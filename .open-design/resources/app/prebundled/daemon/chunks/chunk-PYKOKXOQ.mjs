import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/registry/versioning.js
function parsePluginSpecifier(input) {
  const trimmed = input.trim();
  const slash = trimmed.indexOf("/");
  const at = trimmed.lastIndexOf("@");
  if (slash > 0 && at > slash + 1) {
    const range = trimmed.slice(at + 1);
    return range ? { name: trimmed.slice(0, at), range } : { name: trimmed.slice(0, at) };
  }
  return { name: trimmed };
}
function resolveMarketplaceEntryVersion(entry, requestedRange) {
  if (entry.yanked)
    return null;
  const versions = entry.versions ?? [];
  const range = requestedRange?.trim();
  const defaultVersion = entry.distTags?.latest ?? entry.version ?? versions.find((version) => !version.yanked)?.version;
  const targetVersion = range && range !== "latest" ? resolveRequestedVersion(versions, entry.distTags ?? {}, range) : defaultVersion;
  if (!targetVersion)
    return null;
  const versionRecord = versions.find((version) => version.version === targetVersion);
  if (versionRecord?.yanked)
    return null;
  const source = versionRecord?.source ?? entry.source;
  if (!source)
    return null;
  const resolved = {
    version: targetVersion,
    source
  };
  const ref = versionRecord?.ref ?? entry.ref;
  if (ref)
    resolved.ref = ref;
  const manifestDigest = versionRecord?.manifestDigest ?? versionRecord?.dist?.manifestDigest ?? entry.manifestDigest ?? entry.dist?.manifestDigest;
  if (manifestDigest)
    resolved.manifestDigest = manifestDigest;
  const archiveIntegrity = versionRecord?.integrity ?? versionRecord?.dist?.integrity ?? entry.integrity ?? entry.dist?.integrity;
  if (archiveIntegrity)
    resolved.archiveIntegrity = archiveIntegrity;
  const deprecated = versionRecord?.deprecated ?? entry.deprecated;
  if (deprecated !== void 0)
    resolved.deprecated = deprecated;
  return resolved;
}
function resolveRequestedVersion(versions, distTags, range) {
  const tagged = distTags[range];
  if (tagged)
    return tagged;
  if (!range.startsWith("^") && !range.startsWith("~")) {
    return range;
  }
  const base = parseSemver(range.slice(1));
  if (!base)
    return null;
  const candidates = versions.filter((version) => !version.yanked).map((version) => version.version).filter((version) => {
    const parsed = parseSemver(version);
    if (!parsed)
      return false;
    if (range.startsWith("^")) {
      return parsed.major === base.major && compareSemver(parsed, base) >= 0;
    }
    return parsed.major === base.major && parsed.minor === base.minor && compareSemver(parsed, base) >= 0;
  }).sort((left, right) => compareSemver(parseSemver(right), parseSemver(left)));
  return candidates[0] ?? null;
}
function parseSemver(value) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(value);
  if (!match)
    return null;
  return {
    major: Number(match[1] ?? 0),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0)
  };
}
function compareSemver(left, right) {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}

export {
  parsePluginSpecifier,
  resolveMarketplaceEntryVersion
};
