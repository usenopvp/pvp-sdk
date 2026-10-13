// Grinds a mint address ending in a suffix ("PVP" by default) on your own machine, using every CPU core.
// Node only (worker_threads). A 3-letter suffix takes ~195k tries on average: a few seconds on a modern laptop.
// The key only creates the token's mint account; after launch the PVP program holds every authority.
import { Worker } from "node:worker_threads";
import { availableParallelism } from "node:os";
import { Keypair } from "@solana/web3.js";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

// Runs inside each worker. The last base58 characters are the least significant digits: check n mod 58^k.
// Dynamic imports so it runs whether Node evaluates it as CommonJS or as an ES module.
const WORKER = `
(async () => {
const { parentPort, workerData } = await import("node:worker_threads");
const { generateKeyPairSync } = await import("node:crypto");
const MOD = BigInt(workerData.mod), WANT = BigInt(workerData.want);
let tries = 0;
for (;;) {
  const { privateKey } = generateKeyPairSync("ed25519");
  const jwk = privateKey.export({ format: "jwk" });
  const pub = Buffer.from(jwk.x, "base64url");
  let n = 0n;
  for (const b of pub) n = (n << 8n) | BigInt(b);
  if (++tries % 5000 === 0) parentPort.postMessage({ tries: 5000 });
  if (n % MOD === WANT) {
    parentPort.postMessage({ secret: [...Buffer.concat([Buffer.from(jwk.d, "base64url"), pub])] });
    break;
  }
}
})();
`;

export interface GrindOptions {
  /** Case-sensitive base58 suffix. Default "PVP". */
  suffix?: string;
  /** Worker threads. Default: all cores. */
  threads?: number;
  /** Called every few thousand tries with the running total. */
  onProgress?: (tries: number) => void;
  signal?: AbortSignal;
}

/** Expected number of tries for a suffix (58^length). */
export const expectedTries = (suffix = "PVP") => 58 ** suffix.length;

export function grindVanityMint(opts: GrindOptions = {}): Promise<Keypair> {
  const suffix = opts.suffix ?? "PVP";
  for (const ch of suffix) if (!ALPHABET.includes(ch)) throw new Error(`"${ch}" is not a base58 character (no 0, O, I or l).`);
  if (suffix.length > 5) throw new Error("Suffixes longer than 5 characters take too long.");
  const mod = 58n ** BigInt(suffix.length);
  const want = [...suffix].reduce((acc, ch) => acc * 58n + BigInt(ALPHABET.indexOf(ch)), 0n);
  const threads = Math.max(1, opts.threads ?? availableParallelism());
  return new Promise((resolve, reject) => {
    let tries = 0;
    let done = false;
    const workers: Worker[] = [];
    const stop = () => {
      done = true;
      for (const w of workers) void w.terminate();
    };
    opts.signal?.addEventListener("abort", () => {
      stop();
      reject(new Error("Vanity grind aborted"));
    });
    for (let i = 0; i < threads; i++) {
      const w = new Worker(WORKER, { eval: true, workerData: { mod: mod.toString(), want: want.toString() } });
      workers.push(w);
      w.on("message", (m: { tries?: number; secret?: number[] }) => {
        if (done) return;
        if (m.tries) {
          tries += m.tries;
          opts.onProgress?.(tries);
        }
        if (m.secret) {
          const kp = Keypair.fromSecretKey(Uint8Array.from(m.secret));
          if (!kp.publicKey.toBase58().endsWith(suffix)) return; // never expected; keep grinding
          stop();
          resolve(kp);
        }
      });
      w.on("error", (e) => {
        if (done) return;
        stop();
        reject(e);
      });
    }
  });
}
