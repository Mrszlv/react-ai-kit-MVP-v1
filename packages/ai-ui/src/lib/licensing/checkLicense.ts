import nacl from "tweetnacl";
import type { LicensePayload } from "./types";

// ✅ твій public key (base64url, 43 chars для ed25519)
const PUBLIC_KEY_B64URL = "y4hphPusMOvXm5V6SID7LYhLvf2v5etnyAtnoXNoNwM";

function safeBase64UrlToUint8Array(b64url: string): Uint8Array | null {
  try {
    const s = (b64url || "").trim();
    if (!s || !/^[A-Za-z0-9_-]+$/.test(s)) return null;

    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const clean = b64 + pad;

    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function isValidDateYYYYMMDD(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function todayYYYYMMDD(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isExpired(expYYYYMMDD: string): boolean {
  return expYYYYMMDD < todayYYYYMMDD();
}

function parseLicense(
  key: string
): { payloadJson: string; sig: Uint8Array } | null {
  if (!key.startsWith("mrszlv1.")) return null;

  const parts = key.split(".");
  if (parts.length !== 3) return null;

  const payloadBytes = safeBase64UrlToUint8Array(parts[1]);
  const sigBytes = safeBase64UrlToUint8Array(parts[2]);

  if (!payloadBytes || !sigBytes) return null;
  if (sigBytes.length !== 64) return null; // ed25519 sig

  const payloadJson = new TextDecoder().decode(payloadBytes);
  return { payloadJson, sig: sigBytes };
}

export type VerifyLicenseResult =
  | { valid: true; payload: LicensePayload; error: null }
  | { valid: false; payload: null; error: string };

export function verifyLicense(key?: string): VerifyLicenseResult {
  const k = key?.trim();
  if (!k) return { valid: false, payload: null, error: "NO_KEY" };

  // demo key (опційно)
  if (k.startsWith("mrszlv_demo_")) {
    return {
      valid: true,
      payload: {
        email: "demo",
        plan: "demo",
        exp: "2999-12-31",
        iat: todayYYYYMMDD(),
      },
      error: null,
    };
  }

  const parsed = parseLicense(k);
  if (!parsed) return { valid: false, payload: null, error: "BAD_FORMAT" };

  let payload: LicensePayload;
  try {
    payload = JSON.parse(parsed.payloadJson) as LicensePayload;
  } catch {
    return { valid: false, payload: null, error: "BAD_PAYLOAD_JSON" };
  }

  if (!payload?.email || !payload?.plan || !payload?.exp || !payload?.iat) {
    return { valid: false, payload: null, error: "MISSING_FIELDS" };
  }

  if (payload.plan !== "pro" && payload.plan !== "demo") {
    return { valid: false, payload: null, error: "BAD_PLAN" };
  }

  if (!isValidDateYYYYMMDD(payload.exp) || !isValidDateYYYYMMDD(payload.iat)) {
    return { valid: false, payload: null, error: "BAD_DATE" };
  }

  if (isExpired(payload.exp)) {
    return { valid: false, payload: null, error: "EXPIRED" };
  }

  const publicKey = safeBase64UrlToUint8Array(PUBLIC_KEY_B64URL);
  if (!publicKey || publicKey.length !== 32) {
    return { valid: false, payload: null, error: "BAD_PUBLIC_KEY" };
  }

  const payloadBytes = new TextEncoder().encode(parsed.payloadJson);

  const ok = nacl.sign.detached.verify(payloadBytes, parsed.sig, publicKey);
  if (!ok) return { valid: false, payload: null, error: "BAD_SIGNATURE" };

  return { valid: true, payload, error: null };
}

// ✅ для старого коду (guard), якщо десь очікується boolean
export function checkLicense(key?: string): boolean {
  return verifyLicense(key).valid;
}
