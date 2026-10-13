// Generated from the PVP program and app sources; do not edit by hand.
import { BLOCKED_SLURS } from "./blocked-slurs.js";
import { FOLD } from "./names-table.js";
export const NAME_LOCK_HOURS = 24;
const HOMOGLYPHS: Record<string, string> = {
    "а": "a", "в": "b", "е": "e", "к": "k", "м": "m", "н": "h", "о": "o", "р": "p", "с": "c",
    "т": "t", "у": "y", "х": "x", "і": "i", "ј": "j", "ѕ": "s", "һ": "h", "ԁ": "d", "ԛ": "q",
    "ԝ": "w", "ѵ": "v",
    "α": "a", "β": "b", "γ": "y", "ε": "e", "η": "n", "ι": "i", "κ": "k", "ν": "v", "ο": "o",
    "ρ": "p", "τ": "t", "υ": "u", "χ": "x", "ω": "w", "ϲ": "c",
    "ɑ": "a", "ɡ": "g",
    "0": "o", "1": "i", "l": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b",
};
export const BLOCKED_NAMES_RAW = [...BLOCKED_SLURS];
export const BLOCKED_NAMES = BLOCKED_NAMES_RAW
    .map(normalizeName)
    .filter((k, i, all) => all.indexOf(k) === i);
export function normalizeName(raw: string): string {
    let out = "";
    for (const ch of raw) {
        const cp = ch.codePointAt(0)!;
        const folded = cp >= 0xff01 && cp <= 0xff5e ? String.fromCodePoint(cp - 0xfee0) : (FOLD.get(cp) ?? ch);
        for (const lower of folded.toLowerCase()) {
            const mapped = HOMOGLYPHS[lower] ?? lower;
            if (/[\p{Alphabetic}\p{Nd}\p{Nl}\p{No}]/u.test(mapped))
                out += mapped;
        }
    }
    return out;
}
export function nameAllowed(normalized: string): boolean {
    for (const ch of normalized) {
        const cp = ch.codePointAt(0)!;
        const ok = (ch >= "a" && ch <= "z") ||
            (ch >= "0" && ch <= "9") ||
            (cp >= 0x4e00 && cp <= 0x9fff) ||
            (cp >= 0x3400 && cp <= 0x4dbf) ||
            (cp >= 0x3040 && cp <= 0x30ff) ||
            (cp >= 0xac00 && cp <= 0xd7af);
        if (!ok)
            return false;
    }
    return true;
}
export function rawAllowed(raw: string): boolean {
    for (const ch of raw) {
        const cp = ch.codePointAt(0)!;
        if (cp <= 0x1f || (cp >= 0x7f && cp <= 0x9f))
            return false;
        if (cp === 0x061c || cp === 0x200e || cp === 0x200f || (cp >= 0x2028 && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069))
            return false;
    }
    return true;
}
export interface NameHolder {
    name: string;
    symbol: string;
    mint: string;
    since: number;
}
export type NameCheck = {
    ok: true;
    key: string;
} | {
    ok: false;
    key: string;
    reason: "empty";
} | {
    ok: false;
    key: string;
    reason: "chars";
} | {
    ok: false;
    key: string;
    reason: "blocked";
} | {
    ok: false;
    key: string;
    reason: "locked";
    holder: NameHolder;
    freeAt: number;
};
export function checkName(raw: string, holders: NameHolder[], now = Date.now()): NameCheck {
    const key = normalizeName(raw);
    if (!key)
        return { ok: false, key, reason: "empty" };
    if (!nameAllowed(key) || !rawAllowed(raw))
        return { ok: false, key, reason: "chars" };
    if (BLOCKED_NAMES.includes(key))
        return { ok: false, key, reason: "blocked" };
    const lockMs = NAME_LOCK_HOURS * 3600000;
    const holder = holders
        .filter((h) => normalizeName(h.name) === key && now - h.since < lockMs)
        .sort((a, b) => a.since - b.since)[0];
    if (holder)
        return { ok: false, key, reason: "locked", holder, freeAt: holder.since + lockMs };
    return { ok: true, key };
}
