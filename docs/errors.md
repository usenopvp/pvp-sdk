# Errors

The SDK throws `PvpError`. `code` is the program error name when the program refused the transaction; the CLI prints it
in parentheses and in the `code` field of `--json` output. A refused transaction costs only the network fee.

## Errors from the SDK (before sending)

| `code` | Meaning |
|---|---|
| `empty`, `chars`, `too-long`, `blocked` | The name or ticker breaks a rule (see [rules](rules.md#names)) |
| `NoActiveProposal` | You voted or settled without `proposal` and the token has no open vote |
| `InsufficientFunds` | Not enough SOL for the transaction |

## Errors from the PVP program

| Code | Name | Message | What to do |
|---|---|---|---|
| 6000 | `EmptyName` | Name must have at least one letter or number | |
| 6001 | `TooLong` | Name, ticker or image link is too long | 32 / 10 / 200 bytes |
| 6003 | `NameBlocked` | This name belongs to a major brand or token | The name is on PVP's blocklist (a few hate terms plus names the team blocks on-chain). Pick another name |
| 6004 | `NameLocked` | Another token holds this name for now | `checkName` shows who and until when |
| 6005 | `NothingToChange` | Nothing to change | The vote proposes the current identity |
| 6007 | `ZeroAmount` | Amount must be greater than zero | |
| 6008 | `Slippage` | Price moved past your slippage limit | Retry, or raise `slippageBps` |
| 6011 | `ProposalActive` | This token already has an open rename vote | Vote on it instead |
| 6012 | `BelowProposalThreshold` | Lock more coins to open a rename vote | Default threshold: 0.5% of supply |
| 6013 | `VotingEnded` | Voting on this proposal has ended | Settle it |
| 6014 | `VotingOpen` | Voting on this proposal is still open | Wait for `endsAt` (or `earlySettleAt` if the vote is `decided`) |
| 6015 | `AlreadyExecuted` | This proposal was already settled | Withdraw your tokens |
| 6016 | `SwitchSide` | You already voted the other way; withdraw first to switch | |
| 6017 | `NothingToWithdraw` | Nothing to withdraw | |
| 6029 | `NothingToClaim` | Nothing to claim | No rewards accrued yet |
| 6030 | `InsufficientStake` | Not enough staked | |
| 6032 | `ProposerLocked` | The proposer's coins stay locked until the vote ends | |
| 6035 | `TickerBlocked` | This ticker belongs to a major brand or token | The ticker is on PVP's blocklist. Pick another ticker |
| 6037 | `VoteCooldown` | This token changed its name by vote less than a day ago | Wait 24 h after the last rename |
| 6038 | `NameChars` | Names and tickers can only use Latin letters, digits, and Chinese, Japanese or Korean characters | |
| 6039 | `NotOperator` | Only the PVP admin or operator can do this | Team commands need the admin or operator wallet |
| 6040 | `VotesLockedUntilEnd` | No longer used | |
| 6041 | `InvalidProof` | This rewards proof doesn't match the latest rewards root | Fetch the proofs again (`getMyRewards`) |
| 6042 | `NotRewardsAuthority` | Only the PVP rewards authority can publish rewards | |
| 6043 | `InvalidRewardsRoot` | Rewards can't exceed what holders received, and can't go down | |
| 6044 | `StakeOnlyPvpToken` | Only the PVP token has staking; other tokens pay holders automatically | Use `claimHolderRewards` |
| 6045 | `WrongRewardsAccount` | Holder rewards for this token go to a different account | |
| 6046 | `EarlySettleNotAlone` | A vote decided early must be counted in its own transaction | Send `settle` alone (priority fee instructions are fine) |
| 6047 | `UnstakeNeedsRequest` | Unstaking has a waiting period: request the unstake, then complete it when the wait is over | Use `requestUnstake`, then `completeUnstake` |
| 6048 | `UnstakeLocked` | The unstake waiting period is not over yet | Wait for `getStake().unstaking.unlockAt` |
| 6049 | `TransferHookNotSupported` | Tokens with a transfer hook can't be staked | |

Swaps on the curve and on the pool run in Meteora's programs; their errors (for example `ExceededSlippage`) come with
Meteora's names.
