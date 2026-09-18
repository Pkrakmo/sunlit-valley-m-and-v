const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const { formatSummary, readLockFile, validateLock } = require("../scripts/pakkuAudit.js");

const fixture = (name) => path.join(__dirname, "fixtures", name);
const validLock = () => readLockFile(fixture("valid-curseforge-lock.json"));

test("accepts a valid CurseForge-only lock", () => {
  const summary = validateLock(validLock());
  assert.deepEqual(summary, {
    projectCount: 1,
    mcVersions: ["1.20.1"],
    loaders: { forge: "47.4.0" },
    curseForgeFileCount: 1,
  });
  assert.equal(
    formatSummary(summary),
    "Validated 1 locked projects. Minecraft: 1.20.1. Loaders: forge 47.4.0. Validated 1 CurseForge files."
  );
});

test("rejects malformed JSON", () => {
  assert.throws(() => readLockFile(fixture("malformed-lock.json")), /Invalid JSON/);
});

test("rejects a non-CurseForge target", () => {
  assert.throws(() => validateLock(readLockFile(fixture("wrong-target-lock.json"))), /target must be "curseforge"/);
});

test("rejects incomplete CurseForge file metadata", () => {
  assert.throws(
    () => validateLock(readLockFile(fixture("missing-curseforge-metadata-lock.json"))),
    /MD5 hash/
  );
});

test("rejects a project without a CurseForge identity", () => {
  const lock = validLock();
  delete lock.projects[0].slug.curseforge;
  assert.throws(() => validateLock(lock), /CurseForge slug/);
});

for (const [field, expectedError] of [
  ["file_name", /filename/],
  ["url", /URL/],
  ["id", /file 1 ID/],
  ["hashes", /hashes/],
]) {
  test(`rejects a CurseForge file without ${field}`, () => {
    const lock = validLock();
    delete lock.projects[0].files[0][field];
    assert.throws(() => validateLock(lock), expectedError);
  });
}

for (const [hash, value, expectedError] of [
  ["sha1", "a".repeat(39), /SHA-1 hash.*40-character hexadecimal/],
  ["sha1", "g".repeat(40), /SHA-1 hash.*40-character hexadecimal/],
  ["md5", "a".repeat(31), /MD5 hash.*32-character hexadecimal/],
  ["md5", "g".repeat(32), /MD5 hash.*32-character hexadecimal/],
]) {
  test(`rejects an invalid CurseForge ${hash} hash`, () => {
    const lock = validLock();
    lock.projects[0].files[0].hashes[hash] = value;
    assert.throws(() => validateLock(lock), expectedError);
  });
}

test("rejects duplicate CurseForge project identities", () => {
  assert.throws(
    () => validateLock(readLockFile(fixture("duplicate-project-lock.json"))),
    /Duplicate CurseForge project ID: 12345/
  );
});

test("rejects a lockfile schema with no projects array", () => {
  assert.throws(
    () => validateLock({ target: "curseforge", mc_versions: ["1.20.1"], loaders: { forge: "47.4.0" } }),
    /projects must be an array/
  );
});
