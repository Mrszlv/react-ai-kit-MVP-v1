import nacl from "tweetnacl";

function toBase64Url(bytes) {
  const b64 = Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(b64url) {
  const b64 =
    b64url.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((b64url.length + 3) % 4);
  return new Uint8Array(Buffer.from(b64, "base64"));
}

// usage:
// node scripts/license-issue.mjs client@company.com 2026-01-31 pro
const email = process.argv[2];
const exp = process.argv[3];
const plan = process.argv[4] ?? "pro";

if (!email || !exp) {
  console.error(
    "Usage: node scripts/license-issue.mjs <email> <YYYY-MM-DD> [plan]"
  );
  process.exit(1);
}

const PRIVATE_KEY_B64URL = process.env.LICENSE_PRIVATE_KEY_B64URL;
if (!PRIVATE_KEY_B64URL) {
  console.error("Missing env LICENSE_PRIVATE_KEY_B64URL");
  process.exit(1);
}

const secretKey = fromBase64Url(PRIVATE_KEY_B64URL);

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const iat = `${yyyy}-${mm}-${dd}`;

const payload = {
  email,
  plan,
  exp,
  iat,
};

const payloadJson = JSON.stringify(payload);
const payloadBytes = new TextEncoder().encode(payloadJson);

const sig = nacl.sign.detached(payloadBytes, secretKey);

const license = `mrszlv1.${toBase64Url(payloadBytes)}.${toBase64Url(sig)}`;
console.log(license);
