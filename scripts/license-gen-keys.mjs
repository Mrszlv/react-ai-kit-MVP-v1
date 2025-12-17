import nacl from "tweetnacl";

function toBase64Url(bytes) {
  const b64 = Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const kp = nacl.sign.keyPair();

console.log("PUBLIC_KEY_B64URL=", toBase64Url(kp.publicKey));
console.log("PRIVATE_KEY_B64URL=", toBase64Url(kp.secretKey));
