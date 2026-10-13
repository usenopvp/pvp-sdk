# Examples

The examples run on **devnet** unless you set `PVP_NETWORK=mainnet` (the SDK and the CLI default to mainnet). Use a
funded keypair (get devnet SOL at https://faucet.solana.com):

```bash
export PVP_KEYPAIR=~/.config/solana/id.json   # signs the transactions
export PVP_RPC_URL=https://api.devnet.solana.com
export PVP_NETWORK=devnet                      # also used by the pvp CLI in the Python example
npx tsx examples/launch.ts "My Token" MYTKN https://example.com/image.png
npx tsx examples/watch-launches.ts
npx tsx examples/move-into-winner.ts <loser-mint> <winner-mint>
npx tsx examples/custom-send.ts <mint> 0.05
python examples/python/launch.py "My Token" MYTKN https://example.com/image.png
```
