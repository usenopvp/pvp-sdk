// Program-derived addresses of the PVP program.
import { PublicKey } from "@solana/web3.js";

export function pdas(programId: PublicKey) {
  const pda = (...seeds: (Buffer | Uint8Array)[]) => PublicKey.findProgramAddressSync(seeds, programId)[0];
  const b = (s: string) => Buffer.from(s);
  return {
    config: pda(b("config")),
    authority: pda(b("authority")),
    dbcSettings: pda(b("dbc")),
    operator: pda(b("operator")),
    pvpToken: pda(b("pvp_token")),
    holderRewards: (mint: PublicKey) => pda(b("holder_rewards"), mint.toBuffer()),
    rewardClaim: (mint: PublicKey, wallet: PublicKey) => pda(b("reward_claim"), mint.toBuffer(), wallet.toBuffer()),
    curve: (mint: PublicKey) => pda(b("curve"), mint.toBuffer()),
    stakePool: (mint: PublicKey) => pda(b("stake_pool"), mint.toBuffer()),
    stakeAccount: (mint: PublicKey, owner: PublicKey) => pda(b("stake"), mint.toBuffer(), owner.toBuffer()),
    unstakeRequest: (mint: PublicKey, owner: PublicKey) => pda(b("unstake"), mint.toBuffer(), owner.toBuffer()),
    name: (key: Uint8Array) => pda(b("name"), key),
    blocked: (key: Uint8Array) => pda(b("blocked"), key),
    vote: (proposal: PublicKey, voter: PublicKey) => pda(b("vote"), proposal.toBuffer(), voter.toBuffer()),
    proposal: (mint: PublicKey, id: number) => {
      const le = Buffer.alloc(4);
      le.writeUInt32LE(id);
      return pda(b("proposal"), mint.toBuffer(), le);
    },
  };
}

export type Pdas = ReturnType<typeof pdas>;
