#!/usr/bin/env node
// pvp: command line for PVP (nopvp.app). `pvp help` lists the commands.
import { parseArgs } from "node:util";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { Keypair } from "@solana/web3.js";
import { Pvp, PvpError, type MintSource, type NameStatus } from "./pvp.js";
import { parseNetwork, type Network } from "./networks.js";
import { LINK_KEYS, type TokenLinks } from "./metadata.js";

const HELP = `pvp: launch, trade, vote and earn on PVP (nopvp.app) from the terminal

Usage: pvp <command> [args] [options]

Read
  config                              Launchpad parameters (fees, name lock, vote rules)
  tokens [--limit 20] [--sort new|mcap|progress] [--visible]
                                      Tokens launched on PVP (--visible: without the ones the team hid)
  token <mint>                        One token
  check-name <name>                   Is the name free to launch or rename into?
  quote buy <mint> <sol>              Tokens you get for <sol>
  quote sell <mint> <tokens>          SOL you get for <tokens>
  balance [mint]                      SOL balance, or token balance
  proposals <mint>                    Rename votes of a token
  rewards [mint]                      SOL you earned from holding (all tokens, or one); stake on the PVP token
  staking                             Staking rules: the PVP token, stakers' share, unstake wait
  watch [--type TokenCreated,Renamed] Stream events live (one JSON per line with --json)
  address                             Your wallet address

Write (signed by --keypair)
  launch --name <n> --symbol <s> --image <file> [--description <text>] [--website|--twitter|--tweet|--tiktok|
         --telegram|--github <url>] [--mint factory|random|<keypair.json>]
                                      The image (PNG, JPEG or WebP, up to 5 MB) is uploaded to nopvp.app.
                                      Use --uri <url> instead to point at your own metadata JSON
  buy <mint> <sol>
  sell <mint> <tokens|all|50%>
  move <loser-mint> <winner-mint> <tokens|all|50%>
                                      Sell the token that lost the name and buy the winner, one transaction
  propose <mint> [--name <n>] [--symbol <s>] [--image <file>] [--description <text>] [links as in launch]
         [--tokens <n>]               Open a vote to change any of these (locks tokens on YES, pays bond + settlement fee).
                                      What you leave out stays as it is; pass "" to remove a description or link
  vote <mint> yes|no <tokens|all> [--proposal <address>]
  withdraw <mint> <proposal>          Take locked tokens back (cancels the vote if still open)
  settle <mint> [--proposal <address>] Apply the result after the vote ends (anyone can)
  stake <mint> <tokens|all>           PVP token only: stake it for a share of PVP revenue, in SOL (not live on mainnet yet)
  unstake <mint> <tokens|all>         Unstake (with a wait set, this starts the wait; tokens stop earning)
  unstake-complete <mint>             Take out the tokens once the unstake wait is over
  claim <mint>                        Claim the SOL you earned from holding a token

Team (the PVP admin or operator wallet)
  operator                            Show the operator wallet
  moderation                          Tokens the team hid from nopvp.app and images it removed (read-only)
  team-propose <mint> [same options as propose]
                                      Open a vote without locking coins (can take a name in use;
                                      holders still decide). What you leave out stays as it is
  set-operator <address|none>         Admin only: name or remove the operator

Tools
  vanity [--suffix PVP] [--out mint.json] [--threads N]
                                      Grind a mint keypair ending in PVP on this machine

Options
  --network mainnet|devnet  (env PVP_NETWORK, default mainnet)
  --rpc <url>               (env PVP_RPC_URL, default: public RPC; use your own for bots)
  --keypair <file>          (env PVP_KEYPAIR, default ~/.config/solana/id.json)
  --priority-fee <n>        micro-lamports per compute unit
  --slippage <bps>          default 100 (1%)
  --json                    machine-readable output
  --yes                     required for transactions on mainnet
`;

const { values: o, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    network: { type: "string" },
    rpc: { type: "string" },
    keypair: { type: "string" },
    "priority-fee": { type: "string" },
    slippage: { type: "string" },
    json: { type: "boolean", default: false },
    visible: { type: "boolean", default: false },
    yes: { type: "boolean", default: false },
    name: { type: "string" },
    symbol: { type: "string" },
    image: { type: "string" },
    uri: { type: "string" },
    description: { type: "string" },
    website: { type: "string" },
    twitter: { type: "string" },
    tweet: { type: "string" },
    tiktok: { type: "string" },
    telegram: { type: "string" },
    github: { type: "string" },
    mint: { type: "string" },
    tokens: { type: "string" },
    proposal: { type: "string" },
    limit: { type: "string" },
    sort: { type: "string" },
    type: { type: "string" },
    suffix: { type: "string" },
    out: { type: "string" },
    threads: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});

const [cmd, ...args] = positionals;
const json = o.json;

function out(human: string, data: unknown) {
  console.log(json ? JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)) : human);
}

function fail(msg: string, code?: string): never {
  if (json) console.log(JSON.stringify({ error: msg, code }));
  else console.error(`error: ${msg}${code ? ` (${code})` : ""}`);
  process.exit(1);
}

function need(v: string | undefined, what: string): string {
  if (!v) fail(`missing ${what}. See: pvp help`);
  return v;
}

function loadKeypair(path: string): Keypair {
  const p = resolve(path.replace(/^~(?=$|[\\/])/, homedir()));
  if (!existsSync(p)) fail(`no keypair at ${p}. Pass --keypair <file> (a Solana CLI JSON keypair).`);
  try {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(p, "utf8"))));
  } catch {
    fail(`could not read the keypair at ${p}`);
  }
}

const network: Network = parseNetwork(o.network ?? process.env.PVP_NETWORK);
const keypairPath = o.keypair ?? process.env.PVP_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
const WRITE = new Set(["launch", "buy", "sell", "move", "propose", "vote", "withdraw", "settle", "stake", "unstake", "unstake-complete", "claim", "team-propose", "set-operator"]);
const WALLET = new Set([...WRITE, "balance", "rewards", "address"]);

function client(): Pvp {
  const wallet = WALLET.has(cmd) ? loadKeypair(keypairPath) : undefined;
  return new Pvp({
    network,
    rpcUrl: o.rpc ?? process.env.PVP_RPC_URL,
    wallet,
    priorityFee: o["priority-fee"] ? Number(o["priority-fee"]) : undefined,
    slippageBps: o.slippage ? Number(o.slippage) : undefined,
  });
}

/** "all", "50%" or a number of tokens. */
async function amount(pvp: Pvp, mint: string, raw: string | undefined): Promise<string> {
  const v = need(raw, "amount");
  if (v === "all" || v.endsWith("%")) {
    const bal = await pvp.getBalance(mint);
    const pct = v === "all" ? 100 : Number(v.slice(0, -1));
    if (!(pct > 0 && pct <= 100)) fail(`bad percentage: ${v}`);
    const units = Math.floor((bal * 1e6 * pct) / 100);
    if (units <= 0) fail("you hold none of this token");
    return (units / 1e6).toFixed(6);
  }
  if (!(Number(v) > 0)) fail(`bad amount: ${v}`);
  return v;
}

const sol = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 6 })} SOL`;
const tok = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const when = (ms: number) => new Date(ms).toISOString().replace("T", " ").slice(0, 16) + " UTC";
const explorer = (sig: string) => `https://solscan.io/tx/${sig}${network === "devnet" ? "?cluster=devnet" : ""}`;

/**
 * Metadata URL for a launch: --uri as given; --image <file> is uploaded to nopvp.app together with
 * --description and the links; an --image https link is used as the URI directly (no description or links then).
 */
async function metadataUri(pvp: Pvp, name: string, symbol: string): Promise<string> {
  const links: TokenLinks = {};
  for (const k of LINK_KEYS) if (o[k]) links[k] = o[k];
  const extras = !!o.description || Object.keys(links).length > 0;
  if (o.uri) return o.uri;
  if (!o.image) {
    return fail("--image <file> is required (PNG, JPEG or WebP)");
  }
  if (existsSync(o.image)) {
    const image = await pvp.uploadImage(readFileSync(o.image));
    return pvp.createMetadata({ name, symbol, image, description: o.description, links });
  }
  if (/^https:\/\//.test(o.image)) {
    if (extras) fail("--description and links need --image <file>, so they can be stored with the uploaded image");
    return o.image;
  }
  return fail(`--image: no such file: ${o.image}`);
}

/**
 * Metadata URL for a vote: whatever is not given stays as the token has it now. --image <file> uploads a new image;
 * --description and each link flag replace that field (pass "" to remove it). With only the name or ticker changing,
 * the current URI is kept. When the description or links change but the current image is not hosted on PVP, the image
 * is uploaded again (the metadata server only accepts its own images).
 */
async function voteUri(pvp: Pvp, t: { uri: string }, name: string, symbol: string): Promise<string> {
  if (o.uri) return o.uri;
  const cur = await readMetadata(t.uri);
  const links: TokenLinks = { ...cur.links };
  for (const k of LINK_KEYS) if (o[k] !== undefined) o[k] ? (links[k] = o[k]) : delete links[k];
  const description = o.description ?? cur.description;
  const metaChanged = description !== cur.description || LINK_KEYS.some((k) => (links[k] ?? "") !== (cur.links[k] ?? ""));
  let image = cur.image;
  if (o.image) {
    if (!existsSync(o.image)) return fail(`--image: no such file: ${o.image}`);
    image = await pvp.uploadImage(readFileSync(o.image));
  } else if (!metaChanged) {
    return t.uri;
  }
  if (!image) return fail("the token has no image to keep: pass --image <file>");
  if (!image.startsWith(`${pvp.net.site}/i/`)) {
    const r = await fetch(image, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
    if (!r?.ok) return fail("the current image is not hosted on PVP and could not be downloaded: pass --image <file>");
    image = await pvp.uploadImage(new Uint8Array(await r.arrayBuffer()));
  }
  return pvp.createMetadata({ name, symbol, image, description, links });
}

/** Image, description and links from a metadata URL (empty when it can’t be read). */
async function readMetadata(uri: string): Promise<{ image: string | null; description: string; links: TokenLinks }> {
  const empty = { image: null, description: "", links: {} };
  if (!uri) return empty;
  if (/\.(png|jpe?g|webp)(\?.*)?$/i.test(uri)) return { ...empty, image: uri };
  try {
    const r = await fetch(uri, { signal: AbortSignal.timeout(10_000) });
    if ((r.headers.get("content-type") ?? "").startsWith("image/")) return { ...empty, image: uri };
    const j = (await r.json()) as Record<string, unknown>;
    const links: TokenLinks = {};
    for (const k of LINK_KEYS) if (typeof j[k] === "string" && /^https:\/\//.test(j[k] as string)) links[k] = j[k] as string;
    return { image: typeof j.image === "string" ? j.image : null, description: typeof j.description === "string" ? j.description : "", links };
  } catch {
    return fail(`could not read the current metadata at ${uri}`);
  }
}

function nameLine(s: NameStatus) {
  if (s.available) return `available (key "${s.key}")`;
  switch (s.reason) {
    case "locked":
      return `taken by ${s.holder} until ${when(s.freeAt)}`;
    case "reserved":
      return `reserved by an open vote on ${s.reservedFor} until ${when(s.freeAt)}`;
    case "blocked":
      return "blocked (on the PVP blocklist)";
    case "chars":
      return "not allowed: only Latin letters, digits and Chinese/Japanese/Korean characters";
    case "empty":
      return "needs at least one letter or number";
    case "too-long":
      return "too long (32 bytes max)";
  }
}

async function main() {
  if (!cmd || cmd === "help" || o.help) return console.log(HELP);
  if (WRITE.has(cmd) && network === "mainnet" && !o.yes) fail("this sends a mainnet transaction: add --yes to confirm");
  const pvp = client();

  switch (cmd) {
    case "address":
      return out(pvp.publicKey.toBase58(), { address: pvp.publicKey.toBase58() });

    case "staking": {
      const s = await pvp.getStakingRules();
      const pool = s.pvpMint ? await pvp.getStakePool(s.pvpMint) : null;
      return out(
        [
          `PVP token          ${s.pvpMint ?? "not registered yet"}`,
          `stakers' share     ${(s.stakerShareOfTeam * 100).toFixed(2)}% of the team's share of every fee, in SOL`,
          `unstake wait       ${s.unstakeWaitSeconds === 0 ? "none (unstake right away)" : `${+(s.unstakeWaitSeconds / 3600).toFixed(2)} h`}`,
          ...(pool ? [`staked             ${tok(pool.totalStaked)}`, `paid to stakers    ${sol(pool.totalDistributedSol)}`] : []),
        ].join("\n"),
        { ...s, pool },
      );
    }

    case "config": {
      const c = await pvp.getConfig();
      return out(
        [
          `network            ${network} (program ${pvp.net.programId.toBase58()})`,
          `name lock          ${c.nameLockSeconds / 3600} h`,
          `open a vote        lock ${(c.proposalThresholdBps / 100).toFixed(2)}% of supply + ${+(c.proposalBondSol + c.executionFeeSol).toFixed(4)} SOL (${c.proposalBondSol} refundable bond + ${c.executionFeeSol} settlement fee)`,
          `min yes to pass    ${(c.quorumBps / 100).toFixed(2)}% of supply (above 50% decides early)`,
          `vote length        ${c.voteDurationSeconds / 3600} h`,
          `between renames    ${c.voteRenameCooldownSeconds / 3600} h`,
          `supply             ${tok(c.totalSupply)}`,
        ].join("\n"),
        { network, programId: pvp.net.programId.toBase58(), ...c },
      );
    }

    case "tokens": {
      let list = await pvp.listTokens({ excludeHidden: o.visible });
      if (o.sort === "mcap") list.sort((a, b) => b.marketCapSol - a.marketCapSol);
      if (o.sort === "progress") list.sort((a, b) => b.progress - a.progress);
      list = list.slice(0, Number(o.limit ?? 20));
      return out(
        list
          .map((t) => `${t.mint}  ${t.name} ($${t.symbol})  mcap ${sol(t.marketCapSol)}  ${t.migrated ? "migrated" : `${(t.progress * 100).toFixed(1)}%`}`)
          .join("\n") || "no tokens yet",
        list,
      );
    }

    case "token": {
      const t = await pvp.getToken(need(args[0], "mint"));
      if (!t) fail("not a PVP token");
      return out(
        [
          `${t.name} ($${t.symbol})  ${t.mint}`,
          `creator      ${t.creator}`,
          `launched     ${when(t.createdAt)}`,
          `renames      ${t.renameCount}${t.lastRenameAt ? ` (last ${when(t.lastRenameAt)})` : ""}`,
          `price        ${t.priceSol.toExponential(4)} SOL`,
          `market cap   ${sol(t.marketCapSol)}`,
          `curve        ${t.migrated ? `migrated to Meteora (${t.dammPool})` : `${(t.progress * 100).toFixed(2)}% (${sol(t.curveSol)})`}`,
          `open vote    ${t.activeProposal ?? "none"}`,
          `image        ${t.uri || "-"}`,
        ].join("\n"),
        t,
      );
    }

    case "check-name": {
      const name = need(args.join(" ") || undefined, "name");
      const s = await pvp.checkName(name);
      return out(`"${name}": ${nameLine(s)}`, { name, ...s });
    }

    case "quote": {
      const [side, mint, amt] = args;
      if (side === "buy") {
        const n = await pvp.quoteBuy(need(mint, "mint"), need(amt, "SOL amount"));
        return out(`${amt} SOL -> ${tok(n)} tokens`, { side, sol: Number(amt), tokens: n });
      }
      if (side === "sell") {
        const n = await pvp.quoteSell(need(mint, "mint"), need(amt, "token amount"));
        return out(`${amt} tokens -> ${sol(n)}`, { side, tokens: Number(amt), sol: n });
      }
      return fail("use: pvp quote buy|sell <mint> <amount>");
    }

    case "balance": {
      if (args[0]) {
        const n = await pvp.getBalance(args[0]);
        return out(`${tok(n)} tokens`, { mint: args[0], tokens: n });
      }
      const n = await pvp.getSolBalance();
      return out(sol(n), { address: pvp.publicKey.toBase58(), sol: n });
    }

    case "proposals": {
      const list = await pvp.getProposals(need(args[0], "mint"));
      return out(
        list
          .map((p) => {
            const state = p.executed ? (p.passed ? "passed" : "failed") : p.decided ? (Date.now() >= p.earlySettleAt ? "decided (yes above 50% of supply), waiting for settle" : `decided (yes above 50% of supply), can be settled from ${when(p.earlySettleAt)}`) : p.endsAt > Date.now() ? `open until ${when(p.endsAt)}` : "ended, waiting for settle";
            return `#${p.id} ${p.address}  -> ${p.name} ($${p.symbol})${p.byTeam ? " [team]" : ""}  yes ${tok(p.yes)} / no ${tok(p.no)}  ${state}`;
          })
          .join("\n") || "no votes yet",
        list,
      );
    }

    case "rewards": {
      // No mint: what the wallet earned across all tokens. With a mint: that token (staking on the PVP token).
      if (!args[0]) {
        const list = await pvp.getMyRewards();
        const total = list.reduce((s, r) => s + (r.current ? r.claimableSol : 0), 0);
        return out(
          list.length
            ? [...list.map((r) => `${r.mint}  ${sol(r.claimableSol)} to claim, ${sol(r.earnedSol)} earned${r.current ? "" : " (updating)"}`), `total to claim: ${sol(total)}`].join("\n")
            : "no rewards yet: hold a token launched on PVP and its fees start coming to you",
          { total, rewards: list },
        );
      }
      const mint = args[0];
      if ((await pvp.getPvpTokenMint()) === mint) {
        const [pool, mine] = await Promise.all([pvp.getStakePool(mint), pvp.getStake(mint)]);
        return out(
          pool
            ? `PVP token staking: ${tok(pool.totalStaked)} staked, ${sol(pool.totalDistributedSol)} paid so far\nyou: ${mine ? `${tok(mine.amount)} staked, ${sol(mine.pendingSol)} to claim, ${sol(mine.claimedSol)} claimed` : "nothing staked"}` +
                (mine?.unstaking ? `\nunstaking: ${tok(mine.unstaking.amount)} ${mine.unstaking.ready ? "ready to take out" : `until ${new Date(mine.unstaking.unlockAt).toISOString()}`}` : "")
            : "no staking pool yet (the first stake opens it)",
          { pool, mine },
        );
      }
      const [pot, mine] = await Promise.all([pvp.getHolderRewards(mint), pvp.getMyRewards().then((l) => l.find((r) => r.mint === mint) ?? null)]);
      return out(
        `paid to holders: ${sol(pot?.receivedSol ?? 0)}\nyou: ${mine ? `${sol(mine.claimableSol)} to claim, ${sol(mine.earnedSol)} earned${mine.current ? "" : " (updating)"}` : "nothing yet"}`,
        { pot, mine },
      );
    }

    case "watch": {
      const types = o.type?.split(",").map((s) => s.trim());
      if (!json) console.error(`watching PVP on ${network}... (ctrl+c to stop)`);
      pvp.onEvent((ev) => {
        if (types && !types.includes(ev.type)) return;
        if (json) return console.log(JSON.stringify(ev));
        const e = ev as any;
        const line =
          ev.type === "TokenCreated" ? `NEW ${e.name} ($${e.symbol}) ${e.mint} by ${e.creator}`
          : ev.type === "Renamed" ? `RENAMED ${e.mint}: ${e.oldName} -> ${e.name} ($${e.symbol}) by ${e.by}`
          : ev.type === "ProposalCreated" ? `VOTE OPENED on ${e.mint}: rename to ${e.name} ($${e.symbol}), ends ${when(e.endsAt)}`
          : `${ev.type} ${JSON.stringify(ev)}`;
        console.log(`${new Date().toISOString().slice(11, 19)} ${line}`);
      });
      return new Promise(() => {});
    }

    case "vanity": {
      const { grindVanityMint, expectedTries } = await import("./vanity.js");
      const suffix = o.suffix ?? "PVP";
      const file = resolve(o.out ?? `${suffix.toLowerCase()}-mint.json`);
      if (existsSync(file)) fail(`${file} already exists`);
      if (!json) console.error(`grinding an address ending in "${suffix}" (~${expectedTries(suffix).toLocaleString("en-US")} tries on average)...`);
      const t0 = Date.now();
      const kp = await grindVanityMint({
        suffix,
        threads: o.threads ? Number(o.threads) : undefined,
        onProgress: json ? undefined : (n) => process.stderr.write(`\r${n.toLocaleString("en-US")} tries`),
      });
      writeFileSync(file, JSON.stringify(Array.from(kp.secretKey)), { mode: 0o600 });
      if (!json) process.stderr.write("\n");
      return out(`${kp.publicKey.toBase58()} saved to ${file} (${((Date.now() - t0) / 1000).toFixed(1)} s). Launch with --mint ${file}`, {
        address: kp.publicKey.toBase58(),
        file,
      });
    }

    case "launch": {
      const name = need(o.name, "--name");
      const symbol = need(o.symbol, "--symbol");
      const s = await pvp.checkName(name);
      if (!s.available) fail(`"${name}" ${nameLine(s)}`, s.reason);
      const uri = await metadataUri(pvp, name, symbol);
      const mint: MintSource = !o.mint || o.mint === "factory" ? "factory" : o.mint === "random" ? "random" : loadKeypair(o.mint);
      const r = await pvp.launch({ name, symbol, uri, mint });
      return out(`launched ${name} ($${symbol}): ${r.mint}\n${explorer(r.signature)}\nhttps://nopvp.app/t/${r.mint}`, r);
    }

    case "buy": {
      const r = await pvp.buy(need(args[0], "mint"), need(args[1], "SOL amount"));
      return out(`bought ~${tok(r.expectedTokens)} tokens (min ${tok(r.minTokens)})\n${explorer(r.signature)}`, r);
    }

    case "sell": {
      const mint = need(args[0], "mint");
      const r = await pvp.sell(mint, await amount(pvp, mint, args[1]));
      return out(`sold for ~${sol(r.expectedSol)} (min ${sol(r.minSol)})\n${explorer(r.signature)}`, r);
    }

    case "move": {
      const loser = need(args[0], "loser mint");
      const r = await pvp.moveInto(loser, need(args[1], "winner mint"), await amount(pvp, loser, args[2]));
      return out(`moved into the winner: ~${tok(r.expectedWinner)} tokens (min ${tok(r.minWinner)})\n${explorer(r.signature)}`, r);
    }

    case "propose": {
      const mint = need(args[0], "mint");
      const t = await pvp.getToken(mint);
      if (!t) fail("not a PVP token", "NotFound");
      const name = o.name ?? t!.name;
      const symbol = o.symbol ?? t!.symbol;
      if (name !== t!.name) {
        const s = await pvp.checkName(name, mint);
        if (!s.available) fail(`"${name}" ${nameLine(s)}`, s.reason);
      }
      const uri = await voteUri(pvp, t!, name, symbol);
      if (name === t!.name && symbol === t!.symbol && uri === t!.uri) fail("nothing to change: pass --name, --symbol, --image, --description or a link");
      const r = await pvp.propose({ mint, name, symbol, uri, tokens: o.tokens });
      return out(`vote opened: ${r.proposal}\n${explorer(r.signature)}`, r);
    }

    case "operator": {
      const op = await pvp.getOperator();
      return out(op ?? "no operator set (only the admin opens team votes)", { operator: op });
    }

    case "moderation": {
      const m = await pvp.getModeration();
      const hidden = Object.entries(m.hiddenMints).sort((a, b) => b[1].at - a[1].at);
      const images = Object.entries(m.removedImages).sort((a, b) => b[1].at - a[1].at);
      return out(
        [
          `hidden tokens (${hidden.length})`,
          ...hidden.map(([mint, e]) => `  ${mint}  ${when(e.at)}  ${e.reason}`),
          `removed images (${images.length})`,
          ...images.map(([file, e]) => `  ${file}  ${when(e.at)}  ${e.reason}`),
        ].join("\n"),
        m,
      );
    }

    case "team-propose": {
      const mint = need(args[0], "mint");
      const t = await pvp.getToken(mint);
      if (!t) fail("not a PVP token", "NotFound");
      const name = o.name ?? t!.name;
      const symbol = o.symbol ?? t!.symbol;
      if (name !== t!.name) {
        const s = await pvp.checkName(name, mint);
        if (!s.available && s.reason !== "locked" && s.reason !== "reserved") fail(`"${name}" ${nameLine(s)}`, s.reason);
      }
      const uri = await voteUri(pvp, t!, name, symbol);
      if (name === t!.name && symbol === t!.symbol && uri === t!.uri) fail("nothing to change: pass --name, --symbol, --image, --description or a link");
      const r = await pvp.teamPropose({ mint, name, symbol, uri });
      return out(`team vote opened: ${r.proposal}\n${explorer(r.signature)}`, r);
    }

    case "set-operator": {
      const a = need(args[0], "address|none");
      const r = await pvp.setOperator(a === "none" ? null : a);
      return out(`operator ${a === "none" ? "removed" : `set to ${a}`}\n${explorer(r.signature)}`, r);
    }

    case "vote": {
      const mint = need(args[0], "mint");
      const side = need(args[1], "yes|no").toLowerCase();
      if (side !== "yes" && side !== "no") fail("vote yes or no");
      const r = await pvp.vote({ mint, yes: side === "yes", tokens: await amount(pvp, mint, args[2]), proposal: o.proposal });
      return out(`voted ${side.toUpperCase()}\n${explorer(r.signature)}`, r);
    }

    case "withdraw": {
      const r = await pvp.withdrawVote({ mint: need(args[0], "mint"), proposal: need(args[1] ?? o.proposal, "proposal") });
      return out(`tokens back in your wallet\n${explorer(r.signature)}`, r);
    }

    case "settle": {
      const r = await pvp.settle({ mint: need(args[0], "mint"), proposal: o.proposal });
      return out(`vote settled\n${explorer(r.signature)}`, r);
    }

    case "stake": {
      const mint = need(args[0], "mint");
      const r = await pvp.stake(mint, await amount(pvp, mint, args[1]));
      return out(`staked\n${explorer(r.signature)}`, r);
    }

    case "unstake": {
      const mint = need(args[0], "mint");
      const v = args[1] === "all" ? String((await pvp.getStake(mint))?.amount ?? fail("nothing staked")) : need(args[1], "amount");
      const { unstakeWaitSeconds } = await pvp.getStakingRules();
      if (unstakeWaitSeconds === 0) {
        const r = await pvp.unstake(mint, v);
        return out(`unstaked\n${explorer(r.signature)}`, r);
      }
      const r = await pvp.requestUnstake(mint, v);
      const unlockAt = (await pvp.getStake(mint))?.unstaking?.unlockAt ?? Date.now() + unstakeWaitSeconds * 1000;
      return out(
        `unstake requested: these tokens stopped earning; take them out after ${new Date(unlockAt).toISOString()} with "pvp unstake-complete ${mint}"\n${explorer(r.signature)}`,
        { ...r, unlockAt },
      );
    }

    case "unstake-complete": {
      const mint = need(args[0], "mint");
      const r = await pvp.completeUnstake(mint);
      return out(`tokens back in your wallet\n${explorer(r.signature)}`, r);
    }

    case "claim": {
      const mint = need(args[0], "mint");
      if ((await pvp.getPvpTokenMint()) === mint) {
        const r = await pvp.claimRewards(mint);
        return out(`staking rewards claimed\n${explorer(r.signature)}`, r);
      }
      const r = await pvp.claimHolderRewards(mint);
      return out(`claimed ${sol(r.amountSol)}\n${explorer(r.signature)}`, r);
    }

    default:
      fail(`unknown command "${cmd}". See: pvp help`);
  }
}

main().then(
  () => {
    if (cmd !== "watch") process.exit(0);
  },
  (e) => {
    if (e instanceof PvpError) fail(e.message, e.code);
    fail(e instanceof Error ? e.message : String(e));
  },
);
