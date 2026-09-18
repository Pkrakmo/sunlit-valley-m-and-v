# Preliminary repository analysis

**Reviewed:** 2026-09-16
**Repository:** `Pkrakmo/sunlit-valley-m-and-v` (current branch: `master`)
**Current pack version:** `4.1.5` (`pakku.json`)

## Executive summary

This is a source repository for a customised, Stardew Valley-inspired Minecraft
modpack, not a single Java mod project. It contains configuration, quests,
assets, localisation, and a substantial KubeJS implementation that provides
the pack's bespoke gameplay. Dependency distribution is managed with Pakku.

The pack is sizeable but its authored logic is concentrated in `kubejs/`. The
highest-value areas to understand before making changes are custom item/block
registration, recipes/tags, machine definitions, quest content, and the
corresponding client-facing JEI/tooltips/localisation.

## Repository map

| Path | Purpose |
| --- | --- |
| `pakku.json` | Pack metadata, version, client-only project overrides, and export rules. |
| `pakku-lock.json` | Locked mod/project dependency set; 367 projects were found. |
| `kubejs/` | Custom gameplay and data: 303 JavaScript files. |
| `config/` | Common/client mod configuration and pack presentation assets. |
| `defaultconfigs/` | Server-default configuration deployed for worlds/servers. |
| `configureddefaults/` | Default client configuration (options, controller, JourneyMap). |
| `patchouli_books/` | In-game guide-book content; 1,070 files. |
| `FTBLang/` and `kubejs/assets/**/lang` | Localisation and language overrides. |
| `resourcepacks/sunlit_overrides.zip` | Versioned client resource-pack override. |
| `scripts/pakkuAudit.js` | Node-based dependency-platform audit utility. |

## KubeJS architecture

KubeJS is organised according to its lifecycle and responsibility:

- `startup_scripts/` — registrations and shared definitions that load at
  startup. This includes blocks, items, entities, crops, fluids, sounds,
  custom machines, powerful machines, fishing systems, and global helpers.
  It contains 97 JavaScript files.
- `server_scripts/` — server-side rules and data changes. Subareas include
  recipes, tags, loot, entities, NPCs, player/item/block/server events, and
  data generation. It contains 188 JavaScript files.
- `client_scripts/` — UI/integration customisation, notably JEI, Jade,
  tooltips, seasonal display work, and hidden/added item views. It contains
  18 JavaScript files.
- `assets/` — modpack resource data and language overrides (861 files).

Several files are large and likely act as central registries or policy points:
`startup_scripts/globalRegistry.js` (~101 KB),
`startup_scripts/fishPondDefinitions.js` (~93 KB),
`startup_scripts/globalBlockEntityHandlers.js` (~42 KB),
`startup_scripts/registration/registerItems.js` (~41 KB), and recipe files
under `server_scripts/recipes/` (~38–39 KB). Changes here deserve targeted
in-game regression testing, because they can affect many systems at once.

## Tooling and delivery model

- Pakku declares the pack version and separates shared overrides (`config`,
  `defaultconfigs`, `kubejs`, `patchouli_books`) from client overrides
  (`configureddefaults`, shaders, and the versioned resource pack).
- `package.json` supplies ESLint dependencies only. Its `test` script is the
  placeholder `"-"`; there is no automated test/build/export command defined.
- `eslint.config.mjs` treats JavaScript as script-mode and disables `no-undef`,
  which is appropriate for KubeJS globals but limits static typo detection.
- The dependency lock currently contains only `curseforge` file records. As a
  result, `scripts/pakkuAudit.js` reports every project as missing Modrinth.
  That is a data/assumption mismatch, not necessarily 367 actionable package
  problems. The script is useful only after the lock contains both platforms,
  or after its audit objective is revised.

## Initial risks and maintenance observations

1. **No automated verification path is present.** The next practical addition
   would be documented lint, pack export/validation, and a small smoke-test
   checklist for loading a client and dedicated server.
2. **Cross-layer changes are easy to incompletely implement.** A new custom
   object can require startup registration, recipe/tag rules, assets and
   localisation, JEI/tooltips, quests, and possibly default/server config.
3. **The installed state is deliberately excluded.** `.gitignore` omits
   `mods/`, saves, logs, screenshots, shaderpacks, and other local runtime
   data. Reproducing an instance should start from Pakku metadata and tracked
   overrides, rather than treating this checkout as a ready-to-run instance.
4. **Binary and generated-style content raises review cost.** The checkout is
   about 177 MB excluding Git history; it includes blueprint assets, audio,
   native controller files, and a zipped resource pack. Review binary changes
   separately from code/config changes when possible.
5. **Documentation has upstream carry-over.** README and translation guidance
   still direct contributors to the original `Chakyl/society-sunlit-valley`
   project and state that original contributions using AI are denied. This
   fork's README explicitly says AI has been used for the fork. Clarify local
   contribution policy and issue/PR destinations if outside contributors are
   expected.
6. **Pack compatibility needs explicit confirmation.** The reviewed metadata
   identifies a Forge/NeoForge-oriented mod set, but no authoritative
   Minecraft-version/loader requirement was found in the top-level metadata.
   Record this alongside Java and launcher/Pakku versions before upgrade work.

## Recommended next steps

1. Add a short `DEVELOPMENT.md` that states the required Minecraft version,
   loader, Java runtime, Pakku workflow, and client/server export process.
2. Replace the placeholder npm test command with explicit lint and pack-audit
   commands; document any intentional lint exemptions for KubeJS globals.
3. Map the main KubeJS systems (economy, machines, farming, fishing, NPCs,
   quests) to their primary scripts before a feature or balance pass.
4. Decide whether Modrinth parity is a real delivery requirement. Then either
   populate the required lock metadata or adjust/remove `pakkuAudit.js` so its
   output is actionable.
5. Establish a repeatable smoke-test matrix: clean client launch, server
   launch, existing-world load, new-world load, quest sync, custom-machine
   interactions, and recipe/JEI visibility.

## Scope and limitations

This is a static preliminary assessment. It does not validate a Pakku export,
download dependencies, launch Minecraft, or test in-game behavior. No tracked
pack files were changed; this `CODEX` report is the only addition.
