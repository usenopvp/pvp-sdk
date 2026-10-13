// Shared by the examples: loads the keypair from PVP_KEYPAIR (default: the Solana CLI keypair).
// The examples run on devnet unless PVP_NETWORK=mainnet (the SDK itself defaults to mainnet).
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Keypair } from "@solana/web3.js";
import { Pvp, parseNetwork } from "@usenopvp/sdk";

export function connect() {
  const path = process.env.PVP_KEYPAIR ?? join(homedir(), ".config", "solana", "id.json");
  const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))));
  return { wallet, pvp: new Pvp({ network: parseNetwork(process.env.PVP_NETWORK ?? "devnet"), rpcUrl: process.env.PVP_RPC_URL, wallet }) };
}
