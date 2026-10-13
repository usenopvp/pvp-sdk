// Build a buy and send it yourself as a versioned transaction with your own priority fee
// (the same shape you'd use for a Jito bundle).
// npx tsx examples/custom-send.ts <mint> <sol>
import { ComputeBudgetProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { connect } from "./wallet.js";

const [mint, sol = "0.01"] = process.argv.slice(2);
if (!mint) throw new Error("usage: custom-send.ts <mint> [sol]");
const { pvp, wallet } = connect();

const built = await pvp.buildBuy(mint, sol, 300); // 3% slippage
const { blockhash, lastValidBlockHeight } = await pvp.connection.getLatestBlockhash();
const message = new TransactionMessage({
  payerKey: wallet.publicKey,
  recentBlockhash: blockhash,
  instructions: [
    ComputeBudgetProgram.setComputeUnitLimit({ units: built.computeUnits }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
    ...built.instructions,
  ],
}).compileToV0Message();
const tx = new VersionedTransaction(message);
tx.sign([wallet, ...built.signers]);
const signature = await pvp.connection.sendTransaction(tx);
await pvp.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
console.log(`bought ~${built.expectedTokens.toFixed(0)} tokens (min ${built.minTokens.toFixed(0)}): ${signature}`);
