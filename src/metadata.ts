// Token image and metadata, hosted by PVP (the same endpoints the site uses).
// The token stores the metadata URL (https://nopvp.app/m/<sha256>.json), which points to the image
// (https://nopvp.app/i/<sha256>.png|jpg|webp). Fields follow the pump.fun metadata format, which GMGN, DexScreener and
// other apps already read.

export const LINK_KEYS = ["website", "twitter", "tweet", "tiktok", "telegram", "github"] as const;
export type LinkKey = (typeof LINK_KEYS)[number];
/** Optional links. `twitter` is the X profile and `tweet` the source post (…/status/…). All must be https. */
export type TokenLinks = Partial<Record<LinkKey, string>>;

export type ImageType = "image/png" | "image/jpeg" | "image/webp";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Image type from the file's bytes, or null if it is not PNG, JPEG or WebP. */
export function imageType(bytes: Uint8Array): ImageType | null {
  const ascii = (a: number, b: number) => String.fromCharCode(...bytes.subarray(a, b));
  if (bytes.length > 8 && bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

async function post(url: string, body: BodyInit, type: string) {
  const r = await fetch(url, { method: "POST", body, headers: { "content-type": type }, signal: AbortSignal.timeout(30_000) });
  const j = (await r.json().catch(() => ({}))) as { error?: string; image?: string; uri?: string };
  if (!r.ok) throw new Error(j.error ?? (r.status === 429 ? "Too many uploads: wait a minute and retry." : `Upload failed (HTTP ${r.status}).`));
  return j;
}

/** Uploads a PNG, JPEG or WebP (up to 5 MB) and returns its public URL. EXIF/GPS data is stripped by the server. */
export async function uploadImage(bytes: Uint8Array, site = "https://nopvp.app"): Promise<string> {
  const type = imageType(bytes);
  if (!type) throw new Error("Use a PNG, JPEG or WebP image.");
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("The image must be 5 MB or smaller.");
  return (await post(`${site}/api/upload`, new Blob([Uint8Array.from(bytes)], { type }), type)).image!;
}

/**
 * Stores the metadata JSON and returns the URL to pass as `uri` when launching or proposing. `image` must be a URL
 * returned by `uploadImage`. Description up to 500 bytes; each link must be https on the right domain.
 */
export async function createMetadata(
  m: { name: string; symbol: string; image: string; description?: string; links?: TokenLinks },
  site = "https://nopvp.app",
): Promise<string> {
  const { links, ...rest } = m;
  return (await post(`${site}/api/metadata`, JSON.stringify({ ...rest, ...links }), "application/json")).uri!;
}
