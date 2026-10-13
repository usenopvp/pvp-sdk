// Launch a token if the name is free, then buy a little of it.
// npx tsx examples/launch.ts "My Token" MYTKN https://example.com/image.png
import { PvpError } from "@usenopvp/sdk";
import { connect } from "./wallet.js";

const [name, symbol, uri] = process.argv.slice(2);
if (!name || !symbol || !uri) throw new Error('usage: launch.ts "<name>" <TICKER> <image url>');
const { pvp } = connect();

const status = await pvp.checkName(name);
if (!status.available) {
  console.log(`"${name}" is not available: ${status.reason}`, status);
  process.exit(1);
}

try {
  const { mint, signature } = await pvp.launch({ name, symbol, uri });
  console.log(`launched ${mint} (${signature})`);
  const buy = await pvp.buy(mint, 0.01);
  console.log(`bought ~${buy.expectedTokens.toFixed(0)} tokens`);
} catch (e) {
  if (e instanceof PvpError && e.code === "NameLocked") console.log("someone launched this name a moment before us");
  else throw e;
}
