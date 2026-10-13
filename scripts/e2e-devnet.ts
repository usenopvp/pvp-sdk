// End-to-end test of the SDK on devnet with real transactions (only devnet; costs ~0.3 devnet SOL).
// Usage: npm run e2e -- <keypair.json>   (or PVP_KEYPAIR)
import { readFileSync } from "node:fs";
import { Keypair } from "@solana/web3.js";
import { Pvp, PvpError, type PvpEvent } from "../src/index.js";

const path = process.argv[2] ?? process.env.PVP_KEYPAIR;
if (!path) throw new Error("usage: npm run e2e -- <devnet keypair.json>");
const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))));
const pvp = new Pvp({ network: "devnet", wallet, rpcUrl: process.env.PVP_RPC_URL });

let failed = 0;
async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  try {
    const r = await fn();
    console.log(`ok   ${name} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    return r;
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e instanceof Error ? e.message : e}`);
    throw e;
  }
}
async function expectError(name: string, code: string, fn: () => Promise<unknown>) {
  await step(name, async () => {
    try {
      await fn();
    } catch (e) {
      if (e instanceof PvpError && e.code === code) return;
      throw new Error(`expected ${code}, got ${e instanceof PvpError ? e.code : ""} ${e instanceof Error ? e.message : e}`);
    }
    throw new Error(`expected ${code}, but it succeeded`);
  });
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const eq = (a: unknown, b: unknown, what: string) => {
  if (a !== b) throw new Error(`${what}: expected ${b}, got ${a}`);
};

const events: PvpEvent[] = [];
const stop = pvp.onEvent((e) => events.push(e));
const sol0 = await pvp.getSolBalance();
console.log(`wallet ${wallet.publicKey.toBase58()}  ${sol0} SOL`);

const tag = Date.now().toString(36).slice(-5);
const name = `Sdk Test ${tag}`;
const symbol = "SDKT";
const uri = "https://nopvp.app/img/logo-mark.svg";

await step("checkName: fresh name is available", async () => eq((await pvp.checkName(name)).available, true, "available"));
const { mint } = await step("launch (factory mint)", () => pvp.launch({ name, symbol, uri }));
console.log(`     mint ${mint}${mint.endsWith("PVP") ? " (ends in PVP)" : " (factory unavailable: plain address)"}`);
await step("getToken reads it back", async () => {
  const t = await pvp.getToken(mint);
  if (!t) throw new Error("not found");
  eq(t.name, name, "name");
  eq(t.symbol, symbol, "symbol");
  eq(t.creator, wallet.publicKey.toBase58(), "creator");
});
await step("checkName: now locked by our token", async () => {
  const s = await pvp.checkName(name.toUpperCase().replace(/ /g, "-"));
  if (s.available || s.reason !== "locked" || s.holder !== mint) throw new Error(JSON.stringify(s));
});
await expectError("launch with the same name (other spelling) is refused on-chain", "NameLocked", async () => {
  // skip the SDK's own pre-check by building directly: the program must refuse
  const b = await pvp.buildLaunch({ name: name.toLowerCase(), symbol, uri, mint: "random" });
  await pvp.send(b);
});
const quoted = await step("quoteBuy 0.2 SOL", () => pvp.quoteBuy(mint, 0.2));
const bought = await step("buy 0.2 SOL", () => pvp.buy(mint, 0.2));
await step("balance matches the quote (within slippage)", async () => {
  const bal = await pvp.getBalance(mint);
  if (bal < bought.minTokens || bal > quoted * 1.001) throw new Error(`balance ${bal}, quote ${quoted}, min ${bought.minTokens}`);
  console.log(`     holding ${bal.toFixed(0)} tokens`);
});
await step("sell 10%", async () => {
  const bal = await pvp.getBalance(mint);
  await pvp.sell(mint, (bal * 0.1).toFixed(6));
  const after = await pvp.getBalance(mint);
  if (Math.abs(after - bal * 0.9) > 1) throw new Error(`expected ~${bal * 0.9}, got ${after}`);
});
// Only the PVP token has staking (it lives outside the launchpad); staking a launchpad token is refused.
await step("stake on a launchpad token is refused (only the PVP token has staking)", async () => {
  try {
    await pvp.stake(mint, 1_000_000);
  } catch (e) {
    if (e instanceof PvpError && (e.code === "StakeOnlyPvpToken" || e.code === "AccountNotInitialized")) return;
    throw e;
  }
  throw new Error("stake succeeded on a token that is not the PVP token");
});
await step("staking rules", async () => {
  const r = await pvp.getStakingRules();
  console.log(`     PVP token ${r.pvpMint ?? "none"}, stakers ${r.stakerShareOfTeam * 100}% of the team share, unstake wait ${r.unstakeWaitSeconds}s`);
});

const newName = `Sdk Renamed ${tag}`;
const { proposal } = await step("propose rename (locks the 0.5% threshold)", () => pvp.propose({ mint, name: newName, symbol: "SDKR", uri }));
await step("proposal is listed and reserves the name", async () => {
  const [list, s] = await Promise.all([pvp.getProposals(mint), pvp.checkName(newName)]);
  const p = list.find((x) => x.address === proposal);
  if (!p) throw new Error("proposal not listed");
  eq(p.name, newName, "proposal name");
  eq(p.yes, 5_000_000, "yes");
  if (s.available || s.reason !== "reserved") throw new Error(`name should be reserved: ${JSON.stringify(s)}`);
  eq((await pvp.checkName(newName, mint)).available, true, "available for the proposing token");
});
await step("vote YES with 100,000 more", async () => {
  await pvp.vote({ mint, yes: true, tokens: 100_000 });
  eq((await pvp.getVote(proposal))?.amount, 5_100_000, "vote amount");
});
await expectError("vote NO after YES is refused", "SwitchSide", () => pvp.vote({ mint, yes: false, tokens: 1 }));
await expectError("settle before the end is refused", "VotingOpen", () => pvp.settle({ mint }));

await sleep(4000);
stop();
await step("live events arrived (TokenCreated, ProposalCreated, Voted)", async () => {
  const types = new Set<string>(events.filter((e: any) => e.mint === mint || e.proposal === proposal).map((e) => e.type));
  for (const t of ["TokenCreated", "ProposalCreated", "Voted"]) if (!types.has(t)) throw new Error(`missing ${t}; got ${[...types].join(",")}`);
});

const sol1 = await pvp.getSolBalance();
console.log(`\nspent ${(sol0 - sol1).toFixed(4)} devnet SOL. token: ${mint}  proposal: ${proposal}`);
console.log(failed ? `${failed} step(s) failed` : "all steps passed");
process.exit(failed ? 1 : 0);
