# BeachBook — Theme (Clean-Core)

## Design system

BeachBook uses the **Wasserwacht Clean-Core** direction: high-contrast readability, pure white surfaces, **1px neutral borders** instead of tinted “layers” or shadows, and **`#008ccd`** reserved for primary actions and links. Tokens live in [`global.css`](../global.css) as Uniwind `@theme` entries.

### Principles

- **Canvas:** `#FFFFFF` only — no dynamic Material off-whites on the main screen.
- **Cards:** same white as the canvas; separation is **`border border-outline-variant`** (`#E5E7EB`), not background tint.
- **Shadows:** none for product UI; depth is border-only.
- **Primary blue:** `#008ccd` — filled primary buttons, links, active nav; not large static fills.
- **Semantic colors:** keep **success / warning / error** for tower status, incidents, and severity. Do not replace those with brand blue.

### References

- [Uniwind — theming](https://docs.uniwind.dev/theming/basics)
- [Uniwind — `@theme`](https://docs.uniwind.dev/)

## Color palette

| Token | Value | Usage |
| --- | --- | --- |
| `--color-primary` | `#008ccd` | Primary buttons, links, interactive emphasis |
| `--color-on-primary` | `#ffffff` | Text/icons on primary |
| `--color-background` | `#ffffff` | Page background |
| `--color-surface` | `#ffffff` | Sheets, inputs, card fill |
| `--color-surface-container` | `#ffffff` | Alias aligned with cards (still use **border** on the card) |
| `--color-on-background` | `#111827` | Primary text |
| `--color-on-surface` | `#111827` | Primary text on surfaces |
| `--color-on-surface-variant` | `#6b7280` | Secondary text, captions |
| `--color-outline-variant` | `#e5e7eb` | **Default card and list stroke**, dividers, secondary button outline |
| `--color-outline` | `#9ca3af` | Stronger strokes / icons when needed |
| `--color-badge` | `#f3f4f6` | Low-emphasis pills, menu icon wells |
| `--color-on-badge` | `#374151` | Text on badge surfaces |
| `--color-surface-container-high` | `#f3f4f6` | Nested chips inside cards (same intent as badge) |
| `--color-error` / `--color-success` / `--color-warning` | (see `global.css`) | Status and severity only |

## CSS variables

Source of truth: [`global.css`](../global.css) `@theme { ... }`. After changing tokens, rely on Uniwind’s generated utilities (`bg-surface`, `text-on-surface-variant`, etc.).

## Information cards

Default pattern for lists, settings groups, tower blocks:

```tsx
className="rounded-2xl border border-outline-variant bg-surface p-4"
```

- **Padding:** `p-3` (12px) or `p-4` (16px).
- **Radius:** `rounded-xl` or `rounded-2xl` — both resolve to **12px** in theme for large surfaces; use `rounded-md` (8px) for compact fields.

### Hero / empty states

Prefer **one** emphasized block per section: bordered card, optional **left accent** (`border-l-4 border-l-primary`), or light `bg-primary/10` only when it clearly invites a single primary action. Avoid stacking multiple tinted heroes.

## Navigation and headers

- **Native stack header:** white background, **bottom hairline** `1px` `#E5E7EB` (configured in `app/_layout.tsx`).
- **In-tab titles:** [`PageHeader`](../components/page-header.tsx) — large, bold `text-on-background` (`#111827`).

## Primary CTA (buttons)

- **Filled:** `bg-primary` + `text-on-primary` — main submit / dispatch / “add” flows.
- **Outline / secondary:** neutral **`border-outline-variant`**, label `text-primary` (see [`Button`](../components/button.tsx)).
- **Subtle / text:** `text-primary` on transparent.

## Badges and status tags

- **Neutral info:** `bg-badge text-on-badge rounded-md px-2 py-1` (or `rounded-full` for pills).
- **Severity / tower state:** keep `bg-success/15 text-success` (and warning/error analogs) so safety semantics stay green/amber/red.

## Typography

Type scale follows Material-like steps (see [`Typography`](../components/typography.tsx)).

**Numbers:** use [`NumericText`](../components/numeric-text.tsx) (Space Mono, loaded in root layout) for timestamps, coordinates, counts, and tabular grids. For body text that is mostly prose with digits, `Typography` supports a **tabular** flag where the platform allows tabular figures.

## Spacing and radius (theme)

| Utility | Role |
| --- | --- |
| `rounded-md` | 8px — inputs, tight blocks |
| `rounded-lg` | 8px — shared [`Button`](../components/button.tsx), Dienstplan “+ Hinzufügen”, other compact actions |
| `rounded-xl` / `rounded-2xl` | 12px — cards and grouped lists |
| `rounded-full` | Optional badge/chip pills, FABs, avatars |

## Elevation

Do **not** use `shadow-*` on product cards. Use borders. (Exceptions like platform modals are outside this guide.)

## Icon usage

```tsx
import { IconLifebuoy, IconAlertTriangle } from "@tabler/icons-react-native";

<IconLifebuoy size={24} color="var(--color-on-surface)" />
<IconAlertTriangle size={20} color="var(--color-on-surface-variant)" />
<IconLifebuoy size={32} color="var(--color-primary)" />
```

Use **primary** icon color for interactive rows or primary actions; **on-surface-variant** for decorative / secondary icons inside neutral cards.

## Severity and tower status

Unchanged from operations needs — see tables in the previous shipped docs: low/medium/high/critical backgrounds; open/closed/restricted tower colors.

## Spacing system

Use `<Spacer />` between major blocks; use `gap-*` inside uniform lists. See [`Spacer`](../components/spacer.tsx).

## Reusable components

### `Typography`

[`components/typography.tsx`](../components/typography.tsx) — `variant`, `bold`, optional **`tabular`** (`tabular-nums` for aligned figures where the platform supports it).

### `NumericText`

[`components/numeric-text.tsx`](../components/numeric-text.tsx) — monospace numbers.

### `Button`

[`components/button.tsx`](../components/button.tsx) — `filled`, **`secondary`** (transparent + `border-primary`), `outline` (neutral border), `subtle`, `light`, `danger`, etc.

### `TextInput`

[`components/text-input.tsx`](../components/text-input.tsx) — pass icon color `var(--color-on-surface-variant)` or `useCSSVariable("--color-on-surface-variant")`.

### `Spacer`

[`components/spacer.tsx`](../components/spacer.tsx)
