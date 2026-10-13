import { PublicKey } from "@solana/web3.js";
import type { Idl } from "@coral-xyz/anchor";
import devnetIdl from "./idl/devnet.js";
import mainnetIdl from "./idl/mainnet.js";

export type Network = "devnet" | "mainnet";

export interface NetworkInfo {
  network: Network;
  idl: Idl;
  programId: PublicKey;
  /** Public RPC. Fine for trying things out; bots should pass their own RPC (Helius, Triton, QuickNode...). */
  defaultRpc: string;
  /** Site that serves "...PVP" mint addresses (POST /api/mint-key). */
  site: string;
}

const info = (network: Network, idl: unknown, defaultRpc: string): NetworkInfo => ({
  network,
  idl: idl as Idl,
  programId: new PublicKey((idl as { address: string }).address),
  defaultRpc,
  site: "https://nopvp.app",
});

export const NETWORKS: Record<Network, NetworkInfo> = {
  devnet: info("devnet", devnetIdl, "https://api.devnet.solana.com"),
  mainnet: info("mainnet", mainnetIdl, "https://api.mainnet-beta.solana.com"),
};

export function parseNetwork(raw: string | undefined): Network {
  const v = (raw ?? "mainnet").trim().toLowerCase();
  if (v === "devnet") return "devnet";
  if (v === "mainnet" || v === "mainnet-beta") return "mainnet";
  throw new Error(`Unknown network "${raw}". Use devnet or mainnet.`);
}

export const DECIMALS = 6;
export const TOKEN_UNIT = 10 ** DECIMALS;
export const LAMPORTS_PER_SOL = 1_000_000_000;
