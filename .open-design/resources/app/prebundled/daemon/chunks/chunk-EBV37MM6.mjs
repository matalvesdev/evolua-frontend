import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/desktop-auth.js
import { createHmac, timingSafeEqual } from "node:crypto";
var desktopAuthSecret = null;
var desktopAuthEverRegistered = process.env.OD_REQUIRE_DESKTOP_AUTH === "1";
var consumedImportNonces = /* @__PURE__ */ new Map();
var DESKTOP_IMPORT_TOKEN_TTL_MS = 6e4;
var DESKTOP_IMPORT_TOKEN_FIELD_SEP = "~";
function setDesktopAuthSecret(secret) {
  desktopAuthSecret = secret;
  if (secret != null) {
    desktopAuthEverRegistered = true;
  }
  consumedImportNonces.clear();
}
function getDesktopAuthSecret() {
  return desktopAuthSecret;
}
function isDesktopAuthRegistered() {
  return desktopAuthSecret != null;
}
function isDesktopAuthGateActive() {
  return desktopAuthEverRegistered;
}
function resetDesktopAuthForTests() {
  desktopAuthSecret = null;
  desktopAuthEverRegistered = process.env.OD_REQUIRE_DESKTOP_AUTH === "1";
  consumedImportNonces.clear();
}
function pruneExpiredImportNonces(now) {
  for (const [nonce, exp] of consumedImportNonces) {
    if (exp <= now)
      consumedImportNonces.delete(nonce);
  }
}
function timingSafeStringEquals(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length)
    return false;
  return timingSafeEqual(bufA, bufB);
}
function signDesktopImportToken(secret, baseDir, options) {
  const signature = createHmac("sha256", secret).update(`${baseDir}
${options.nonce}
${options.exp}`).digest("base64url");
  return [options.nonce, options.exp, signature].join(DESKTOP_IMPORT_TOKEN_FIELD_SEP);
}
function verifyDesktopImportToken(secret, baseDir, token, now, consumedNonces) {
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "token missing" };
  }
  const parts = token.split(DESKTOP_IMPORT_TOKEN_FIELD_SEP);
  if (parts.length !== 3) {
    return { ok: false, reason: "token shape invalid" };
  }
  const nonce = parts[0];
  const expISO = parts[1];
  const signature = parts[2];
  if (nonce.length === 0 || expISO.length === 0 || signature.length === 0) {
    return { ok: false, reason: "token shape invalid" };
  }
  const expMs = Date.parse(expISO);
  if (!Number.isFinite(expMs)) {
    return { ok: false, reason: "token expiry invalid" };
  }
  if (expMs <= now) {
    return { ok: false, reason: "token expired" };
  }
  if (expMs - now > DESKTOP_IMPORT_TOKEN_TTL_MS * 2) {
    return { ok: false, reason: "token expiry exceeds permitted window" };
  }
  const expected = createHmac("sha256", secret).update(`${baseDir}
${nonce}
${expISO}`).digest("base64url");
  if (!timingSafeStringEquals(expected, signature)) {
    return { ok: false, reason: "token signature invalid" };
  }
  if (consumedNonces.has(nonce)) {
    return { ok: false, reason: "token nonce already used" };
  }
  return { ok: true, nonce, exp: expMs };
}

export {
  consumedImportNonces,
  setDesktopAuthSecret,
  getDesktopAuthSecret,
  isDesktopAuthRegistered,
  isDesktopAuthGateActive,
  resetDesktopAuthForTests,
  pruneExpiredImportNonces,
  signDesktopImportToken,
  verifyDesktopImportToken
};
