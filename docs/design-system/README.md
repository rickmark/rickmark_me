A personal site for a hardware and privacy security engineer: the voice of a lab notebook, precise and plain-spoken, with one warm signal colour against graphite and paper.

## Content fundamentals

- Write in first person, short declarative sentences. Lead with the work, not adjectives: "Found and disclosed a boot-ROM flaw in Apple's T2" — not "passionate security enthusiast".
- Sentence case for every heading and button. No emoji.
- Name real things: chips, CVEs, protocols, repos (`apple-knowledge`, `chainfix`). Technical identifiers go in `code` style, coloured `signal`.
- Section labels (WORK, RESEARCH, WRITING, TALKS) use the `label` style — mono, uppercase, tracked — in `ink-muted`.

## Visual foundations

- **Color.** `surface` is the page; `surface-raised` holds cards and code. Body copy is `ink`; dates and metadata are `ink-muted`. `accent` (signal amber) is for links, the current nav item and the single primary button per page — spend it sparingly. `signal` (probe teal) marks code, tags and advisories. `accent-tint` backs a callout or a featured project. Ship both themes; follow the visitor's `prefers-color-scheme`.
- **Type.** IBM Plex Sans for prose and headings, IBM Plex Mono for labels, code and data (load both from Google Fonts). Headings: `display` for the name on the home hero only, `h1` page titles, `h2` sections. Prose in `body` at a 68ch max measure; captions in `small`.
- **Spacing.** An 8px grid: `space-1` inside components, `space-2` padding, `space-3` between blocks, `space-4` between sections.
- **Borders, not shadows.** Separate cards and rows with a 1px `hairline` border. No drop shadows, no gradients.
- **Radii.** `radius-sm` on tags and code, `radius-md` on buttons and cards, `radius-lg` on the portrait only.
- **Focus.** A solid 2px `signal` outline offset 2px, `radius-sm`, on every interactive element.
- **Motion.** None beyond 120ms colour transitions on hover.
- **Imagery.** One real portrait, plus real hardware photos or diagrams from the research. No stock photos.

## Iconography

No logo yet — set the name "Rick Mark" in `h2` sans as the wordmark. Use a single 1.5px-stroke line icon set (e.g. Lucide) in `ink-muted`, 16–20px, only for links out (GitHub, LinkedIn, X, email, RSS).
