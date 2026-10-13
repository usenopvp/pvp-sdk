# How PVP works

The rules below are enforced by the PVP program on Solana. The SDK checks the same rules before sending, so most mistakes
fail fast on your machine instead of costing a transaction fee. Read the live values with `pvp config` or
`pvp.getConfig()`: the numbers here are the current defaults.

## Tokens

- Anyone can launch. Launching costs only network rent (about **0.011 SOL**); there is no launch fee.
- Every token is a Token-2022 mint with 1,000,000,000 supply and 6 decimals.
- Tokens trade on a bonding curve (Meteora Dynamic Bonding Curve). When the curve collects **85 SOL**, liquidity moves to
  a Meteora DAMM v2 pool automatically. After that, the SDK trades on the pool; the methods are the same.
- The metadata authority belongs to the PVP program. **Nobody can rename a token alone, not even its creator.** Only a
  holder vote can.

### Mint addresses ending in PVP

PVP mints end in `PVP`, like pump.fun mints end in `pump`. You have three options:

| `mint` option | What happens |
|---|---|
| `"factory"` (default) | Takes a ready address from nopvp.app (rate limited to 6 per minute per IP). Falls back to a plain address. |
| a `Keypair` | Your own. Grind one with `pvp vanity` or `grindVanityMint()` (about 3 s on a modern laptop). |
| `"random"` | A plain random address. |

The mint key only creates the mint account. After launch, the program holds every authority over the token.

## Names

### One name, one token, 24 hours

A name lives on **one token at a time**. The first token to take a name (by launching or by a rename vote) holds it for
**24 hours**. During that time nobody else on PVP can launch with it, and holder votes can't rename into it. Only a
team vote (below) can move a name in use to another token, and only if that token's holders approve.

### Spellings count as the same name

Names are compared after normalization, so all of these are the **same** name:

```
Chill Guy   chillguy   CHILL-GUY!   ｃｈｉｌｌ ｇｕｙ   Сhill Guy (Cyrillic С)   Ch1ll Guy
```

Normalization removes spaces, punctuation and emoji, lowercases, folds accents and styled letters (𝐂, Ⓒ, ℂ), maps
look-alike letters from other alphabets, and maps confusable digits (`0→o`, `1→i`, `l→i`, `3→e`, `4→a`, `5→s`, `7→t`,
`8→b`). Use `normalizeName()` to see the key: `normalizeName("Chill Guy") === "chiiiguy"`.

### Limits

- Name: up to 32 bytes. Ticker: up to 10 bytes. Image link: up to 200 bytes.
- After normalization, only Latin letters, digits, and Chinese, Japanese or Korean characters.
- A short blocklist applies to names and tickers: a few hate terms built in (`BLOCKED_NAMES`: `adolfhitler`,
  `heilhitler`, `siegheil`, `whitepower`, in any spelling), plus any name the PVP team blocks on-chain later. Brand
  names are not blocked; `checkName` reads the on-chain list.

`pvp check-name <name>` / `pvp.checkName(name)` tells you if a name is free right now, who holds it and when it frees up.

## Rename votes

| Rule | Default |
|---|---|
| Who can open a vote | Anyone who locks **0.5% of the supply** voting YES |
| Cost to open | **0.06 SOL** = **0.05 SOL deposit**, returned if the vote passes or YES reaches the minimum (otherwise kept by PVP), + **0.01 SOL settlement fee**, not returned, paid to whoever settles the vote (it covers the transaction that writes the new name) |
| Vote length | **24 hours** (a vote in the last eighth extends it, up to double) |
| Passes when | YES reaches **10% of the supply** and YES > NO |
| Decided early | Once YES passes **50% of the supply** and a quarter of the vote length has passed (6 h of a 24 h vote), anyone can settle it before the end, in a transaction of its own (`ProposalInfo.earlySettleAt`); locked coins come back as soon as it's settled |
| Between renames | At least **24 hours** |
| Open votes per token | One |
| Team votes | The PVP team (admin or operator wallet) can open a vote without locking coins or paying the deposit or the settlement fee |

- **Voting locks your tokens** in the vote's vault. They stay yours; withdraw them any time. Withdrawing before the end
  removes your vote. The proposer's tokens stay locked until the vote ends.
- You can't vote both sides. Withdraw first to switch.
- The proposed name is **reserved** for the token while the vote runs (and a short grace period), so nobody grabs it
  before the result.
- **Team votes.** When the right name for a narrative is clear and the biggest token is still on the wrong name, the
  PVP team can open a vote for it, even if a smaller token already uses that name. The team only opens the vote: the
  token's holders decide with the same quorum, and the smaller token keeps its own name. Team votes show as such on
  the token page and in `ProposalInfo.byTeam`.
- When the vote ends, **anyone** can settle it (`pvp settle`). If it passed and the name is still free, the token is
  renamed in the same transaction: name, ticker and image.

## Moving into the winner (SDK and CLI only)

The website doesn't have this; it is a convenience of the SDK. `pvp move <loser> <winner>` / `pvp.moveInto()` sells one
token and buys another **in one transaction**, with a slippage limit on both legs. If either price moves too much,
nothing happens. It is two ordinary trades: no special rule of the program is involved.

## Fees

| Where | Fee | Split |
|---|---|---|
| Bonding curve | 1% of each trade, in SOL | 0.2% Meteora, 0.4% the token's holders, 0.4% PVP |
| Meteora pool (after migration) | 1% of each trade, in SOL | 80% the token's holders, 20% PVP |

There is no creator fee. **The holders' share goes to everyone who holds the token, automatically.** No locking:

- Every 10 minutes PVP records each wallet's balance; every hour, the new fees are split by each wallet's average balance
  in that hour (buying right before a split and selling right after earns almost nothing).
- Coins locked in a rename vote keep earning for the voter. Coins in pools and other program accounts don't earn.
- PVP publishes each wallet's running total on-chain as a Merkle root and the proofs at
  `https://nopvp.app/rewards/<network>/w/<wallet>.json`. The program pays only what matches the root, and the total can never
  exceed what the token's holders received.
- Claim whenever you want (`pvp claim <mint>`, `pvp rewards` to see everything). Unclaimed SOL doesn't expire.

## PVP token staking

**Not live on mainnet yet:** PVP token staking opens in a coming update. Until then the stakers' share is 0 and all of
the team's share goes to the team (`pvp staking` shows the live values). The rules below are how it works on devnet
today.

The PVP token is a regular token traded on a Meteora pool (not launched on the launchpad). Its holders can stake it
(`pvp stake`):

- Of the team's share of every fee on PVP (on the curve, the surplus after migration and the Meteora pool), a set part
  goes to the PVP token's stakers in SOL. On devnet it is 10% of the team's share, which on the curve is 0.04% of volume.
  `pvp staking` shows the current value; the team can change it (up to 50%). Holders' shares are not touched.
- What arrives is released over 24 hours and split by how much each wallet has staked.
- Unstaking can have a wait (set by the team, up to 30 days; 0 means instant). During the wait the tokens no longer earn; `pvp unstake-complete` takes them out when it ends.
- Payouts depend on trading volume. Nothing is guaranteed.

## What the program refuses

Your transaction fails (and costs only the network fee) when:

- the name or ticker is blocked, empty, too long, uses other alphabets, or is held/reserved by another token;
- the price moved past your slippage limit;
- you vote on a closed vote, switch sides, or settle a vote that is still open;
- you open a vote with less than the threshold, while another vote is open, or less than 24 h after the last rename.

See [errors.md](errors.md) for every error code.
