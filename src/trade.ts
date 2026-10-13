// Generated from the PVP program and app sources; do not edit by hand.
import type { Program } from "@coral-xyz/anchor";
import BN from "bn.js";
import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction, type TransactionInstruction } from "@solana/web3.js";
import { NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddressSync, } from "@solana/spl-token";
import { CpAmm } from "@meteora-ag/cp-amm-sdk";
import { DAMM_V2_MIGRATION_FEE_ADDRESS, DynamicBondingCurveClient, MigrationFeeOption, deriveDammV2PoolAddress, getCurrentPoint, swapQuote, swapQuotePartialFill, SwapMode, } from "@meteora-ag/dynamic-bonding-curve-sdk";
export const BPS = 10000n;
export const DAMM_MIGRATION_CONFIG = DAMM_V2_MIGRATION_FEE_ADDRESS[MigrationFeeOption.Customizable];
export interface CurveState {
    mint: PublicKey;
    creator: PublicKey;
    dbcPool: PublicKey;
    dbcConfig: PublicKey;
    migrated: boolean;
    quoteReserve: bigint;
    migrationThreshold: bigint;
    dammPool: PublicKey;
}
const unwrap = (x: any) => x?.poolState ?? x;
export class PvpClient {
    readonly amm: CpAmm;
    readonly dbc: DynamicBondingCurveClient;
    constructor(readonly program: Program) {
        this.amm = new CpAmm(program.provider.connection);
        this.dbc = new DynamicBondingCurveClient(program.provider.connection, "confirmed");
    }
    get connection() {
        return this.program.provider.connection;
    }
    pda(...seeds: (Buffer | Uint8Array)[]) {
        return PublicKey.findProgramAddressSync(seeds, this.program.programId)[0];
    }
    configPda = () => this.pda(Buffer.from("config"));
    curvePda = (mint: PublicKey) => this.pda(Buffer.from("curve"), mint.toBuffer());
    async curve(mint: PublicKey): Promise<CurveState> {
        const rec = await (this.program.account as any).curve.fetch(this.curvePda(mint));
        const pool = unwrap(await this.dbc.state.getPool(rec.dbcPool));
        const config = unwrap(await this.dbc.state.getPoolConfig(pool.config));
        return {
            mint,
            creator: rec.creator,
            dbcPool: rec.dbcPool,
            dbcConfig: pool.config,
            migrated: Boolean(pool.isMigrated),
            quoteReserve: BigInt(pool.quoteReserve.toString()),
            migrationThreshold: BigInt(config.migrationQuoteThreshold.toString()),
            dammPool: deriveDammV2PoolAddress(DAMM_MIGRATION_CONFIG, mint, NATIVE_MINT),
        };
    }
    async feeConfig() {
        return {};
    }
    async quoteSell(c: CurveState, _cfg: unknown, tokensIn: bigint): Promise<bigint> {
        return c.migrated ? this.quotePool(c.dammPool, c.mint, tokensIn) : this.quoteCurve(c, true, tokensIn);
    }
    async quoteBuy(c: CurveState, _cfg: unknown, solIn: bigint): Promise<bigint> {
        return c.migrated ? this.quotePool(c.dammPool, NATIVE_MINT, solIn) : this.quoteCurve(c, false, solIn);
    }
    private async quoteCurve(c: CurveState, sell: boolean, amountIn: bigint): Promise<bigint> {
        const pool: any = await this.dbc.state.getPool(c.dbcPool);
        const config: any = await this.dbc.state.getPoolConfig(c.dbcConfig);
        const point = await getCurrentPoint(this.connection, unwrap(config).activationType);
        const q = sell
            ? swapQuote(pool, config, true, new BN(amountIn.toString()), 0, false, point, false)
            : swapQuotePartialFill(pool, config, false, new BN(amountIn.toString()), 0, false, point, false);
        return BigInt(q.outputAmount.toString());
    }
    private async quotePool(pool: PublicKey, inputMint: PublicKey, amountIn: bigint): Promise<bigint> {
        const state = await this.amm.fetchPoolState(pool);
        const slot = await this.connection.getSlot();
        const time = (await this.connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000);
        const q = this.amm.getQuote({
            inAmount: new BN(amountIn.toString()),
            inputTokenMint: inputMint,
            slippage: 0,
            poolState: state,
            currentTime: time,
            currentSlot: slot,
            tokenADecimal: 6,
            tokenBDecimal: 9,
        });
        return BigInt(q.swapOutAmount.toString());
    }
    async sellIxs(c: CurveState, _cfg: unknown, user: PublicKey, tokensIn: bigint, minSol: bigint): Promise<TransactionInstruction[]> {
        if (!c.migrated)
            return this.curveSwapIxs(c, user, true, tokensIn, minSol);
        const wsol = getAssociatedTokenAddressSync(NATIVE_MINT, user, false, TOKEN_PROGRAM_ID);
        return [
            createAssociatedTokenAccountIdempotentInstruction(user, wsol, user, NATIVE_MINT, TOKEN_PROGRAM_ID),
            ...(await this.poolSwapIxs(c.dammPool, user, c.mint, NATIVE_MINT, tokensIn, minSol)),
            createCloseAccountInstruction(wsol, user, user, [], TOKEN_PROGRAM_ID),
        ];
    }
    async buyIxs(c: CurveState, _cfg: unknown, user: PublicKey, solIn: bigint, minTokens: bigint): Promise<TransactionInstruction[]> {
        if (!c.migrated)
            return this.curveSwapIxs(c, user, false, solIn, minTokens);
        const wsol = getAssociatedTokenAddressSync(NATIVE_MINT, user, false, TOKEN_PROGRAM_ID);
        const tokenAta = getAssociatedTokenAddressSync(c.mint, user, false, TOKEN_2022_PROGRAM_ID);
        return [
            createAssociatedTokenAccountIdempotentInstruction(user, wsol, user, NATIVE_MINT, TOKEN_PROGRAM_ID),
            createAssociatedTokenAccountIdempotentInstruction(user, tokenAta, user, c.mint, TOKEN_2022_PROGRAM_ID),
            SystemProgram.transfer({ fromPubkey: user, toPubkey: wsol, lamports: solIn }),
            createSyncNativeInstruction(wsol, TOKEN_PROGRAM_ID),
            ...(await this.poolSwapIxs(c.dammPool, user, NATIVE_MINT, c.mint, solIn, minTokens)),
            createCloseAccountInstruction(wsol, user, user, [], TOKEN_PROGRAM_ID),
        ];
    }
    private async curveSwapIxs(c: CurveState, user: PublicKey, sell: boolean, amountIn: bigint, minOut: bigint) {
        const tx = await this.dbc.pool.swap2({
            owner: user,
            pool: c.dbcPool,
            swapMode: sell ? SwapMode.ExactIn : SwapMode.PartialFill,
            amountIn: new BN(amountIn.toString()),
            minimumAmountOut: new BN(minOut.toString()),
            swapBaseForQuote: sell,
            referralTokenAccount: null,
        });
        return tx.instructions.filter((ix) => !ix.programId.equals(ComputeBudgetProgram.programId));
    }
    private async poolSwapIxs(pool: PublicKey, user: PublicKey, inputMint: PublicKey, outputMint: PublicKey, amountIn: bigint, minOut: bigint): Promise<TransactionInstruction[]> {
        const state = await this.amm.fetchPoolState(pool);
        const tx = await this.amm.swap({
            payer: user,
            pool,
            inputTokenMint: inputMint,
            outputTokenMint: outputMint,
            amountIn: new BN(amountIn.toString()),
            minimumAmountOut: new BN(minOut.toString()),
            tokenAMint: state.tokenAMint,
            tokenBMint: state.tokenBMint,
            tokenAVault: state.tokenAVault,
            tokenBVault: state.tokenBVault,
            tokenAProgram: TOKEN_2022_PROGRAM_ID,
            tokenBProgram: TOKEN_PROGRAM_ID,
            referralTokenAccount: null,
            poolState: state,
        });
        return tx.instructions.filter((ix) => ix.programId.equals(this.amm._program.programId));
    }
    async moveIntoTx(loserMint: PublicKey, winnerMint: PublicKey, user: PublicKey, tokensIn: bigint, slippageBps = 100) {
        const [loser, winner] = await Promise.all([this.curve(loserMint), this.curve(winnerMint)]);
        const solOut = await this.quoteSell(loser, null, tokensIn);
        const minSol = (solOut * (BPS - BigInt(slippageBps))) / BPS;
        const winnerOut = await this.quoteBuy(winner, null, minSol);
        const minWinner = (winnerOut * (BPS - BigInt(slippageBps))) / BPS;
        const tx = new Transaction().add(ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 }));
        tx.add(...(await this.sellIxs(loser, null, user, tokensIn, minSol)));
        tx.add(...(await this.buyIxs(winner, null, user, minSol, minWinner)));
        return { tx, expectedSol: solOut, expectedWinner: winnerOut, minWinner };
    }
}
