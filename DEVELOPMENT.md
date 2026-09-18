# Development

This is a Pakku-managed Minecraft modpack, not a Gradle mod project. Pakku is
installed separately and is the source of truth for managed projects and their
locked versions.

## Requirements

- Minecraft 1.20.1
- Forge 47.4.0
- Eclipse Temurin Java 17
- [Pakku](https://github.com/juraj-hrivnak/pakku)
- Node.js and npm for repository checks

On this workstation, select the expected Java runtime before running Minecraft
or other Java tooling:

```bash
export JAVA_HOME=/opt/jdk/jdk-17.0.20+8
export PATH="$JAVA_HOME/bin:$PATH"
java -version
```

The last command should report Temurin/OpenJDK 17.

## Pakku workflow

Edit `pakku.json` to manage the pack's projects. Run `pakku fetch` to populate
the local managed dependency set from `pakku.json` and `pakku-lock.json`; do
not manually treat downloaded `mods/` files as project metadata.

When preparing a release, run `pakku export`. It produces the CurseForge ZIP
and the server-pack ZIP under `build/`. Server-side projects are intentionally
included in client exports (`export_server_side_projects_to_client` is enabled
in `pakku.json`), so do not remove them from the client artifact.

## Checks

```bash
npm run lint
npm run pack-audit
npm test
```

`pack-audit` is a strict CurseForge lock-integrity check. It verifies the
CurseForge target, project identities, and the filename, URL, ID, and hashes
for every locked CurseForge file. Modrinth parity is not a delivery requirement
and is neither checked nor reported. See [KUBEJS_SYSTEMS.md](KUBEJS_SYSTEMS.md)
for feature ownership and [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for the
release smoke-test gate.
