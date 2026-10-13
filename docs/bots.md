# Building bots

## RPC

The public RPC rate-limits heavily (you'll see `429 Too Many Requests` retries). For anything that runs unattended, use
your own RPC (Helius, Triton, QuickNode, a node of your own):

```ts
const pvp = new Pvp({ network: "mainnet", rpcUrl: process.env.RPC_URL, wallet });
```
```bash
export PVP_RPC_URL=https://...
```

`onEvent` / `pvp watch` need the RPC's websocket (most providers serve it on the same URL).

## Keys

- Keep the bot's keypair in a file outside your repo, readable only by the bot (`chmod 600`).
- Use a dedicated wallet with only what the bot needs. Never your main wallet.
- The SDK signs locally and never sends the key anywhere.

## Reacting to launches and renames

```ts
pvp.onEvent(async (ev) => {
  if (ev.type !== "TokenCreated") return;
  console.log(`new: ${ev.name} ($${ev.symbol}) ${ev.mint}`);
});
```

Events arrive at `confirmed` commitment. Handle duplicates (a reconnect can replay) by remembering `signature`.

For a full snapshot, call `listTokens()` once at start, then keep it up to date from events instead of polling.

## Names: check before you launch

The 24 h lock means the first launch wins the name. Always check first; it is one cheap read:

```ts
const s = await pvp.checkName(name);
if (!s.available) {
  if (s.reason === "locked") console.log(`held by ${s.holder} until ${new Date(s.freeAt)}`);
  return;
}
```

Even after a check, another launch can land first. Then the program refuses yours with `NameLocked` and you pay only
the network fee. The lock compares normalized names, so `Chill Guy` and `CHILLGUY` collide: check with the exact name
you will launch.

## Priority fees

```ts
const pvp = new Pvp({ ..., priorityFee: 50_000 });          // default for every transaction
await pvp.buy(mint, 0.5, { priorityFee: 200_000 });          // per call
```
```bash
pvp buy <mint> 0.5 --priority-fee 200000
```

The fee is in micro-lamports per compute unit. Each action sets a compute unit limit (`Built.computeUnits`), so the
total priority fee is `priorityFee × computeUnits / 1e6` lamports. A buy at 200,000 costs at most 0.00008 SOL.

## Custom sending

Use the `build*` methods to get the instructions and send them your way: versioned transactions, Jito bundles, your own
retry logic.

```ts
import { ComputeBudgetProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

const built = await pvp.buildBuy(mint, 0.5, 150); // 1.5% slippage
const { blockhash } = await pvp.connection.getLatestBlockhash();
const msg = new TransactionMessage({
  payerKey: wallet.publicKey,
  recentBlockhash: blockhash,
  instructions: [
    ComputeBudgetProgram.setComputeUnitLimit({ units: built.computeUnits }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 }),
    ...built.instructions,
    // add a Jito tip transfer here if you send as a bundle
  ],
}).compileToV0Message();
const tx = new VersionedTransaction(msg);
tx.sign([wallet, ...built.signers]);
await pvp.connection.sendTransaction(tx);
```

`buildLaunch` returns the new mint in `built.mint` and its keypair in `built.signers`: sign with it.

## Slippage

Trades compute the minimum output from a fresh quote and your `slippageBps`. If the price moves past it, the program
refuses and nothing is spent but the fee. On busy launches, 1% can be too tight; 3–5% is common for memecoins. Raising it
means accepting a worse fill.

## Errors

Check `PvpError.code` rather than parsing messages:

```ts
try { await pvp.buy(mint, 0.5); }
catch (e) {
  if (e instanceof PvpError && (e.code === "Slippage" || e.code === "ExceededSlippage")) { /* retry with a new quote */ }
  else throw e;
}
```

`e.logs` has the program logs for debugging. All codes: [errors.md](errors.md).

## Other languages

The CLI is the bridge: every command takes `--json`, prints one JSON object, and exits with `1` on error.

```python
import json, subprocess

def pvp(*args):
    r = subprocess.run(["pvp", *args, "--json"], capture_output=True, text=True)
    out = json.loads(r.stdout)
    if r.returncode != 0:
        raise RuntimeError(f"{out.get('code')}: {out['error']}")
    return out

if pvp("check-name", "Chill Guy")["available"]:
    print(pvp("launch", "--name", "Chill Guy", "--symbol", "CHILL", "--image", "chill.png", "--yes")["mint"])
```

`pvp watch --json` streams one event per line on stdout for any language to read.

## Testing

Mainnet is the default network. Build on **devnet** first: `network: "devnet"` / `--network devnet` (or
`PVP_NETWORK=devnet`). Get devnet SOL from https://faucet.solana.com; tokens and SOL on devnet have no value. When your
bot works, drop the devnet option (the CLI then needs `--yes` on every transaction).
