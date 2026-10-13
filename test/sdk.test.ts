import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  NETWORKS,
  Pvp,
  nameKey,
  nameAllowed,
  normalizeName,
  parseNetwork,
  pdas,
  solToLamports,
  tokensToRaw,
  validateIdentity,
} from "../src/index.js";
import { grindVanityMint } from "../src/vanity.js";

const SDK = join(import.meta.dirname, "..");
// Same vectors the on-chain program and the site are tested against.
const vectors: { input: string; normalized: string; allowed?: boolean }[] = JSON.parse(
  readFileSync(join(SDK, "test", "fixtures", "name-vectors.json"), "utf8"),
);

describe("names", () => {
  it.each(vectors)("normalizes $input like the program", (v) => {
    expect(normalizeName(v.input)).toBe(v.normalized);
    if (v.allowed !== undefined) expect(nameAllowed(v.normalized)).toBe(v.allowed);
  });

  it("gives every spelling of a name the same key", async () => {
    const keys = await Promise.all(["Chill Guy", "chillguy", "CHILL-GUY!", "ｃｈｉｌｌ ｇｕｙ"].map(nameKey));
    for (const k of keys) expect(Buffer.from(k).equals(Buffer.from(keys[0]))).toBe(true);
    expect(keys[0].length).toBe(32);
  });

  it("validates identity like the program", () => {
    expect(validateIdentity("Chill Guy", "CHILL", "https://x.y/a.png")).toEqual({ ok: true });
    expect(validateIdentity("Sieg Heil", "SH")).toMatchObject({ ok: false, problem: "blocked" });
    expect(validateIdentity("!!!", "X")).toMatchObject({ ok: false, field: "name", problem: "empty" });
    expect(validateIdentity("Ok", "TOOLONGTICKER")).toMatchObject({ ok: false, field: "symbol", problem: "too-long" });
    expect(validateIdentity("x".repeat(33), "X")).toMatchObject({ ok: false, field: "name", problem: "too-long" });
    expect(validateIdentity("Ⅻ roman", "X")).toMatchObject({ ok: false, problem: "chars" });
  });
});

describe("amounts", () => {
  it("converts without float errors", () => {
    expect(solToLamports(0.1)).toBe(100_000_000n);
    expect(solToLamports("1.5")).toBe(1_500_000_000n);
    expect(tokensToRaw(0.000001)).toBe(1n);
    expect(tokensToRaw("1000000")).toBe(1_000_000_000_000n);
    expect(tokensToRaw("1.1234567")).toBe(1_123_456n); // extra decimals are cut, never rounded up
    expect(() => tokensToRaw("-1")).toThrow();
    expect(() => tokensToRaw("abc")).toThrow();
  });
});

describe("networks and addresses", () => {
  it("knows both program ids", () => {
    expect(NETWORKS.devnet.programId.toBase58()).toBe("4716RUH7qqikpxf6sQAp33xUaJMBD3y6QeAnndH4iV3M");
    expect(NETWORKS.mainnet.programId.toBase58()).toBe("A8eZ1qbbSJvw9UiBKY76PtCJNM9P18SbtTBWDCDYTzX3");
    expect(parseNetwork("mainnet-beta")).toBe("mainnet");
    expect(() => parseNetwork("testnet")).toThrow();
  });

  it("derives PDAs deterministically per program", () => {
    const d = pdas(NETWORKS.devnet.programId);
    const m = pdas(NETWORKS.mainnet.programId);
    expect(d.config.equals(m.config)).toBe(false);
    const mint = new PublicKey("13W3G4BnYcQG5ew2mA9XybDUZ7gArV35kBRveEHhDPVP");
    expect(d.curve(mint).equals(PublicKey.findProgramAddressSync([Buffer.from("curve"), mint.toBuffer()], NETWORKS.devnet.programId)[0])).toBe(true);
    expect(d.proposal(mint, 1).equals(d.proposal(mint, 0))).toBe(false);
  });

  it("refuses to sign without a wallet", () => {
    expect(() => new Pvp().publicKey).toThrow(/No wallet/);
  });

  it("refuses an invalid name before touching the network", async () => {
    const pvp = new Pvp({ wallet: Keypair.generate(), rpcUrl: "http://127.0.0.1:9" });
    await expect(pvp.buildLaunch({ name: "Sieg Heil", symbol: "SH", uri: "" })).rejects.toThrow(/blocked/);
  });
});

describe("vanity", () => {
  it("grinds an address with the suffix", async () => {
    const kp = await grindVanityMint({ suffix: "P", threads: 2 });
    expect(kp.publicKey.toBase58().endsWith("P")).toBe(true);
  });

  it("rejects characters that are not base58", () => {
    expect(() => grindVanityMint({ suffix: "P0P" })).toThrow(/base58/);
  });
});

describe("cli", () => {
  const cli = (...args: string[]) => spawnSync(process.execPath, ["--import", "tsx", join(SDK, "src", "cli.ts"), ...args], { encoding: "utf8", cwd: SDK });

  it("prints help", () => {
    const out = execFileSync(process.execPath, ["--import", "tsx", join(SDK, "src", "cli.ts"), "help"], { encoding: "utf8", cwd: SDK });
    expect(out).toContain("pvp: launch, trade, vote and earn");
  });

  it("asks for --yes before a mainnet transaction", () => {
    const r = cli("buy", "13W3G4BnYcQG5ew2mA9XybDUZ7gArV35kBRveEHhDPVP", "0.1", "--network", "mainnet", "--json");
    expect(r.status).toBe(1);
    expect(JSON.parse(r.stdout).error).toMatch(/--yes/);
  });

  it("defaults to mainnet, so a transaction without --network still needs --yes", () => {
    const r = cli("buy", "13W3G4BnYcQG5ew2mA9XybDUZ7gArV35kBRveEHhDPVP", "0.1", "--json");
    expect(r.status).toBe(1);
    expect(JSON.parse(r.stdout).error).toMatch(/--yes/);
    expect(new Pvp().network).toBe("mainnet");
  });

  it("reports a missing keypair clearly", () => {
    const r = cli("balance", "--keypair", "nope.json", "--json");
    expect(r.status).toBe(1);
    expect(JSON.parse(r.stdout).error).toMatch(/no keypair/);
  });
}, 60_000);

describe("moderation", () => {
  it("reads the public list and ignores another network's list", async () => {
    const body = { cluster: "devnet", updatedAt: 5, mints: { M1: { reason: "scam", at: 1, by: "A" } }, images: {}, names: {}, log: [] };
    const fetchMock = vi.fn(async (_url: string) => new Response(JSON.stringify(body), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      const dev = await new Pvp({ network: "devnet" }).getModeration();
      expect(dev.hiddenMints.M1.reason).toBe("scam");
      expect(String(fetchMock.mock.calls[0][0])).toBe("https://nopvp.app/api/moderation");
      const main = await new Pvp({ network: "mainnet" }).getModeration();
      expect(main.hiddenMints).toEqual({});
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
