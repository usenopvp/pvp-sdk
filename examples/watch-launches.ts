// Print every launch and rename on PVP as it happens.
// npx tsx examples/watch-launches.ts
import { Pvp, parseNetwork } from "@usenopvp/sdk";

const pvp = new Pvp({ network: parseNetwork(process.env.PVP_NETWORK ?? "devnet"), rpcUrl: process.env.PVP_RPC_URL });
const seen = new Set<string>();

console.log("watching PVP... (ctrl+c to stop)");
pvp.onEvent(async (ev) => {
  if (seen.has(ev.signature + ev.type)) return; // reconnects can replay
  seen.add(ev.signature + ev.type);
  if (ev.type === "TokenCreated") {
    console.log(`NEW     ${ev.name} ($${ev.symbol})  ${ev.mint}`);
  } else if (ev.type === "Renamed") {
    console.log(`RENAMED ${ev.oldName} -> ${ev.name}  ${ev.mint}`);
  } else if (ev.type === "ProposalCreated") {
    const t = await pvp.getToken(ev.mint);
    console.log(`VOTE    ${t?.name ?? ev.mint} wants to become "${ev.name}" (ends ${new Date(ev.endsAt).toISOString()})`);
  }
});
