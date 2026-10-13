// PVP client: reads tokens, names, votes and rewards, and builds/sends every user transaction of the launchpad.
import { AnchorProvider, BorshCoder, EventParser, Program, type Idl } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SendTransactionError,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  type Commitment,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  ExtensionType,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  getAssociatedTokenAddressSync,
  getExtensionData,
  unpackMint,
} from "@solana/spl-token";
import { unpack as unpackMetadata } from "@solana/spl-token-metadata";
import {
  DAMM_V2_MIGRATION_FEE_ADDRESS,
  DynamicBondingCurveIdl,
  MigrationFeeOption,
  deriveDammV2PoolAddress,
  deriveDbcEventAuthority,
  deriveDbcPoolAddress,
  deriveDbcPoolAuthority,
  deriveDbcTokenVaultAddress,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { CpAmm } from "@meteora-ag/cp-amm-sdk";
import BN from "bn.js";
import { NETWORKS, TOKEN_UNIT, LAMPORTS_PER_SOL, DECIMALS, type Network, type NetworkInfo } from "./networks.js";
import { pdas, type Pdas } from "./pda.js";
import { nameKey, normalizeName, validateIdentity, type IdentityProblem } from "./names.js";
import { PvpClient } from "./trade.js";
import { createMetadata, uploadImage } from "./metadata.js";

// ---------- types ----------

/** Anything that can sign: a Keypair (bots, CLI) or a browser wallet adapter. */
export interface WalletSigner {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}
export type WalletLike = Keypair | WalletSigner;

/** Where the mint address comes from when launching. */
export type MintSource =
  /** An address ending in "PVP" from nopvp.app (rate limited); falls back to a random address. Default. */
  | "factory"
  /** A plain random address. */
  | "random"
  /** Your own keypair, e.g. one ground with `grindVanityMint` from "@usenopvp/sdk/vanity". */
  | Keypair;

export interface PvpOptions {
  /** `"mainnet"` (default) or `"devnet"`. */
  network?: Network;
  /** Your RPC. Defaults to the public RPC of the network (rate limited; fine for testing only). */
  rpcUrl?: string;
  /** Or pass a ready connection (takes precedence over rpcUrl). */
  connection?: Connection;
  wallet?: WalletLike;
  commitment?: Commitment;
  /** Priority fee in micro-lamports per compute unit, added to every transaction. Default 0. */
  priorityFee?: number;
  /** Default slippage for trades, in basis points (100 = 1%). Default 100. */
  slippageBps?: number;
  /**
   * IDL of a different deployment of the PVP program (its `address` becomes the program id), e.g. a launch rehearsal
   * on devnet with a fresh program id. Defaults to the bundled IDL of the network.
   */
  idl?: Idl;
}

export interface SendOptions {
  priorityFee?: number;
  /** Skip the RPC simulation before sending. */
  skipPreflight?: boolean;
}

/** Instructions ready to send, for bots that want their own sending (Jito bundles, custom fees, retries). */
export interface Built {
  instructions: TransactionInstruction[];
  /** Extra signers besides the wallet (e.g. the new mint on launch). */
  signers: Keypair[];
  computeUnits: number;
}

export interface ChainConfig {
  admin: string;
  feeRecipient: string;
  /** Fee split of the 1% curve fee, in bps of the PVP share (team vs holders). */
  feeBps: number;
  holderFeeBps: number;
  /** Seconds a name stays with a token before anyone else can take it (24 h). */
  nameLockSeconds: number;
  totalSupply: number;
  /** Share of the supply you must lock to open a rename vote (bps). */
  proposalThresholdBps: number;
  /** Share of the supply that must vote for a result to count (bps). */
  quorumBps: number;
  voteDurationSeconds: number;
  /** Minimum time between two renames by vote. */
  voteRenameCooldownSeconds: number;
  /** SOL deposit to open a vote (returned if it passes or YES reaches quorum). */
  proposalBondSol: number;
  /** SOL settlement fee to open a holder vote (not returned; paid to whoever settles the vote). */
  executionFeeSol: number;
}

/**
 * PVP's moderation list (off-chain): tokens the team hid from nopvp.app and images it removed. Tokens can't be deleted
 * on-chain, so a hidden token still trades; the site just stops listing it.
 */
export interface Moderation {
  updatedAt: number;
  /** mint -> why and when it was hidden, and by which team wallet. */
  hiddenMints: Record<string, { reason: string; at: number; by: string }>;
  /** Image file names on nopvp.app/i/ (`<sha256>.<ext>`) that were removed. */
  removedImages: Record<string, { reason: string; at: number; by: string }>;
}

export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  creator: string;
  createdAt: number; // ms
  lastRenameAt: number; // ms, 0 if never renamed
  renameCount: number;
  /** SOL per whole token. */
  priceSol: number;
  marketCapSol: number;
  /** Bonding curve progress, 0 to 1. */
  progress: number;
  /** SOL in the curve. */
  curveSol: number;
  migrated: boolean;
  dbcPool: string;
  /** Meteora DAMM v2 pool (exists after migration). */
  dammPool: string;
  activeProposal: string | null;
  proposalCount: number;
  /** Hex of the on-chain name key. */
  nameKey: string;
}

export interface ProposalInfo {
  address: string;
  mint: string;
  id: number;
  proposer: string;
  name: string;
  symbol: string;
  uri: string;
  createdAt: number; // ms
  endsAt: number; // ms
  yes: number; // whole tokens locked
  no: number;
  executed: boolean;
  passed: boolean;
  /** Opened by the PVP team (admin or operator) without locking coins. Holders still decide. */
  byTeam: boolean;
  /** YES is above half the supply: the result is decided and the vote can be settled before `endsAt` (from `earlySettleAt`). */
  decided: boolean;
  /** Earliest time (ms) a decided vote can be settled before `endsAt`: a quarter of the vote duration after it opened. */
  earlySettleAt: number;
}

export type NameStatus =
  | { available: true; key: string }
  | { available: false; key: string; reason: IdentityProblem }
  | { available: false; key: string; reason: "locked"; holder: string; freeAt: number }
  | { available: false; key: string; reason: "reserved"; reservedFor: string; freeAt: number };

export interface StakePoolInfo {
  mint: string;
  totalStaked: number;
  totalDistributedSol: number;
}

export interface HolderRewardsInfo {
  mint: string;
  /** Everything the token's holders received so far. */
  receivedSol: number;
  claimedSol: number;
  /** Last time PVP published new shares (ms). */
  updatedAt: number;
}

export interface MyReward {
  mint: string;
  /** Total earned in lamports (as text) at the latest update: the amount the claim proves. */
  cumulative: string;
  proof: string[];
  earnedSol: number;
  claimedSol: number;
  claimableSol: number;
  /** The proof matches the on-chain root (false for a moment while an update lands). */
  current: boolean;
}

export interface MyStake {
  amount: number;
  pendingSol: number;
  claimedSol: number;
  /** Pending unstake request: no longer earning, can be taken out once `ready` (unlockAt in ms). */
  unstaking: { amount: number; unlockAt: number; ready: boolean } | null;
}

export interface StakingRules {
  /** The PVP token's mint, or null before it is registered. */
  pvpMint: string | null;
  /** Fraction of the team's share of every fee that goes to PVP stakers (0.1 = 10%). */
  stakerShareOfTeam: number;
  /** Wait between requesting and completing an unstake, in seconds (0 = unstake right away). */
  unstakeWaitSeconds: number;
}

export type PvpEvent =
  | { type: "TokenCreated"; signature: string; mint: string; creator: string; name: string; symbol: string; uri: string; at: number }
  | { type: "Renamed"; signature: string; mint: string; oldName: string; oldSymbol: string; name: string; symbol: string; uri: string; at: number; by: string }
  | { type: "ProposalCreated"; signature: string; mint: string; proposal: string; id: number; name: string; symbol: string; amount: number; endsAt: number; byTeam: boolean }
  | { type: "Voted"; signature: string; proposal: string; voter: string; yes: boolean; amount: number }
  | { type: "VoteWithdrawn"; signature: string; proposal: string; voter: string; amount: number; voteCancelled: boolean }
  | { type: "ProposalSettled"; signature: string; mint: string; proposal: string; passed: boolean; yes: number; no: number }
  | { type: "FeesClaimed"; signature: string; mint: string; source: unknown; total: number; holders: number; stakers: number; team: number };

/** Error from the PVP program or the network, with the program's reason when there is one. */
export class PvpError extends Error {
  constructor(
    message: string,
    /** Program error name, e.g. "NameLocked". */
    readonly code?: string,
    readonly logs?: string[],
  ) {
    super(message);
    this.name = "PvpError";
  }
}

// ---------- helpers ----------

/** Supply of every PVP token in base units (1 billion, 6 decimals). */
const SUPPLY_RAW = 1_000_000_000_000_000n;

const big = (x: any) => Number(x?.toString?.() ?? x ?? 0);
const pick = (o: any, camel: string, snake: string) => o?.[camel] ?? o?.[snake];
const hex = (b: Uint8Array | number[]) => Buffer.from(Uint8Array.from(b)).toString("hex");
const priceFromSqrt = (sqrt: any) => (big(sqrt) / 2 ** 64) ** 2 * 10 ** (DECIMALS - 9);
const DAMM_CONFIG = DAMM_V2_MIGRATION_FEE_ADDRESS[MigrationFeeOption.Customizable];
const DBC_PROGRAM_ID = new PublicKey((DynamicBondingCurveIdl as { address: string }).address);
const dbcCoder = new BorshCoder(DynamicBondingCurveIdl as unknown as Idl);

/** Decimal amount → raw integer units, without float rounding surprises (0.1 SOL is exactly 100000000). */
export function toRaw(amount: number | string, decimals: number): bigint {
  const s = typeof amount === "number" ? amount.toFixed(decimals) : amount.trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new PvpError(`Invalid amount: ${amount}`);
  const [int, frac = ""] = s.split(".");
  return BigInt(int + frac.padEnd(decimals, "0").slice(0, decimals));
}
export const tokensToRaw = (tokens: number | string) => toRaw(tokens, DECIMALS);
export const solToLamports = (sol: number | string) => toRaw(sol, 9);

function asSigner(w: WalletLike): WalletSigner {
  if (!(w instanceof Keypair)) return w;
  return {
    publicKey: w.publicKey,
    async signTransaction(tx) {
      if (tx instanceof VersionedTransaction) tx.sign([w]);
      else tx.partialSign(w);
      return tx;
    },
    async signAllTransactions(txs) {
      for (const tx of txs) await this.signTransaction(tx);
      return txs;
    },
  };
}

const readOnlySigner: WalletSigner = {
  publicKey: PublicKey.default,
  signTransaction: () => Promise.reject(new PvpError("No wallet: pass `wallet` to create Pvp to send transactions.")),
  signAllTransactions: () => Promise.reject(new PvpError("No wallet: pass `wallet` to create Pvp to send transactions.")),
};

// ---------- client ----------

export class Pvp {
  readonly network: Network;
  readonly net: NetworkInfo;
  readonly connection: Connection;
  readonly program: Program;
  readonly pda: Pdas;
  readonly trade: PvpClient;
  readonly slippageBps: number;
  private readonly signer: WalletSigner | null;
  private readonly priorityFee: number;
  private readonly commitment: Commitment;
  private configCache: Promise<ChainConfig> | null = null;

  constructor(opts: PvpOptions = {}) {
    this.network = opts.network ?? "mainnet";
    const base = NETWORKS[this.network];
    this.net = opts.idl ? { ...base, idl: opts.idl, programId: new PublicKey((opts.idl as Idl & { address: string }).address) } : base;
    this.commitment = opts.commitment ?? "confirmed";
    this.connection = opts.connection ?? new Connection(opts.rpcUrl ?? this.net.defaultRpc, this.commitment);
    this.signer = opts.wallet ? asSigner(opts.wallet) : null;
    this.priorityFee = opts.priorityFee ?? 0;
    this.slippageBps = opts.slippageBps ?? 100;
    this.program = new Program(
      this.net.idl,
      new AnchorProvider(this.connection, this.signer ?? readOnlySigner, { commitment: this.commitment }),
    );
    this.pda = pdas(this.net.programId);
    this.trade = new PvpClient(this.program);
  }

  /** The connected wallet's address (throws without a wallet). */
  get publicKey(): PublicKey {
    if (!this.signer) throw new PvpError("No wallet: pass `wallet` to create Pvp to send transactions.");
    return this.signer.publicKey;
  }

  private get acc() {
    return this.program.account as any;
  }

  // ---------- reads ----------

  /** Launchpad parameters (fees, name lock, vote rules). Cached. */
  getConfig(): Promise<ChainConfig> {
    this.configCache ??= this.acc.config.fetch(this.pda.config).then((c: any) => ({
      admin: c.admin.toBase58(),
      feeRecipient: c.feeRecipient.toBase58(),
      feeBps: c.feeBps,
      holderFeeBps: c.holderFeeBps,
      nameLockSeconds: big(c.nameLock),
      totalSupply: big(c.totalSupply) / TOKEN_UNIT,
      proposalThresholdBps: c.proposalThresholdBps,
      quorumBps: c.quorumBps,
      voteDurationSeconds: big(c.voteDuration),
      voteRenameCooldownSeconds: big(c.voteRenameCooldown),
      proposalBondSol: big(c.proposalBond) / LAMPORTS_PER_SOL,
      executionFeeSol: big(c.executionFee) / LAMPORTS_PER_SOL,
    }));
    this.configCache!.catch(() => (this.configCache = null));
    return this.configCache!;
  }

  /** One token by mint, or null if it was not launched on PVP. */
  async getToken(mint: string | PublicKey): Promise<TokenInfo | null> {
    let m: PublicKey;
    try {
      m = new PublicKey(mint);
    } catch {
      return null;
    }
    const curve = await this.acc.curve.fetchNullable(this.pda.curve(m));
    if (!curve) return null;
    const [list] = await Promise.all([this.toTokens([{ account: curve }])]);
    return list[0] ?? null;
  }

  /**
   * Every token launched on PVP, newest first. One RPC scan: cache it in a bot instead of calling in a loop.
   * With `excludeHidden`, tokens the team hid from nopvp.app (see `getModeration`) are left out.
   */
  async listTokens(opts: { excludeHidden?: boolean } = {}): Promise<TokenInfo[]> {
    const mod = opts.excludeHidden ? this.getModeration() : null;
    const coder = this.program.coder.accounts as any;
    const raw = await this.connection.getProgramAccounts(this.net.programId, { filters: [{ memcmp: coder.memcmp("curve") }] });
    const curves: { account: any }[] = [];
    for (const { account } of raw) {
      try {
        curves.push({ account: coder.decode("curve", account.data) });
      } catch {
        // account from an older program version
      }
    }
    const hidden = mod ? (await mod).hiddenMints : {};
    return (await this.toTokens(curves)).filter((t) => !hidden[t.mint]).sort((a, b) => b.createdAt - a.createdAt);
  }

  /** The team's moderation list from nopvp.app (public, read-only). Empty if the site serves another network. */
  async getModeration(): Promise<Moderation> {
    const r = await fetch(`${this.net.site}/api/moderation`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new PvpError(`Couldn't read the moderation list (HTTP ${r.status}).`, "ModerationUnavailable");
    const j = (await r.json()) as { cluster?: string; updatedAt?: number; mints?: Moderation["hiddenMints"]; images?: Moderation["removedImages"] };
    const cluster = this.network === "mainnet" ? "mainnet-beta" : "devnet";
    if (j.cluster && j.cluster !== cluster) return { updatedAt: j.updatedAt ?? 0, hiddenMints: {}, removedImages: {} };
    return { updatedAt: j.updatedAt ?? 0, hiddenMints: j.mints ?? {}, removedImages: j.images ?? {} };
  }

  private async toTokens(curves: { account: any }[]): Promise<TokenInfo[]> {
    const [cfg, metas, pools] = await Promise.all([
      this.getConfig(),
      this.readMetas(curves.map((c) => c.account.mint)),
      this.readMany(curves.map((c) => c.account.dbcPool), (d) => dbcCoder.accounts.decode("VirtualPool", d)),
    ]);
    const threshold = await this.curveThreshold();
    const out: TokenInfo[] = [];
    for (const { account: c } of curves) {
      const raw = pools.get(c.dbcPool.toBase58());
      if (!raw) continue;
      const pool = raw.poolState ?? raw.pool_state ?? raw;
      const mint: PublicKey = c.mint;
      const migrated = big(pick(pool, "isMigrated", "is_migrated")) === 1;
      const dammPool = deriveDammV2PoolAddress(DAMM_CONFIG, mint, NATIVE_MINT);
      let price = priceFromSqrt(pick(pool, "sqrtPrice", "sqrt_price"));
      if (migrated) {
        const st = await new CpAmm(this.connection).fetchPoolState(dammPool).catch(() => null);
        if (st) price = priceFromSqrt(st.sqrtPrice);
      }
      const quote = big(pick(pool, "quoteReserve", "quote_reserve"));
      const meta = metas.get(mint.toBase58()) ?? { name: "?", symbol: "?", uri: "" };
      out.push({
        mint: mint.toBase58(),
        ...meta,
        creator: c.creator.toBase58(),
        createdAt: big(c.createdAt) * 1000,
        lastRenameAt: c.renameCount > 0 ? big(c.lastRenameAt) * 1000 : 0,
        renameCount: c.renameCount,
        priceSol: price,
        marketCapSol: price * cfg.totalSupply,
        progress: migrated ? 1 : threshold > 0 ? Math.min(1, quote / threshold) : 0,
        curveSol: quote / LAMPORTS_PER_SOL,
        migrated,
        dbcPool: c.dbcPool.toBase58(),
        dammPool: dammPool.toBase58(),
        activeProposal: c.activeProposal.equals(PublicKey.default) ? null : c.activeProposal.toBase58(),
        proposalCount: c.proposalCount,
        nameKey: hex(c.nameKey),
      });
    }
    return out;
  }

  private thresholdCache: Promise<number> | null = null;
  private curveThreshold() {
    this.thresholdCache ??= (async () => {
      const settings = await this.acc.dbcSettings.fetch(this.pda.dbcSettings);
      const info = await this.connection.getAccountInfo(settings.dbcConfig);
      const d: any = dbcCoder.accounts.decode("PoolConfig", info!.data);
      return big(pick(d?.config ?? d, "migrationQuoteThreshold", "migration_quote_threshold"));
    })();
    this.thresholdCache.catch(() => (this.thresholdCache = null));
    return this.thresholdCache;
  }

  private async readMany<T>(keys: PublicKey[], decode: (data: Buffer) => T) {
    const out = new Map<string, T>();
    for (let i = 0; i < keys.length; i += 100) {
      const chunk = keys.slice(i, i + 100);
      const infos = await this.connection.getMultipleAccountsInfo(chunk);
      infos.forEach((info, j) => {
        if (!info) return;
        try {
          out.set(chunk[j].toBase58(), decode(info.data));
        } catch {
          // unreadable account
        }
      });
    }
    return out;
  }

  private async readMetas(mints: PublicKey[]) {
    const out = new Map<string, { name: string; symbol: string; uri: string }>();
    for (let i = 0; i < mints.length; i += 100) {
      const chunk = mints.slice(i, i + 100);
      const infos = await this.connection.getMultipleAccountsInfo(chunk);
      infos.forEach((info, j) => {
        try {
          const mint = unpackMint(chunk[j], info, TOKEN_2022_PROGRAM_ID);
          const data = getExtensionData(ExtensionType.TokenMetadata, mint.tlvData);
          if (!data) return;
          const m = unpackMetadata(data);
          out.set(chunk[j].toBase58(), { name: m.name, symbol: m.symbol, uri: m.uri });
        } catch {
          // mint without readable metadata
        }
      });
    }
    return out;
  }

  /**
   * Can this name be used right now (launch or rename)? Checks the rules, the on-chain blocklist, the 24 h lock and
   * names reserved by open votes. Pass `forMint` when checking a rename of that token (its own name is fine).
   */
  async checkName(name: string, forMint?: string | PublicKey): Promise<NameStatus> {
    const key = normalizeName(name);
    const local = validateIdentity(name, "X");
    if (!local.ok) return { available: false, key, reason: local.problem };
    const k = await nameKey(name);
    const [blocked, rec, cfg] = await Promise.all([
      this.connection.getAccountInfo(this.pda.blocked(k)),
      this.acc.nameRecord.fetchNullable(this.pda.name(k)),
      this.getConfig(),
    ]);
    if (blocked) return { available: false, key, reason: "blocked" };
    if (rec) {
      const now = Math.floor(Date.now() / 1000);
      const self = forMint ? new PublicKey(forMint) : PublicKey.default;
      const holder: PublicKey = rec.holder;
      if (!holder.equals(PublicKey.default) && !holder.equals(self) && now - big(rec.since) < cfg.nameLockSeconds) {
        return { available: false, key, reason: "locked", holder: holder.toBase58(), freeAt: (big(rec.since) + cfg.nameLockSeconds) * 1000 };
      }
      const resv: PublicKey = rec.reservedFor;
      if (!resv.equals(PublicKey.default) && !resv.equals(self) && now < big(rec.reservedUntil)) {
        return { available: false, key, reason: "reserved", reservedFor: resv.toBase58(), freeAt: big(rec.reservedUntil) * 1000 };
      }
    }
    return { available: true, key };
  }

  /** Rename votes of a token, newest first. */
  async getProposals(mint: string | PublicKey): Promise<ProposalInfo[]> {
    const cfg = await this.getConfig();
    const coder = this.program.coder.accounts as any;
    const raw = await this.connection.getProgramAccounts(this.net.programId, {
      filters: [{ memcmp: coder.memcmp("proposal") }, { memcmp: { offset: 8, bytes: new PublicKey(mint).toBase58() } }],
    });
    const out: ProposalInfo[] = [];
    for (const { pubkey, account } of raw) {
      try {
        out.push(this.toProposal(pubkey, coder.decode("proposal", account.data), cfg.voteDurationSeconds));
      } catch {
        // older layout
      }
    }
    return out.sort((a, b) => b.id - a.id);
  }

  async getProposal(address: string | PublicKey): Promise<ProposalInfo | null> {
    const [p, cfg] = await Promise.all([this.acc.proposal.fetchNullable(new PublicKey(address)), this.getConfig()]);
    return p ? this.toProposal(new PublicKey(address), p, cfg.voteDurationSeconds) : null;
  }

  /** The PVP token's mint (the only token with staking), or null before it launches. */
  async getPvpTokenMint(): Promise<string | null> {
    const p = await this.acc.pvpToken.fetchNullable(this.pda.pvpToken);
    return p ? (p.mint as PublicKey).toBase58() : null;
  }

  /** A token's automatic holder rewards: everything its holders received and claimed so far (SOL). */
  async getHolderRewards(mint: string | PublicKey): Promise<HolderRewardsInfo | null> {
    const a = await this.acc.holderRewards.fetchNullable(this.pda.holderRewards(new PublicKey(mint)));
    if (!a) return null;
    return {
      mint: (a.mint as PublicKey).toBase58(),
      receivedSol: big(a.totalReceived) / LAMPORTS_PER_SOL,
      claimedSol: big(a.totalClaimed) / LAMPORTS_PER_SOL,
      updatedAt: big(a.updatedAt) * 1000,
    };
  }

  /**
   * What a wallet earned from holding each token: the shares PVP published (updated about hourly) and what it already
   * claimed on-chain. `current` is false for a moment while a new update lands; claim after it turns true.
   */
  async getMyRewards(owner: PublicKey | string = this.publicKey): Promise<MyReward[]> {
    const w = new PublicKey(owner);
    const r = await fetch(`${this.net.site}/rewards/${this.network}/w/${w.toBase58()}.json`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (r.status === 404) return [];
    if (!r.ok) throw new PvpError(`Couldn't read rewards (HTTP ${r.status}).`, "RewardsUnavailable");
    const file = (await r.json()) as { tokens?: Record<string, { amount: string; proof: string[]; root: string }> };
    const entries = Object.entries(file.tokens ?? {});
    if (!entries.length) return [];
    const keys = entries.flatMap(([m]) => [this.pda.holderRewards(new PublicKey(m)), this.pda.rewardClaim(new PublicKey(m), w)]);
    const infos = await this.connection.getMultipleAccountsInfo(keys, this.commitment);
    const coder = this.program.coder.accounts;
    return entries.map(([mint, e], i) => {
      const hr = infos[2 * i] ? (coder.decode("holderRewards", infos[2 * i]!.data) as any) : null;
      const claimed = infos[2 * i + 1] ? BigInt((coder.decode("rewardClaim", infos[2 * i + 1]!.data) as any).claimed.toString()) : 0n;
      const earned = BigInt(e.amount);
      return {
        mint,
        cumulative: e.amount,
        proof: e.proof,
        earnedSol: Number(earned) / LAMPORTS_PER_SOL,
        claimedSol: Number(claimed) / LAMPORTS_PER_SOL,
        claimableSol: Number(earned > claimed ? earned - claimed : 0n) / LAMPORTS_PER_SOL,
        current: !!hr && Buffer.from(hr.root).toString("hex") === e.root,
      };
    });
  }

  /** Uploads a PNG, JPEG or WebP (up to 5 MB) to PVP and returns its public URL. */
  uploadImage(bytes: Uint8Array): Promise<string> {
    return uploadImage(bytes, this.net.site);
  }

  /** Stores the token's metadata JSON (image from `uploadImage`, description, links) and returns the `uri`. */
  createMetadata(m: Parameters<typeof createMetadata>[0]): Promise<string> {
    return createMetadata(m, this.net.site);
  }

  /** The team's operator wallet (opens team votes, blocks and unblocks names), or null if none is set. */
  async getOperator(): Promise<string | null> {
    const op = await this.acc.operator.fetchNullable(this.pda.operator);
    return op && !op.key.equals(PublicKey.default) ? op.key.toBase58() : null;
  }

  private toProposal(address: PublicKey, p: any, voteDurationSeconds: number): ProposalInfo {
    return {
      address: address.toBase58(),
      mint: p.mint.toBase58(),
      id: p.id,
      proposer: p.proposer.toBase58(),
      name: p.name,
      symbol: p.symbol,
      uri: p.uri,
      createdAt: big(p.createdAt) * 1000,
      endsAt: big(p.endsAt) * 1000,
      yes: big(p.yes) / TOKEN_UNIT,
      no: big(p.no) / TOKEN_UNIT,
      executed: p.executed,
      passed: p.passed,
      byTeam: p.kind === 2,
      decided: BigInt(p.yes.toString()) * 2n > SUPPLY_RAW,
      earlySettleAt: (big(p.createdAt) + Math.floor(voteDurationSeconds / 4)) * 1000,
    };
  }

  /** How a wallet voted on a proposal (null if it has nothing locked there). */
  async getVote(proposal: string | PublicKey, voter: PublicKey = this.publicKey) {
    const v = await this.acc.voteRecord.fetchNullable(this.pda.vote(new PublicKey(proposal), voter));
    return v ? { amount: big(v.amount) / TOKEN_UNIT, yes: v.yes as boolean } : null;
  }

  /** Token balance in whole tokens. */
  async getBalance(mint: string | PublicKey, owner: PublicKey = this.publicKey): Promise<number> {
    // Launchpad tokens are Token-2022 with 6 decimals; the PVP token can be SPL Token with other decimals.
    const m = new PublicKey(mint);
    const info = await this.connection.getAccountInfo(m).catch(() => null);
    const programId = info?.owner.equals(TOKEN_PROGRAM_ID) ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID;
    const r = await this.connection.getTokenAccountBalance(getAssociatedTokenAddressSync(m, owner, true, programId)).catch(() => null);
    return r ? big(r.value.amount) / 10 ** r.value.decimals : 0;
  }

  async getSolBalance(owner: PublicKey = this.publicKey): Promise<number> {
    return (await this.connection.getBalance(owner)) / LAMPORTS_PER_SOL;
  }

  /** Staking pool of the PVP token (null until it is opened). */
  async getStakePool(mint: string | PublicKey): Promise<StakePoolInfo | null> {
    const m = new PublicKey(mint);
    const p = await this.acc.stakePool.fetchNullable(this.pda.stakePool(m));
    if (!p) return null;
    const unit = 10 ** (await this.mintInfo(m)).decimals;
    return { mint: m.toBase58(), totalStaked: big(p.totalStaked) / unit, totalDistributedSol: big(p.totalDistributed) / LAMPORTS_PER_SOL };
  }

  /**
   * Staking rules: the PVP token, the stakers' share of PVP's revenue (fraction of the team's share of every fee) and
   * the wait to unstake (0 = instant).
   */
  async getStakingRules(): Promise<StakingRules> {
    const [cfg, pvp] = await Promise.all([this.acc.config.fetch(this.pda.config), this.getPvpTokenMint()]);
    // Same as Config::staker_bps()/stake_cooldown() in the program: an out-of-range value counts as 0.
    const bps = big(cfg.stakerBps);
    const cooldown = big(cfg.stakeCooldown);
    return {
      pvpMint: pvp,
      stakerShareOfTeam: bps <= 5_000 ? bps / 10_000 : 0,
      unstakeWaitSeconds: cooldown >= 0 && cooldown <= 30 * 86_400 ? cooldown : 0,
    };
  }

  /** What a wallet has staked, can claim and is unstaking (as accounted on-chain so far). */
  async getStake(mint: string | PublicKey, owner: PublicKey = this.publicKey): Promise<MyStake | null> {
    const m = new PublicKey(mint);
    const [s, p, r] = await Promise.all([
      this.acc.stakeAccount.fetchNullable(this.pda.stakeAccount(m, owner)),
      this.acc.stakePool.fetchNullable(this.pda.stakePool(m)),
      this.acc.unstakeRequest.fetchNullable(this.pda.unstakeRequest(m, owner)),
    ]);
    if (!p || (!s && !r)) return null;
    const unit = 10 ** (await this.mintInfo(m)).decimals;
    let pending = new BN(0);
    if (s) {
      const scale = new BN("1000000000000");
      const accrued = new BN(s.amount.toString()).mul(new BN(p.accRewardPerShare.toString())).div(scale);
      pending = accrued.sub(new BN(s.rewardDebt.toString())).add(new BN(s.pending.toString()));
    }
    let unstaking: MyStake["unstaking"] = null;
    if (r && big(r.amount) > 0) {
      const { unstakeWaitSeconds } = await this.getStakingRules();
      // If the admin shortened the wait after the request, the shorter one applies (same as the program).
      const unlockAt = Math.min(big(r.unlockAt), big(r.requestedAt) + unstakeWaitSeconds) * 1000;
      unstaking = { amount: big(r.amount) / unit, unlockAt, ready: Date.now() >= unlockAt };
    }
    return {
      amount: s ? big(s.amount) / unit : 0,
      pendingSol: big(pending) / LAMPORTS_PER_SOL,
      claimedSol: s ? big(s.claimed) / LAMPORTS_PER_SOL : 0,
      unstaking,
    };
  }

  /** Tokens you get for `sol` right now (before slippage). */
  async quoteBuy(mint: string | PublicKey, sol: number | string): Promise<number> {
    const c = await this.trade.curve(new PublicKey(mint));
    return big(await this.trade.quoteBuy(c, null, solToLamports(sol))) / TOKEN_UNIT;
  }

  /** SOL you get for `tokens` right now (before slippage). */
  async quoteSell(mint: string | PublicKey, tokens: number | string): Promise<number> {
    const c = await this.trade.curve(new PublicKey(mint));
    return big(await this.trade.quoteSell(c, null, tokensToRaw(tokens))) / LAMPORTS_PER_SOL;
  }

  // ---------- builders (instructions only, nothing is sent) ----------

  private async mintKeypair(source: MintSource): Promise<Keypair> {
    if (source instanceof Keypair) return source;
    if (source === "random") return Keypair.generate();
    try {
      const r = await fetch(`${this.net.site}/api/mint-key`, { method: "POST", signal: AbortSignal.timeout(4000) });
      if (!r.ok) throw new Error(String(r.status));
      const { address, secretKey } = (await r.json()) as { address: string; secretKey: number[] };
      const kp = Keypair.fromSecretKey(Uint8Array.from(secretKey));
      if (kp.publicKey.toBase58() !== address || !address.endsWith("PVP")) throw new Error("bad key");
      return kp;
    } catch {
      return Keypair.generate();
    }
  }

  async buildLaunch(p: { name: string; symbol: string; uri: string; mint?: MintSource }): Promise<Built & { mint: PublicKey }> {
    const check = validateIdentity(p.name, p.symbol, p.uri);
    if (!check.ok) throw new PvpError(`Invalid ${check.field}: ${check.problem}`, check.problem);
    const user = this.publicKey;
    const mint = await this.mintKeypair(p.mint ?? "factory");
    const key = await nameKey(p.name);
    const settings = await this.acc.dbcSettings.fetch(this.pda.dbcSettings);
    const dbcConfig: PublicKey = settings.dbcConfig;
    const pool = deriveDbcPoolAddress(NATIVE_MINT, mint.publicKey, dbcConfig);
    const ix = await this.program.methods
      .createToken(p.name, p.symbol, p.uri, [...key])
      .accountsPartial({
        creator: user,
        config: this.pda.config,
        dbcSettings: this.pda.dbcSettings,
        dbcConfig,
        mint: mint.publicKey,
        quoteMint: NATIVE_MINT,
        dbcPool: pool,
        baseVault: deriveDbcTokenVaultAddress(pool, mint.publicKey),
        quoteVault: deriveDbcTokenVaultAddress(pool, NATIVE_MINT),
        curve: this.pda.curve(mint.publicKey),
        nameRecord: this.pda.name(key),
        blocked: this.pda.blocked(key),
        blockedSymbol: this.pda.blocked(await nameKey(p.symbol)),
        dbcPoolAuthority: deriveDbcPoolAuthority(),
        dbcEventAuthority: deriveDbcEventAuthority(),
        dbcProgram: DBC_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        quoteTokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    return { instructions: [ix], signers: [mint], computeUnits: 400_000, mint: mint.publicKey };
  }

  private minOut(out: bigint, slippageBps?: number) {
    const raw = slippageBps ?? this.slippageBps;
    // 10000 bps means no protection at all (min out 0, the trade can be sandwiched); outside 1..5000 is almost always a mistake.
    if (!Number.isInteger(raw) || raw < 1 || raw > 5_000) throw new Error(`slippage must be an integer from 1 to 5000 bps (got ${raw})`);
    const bps = BigInt(raw);
    return (out * (10_000n - bps)) / 10_000n;
  }

  async buildBuy(mint: string | PublicKey, sol: number | string, slippageBps?: number): Promise<Built & { expectedTokens: number; minTokens: number }> {
    const c = await this.trade.curve(new PublicKey(mint));
    const lamports = solToLamports(sol);
    const out = await this.trade.quoteBuy(c, null, lamports);
    const min = this.minOut(out, slippageBps);
    const instructions = await this.trade.buyIxs(c, null, this.publicKey, lamports, min);
    return { instructions, signers: [], computeUnits: 400_000, expectedTokens: big(out) / TOKEN_UNIT, minTokens: big(min) / TOKEN_UNIT };
  }

  async buildSell(mint: string | PublicKey, tokens: number | string, slippageBps?: number): Promise<Built & { expectedSol: number; minSol: number }> {
    const c = await this.trade.curve(new PublicKey(mint));
    const raw = tokensToRaw(tokens);
    const out = await this.trade.quoteSell(c, null, raw);
    const min = this.minOut(out, slippageBps);
    const instructions = await this.trade.sellIxs(c, null, this.publicKey, raw, min);
    return { instructions, signers: [], computeUnits: 400_000, expectedSol: big(out) / LAMPORTS_PER_SOL, minSol: big(min) / LAMPORTS_PER_SOL };
  }

  /** Sell `tokens` of the token that lost the name race and buy the winner, in one transaction. */
  async buildMoveInto(loser: string | PublicKey, winner: string | PublicKey, tokens: number | string, slippageBps?: number): Promise<Built & { expectedWinner: number; minWinner: number }> {
    const { tx, expectedWinner, minWinner } = await this.trade.moveIntoTx(
      new PublicKey(loser),
      new PublicKey(winner),
      this.publicKey,
      tokensToRaw(tokens),
      slippageBps ?? this.slippageBps,
    );
    const instructions = tx.instructions.filter((ix) => !ix.programId.equals(ComputeBudgetProgram.programId));
    return { instructions, signers: [], computeUnits: 600_000, expectedWinner: big(expectedWinner) / TOKEN_UNIT, minWinner: big(minWinner) / TOKEN_UNIT };
  }

  private ata(mint: PublicKey, owner: PublicKey) {
    return getAssociatedTokenAddressSync(mint, owner, true, TOKEN_2022_PROGRAM_ID);
  }
  private wsol(owner: PublicKey) {
    return getAssociatedTokenAddressSync(NATIVE_MINT, owner, true, TOKEN_PROGRAM_ID);
  }

  /**
   * Opens a rename vote. You lock `tokens` voting YES (at least the proposal threshold, 0.5% of supply by default)
   * and pay the proposal bond plus the settlement fee. Defaults `tokens` to exactly the threshold.
   */
  async buildPropose(p: { mint: string | PublicKey; name: string; symbol: string; uri: string; tokens?: number | string }): Promise<Built & { proposal: PublicKey }> {
    const check = validateIdentity(p.name, p.symbol, p.uri);
    if (!check.ok) throw new PvpError(`Invalid ${check.field}: ${check.problem}`, check.problem);
    const m = new PublicKey(p.mint);
    const user = this.publicKey;
    const [curve, cfg] = await Promise.all([this.acc.curve.fetch(this.pda.curve(m)), this.getConfig()]);
    const proposal = this.pda.proposal(m, curve.proposalCount);
    const key = await nameKey(p.name);
    const tokens = p.tokens ?? (cfg.totalSupply * cfg.proposalThresholdBps) / 10_000;
    const ix = await this.program.methods
      .createProposal(p.name, p.symbol, p.uri, [...key], new BN(tokensToRaw(tokens).toString()))
      .accountsPartial({
        proposer: user,
        config: this.pda.config,
        mint: m,
        curve: this.pda.curve(m),
        proposal,
        vault: this.ata(m, proposal),
        proposerAta: this.ata(m, user),
        voteRecord: this.pda.vote(proposal, user),
        nameRecord: this.pda.name(key),
        blocked: this.pda.blocked(key),
        blockedSymbol: this.pda.blocked(await nameKey(p.symbol)),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    return { instructions: [ix], signers: [], computeUnits: 300_000, proposal };
  }

  /**
   * Team only (the PVP admin or operator wallet): opens a rename vote without locking coins or paying the bond. It can
   * propose a name another token is using; holders still decide with the same quorum.
   */
  async buildTeamPropose(p: { mint: string | PublicKey; name: string; symbol: string; uri: string }): Promise<Built & { proposal: PublicKey }> {
    const check = validateIdentity(p.name, p.symbol, p.uri);
    if (!check.ok) throw new PvpError(`Invalid ${check.field}: ${check.problem}`, check.problem);
    const m = new PublicKey(p.mint);
    const curve = await this.acc.curve.fetch(this.pda.curve(m));
    const proposal = this.pda.proposal(m, curve.proposalCount);
    const key = await nameKey(p.name);
    const ix = await this.program.methods
      .teamCreateProposal(p.name, p.symbol, p.uri, [...key])
      .accountsPartial({
        team: this.publicKey,
        config: this.pda.config,
        operator: this.pda.operator,
        mint: m,
        curve: this.pda.curve(m),
        proposal,
        vault: this.ata(m, proposal),
        nameRecord: this.pda.name(key),
        blocked: this.pda.blocked(key),
        blockedSymbol: this.pda.blocked(await nameKey(p.symbol)),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    return { instructions: [ix], signers: [], computeUnits: 300_000, proposal };
  }

  /** Admin only: names the operator wallet, which opens team votes and blocks or unblocks names. Pass `null` to remove it. */
  async buildSetOperator(operator: string | PublicKey | null): Promise<Built> {
    const ix = await this.program.methods
      .setOperator(operator ? new PublicKey(operator) : PublicKey.default)
      .accountsPartial({ admin: this.publicKey, config: this.pda.config, operator: this.pda.operator, systemProgram: SystemProgram.programId })
      .instruction();
    return { instructions: [ix], signers: [], computeUnits: 50_000 };
  }

  /** The token's open vote, or throws if there is none. */
  private async activeProposal(mint: PublicKey): Promise<PublicKey> {
    const curve = await this.acc.curve.fetch(this.pda.curve(mint));
    if (curve.activeProposal.equals(PublicKey.default)) throw new PvpError("This token has no open rename vote.", "NoActiveProposal");
    return curve.activeProposal;
  }

  /** Locks `tokens` on YES or NO. Moving or withdrawing them before the end cancels the vote. */
  async buildVote(p: { mint: string | PublicKey; yes: boolean; tokens: number | string; proposal?: string | PublicKey }): Promise<Built> {
    const m = new PublicKey(p.mint);
    const prop = p.proposal ? new PublicKey(p.proposal) : await this.activeProposal(m);
    const user = this.publicKey;
    const ix = await this.program.methods
      .vote(p.yes, new BN(tokensToRaw(p.tokens).toString()))
      .accountsPartial({
        voter: user,
        config: this.pda.config,
        mint: m,
        proposal: prop,
        vault: this.ata(m, prop),
        voterAta: this.ata(m, user),
        voteRecord: this.pda.vote(prop, user),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    return { instructions: [ix], signers: [], computeUnits: 200_000 };
  }

  /** Takes your locked tokens back. Before the vote ends this removes your vote. */
  async buildWithdrawVote(p: { mint: string | PublicKey; proposal: string | PublicKey }): Promise<Built> {
    const m = new PublicKey(p.mint);
    const prop = new PublicKey(p.proposal);
    const user = this.publicKey;
    const ix = await this.program.methods
      .withdraw()
      .accountsPartial({
        voter: user,
        mint: m,
        proposal: prop,
        vault: this.ata(m, prop),
        voterAta: this.ata(m, user),
        voteRecord: this.pda.vote(prop, user),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .instruction();
    return { instructions: [ix], signers: [], computeUnits: 200_000 };
  }

  /** Settles a vote after it ends (anyone can call it): renames the token if it passed. */
  async buildSettle(p: { mint: string | PublicKey; proposal?: string | PublicKey }): Promise<Built> {
    const m = new PublicKey(p.mint);
    const prop = p.proposal ? new PublicKey(p.proposal) : await this.activeProposal(m);
    const [proposal, curve, cfg] = await Promise.all([
      this.acc.proposal.fetch(prop),
      this.acc.curve.fetch(this.pda.curve(m)),
      this.acc.config.fetch(this.pda.config),
    ]);
    const newKey = Uint8Array.from(proposal.nameKey);
    const ix = await this.program.methods
      .executeProposal()
      .accountsPartial({
        executor: this.publicKey,
        config: this.pda.config,
        authority: this.pda.authority,
        mint: m,
        curve: this.pda.curve(m),
        proposal: prop,
        nameRecord: this.pda.name(newKey),
        oldNameRecord: this.pda.name(Uint8Array.from(curve.nameKey)),
        blocked: this.pda.blocked(newKey),
        proposer: proposal.proposer,
        feeRecipient: cfg.feeRecipient,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    return { instructions: [ix], signers: [], computeUnits: 300_000 };
  }

  /** Token program and decimals of a mint (the PVP token can be SPL Token or Token-2022, with any decimals). */
  private async mintInfo(mint: PublicKey): Promise<{ programId: PublicKey; decimals: number }> {
    const info = await this.connection.getParsedAccountInfo(mint);
    const v = info.value;
    if (!v) throw new PvpError(`Token ${mint.toBase58()} not found`);
    const decimals = (v.data as any)?.parsed?.info?.decimals;
    return { programId: v.owner, decimals: typeof decimals === "number" ? decimals : DECIMALS };
  }

  private stakeAccounts(mint: PublicKey, programId: PublicKey) {
    const user = this.publicKey;
    const pool = this.pda.stakePool(mint);
    return {
      user,
      config: this.pda.config,
      stakePool: pool,
      stakeAccount: this.pda.stakeAccount(mint, user),
      stakeMint: mint,
      userStakeAta: getAssociatedTokenAddressSync(mint, user, true, programId),
      stakeVault: getAssociatedTokenAddressSync(mint, pool, true, programId),
      rewardVault: this.wsol(pool),
      stakeTokenProgram: programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
  }

  /**
   * Stakes PVP tokens to earn, in SOL, the stakers' share of PVP's revenue from every token (and, if the PVP token
   * itself trades on the launchpad, its holders' share). Opens the pool if needed.
   */
  async buildStake(mint: string | PublicKey, tokens: number | string): Promise<Built> {
    const m = new PublicKey(mint);
    const { programId, decimals } = await this.mintInfo(m);
    const pool = this.pda.stakePool(m);
    const instructions: TransactionInstruction[] = [];
    if (!(await this.connection.getAccountInfo(pool))) {
      instructions.push(
        await this.program.methods
          .initStakePool()
          .accountsPartial({
            payer: this.publicKey,
            config: this.pda.config,
            pvpToken: this.pda.pvpToken,
            stakeMint: m,
            stakePool: pool,
            stakeVault: getAssociatedTokenAddressSync(m, pool, true, programId),
            wsolMint: NATIVE_MINT,
            rewardVault: this.wsol(pool),
            stakeTokenProgram: programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction(),
      );
    }
    const raw = toRaw(tokens, decimals);
    instructions.push(await this.program.methods.stake(new BN(raw.toString())).accountsPartial(this.stakeAccounts(m, programId)).instruction());
    return { instructions, signers: [], computeUnits: 300_000 };
  }

  /** Unstakes right away. Only works while the unstake wait is zero; otherwise use `buildRequestUnstake`. */
  async buildUnstake(mint: string | PublicKey, tokens: number | string): Promise<Built> {
    const m = new PublicKey(mint);
    const { programId, decimals } = await this.mintInfo(m);
    const raw = toRaw(tokens, decimals);
    const ix = await this.program.methods.unstake(new BN(raw.toString())).accountsPartial(this.stakeAccounts(m, programId)).instruction();
    return { instructions: [ix], signers: [], computeUnits: 200_000 };
  }

  /**
   * Starts an unstake: the tokens stop earning right away and can be taken out with
   * `buildCompleteUnstake` once the wait is over. Requesting again adds to the pending amount and restarts the wait.
   */
  async buildRequestUnstake(mint: string | PublicKey, tokens: number | string): Promise<Built> {
    const m = new PublicKey(mint);
    const { decimals } = await this.mintInfo(m);
    const user = this.publicKey;
    const pool = this.pda.stakePool(m);
    const ix = await this.program.methods
      .requestUnstake(new BN(toRaw(tokens, decimals).toString()))
      .accountsPartial({
        user,
        config: this.pda.config,
        stakePool: pool,
        stakeAccount: this.pda.stakeAccount(m, user),
        unstakeRequest: this.pda.unstakeRequest(m, user),
        rewardVault: this.wsol(pool),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    return { instructions: [ix], signers: [], computeUnits: 200_000 };
  }

  /** Takes out the tokens of a finished unstake request (fails while the wait is not over). */
  async buildCompleteUnstake(mint: string | PublicKey): Promise<Built> {
    const m = new PublicKey(mint);
    const { programId } = await this.mintInfo(m);
    const user = this.publicKey;
    const pool = this.pda.stakePool(m);
    const userAta = getAssociatedTokenAddressSync(m, user, true, programId);
    const ix = await this.program.methods
      .completeUnstake()
      .accountsPartial({
        user,
        config: this.pda.config,
        stakePool: pool,
        unstakeRequest: this.pda.unstakeRequest(m, user),
        stakeMint: m,
        userStakeAta: userAta,
        stakeVault: getAssociatedTokenAddressSync(m, pool, true, programId),
        stakeTokenProgram: programId,
      })
      .instruction();
    return {
      instructions: [createAssociatedTokenAccountIdempotentInstruction(user, userAta, user, m, programId), ix],
      signers: [],
      computeUnits: 200_000,
    };
  }

  /** Claims the SOL earned by staking (arrives as SOL, not WSOL). */
  async buildClaimRewards(mint: string | PublicKey): Promise<Built> {
    const m = new PublicKey(mint);
    const user = this.publicKey;
    const userWsol = this.wsol(user);
    const claim = await this.program.methods
      .claimRewards()
      .accountsPartial({
        user,
        stakePool: this.pda.stakePool(m),
        stakeAccount: this.pda.stakeAccount(m, user),
        rewardVault: this.wsol(this.pda.stakePool(m)),
        userWsol,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    return {
      instructions: [
        createAssociatedTokenAccountIdempotentInstruction(user, userWsol, user, NATIVE_MINT, TOKEN_PROGRAM_ID),
        claim,
        createCloseAccountInstruction(userWsol, user, user, [], TOKEN_PROGRAM_ID),
      ],
      signers: [],
      computeUnits: 200_000,
    };
  }

  /** Claims the automatic holder rewards of a token, using the latest proof PVP published (arrives as SOL). */
  async buildClaimHolderRewards(mint: string | PublicKey): Promise<Built & { amountSol: number }> {
    const m = new PublicKey(mint);
    const mine = (await this.getMyRewards()).find((r) => r.mint === m.toBase58());
    if (!mine || mine.claimableSol <= 0) throw new PvpError("Nothing to claim for this token.", "NothingToClaim");
    if (!mine.current) throw new PvpError("Rewards are being updated; retry in a minute.", "RewardsUpdating");
    const user = this.publicKey;
    const userWsol = this.wsol(user);
    const claim = await this.program.methods
      .claimHolderRewards(new BN(mine.cumulative), mine.proof.map((h) => [...Buffer.from(h, "hex")]))
      .accountsPartial({
        user,
        holderRewards: this.pda.holderRewards(m),
        rewardClaim: this.pda.rewardClaim(m, user),
        vault: this.wsol(this.pda.holderRewards(m)),
        wsolMint: NATIVE_MINT,
        userWsol,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    return {
      instructions: [
        createAssociatedTokenAccountIdempotentInstruction(user, userWsol, user, NATIVE_MINT, TOKEN_PROGRAM_ID),
        claim,
        createCloseAccountInstruction(userWsol, user, user, [], TOKEN_PROGRAM_ID),
      ],
      signers: [],
      computeUnits: 200_000,
      amountSol: mine.claimableSol,
    };
  }

  // ---------- send ----------

  /** Signs with the wallet (and `built.signers`), sends and waits for confirmation. Returns the signature. */
  async send(built: Built, opts: SendOptions = {}): Promise<string> {
    const signer = this.signer;
    if (!signer) throw new PvpError("No wallet: pass `wallet` to create Pvp to send transactions.");
    const fee = opts.priorityFee ?? this.priorityFee;
    const tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: built.computeUnits }));
    if (fee > 0) tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: fee }));
    tx.add(...built.instructions);
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash(this.commitment);
    tx.recentBlockhash = blockhash;
    tx.feePayer = signer.publicKey;
    if (built.signers.length) tx.partialSign(...built.signers);
    const signed = await signer.signTransaction(tx);
    let sig: string;
    try {
      sig = await this.connection.sendRawTransaction(signed.serialize(), { skipPreflight: opts.skipPreflight ?? false, preflightCommitment: this.commitment });
    } catch (e) {
      throw await this.explain(e);
    }
    const res = await this.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, this.commitment);
    if (res.value.err) {
      const tx2 = await this.connection.getTransaction(sig, { maxSupportedTransactionVersion: 0, commitment: "confirmed" }).catch(() => null);
      throw this.fromLogs(tx2?.meta?.logMessages ?? [], `Transaction ${sig} failed: ${JSON.stringify(res.value.err)}`);
    }
    return sig;
  }

  private async explain(e: unknown): Promise<PvpError> {
    let logs: string[] = [];
    if (e instanceof SendTransactionError) logs = (await e.getLogs(this.connection).catch(() => null)) ?? e.logs ?? [];
    return this.fromLogs(logs, e instanceof Error ? e.message : String(e));
  }

  private fromLogs(logs: string[], fallback: string): PvpError {
    // Anchor logs "Error Code: NameLocked. Error Number: 6004. Error Message: Another token holds this name for now."
    for (const line of logs) {
      const m = /Error Code: (\w+)\. Error Number: \d+\. Error Message: (.*?)\.?$/.exec(line);
      if (m) return new PvpError(m[2], m[1], logs);
    }
    if (logs.some((l) => /insufficient lamports|insufficient funds/i.test(l)) || /insufficient funds/i.test(fallback)) {
      return new PvpError("Not enough SOL in the wallet for this transaction.", "InsufficientFunds", logs);
    }
    return new PvpError(fallback, undefined, logs);
  }

  // ---------- actions (build + send) ----------

  /** Launches a token. Returns its mint address. The name is locked to it for 24 h. */
  async launch(p: { name: string; symbol: string; uri: string; mint?: MintSource }, opts?: SendOptions) {
    const b = await this.buildLaunch(p);
    const signature = await this.send(b, opts);
    return { mint: b.mint.toBase58(), signature };
  }

  async buy(mint: string | PublicKey, sol: number | string, opts?: SendOptions & { slippageBps?: number }) {
    const b = await this.buildBuy(mint, sol, opts?.slippageBps);
    return { signature: await this.send(b, opts), expectedTokens: b.expectedTokens, minTokens: b.minTokens };
  }

  async sell(mint: string | PublicKey, tokens: number | string, opts?: SendOptions & { slippageBps?: number }) {
    const b = await this.buildSell(mint, tokens, opts?.slippageBps);
    return { signature: await this.send(b, opts), expectedSol: b.expectedSol, minSol: b.minSol };
  }

  async moveInto(loser: string | PublicKey, winner: string | PublicKey, tokens: number | string, opts?: SendOptions & { slippageBps?: number }) {
    const b = await this.buildMoveInto(loser, winner, tokens, opts?.slippageBps);
    return { signature: await this.send(b, opts), expectedWinner: b.expectedWinner, minWinner: b.minWinner };
  }

  async propose(p: Parameters<Pvp["buildPropose"]>[0], opts?: SendOptions) {
    const b = await this.buildPropose(p);
    return { proposal: b.proposal.toBase58(), signature: await this.send(b, opts) };
  }

  async teamPropose(p: Parameters<Pvp["buildTeamPropose"]>[0], opts?: SendOptions) {
    const b = await this.buildTeamPropose(p);
    return { proposal: b.proposal.toBase58(), signature: await this.send(b, opts) };
  }

  async setOperator(operator: string | PublicKey | null, opts?: SendOptions) {
    return { signature: await this.send(await this.buildSetOperator(operator), opts) };
  }

  async vote(p: Parameters<Pvp["buildVote"]>[0], opts?: SendOptions) {
    return { signature: await this.send(await this.buildVote(p), opts) };
  }

  async withdrawVote(p: Parameters<Pvp["buildWithdrawVote"]>[0], opts?: SendOptions) {
    return { signature: await this.send(await this.buildWithdrawVote(p), opts) };
  }

  async settle(p: Parameters<Pvp["buildSettle"]>[0], opts?: SendOptions) {
    return { signature: await this.send(await this.buildSettle(p), opts) };
  }

  async stake(mint: string | PublicKey, tokens: number | string, opts?: SendOptions) {
    return { signature: await this.send(await this.buildStake(mint, tokens), opts) };
  }

  async unstake(mint: string | PublicKey, tokens: number | string, opts?: SendOptions) {
    return { signature: await this.send(await this.buildUnstake(mint, tokens), opts) };
  }

  async requestUnstake(mint: string | PublicKey, tokens: number | string, opts?: SendOptions) {
    return { signature: await this.send(await this.buildRequestUnstake(mint, tokens), opts) };
  }

  async completeUnstake(mint: string | PublicKey, opts?: SendOptions) {
    return { signature: await this.send(await this.buildCompleteUnstake(mint), opts) };
  }

  async claimRewards(mint: string | PublicKey, opts?: SendOptions) {
    return { signature: await this.send(await this.buildClaimRewards(mint), opts) };
  }

  /** Claims a token's automatic holder rewards. Returns the signature and how much SOL was claimed. */
  async claimHolderRewards(mint: string | PublicKey, opts?: SendOptions) {
    const b = await this.buildClaimHolderRewards(mint);
    return { signature: await this.send(b, opts), amountSol: b.amountSol };
  }

  // ---------- live events ----------

  /**
   * Calls `cb` for every PVP event as it lands (launches, renames, votes...). Uses a websocket subscription on the
   * RPC. Returns a function that stops listening.
   */
  onEvent(cb: (ev: PvpEvent) => void): () => void {
    const parser = new EventParser(this.net.programId, new BorshCoder(this.net.idl));
    const id = this.connection.onLogs(
      this.net.programId,
      (logs) => {
        if (logs.err) return;
        let events: { name: string; data: unknown }[] = [];
        try {
          events = [...parser.parseLogs(logs.logs)];
        } catch {
          // an event this IDL can't decode (another program version) is skipped, not fatal
        }
        for (const ev of events) {
          try {
            cb(normalizeEvent(ev.name, ev.data, logs.signature));
          } catch {
            // a callback error must not kill the subscription
          }
        }
      },
      this.commitment,
    );
    return () => void this.connection.removeOnLogsListener(id);
  }
}

function plain(v: any): any {
  if (v instanceof PublicKey) return v.toBase58();
  if (BN.isBN(v)) return big(v);
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

function normalizeEvent(name: string, data: any, signature: string): PvpEvent {
  // field names come snake_case from the raw IDL; accept both spellings
  const raw = plain(data);
  const d: any = {};
  for (const [k, v] of Object.entries(raw)) d[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  const tokens = (x: unknown) => Number(x ?? 0) / TOKEN_UNIT;
  switch (name) {
    case "TokenCreated":
      return { type: "TokenCreated", signature, mint: d.mint, creator: d.creator, name: d.name, symbol: d.symbol, uri: d.uri, at: d.at * 1000 };
    case "Renamed":
      return {
        type: "Renamed",
        signature,
        mint: d.mint,
        oldName: d.oldName,
        oldSymbol: d.oldSymbol,
        name: d.name,
        symbol: d.symbol,
        uri: d.uri,
        at: d.at * 1000,
        by: (Object.keys(d.by ?? {})[0] ?? "unknown").toLowerCase(),
      };
    case "ProposalCreated":
      return { type: "ProposalCreated", signature, mint: d.mint, proposal: d.proposal, id: d.id, name: d.name, symbol: d.symbol, amount: tokens(d.amount), endsAt: d.endsAt * 1000, byTeam: !!d.byTeam };
    case "Voted":
      return { type: "Voted", signature, proposal: d.proposal, voter: d.voter, yes: d.yes, amount: tokens(d.amount) };
    case "VoteWithdrawn":
      return { type: "VoteWithdrawn", signature, proposal: d.proposal, voter: d.voter, amount: tokens(d.amount), voteCancelled: d.voteCancelled };
    case "ProposalSettled":
      return { type: "ProposalSettled", signature, mint: d.mint, proposal: d.proposal, passed: d.passed, yes: tokens(d.yes), no: tokens(d.no) };
    default:
      return { type: name, signature, ...d } as unknown as PvpEvent;
  }
}
