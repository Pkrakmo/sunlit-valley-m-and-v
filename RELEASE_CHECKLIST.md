# Release checklist

Record the pack version, `pakku-lock.json` revision, Minecraft/Forge/Java
versions, operating system, launcher/server runtime, tester, and date. Attach
logs, screenshots, or command output for every pass; record a failure with its
reproduction steps and do not release until it is resolved or explicitly waived.

## Repository and package evidence

- [ ] `npm run lint` passes.
- [ ] `npm run pack-audit` passes against the committed lockfile.
- [ ] `npm test` passes.
- [ ] `git diff --check` passes and `git status --short` contains only intended release changes.
- [ ] If Pakku is installed, `pakku fetch` succeeds from a clean managed dependency set and `pakku export` produces the CurseForge and server-pack ZIPs.

## Launch matrix

- [ ] A clean client launches and creates a new world.
- [ ] A backed-up existing world loads without errors; retain the backup and record its source pack version.
- [ ] The dedicated server launches with the exported server pack, and a matching client connects and plays.

## In-game smoke evidence

- [ ] FTB Quests syncs for a joining client and the intended chapters/tasks are visible.
- [ ] JEI shows representative recipes and outputs; representative item and block tooltips render correctly.
- [ ] A sellable item completes the shipping-bin flow, including its price/multiplier behavior and resulting payment.
- [ ] One artisan machine accepts its inputs, completes a cycle, and exposes correct output and Jade/tooltip information where applicable.
- [ ] A fish pond can be placed and interacted with; its fish/request or reward flow, quest interaction, and Jade/tooltip state work as expected.

Pakku, launcher, client, and server checks are manual release gates; they cannot
be substituted by the repository-only Node checks.
