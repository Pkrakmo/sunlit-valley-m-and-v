const fs = require("fs");
const path = require("path");

const LOCK_FILE = path.join(process.cwd(), "pakku-lock.json");

class PakkuAuditError extends Error {}

function requireObject(value, description) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PakkuAuditError(`${description} must be an object.`);
  }
}

function requireString(value, description) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new PakkuAuditError(`${description} must be a non-empty string.`);
  }
}

function requireStringArray(value, description) {
  if (!Array.isArray(value) || value.length === 0 || value.some((entry) => typeof entry !== "string" || entry.trim() === "")) {
    throw new PakkuAuditError(`${description} must be a non-empty array of strings.`);
  }
}

function curseForgeIdentity(project, index) {
  requireObject(project, `Project ${index + 1}`);
  requireObject(project.slug, `Project ${index + 1}.slug`);
  requireObject(project.name, `Project ${index + 1}.name`);
  requireObject(project.id, `Project ${index + 1}.id`);
  requireString(project.slug.curseforge, `Project ${index + 1} CurseForge slug`);
  requireString(project.name.curseforge, `Project ${index + 1} CurseForge name`);
  requireString(project.id.curseforge, `Project ${index + 1} CurseForge project ID`);
  return project.id.curseforge;
}

function validateCurseForgeFile(file, projectIndex, fileIndex) {
  const description = `Project ${projectIndex + 1} CurseForge file ${fileIndex + 1}`;
  requireObject(file, description);
  requireString(file.file_name, `${description} filename`);
  requireString(file.id, `${description} ID`);
  requireString(file.url, `${description} URL`);
  try {
    new URL(file.url);
  } catch {
    throw new PakkuAuditError(`${description} URL must be valid.`);
  }
  requireObject(file.hashes, `${description} hashes`);
  requireString(file.hashes.sha1, `${description} SHA-1 hash`);
  requireString(file.hashes.md5, `${description} MD5 hash`);
}

function validateLock(lock) {
  requireObject(lock, "Lockfile root");
  if (lock.target !== "curseforge") {
    throw new PakkuAuditError('Lockfile target must be "curseforge".');
  }
  requireStringArray(lock.mc_versions, "Lockfile mc_versions");
  requireObject(lock.loaders, "Lockfile loaders");
  if (Object.keys(lock.loaders).length === 0) {
    throw new PakkuAuditError("Lockfile loaders must not be empty.");
  }
  for (const [loader, version] of Object.entries(lock.loaders)) {
    requireString(loader, "Lockfile loader name");
    requireString(version, `Lockfile loader ${loader} version`);
  }
  if (!Array.isArray(lock.projects)) {
    throw new PakkuAuditError("Lockfile projects must be an array.");
  }

  const projectIds = new Set();
  let curseForgeFileCount = 0;
  lock.projects.forEach((project, projectIndex) => {
    const projectId = curseForgeIdentity(project, projectIndex);
    if (projectIds.has(projectId)) {
      throw new PakkuAuditError(`Duplicate CurseForge project ID: ${projectId}.`);
    }
    projectIds.add(projectId);
    if (!Array.isArray(project.files)) {
      throw new PakkuAuditError(`Project ${projectIndex + 1}.files must be an array.`);
    }
    const curseForgeFiles = project.files.filter((file) => file && file.type === "curseforge");
    if (curseForgeFiles.length === 0) {
      throw new PakkuAuditError(`Project ${projectIndex + 1} has no CurseForge file.`);
    }
    curseForgeFiles.forEach((file, fileIndex) => {
      validateCurseForgeFile(file, projectIndex, fileIndex);
      curseForgeFileCount += 1;
    });
  });

  return {
    projectCount: lock.projects.length,
    mcVersions: lock.mc_versions,
    loaders: lock.loaders,
    curseForgeFileCount,
  };
}

function readLockFile(lockFile) {
  let contents;
  try {
    contents = fs.readFileSync(lockFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new PakkuAuditError(`Lockfile not found: ${lockFile}.`);
    }
    throw error;
  }
  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new PakkuAuditError(`Invalid JSON in ${path.basename(lockFile)}: ${error.message}`);
  }
}

function formatSummary(summary) {
  const loaders = Object.entries(summary.loaders).map(([loader, version]) => `${loader} ${version}`).join(", ");
  return [
    `Validated ${summary.projectCount} locked projects.`,
    `Minecraft: ${summary.mcVersions.join(", ")}.`,
    `Loaders: ${loaders}.`,
    `Validated ${summary.curseForgeFileCount} CurseForge files.`,
  ].join(" ");
}

function pakkuAudit(lockFile = LOCK_FILE) {
  const summary = validateLock(readLockFile(lockFile));
  console.log(formatSummary(summary));
  return summary;
}

if (require.main === module) {
  try {
    pakkuAudit();
  } catch (error) {
    console.error(`Pakku lock audit failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { PakkuAuditError, formatSummary, pakkuAudit, readLockFile, validateLock };
