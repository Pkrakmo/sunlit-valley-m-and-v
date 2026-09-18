# Contributor and agent guidance

## Working safely

- Preserve unrelated changes and untracked files. Do not clean, reset, or
  reformat broad parts of the repository to make a focused change.
- Treat `pakku.json` and `pakku-lock.json` as authoritative for managed mod
  projects. Use Pakku rather than editing generated dependency contents in
  `mods/`.
- Do not add ignored runtime or local-instance files, including `mods/`,
  `build/`, logs, saves, screenshots, crash reports, and user options, unless a
  task explicitly requires a generated artifact.

## KubeJS

- Keep scripts in their lifecycle folders: `kubejs/startup_scripts/` for
  registration/startup work, `kubejs/server_scripts/` for server reload work,
  and `kubejs/client_scripts/` for client-only behavior.
- KubeJS and Forge APIs are injected at runtime. Their globals are exempt from
  `no-undef` only under `kubejs/**`; Node scripts must remain linted normally.

## Before handoff

- Run the relevant validation. For JavaScript and pack metadata changes, run
  `npm run lint`, `npm run pack-audit`, and `npm test`.
- Review `git diff --check` and `git status --short`, and report checks that
  could not be run or any intentional warnings.
