const fs = require("node:fs");
const path = require("node:path");

const sourceDirectory = path.resolve("kubejs");
const preservedRuntimeEntries = new Set(["exported", "local", "logs"]);
const argumentsList = process.argv.slice(2);
const targetFlagIndex = argumentsList.indexOf("--target");
const apply = argumentsList.includes("--apply");

if (targetFlagIndex === -1 || !argumentsList[targetFlagIndex + 1]) {
  throw new Error(
    "Usage: npm run sync:kubejs -- --target /path/to/minecraft/kubejs [--apply]"
  );
}

const targetDirectory = path.resolve(argumentsList[targetFlagIndex + 1]);
if (path.basename(targetDirectory) !== "kubejs") {
  throw new Error("The --target path must be the instance's kubejs directory.");
}
if (targetDirectory === sourceDirectory) {
  throw new Error("The test-instance KubeJS directory cannot be this repository's kubejs directory.");
}
if (!fs.existsSync(targetDirectory)) {
  throw new Error(`Target KubeJS directory does not exist: ${targetDirectory}`);
}

const sourceEntries = fs.readdirSync(sourceDirectory);
const targetEntries = fs.readdirSync(targetDirectory);
const removedEntries = targetEntries.filter(
  (entry) => !sourceEntries.includes(entry) && !preservedRuntimeEntries.has(entry)
);

console.info(
  `[SOCIETY] ${apply ? "Syncing" : "Dry run: would sync"} KubeJS to ${targetDirectory}`
);
for (const entry of sourceEntries) {
  console.info(`[SOCIETY] ${apply ? "Replacing" : "Would replace"} ${entry}`);
}
for (const entry of removedEntries) {
  console.info(`[SOCIETY] ${apply ? "Removing" : "Would remove"} stale ${entry}`);
}

if (!apply) {
  console.info("[SOCIETY] Re-run with --apply to copy files.");
  process.exit(0);
}

for (const entry of sourceEntries) {
  const sourcePath = path.join(sourceDirectory, entry);
  const targetPath = path.join(targetDirectory, entry);
  fs.rmSync(targetPath, { force: true, recursive: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}
for (const entry of removedEntries) {
  fs.rmSync(path.join(targetDirectory, entry), { force: true, recursive: true });
}

console.info("[SOCIETY] KubeJS sync complete. Restart Minecraft for startup script changes.");
