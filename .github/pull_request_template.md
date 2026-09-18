## Summary

<!-- What changes, why is it needed, and what player or maintainer impact does it have? -->

## Scope

- [ ] Bug fix
- [ ] Balance, recipe, tag, or configuration change
- [ ] KubeJS gameplay or data change
- [ ] Quest, localisation, tooltip, or other player-facing content
- [ ] Pakku dependency or pack metadata change
- [ ] Documentation, tooling, or maintenance

## Validation

<!-- Check the applicable items and include useful results or skipped checks below. -->

- [ ] `npm run lint`
- [ ] `npm run pack-audit`
- [ ] `npm test`
- [ ] `git diff --check`
- [ ] Tested in-game (describe the scenario below)
- [ ] Not tested in-game (explain why below)

### Validation notes

<!-- Commands run, in-game test scenario, and any intentionally skipped checks. -->

## Pack-specific review

<!-- Complete only the sections that apply. -->

### Pakku changes

- [ ] I changed `pakku.json` and regenerated/reviewed `pakku-lock.json` with Pakku.
- [ ] I did not add generated dependency files from `mods/`.

### KubeJS changes

- [ ] Scripts are in the correct lifecycle folder: startup, server, or client.
- [ ] I reviewed related recipes/tags, assets/localisation, tooltips/JEI/Jade, and quests where relevant.

## Changelog

<!-- Player-facing entries only. Write "None" for internal-only work. -->

-

## Additional context

<!-- Screenshots, logs, migration notes, follow-up work, or reviewer guidance. -->
