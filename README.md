# PVP SDK and CLI

Launch, trade, vote and earn on [PVP](https://nopvp.app) from code or from the terminal.

PVP is a Solana launchpad where a name lives on one token at a time. When a story breaks and five tokens show up with five
spellings, holders vote their token to the right name and everyone else moves into it. This package gives bots,
terminals and apps the same powers as the website:

- launch a token (with an address ending in `PVP`);
- check if a name is free before launching;
- buy and sell (on the bonding curve, then on the Meteora pool after migration);
- open rename votes, vote, withdraw and settle;
- see and claim the SOL you earned from holding tokens (no locking needed);
- stream launches, renames and votes live.

> **Status:** live on Solana mainnet since October 13, 2026. Mainnet is the default network; pass `devnet` to test
> without real money.

## Networks

| | Mainnet (default) | Devnet |
|---|---|---|
| PVP program | `A8eZ1qbbSJvw9UiBKY76PtCJNM9P18SbtTBWDCDYTzX3` | `4716RUH7qqikpxf6sQAp33xUaJMBD3y6QeAnndH4iV3M` |
| PVP token | `pvpS6zm7C3suzFvSgCR86o8dNKE8ZHTFSHekXXsaPVP` | |
| Website | https://nopvp.app | |

Pick one with `network: "devnet"` in the SDK, or `--network devnet` / `PVP_NETWORK=devnet` in the CLI.

## Install

```bash
npm install @usenopvp/sdk          # library
npm install -g @usenopvp/sdk       # adds the `pvp` command
```

Node 20 or newer.

## CLI in 30 seconds

The CLI signs with a Solana CLI keypair file (`~/.config/solana/id.json` by default, or `--keypair <file>`).

```bash
pvp check-name "Chill Guy"
# "Chill Guy": available (key "chiiiguy")

pvp launch --name "Chill Guy" --symbol CHILL --image chill.png --yes
# launched Chill Guy ($CHILL): 7xKp...PVP

pvp buy 7xKp...PVP 0.5 --yes
pvp sell 7xKp...PVP 50% --yes
pvp watch --type TokenCreated --json      # one JSON line per new launch
```

On mainnet (the default), every command that sends a transaction needs `--yes`. Add `--network devnet` to try things
for free first. Every command takes `--json` for machine-readable output and exits with code 1 on error. Full list:
[docs/cli.md](docs/cli.md).

## SDK in 30 seconds

```ts
import { Pvp } from "@usenopvp/sdk";
import { Keypair } from "@solana/web3.js";
import { readFileSync } from "node:fs";

const pvp = new Pvp({
  network: "mainnet", // the default; "devnet" to test
  rpcUrl: process.env.RPC_URL, // use your own RPC for anything serious
  wallet: Keypair.fromSecretKey(/* ... */),
});

const status = await pvp.checkName("Chill Guy");
if (status.available) {
  const image = await pvp.uploadImage(readFileSync("chill.png"));
  const uri = await pvp.createMetadata({ name: "Chill Guy", symbol: "CHILL", image });
  const { mint } = await pvp.launch({ name: "Chill Guy", symbol: "CHILL", uri });
  await pvp.buy(mint, 0.5);
}

pvp.onEvent((ev) => {
  if (ev.type === "TokenCreated") console.log("new token", ev.name, ev.mint);
});
```

Full API: [docs/sdk.md](docs/sdk.md). The SDK also has a few extras the website doesn't show, like `moveInto` (sell one
token and buy another in one transaction).

## Docs

| | |
|---|---|
| [How PVP works](docs/rules.md) | Names, the 24 h lock, votes, fees and migration: the rules your bot plays by |
| [CLI reference](docs/cli.md) | Every command, option and JSON output |
| [SDK reference](docs/sdk.md) | Every method and type |
| [Building bots](docs/bots.md) | RPC, priority fees, custom sending (Jito), events, errors, Python |
| [Errors](docs/errors.md) | Every program error and what to do about it |
| [Examples](examples/) | Runnable scripts |

## Safety

- The SDK never sends your keys anywhere. Transactions are signed on your machine.
- On mainnet, every CLI command that sends a transaction needs `--yes`.
- Trades use a slippage limit (1% by default, `--slippage <bps>` to change it). If the price moves more, the transaction
  fails instead of filling at a bad price.
- PVP does not promise returns. Memecoins are risky; only trade what you can lose.

## License

MIT
