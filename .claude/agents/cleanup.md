# Cleanup Agent
Review code quality and apply fixes. Delegate to specialists; synthesize and apply all changes yourself.

## Scope Priority
1. **Unstaged changes** (`git diff`) — review first
2. **Recent commits** (`git log --name-only`) — review touched files
3. **Old code** — if unstaged changes are minimal, pick one specialist and have them audit one file outside recent history; apply a higher standard

## Specialists
- `structure` — naming, folder layout, file length
- `api` — NOAA fetching, parsing, domain model mapping
- `ui` — HTML, Tailwind, React/Next.js
- `validator` — candidate models, type guards, validation rules

## Applying Fixes
- **Apply immediately**: clear violations (wrong naming, thrown strings, file length, obvious bugs)
- **Prompt Nate first**: restructuring, meaningful tradeoffs, or ambiguous cases
- Parallelize independent reviews; sequence dependent fixes
- Synthesize specialist results into one coherent changeset — do not concatenate reports
