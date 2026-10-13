// Name rules. The on-chain program applies the exact same normalization, so a name that fails here fails on-chain.
import { normalizeName, nameAllowed, rawAllowed, BLOCKED_NAMES, NAME_LOCK_HOURS } from "./names-core.js";

export { normalizeName, nameAllowed, rawAllowed, BLOCKED_NAMES, NAME_LOCK_HOURS };

/** Byte limits enforced by the program (UTF-8). */
export const MAX_NAME_BYTES = 32;
export const MAX_SYMBOL_BYTES = 10;
export const MAX_URI_BYTES = 200;

/** On-chain key of a name: sha256 of the normalized name. "Chill Guy", "chillguy" and "CHILL-GUY" share one key. */
export async function nameKey(name: string): Promise<Uint8Array> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizeName(name)));
  return new Uint8Array(digest);
}

export type IdentityProblem = "empty" | "chars" | "too-long" | "blocked";

/**
 * Checks a name/ticker/image link against the rules that don't need the chain (length, characters, built-in
 * blocklist). The chain can block more names; `Pvp.checkName` checks those and the 24 h lock.
 */
export function validateIdentity(name: string, symbol: string, uri = ""): { ok: true } | { ok: false; field: "name" | "symbol" | "uri"; problem: IdentityProblem } {
  const bytes = (s: string) => new TextEncoder().encode(s).length;
  if (bytes(name) > MAX_NAME_BYTES) return { ok: false, field: "name", problem: "too-long" };
  if (bytes(symbol) > MAX_SYMBOL_BYTES) return { ok: false, field: "symbol", problem: "too-long" };
  if (bytes(uri) > MAX_URI_BYTES) return { ok: false, field: "uri", problem: "too-long" };
  for (const [field, raw] of [["name", name], ["symbol", symbol]] as const) {
    const key = normalizeName(raw);
    if (!key || !raw.trim()) return { ok: false, field, problem: "empty" };
    if (!nameAllowed(key) || !rawAllowed(raw)) return { ok: false, field, problem: "chars" };
  }
  if (BLOCKED_NAMES.includes(normalizeName(name))) return { ok: false, field: "name", problem: "blocked" };
  return { ok: true };
}
