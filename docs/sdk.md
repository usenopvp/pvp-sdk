# SDK reference

```ts
import { Pvp, PvpError, normalizeName, nameKey } from "@usenopvp/sdk";
import { grindVanityMint } from "@usenopvp/sdk/vanity"; // Node only
```

Amounts are human units everywhere: SOL as `0.5`, tokens as `1000000` (6 decimals). Pass strings (`"0.1"`) when you
need exact decimals; they are converted without float rounding. Addresses accept a base58 string or a `PublicKey`.

## `new Pvp(options)`

| Option | Type | Default | |
|---|---|---|---|
| `network` | `"mainnet" \| "devnet"` | `"mainnet"` | Devnet tokens and SOL have no value: test there first |
| `rpcUrl` | `string` | public RPC | Bring your own for bots |
| `connection` | `Connection` | | Instead of `rpcUrl` |
| `wallet` | `Keypair \| WalletSigner` | none | Needed to send. Any wallet adapter with `publicKey` and `signTransaction` works |
| `commitment` | `Commitment` | `"confirmed"` | |
| `priorityFee` | `number` | `0` | Micro-lamports per compute unit on every transaction |
| `slippageBps` | `number` | `100` | Default slippage for trades |
| `idl` | `Idl` | bundled | IDL of another deployment of the program (its `address` is used as the program id) |

Without a wallet, all read methods work and send methods throw.

## Reading

| Method | Returns |
|---|---|
| `getConfig()` | [`ChainConfig`](#chainconfig): name lock, vote rules, bond, supply. Cached per instance |
| `getToken(mint)` | [`TokenInfo`](#tokeninfo) or `null` if not a PVP token |
| `listTokens({ excludeHidden? })` | `TokenInfo[]`, newest first. One `getProgramAccounts` scan: don't call it in a tight loop. `excludeHidden: true` leaves out tokens the team hid from nopvp.app |
| `getModeration()` | `{ hiddenMints, removedImages, updatedAt }`: the team's public moderation list from nopvp.app. Hidden tokens still exist and trade on-chain; the site just stops listing them |
| `checkName(name, forMint?)` | [`NameStatus`](#namestatus). Pass `forMint` when checking a rename of that token |
| `getProposals(mint)` | [`ProposalInfo[]`](#proposalinfo), newest first |
| `getProposal(address)` | `ProposalInfo \| null` |
| `getVote(proposal, voter?)` | `{ amount, yes } \| null` |
| `getBalance(mint, owner?)` | Whole tokens |
| `getSolBalance(owner?)` | SOL |
| `getMyRewards(owner?)` | `MyReward[]`: per token, `earnedSol`, `claimedSol`, `claimableSol`, `current` (false for a moment while an hourly update lands) |
| `getHolderRewards(mint)` | `{ receivedSol, claimedSol, updatedAt } \| null`: what the token paid its holders |
| `getPvpTokenMint()` | The PVP token (the only one with staking), or `null` |
| `getStakePool(mint)` | `{ mint, totalStaked, totalDistributedSol } \| null` (PVP token) |
| `getStake(mint, owner?)` | `{ amount, pendingSol, claimedSol, unstaking } \| null`. `unstaking`: `{ amount, unlockAt, ready } \| null` (tokens waiting to come out; they no longer earn) |
| `getStakingRules()` | `{ pvpMint, stakerShareOfTeam, unstakeWaitSeconds }`: stakers get `stakerShareOfTeam` of the team's share of every fee (0.1 = 10%) |
| `quoteBuy(mint, sol)` | Tokens out, before slippage |
| `quoteSell(mint, tokens)` | SOL out, before slippage |
| `getOperator()` | The team's operator wallet, or `null` |

## Image and metadata

| Method | |
|---|---|
| `uploadImage(bytes)` | Uploads a PNG, JPEG or WebP (up to 5 MB) to nopvp.app and returns its URL. EXIF/GPS data is stripped |
| `createMetadata({ name, symbol, image, description?, links? })` | Stores the metadata JSON and returns the `uri` for `launch` or `propose`. `links`: `website`, `twitter`, `tweet`, `tiktok`, `telegram`, `github` (https) |

```ts
const image = await pvp.uploadImage(readFileSync("chill.png"));
const uri = await pvp.createMetadata({ name: "Chill Guy", symbol: "CHILL", image, links: { twitter: "https://x.com/chillguy" } });
await pvp.launch({ name: "Chill Guy", symbol: "CHILL", uri });
```

`owner` / `voter` default to the wallet.

## Sending

Each action builds, signs, sends and waits for confirmation. All take an optional last argument
`{ priorityFee?, skipPreflight? }` (trades also take `slippageBps`).

| Method | Returns |
|---|---|
| `launch({ name, symbol, uri, mint? })` | `{ mint, signature }`. `mint`: `"factory"` (default), `"random"` or a `Keypair` |
| `buy(mint, sol)` | `{ signature, expectedTokens, minTokens }` |
| `sell(mint, tokens)` | `{ signature, expectedSol, minSol }` |
| `moveInto(loser, winner, tokens)` | `{ signature, expectedWinner, minWinner }`. Sells one token and buys another in one transaction (an SDK extra; the website doesn't have it) |
| `propose({ mint, name, symbol, uri, tokens? })` | `{ proposal, signature }`. `tokens` defaults to the threshold |
| `vote({ mint, yes, tokens, proposal? })` | `{ signature }`. `proposal` defaults to the token's open vote |
| `withdrawVote({ mint, proposal })` | `{ signature }` |
| `settle({ mint, proposal? })` | `{ signature }` |
| `claimHolderRewards(mint)` | `{ signature, amountSol }`. Claims what you earned from holding; arrives as SOL |
| `stake(mint, tokens)` | `{ signature }`. Not live on mainnet yet. PVP token only (SPL Token or Token-2022); opens its pool on the first stake |
| `unstake(mint, tokens)` | `{ signature }`. Only while the unstake wait is zero |
| `requestUnstake(mint, tokens)` | `{ signature }`. Starts the wait; the tokens stop earning at once. Again adds and restarts the wait |
| `completeUnstake(mint)` | `{ signature }`. After the wait, the tokens come back |
| `claimRewards(mint)` | `{ signature }`. PVP token staking rewards; SOL arrives as SOL |
| `teamPropose({ mint, name, symbol, uri })` | `{ proposal, signature }`. Team only (admin or operator): opens a vote without locking coins; can propose a name in use |
| `setOperator(address or null)` | `{ signature }`. Admin only |

### Build without sending

Every action has a `build*` twin (`buildLaunch`, `buildBuy`, `buildSell`, `buildMoveInto`, `buildPropose`, `buildVote`,
`buildWithdrawVote`, `buildSettle`, `buildStake`, `buildUnstake`, `buildRequestUnstake`, `buildCompleteUnstake`, `buildClaimRewards`, `buildClaimHolderRewards`, `buildTeamPropose`,
`buildSetOperator`) that returns:

```ts
interface Built {
  instructions: TransactionInstruction[]; // no compute budget instructions: add your own
  signers: Keypair[];                     // extra signers (the new mint on launch)
  computeUnits: number;                   // a safe compute unit limit
}
```

Send it yourself (Jito bundle, your own fee logic, a versioned transaction) or with `pvp.send(built, opts)`.
See [bots.md](bots.md#custom-sending).

## Events

```ts
const stop = pvp.onEvent((ev) => { ... }); // websocket subscription on your RPC
stop();
```

| `ev.type` | Fields |
|---|---|
| `TokenCreated` | `mint, creator, name, symbol, uri, at` |
| `Renamed` | `mint, oldName, oldSymbol, name, symbol, uri, at, by` (`"vote"`) |
| `ProposalCreated` | `mint, proposal, id, name, symbol, amount, endsAt, byTeam` |
| `Voted` | `proposal, voter, yes, amount` |
| `VoteWithdrawn` | `proposal, voter, amount, voteCancelled` |
| `ProposalSettled` | `mint, proposal, passed, yes, no` |
| `FeesClaimed` | `mint, source, total, holders, team` (raw units) |

Every event has `signature`. Times are milliseconds; token amounts are whole tokens.

## Name helpers

| Function | |
|---|---|
| `normalizeName(name)` | The comparison key: `"CHILL-GUY!"` → `"chiiiguy"` |
| `nameAllowed(normalized)` | Only Latin letters, digits and CJK |
| `nameKey(name)` | 32-byte on-chain key (sha256 of the normalized name) |
| `validateIdentity(name, symbol, uri?)` | Offline check of lengths, characters and the built-in blocklist |
| `BLOCKED_NAMES`, `MAX_NAME_BYTES` (32), `MAX_SYMBOL_BYTES` (10), `MAX_URI_BYTES` (200), `NAME_LOCK_HOURS` (24) | |

## Vanity addresses (Node)

```ts
import { grindVanityMint } from "@usenopvp/sdk/vanity";
const mint = await grindVanityMint({ suffix: "PVP", onProgress: (n) => {} }); // Keypair, uses all cores
await pvp.launch({ name, symbol, uri, mint });
```

## Errors

Everything throws `PvpError` with `message`, `code` (the program error name, like `"NameLocked"`) and `logs`.

```ts
try {
  await pvp.launch({ ... });
} catch (e) {
  if (e instanceof PvpError && e.code === "NameLocked") { /* someone took it first */ }
}
```

All codes: [errors.md](errors.md).

## Types

### `TokenInfo`
`mint, name, symbol, uri, creator, createdAt, lastRenameAt (0 if never), renameCount, priceSol, marketCapSol,
progress (0..1), curveSol, migrated, dbcPool, dammPool, activeProposal (address | null), proposalCount, nameKey (hex)`

### `NameStatus`
```ts
| { available: true; key }
| { available: false; key; reason: "empty" | "chars" | "too-long" | "blocked" }
| { available: false; key; reason: "locked"; holder; freeAt }      // freeAt in ms
| { available: false; key; reason: "reserved"; reservedFor; freeAt }
```

### `ProposalInfo`
`address, mint, id, proposer, name, symbol, uri, createdAt, endsAt, yes, no, executed, passed, byTeam` (opened by the
PVP team without locking coins), `decided` (YES above 50% of the supply) and `earlySettleAt` (ms; when a decided vote
can be settled before `endsAt`)

### `ChainConfig`
`admin, feeRecipient, feeBps, holderFeeBps, nameLockSeconds, totalSupply, proposalThresholdBps, quorumBps,
voteDurationSeconds, voteRenameCooldownSeconds, proposalBondSol, executionFeeSol`

## Lower level

`pvp.program` (Anchor `Program`), `pvp.pda` (all program addresses), `pvp.trade` (curve and pool swap builder),
`pvp.connection`, `NETWORKS` (program ids and IDLs).
