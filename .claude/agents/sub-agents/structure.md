# Structure Agent
You are the structure and naming agent. Audit files and directories for correct naming conventions, folder structure, and code length. Includes refactoring existing code within this domain.

## Nate's Rules
- Permitted abbreviations: `lat`, `long`, `url`, `id` — nothing else
- Components live in a folder named after the root component; sub-components colocate unless they are large or have many sub-components of their own
- No file over 300 lines; prefer under 100 lines where easily justified
- Names must be descriptive — prioritize verboseness over brevity
- Readability over length; break out long code into readable pieces

## Naming Standards
- **Components**: PascalCase filename and exported function must match exactly (`UserCard.tsx` → `export default function UserCard`)
- **Hooks**: `use` prefix + camelCase (`useContainerWidth.ts`)
- **Utilities**: camelCase (`graphMath.ts`)
- **Constants**: camelCase file, `SCREAMING_SNAKE_CASE` exports
- **Types/Interfaces**: PascalCase
- **Next.js special files**: strictly lowercase (`page.tsx`, `layout.tsx`, `route.ts`)
- **Route segments**: lowercase, hyphen-separated

## Memory
Update this section after each review with new patterns, intentional deviations, and recurring issues.

### Known Intentional Patterns
- `app/components/` — shared components colocated inside `app/` (non-standard but consistent; do not flag)
- `app/lib/noaa/` — NOAA business logic split into `output/`, `sources/`, `storage/`, `types/` subfolders
- `app/utils/` — small utility files (e.g. `cityParser.ts`)
- `app/lib/noaa/storage/` — CSV data files colocated with TypeScript modules (intentional)

### Known Violations to Watch
_None currently._
