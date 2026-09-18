# Preliminary repository analysis

**Initial review:** 2026-09-16
**Repository:** `Pkrakmo/sunlit-valley-m-and-v`
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
- `package.json` provides `lint`, `pack-audit`, and `test` commands. The test
  command runs ESLint and the Node-based Pakku-audit test suite.
- `eslint.config.mjs` scopes KubeJS/Forge runtime-global exemptions to
  `kubejs/**`, while Node tooling and tests retain normal undefined-variable
  checks.
- The lock contains CurseForge file records. `scripts/pakkuAudit.js` validates
  the CurseForge target, project identities, URLs, and complete SHA-1 and MD5
  digests; it intentionally does not require Modrinth parity.

## Initial risks and maintenance observations

1. **Repository checks do not replace runtime validation.** Lint, lockfile
   validation, and unit tests are available, but Pakku export and in-game
   client/server smoke tests remain manual release gates.
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
5. **Local contribution policy should remain explicit.** The README now
   distinguishes this fork from upstream; clarify local issue/PR ownership if
   outside contributors are expected.
6. **Compatibility requirements are documented.** Development documentation
   records Minecraft 1.20.1, Forge 47.4.0, and Java 17; confirm these values
   before any pack upgrade.

## Recommended next steps

1. Run `pakku fetch` and `pakku export` from a clean managed dependency set
   before release, then retain the resulting artifact evidence.
2. Add automated checks for generated dialogue artifacts and locale key
   alignment when NPC dialogue source definitions change.
3. Use `KUBEJS_SYSTEMS.md` to identify related gameplay layers before a
   feature or balance pass.
4. Establish and record the release smoke-test matrix: clean client launch,
   server launch, existing-world load, new-world load, quest sync,
   custom-machine interactions, and recipe/JEI visibility.

## Scope and limitations

This began as a static preliminary assessment. It does not validate a Pakku
export, download dependencies, launch Minecraft, or test in-game behavior.
Subsequent changes in this fork added documentation and repository-level
validation; see `DEVELOPMENT.md` and `RELEASE_CHECKLIST.md` for current
workflow and manual release gates.
