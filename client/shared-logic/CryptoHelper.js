const nacl = require("tweetnacl");

console.log("NEW hrepldafj;dlkf ");
// ✅ PRNG for Expo / React Native (prevents "no PRNG")
try {
  const Random = require("expo-random");
  if (typeof nacl.setPRNG === "function") {
    nacl.setPRNG((x, n) => {
      const bytes = Random.getRandomBytes(n);
      for (let i = 0; i < n; i++) x[i] = bytes[i];
    });
  }
} catch (e) {
  // optional: web fallback
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.getRandomValues === "function" &&
    typeof nacl.setPRNG === "function"
  ) {
    nacl.setPRNG((x, n) => {
      const bytes = new Uint8Array(n);
      window.crypto.getRandomValues(bytes);
      for (let i = 0; i < n; i++) x[i] = bytes[i];
    });
  }
}

function toUint8ArrayFromString(s) {
  // sign/verify expects bytes; simplest stable conversion:
  return new TextEncoder().encode(String(s));
}

function b64ToU8(b64) {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

function u8ToB64(u8) {
  return Buffer.from(u8).toString("base64");
}

class CryptoHelper {
  // ✅ MUST EXIST
  static generateKeyPair() {
    const kp = nacl.sign.keyPair();
    return {
      publicKey: u8ToB64(kp.publicKey),
      secretKey: u8ToB64(kp.secretKey),
    };
  }

  // dataArr: array of strings
  static sign(dataArr, secretKeyB64) {
    const msg = toUint8ArrayFromString(dataArr.join("|"));
    const sk = b64ToU8(secretKeyB64);
    const sig = nacl.sign.detached(msg, sk);
    return u8ToB64(sig);
  }

  static verify(dataArr, signatureB64, publicKeyB64) {
    const msg = toUint8ArrayFromString(dataArr.join("|"));
    const sig = b64ToU8(signatureB64);
    const pk = b64ToU8(publicKeyB64);
    return nacl.sign.detached.verify(msg, sig, pk);
  }
}

// ✅ THIS EXPORT MUST MATCH YOUR IMPORTS
module.exports = { CryptoHelper };
