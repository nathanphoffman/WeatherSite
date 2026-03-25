---
name: Project Structure Overview
description: WeatherSite Next.js App Router structure, router type, and key intentional patterns
type: project
---

This project uses the Next.js **App Router**. The root is `/home/nate/Code/WeatherSite/app/`.

**Why:** All routing is under `app/`, with `page.tsx`, `layout.tsx`, and `loading.tsx` at the root and route-specific `page.tsx` files in subdirectories (e.g., `app/about/page.tsx`).

**Intentional patterns observed:**
- `app/components/` — shared component tree, colocated inside `app/` (non-standard placement vs. root-level `/components`, but consistent throughout the project)
- `app/lib/noaa/` — all NOAA business logic, organized into `output/`, `sources/`, `storage/`, `types/` subfolders
- `app/utils/` — utility/parser files (currently small: `cityParser.ts`)
- `app/lib/noaa/storage/` contains CSV data files alongside TypeScript modules — intentional colocation
- `graphCardsConfig.ts` inside `app/components/Forecast/ForecastCard/GraphCard/` exports shared graph helpers including a custom React hook (`useContainerWidth`) and math utilities — intentional colocation with the graph component subtree, but the filename implies config-only content

**Recurring issues to watch:**
- ~~`app/components/delete_styles.module.css`~~ — RESOLVED on branch `component-reorg` (deleted)
- `City` interface in `cityParser.ts` still has a `long` field (mapped from CSV `lng`) — this is the allowed abbreviation per project rules, so the field name itself is acceptable; CSV header transform is appropriate
- `graphCardsConfig.ts` misname was PARTIALLY RESOLVED on `component-reorg`: the hook (`useContainerWidth`) and math functions (`smoothLinePath`, etc.) were extracted to dedicated files (`useContainerWidth.ts`, `graphMath.ts`). The config file now only contains `GRAPH_DIMENSIONS`, `ThresholdLine`, and `defaultFormatYLabel` — still named `graphCardsConfig.ts` (plural "Cards" is inconsistent given it's shared config, not card-specific), but its contents are now appropriate for a config file.
- `resolvedLon` in `app/lib/noaa/storage/main.ts` — abbreviation violation; should be `resolvedLongitude` (or simply remove the redundant reassignment entirely)
- Component/function name mismatch in `ThreeHourForecastCard.tsx`: file is named `ThreeHourForecastCard` but the exported function is named `ThreeHourForecast` — these must match
- New `GraphSvg/` subdirectory established under `GraphCard/` — intentional breakdown of SVG axis/border sub-components; treat as established pattern going forward

**Established subdirectory depth pattern:**
`app/components/Forecast/ForecastCard/GraphCard/GraphSvg/` is the deepest confirmed intentional nesting. Components at this level are single-responsibility SVG primitives (`GraphBorders`, `XAxisLabels`, `YAxisLabels`, `ThresholdLines`).

**How to apply:** Do not flag `app/components/` or `app/lib/` placement as errors — these are established patterns for this project. Do flag new files that break from this colocation model.
