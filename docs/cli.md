# CLI reference

```bash
npm install -g @usenopvp/sdk
pvp help
```

## Global options

| Option | Env | Default | |
|---|---|---|---|
| `--network mainnet\|devnet` | `PVP_NETWORK` | `mainnet` | Which PVP to use (devnet tokens and SOL have no value) |
| `--rpc <url>` | `PVP_RPC_URL` | public RPC | Use your own RPC for bots; the public one rate-limits hard |
| `--keypair <file>` | `PVP_KEYPAIR` | `~/.config/solana/id.json` | Solana CLI JSON keypair that signs |
| `--priority-fee <n>` | | `0` | Micro-lamports per compute unit |
| `--slippage <bps>` | | `100` | Max price move for trades (100 = 1%) |
| `--json` | | off | One JSON object on stdout; errors as `{"error","code"}` |
| `--yes` | | off | Required for every mainnet transaction (mainnet is the default) |

Exit code is `0` on success and `1` on any error. Amounts are in SOL and whole tokens (decimals allowed). Where a command
takes `<tokens>`, you can also write `all` or a percentage like `50%` of your balance.

## Reading

### `pvp config`
Launchpad parameters: name lock, vote threshold, cost to open a vote (deposit + settlement fee), quorum, vote length, cooldown.

### `pvp tokens [--limit 20] [--sort new|mcap|progress]`
Tokens launched on PVP. JSON: array of [`TokenInfo`](sdk.md#tokeninfo).

```
13W3...DPVP  Chill Guy ($CHILL)  mcap 27.05 SOL  0.3%
```

### `pvp token <mint>`
One token: creator, launch time, renames, price, market cap, curve progress, open vote, image.

### `pvp check-name <name>`
Whether a name is free to launch or rename into, and why not.

```
$ pvp check-name chill-guy
"chill-guy": taken by 13W3...DPVP until 2026-10-13 07:44 UTC
$ pvp check-name siegheil --json
{"name":"siegheil","available":false,"key":"siegheil","reason":"blocked"}
```

`reason` is one of `locked`, `reserved`, `blocked`, `chars`, `empty`, `too-long`.

### `pvp quote buy <mint> <sol>` / `pvp quote sell <mint> <tokens>`
What a trade returns right now, before slippage.

### `pvp balance [mint]`
Your SOL, or your balance of a token.

### `pvp proposals <mint>`
Rename votes of a token with their state: `open until ...`, `decided (yes above 50% of supply)...`, `ended, waiting for
settle`, `passed`, `failed`.

### `pvp rewards [mint]`
Without a mint: the SOL you earned from holding, token by token, and the total ready to claim. With a mint: what the
token paid its holders and your share. On the PVP token: its staking pool and your stake.

### `pvp watch [--type TokenCreated,Renamed,ProposalCreated,Voted,VoteWithdrawn,ProposalSettled,FeesClaimed]`
Streams events as they land (websocket on your RPC). With `--json`, one event per line: pipe it into anything.

```bash
pvp watch --type TokenCreated --json | while read -r ev; do echo "$ev" | jq -r .name; done
```

### `pvp address`
The address of your keypair.

## Writing

All of these sign with `--keypair`. Each prints the explorer link; `--json` gives the signature and the numbers.

### `pvp launch --name <name> --symbol <ticker> --image <file> [--description <text>] [links] [--mint factory|random|<keypair.json>]`
Launches a token and locks the name to it for 24 h. The CLI checks the name first and stops if it is taken. `--image`
is a PNG, JPEG or WebP file (up to 5 MB): it is uploaded to nopvp.app with the description and links, and the
token points to that metadata. Links: `--website`, `--twitter` (X profile), `--tweet` (the source post), `--tiktok`,
`--telegram`, `--github`, all https. To host the metadata yourself, pass `--uri <url>` instead.

```bash
pvp vanity --out chill-mint.json             # optional: your own ...PVP address
pvp launch --name "Chill Guy" --symbol CHILL --image chill.png --twitter https://x.com/chillguy --mint chill-mint.json
```

JSON: `{"mint","signature"}`.

### `pvp buy <mint> <sol>`
JSON: `{"signature","expectedTokens","minTokens"}`.

### `pvp sell <mint> <tokens|all|50%>`
JSON: `{"signature","expectedSol","minSol"}`.

### `pvp move <loser-mint> <winner-mint> <tokens|all|50%>`
Sells one token and buys another in one transaction, with slippage limits on both legs (a CLI extra; the website
doesn't have it). JSON: `{"signature","expectedWinner","minWinner"}`.

### `pvp propose <mint> [--name <name>] [--symbol <ticker>] [--image <file>] [--description <text>] [links] [--tokens <n>]`
Opens a vote to change the name, ticker, image, description or links (any combination; whatever you leave out
stays as the token has it now, and `""` removes a description or link). Locks `--tokens` (default: exactly the threshold, 0.5% of supply) voting YES and pays 0.06 SOL: the 0.05 SOL bond (refunded if the vote passes or YES reaches the minimum) and the 0.01 SOL settlement fee (paid to whoever settles).
JSON: `{"proposal","signature"}`.

### `pvp vote <mint> yes|no <tokens|all> [--proposal <address>]`
Locks tokens on a side of the token's open vote (or of `--proposal`).

### `pvp withdraw <mint> <proposal>`
Takes your locked tokens back. Before the end, this removes your vote.

### `pvp settle <mint> [--proposal <address>]`
Applies the result after the vote ends (or earlier, once YES is above 50% of the supply and a quarter of the vote length
has passed). Anyone can call it and receives the 0.01 SOL settlement fee of a holder vote; if it passed, the token is
renamed.

### `pvp claim <mint>`
Claims the SOL you earned from holding the token (on the PVP token: your staking rewards). Arrives as SOL.

### `pvp stake <mint> <tokens|all>` / `pvp unstake <mint> <tokens|all>` / `pvp unstake-complete <mint>`
Not live on mainnet yet (staking opens in a coming update; `pvp staking` shows the live values). PVP token only: stake it to earn, in SOL, a share of PVP's revenue from every token (a cut of the team's share of the
fees; `pvp staking` shows the current share and the unstake wait). Without a wait, `unstake` gives the tokens back at
once. With a wait, `unstake` starts it: those tokens stop earning right away, and `unstake-complete` takes them out when
the wait is over. Unstaking again adds to the pending amount and restarts the wait. Nothing here is a promise of returns.

### `pvp staking`
The PVP token, the stakers' share of the team's fees, the unstake wait, and what was staked and paid so far.

## Team

For the PVP team only: these sign with the admin or operator wallet and are refused for anyone else (`NotOperator`).

### `pvp operator`
The operator wallet, or "no operator set".

### `pvp team-propose <mint> [same options as propose]`
Opens a vote without locking coins or paying the bond or the settlement fee. It can propose a name another token is using; the
token’s holders still decide with the same quorum. Whatever you leave out stays as it is. In
`pvp proposals`, team votes show `[team]`.

### `pvp set-operator <address|none>`
Admin only: names the operator wallet (it opens team votes and blocks names; only the admin unblocks) or removes it.

### `pvp moderation`
Read-only, anyone can run it: the tokens the team hid from nopvp.app (with the reason) and the images it removed. `pvp tokens --visible` lists tokens without the hidden ones.

## Tools

### `pvp vanity [--suffix PVP] [--out mint.json] [--threads N]`
Grinds a keypair whose address ends in the suffix, on all CPU cores. Writes the keypair file (never prints the secret).
Each extra character makes it 58 times slower: `PVP` takes seconds, 5 characters takes hours.
