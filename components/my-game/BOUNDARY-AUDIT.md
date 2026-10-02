# File-boundary audit

**Result: PASS after correction.**

The original implementation was incorrectly stored under
`components/confessional/` and `public/confessional/`. Its contents were moved
into `components/my-game/` and `public/my-game/`, replacing the forwarding files.
Both old directories are now absent. Imports, artwork generation, test commands,
configuration, and metadata asset URLs use the corrected paths.

## Verified boundary

Only these source paths differ from the pristine downloaded Ape Church template:

- `components/my-game/`
- `public/my-game/`
- `metadata.json`

All **37 protected template files** were compared byte-for-byte and matched.
No protected files were missing. No unexpected non-ignored source files were
found outside the permitted paths. This includes unchanged application routing,
shared components, global styles, package manifests/lockfile, and configuration.

The repository has no initial commit, so the comparison used the original
downloaded template archive, not a Git HEAD diff. Dependencies and generated
Next.js/TypeScript artifacts are excluded according to the template's unchanged
`.gitignore`; they are not authored source changes.

## Validation after moving

- Exhaustive game-model tests: 22,818 boards passed.
- Production build, including TypeScript: passed.
- Browser reload: Confessional renders all 16 panels and both candlesticks.
- Background loads from `/my-game/card.png`; no broken images or browser errors.
- The team name and revenue-share wallet remain intact in `metadata.json`.

Re-run against a pristine template copy:

```powershell
node components/my-game/boundary-audit.cjs <pristine-template-directory>
```

This audit certifies the source-file boundary. It does not change the documented
demo-only status or claim that live wagering is ready.
