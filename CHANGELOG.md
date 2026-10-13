# Changelog

## 0.1.0 (first public release)

First public release of the PVP SDK and CLI, for PVP on Solana mainnet (live since October 13, 2026).

- `Pvp` class: read tokens, names, votes, rewards and config; launch, buy, sell, propose, vote, withdraw, settle and
  claim holder rewards; `build*` twins that return the instructions without sending; live events with `onEvent`.
- Mainnet is the default network (`network: "devnet"` to test). Bundled IDLs for both networks.
- Name helpers that match the program: `normalizeName`, `nameKey`, `validateIdentity`, `BLOCKED_NAMES`.
- Image upload and metadata (`uploadImage`, `createMetadata`) through nopvp.app.
- Holder rewards: automatic, no locking; `getMyRewards` and `claimHolderRewards` with the published Merkle proofs.
- PVP token staking methods (`stake`, `requestUnstake`, `completeUnstake`, `claimRewards`): staking is not live on
  mainnet yet.
- `pvp` CLI with `--json` on every command; transactions on mainnet need `--yes`.
- `@usenopvp/sdk/vanity`: grind mint addresses ending in `PVP` locally.
