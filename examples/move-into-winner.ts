// Holding a token that lost the name race? Move everything into the winner in one transaction.
// (An SDK extra: the website doesn't offer it. It is a sell and a buy sent together, with slippage on both.)
// npx tsx examples/move-into-winner.ts <loser-mint> <winner-mint>
import { connect } from "./wallet.js";

const [loser, winner] = process.argv.slice(2);
if (!loser || !winner) throw new Error("usage: move-into-winner.ts <loser-mint> <winner-mint>");
const { pvp } = connect();

const [from, to, balance] = await Promise.all([pvp.getToken(loser), pvp.getToken(winner), pvp.getBalance(loser)]);
if (!from || !to) throw new Error("both must be PVP tokens");
if (balance <= 0) throw new Error(`you hold no ${from.name}`);

console.log(`moving ${balance} ${from.name} into ${to.name}...`);
const r = await pvp.moveInto(loser, winner, balance.toFixed(6), { slippageBps: 200 });
console.log(`done: ~${r.expectedWinner.toFixed(0)} ${to.symbol} (min ${r.minWinner.toFixed(0)}), ${r.signature}`);
