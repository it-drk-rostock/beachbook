# BeachBook - Theme

## Design System

BeachBook follows **Material Design 3 (Material You)** guidelines adapted for React Native via Uniwind CSS variables.

### References

- [M3 Expressive Design](https://m3.material.io/blog/building-with-m3-expressive)
- [Dribbble: Sustainable DIY App Concept](https://dribbble.com/shots/21724086-Sustainable-DIY-App-Concept)
- [Dribbble: Settings Page Material You](https://dribbble.com/shots/22405778-Settings-page-Material-You-Design-System)

## Primary Color

```
#008CCD — Ocean Blue
```

This is the brand color for BeachBook, derived from the ocean/lifeguard context.

## Color Palette (M3 Tonal)

Generated from primary `#008CCD` using Material 3 color system principles.

### Light Theme

| Token                  | Value       | Usage                                    |
| ---------------------- | ----------- | ---------------------------------------- |
| `--color-primary`      | `#008CCD`   | Primary buttons, active states, links    |
| `--color-on-primary`   | `#FFFFFF`   | Text/icons on primary                    |
| `--color-primary-container` | `#C8E6FF` | Soft primary backgrounds, chips       |
| `--color-on-primary-container` | `#001E31` | Text on primary container          |
| `--color-secondary`    | `#4F6070`   | Secondary actions, less prominent UI     |
| `--color-on-secondary` | `#FFFFFF`   | Text/icons on secondary                  |
| `--color-secondary-container` | `#D3E4F5` | Secondary backgrounds              |
| `--color-on-secondary-container` | `#0B1D2B` | Text on secondary container       |
| `--color-tertiary`     | `#645A7C`   | Accent elements, complementary UI        |
| `--color-on-tertiary`  | `#FFFFFF`   | Text/icons on tertiary                   |
| `--color-background`   | `#F8F9FF`   | Page background                          |
| `--color-on-background`| `#191C20`   | Primary text                             |
| `--color-surface`      | `#F8F9FF`   | Card/sheet surfaces                      |
| `--color-on-surface`   | `#191C20`   | Text on surfaces                         |
| `--color-surface-variant` | `#DDE3EA` | Dividers, disabled backgrounds           |
| `--color-on-surface-variant` | `#41484F` | Secondary text, icons                |
| `--color-outline`      | `#727980`   | Borders, dividers                        |
| `--color-outline-variant` | `#C1C7CE` | Subtle borders                           |
| `--color-error`        | `#BA1A1A`   | Error states, destructive actions        |
| `--color-on-error`     | `#FFFFFF`   | Text on error                            |
| `--color-error-container` | `#FFDAD6` | Error backgrounds                       |
| `--color-success`      | `#006D3B`   | Success states, resolved incidents       |
| `--color-warning`      | `#7B5800`   | Warning states, medium severity          |

## CSS Variables (global.css)

```css
@import "tailwindcss";
@import "uniwind";

@layer theme {
  :root {
    --color-primary: #008CCD;
    --color-on-primary: #FFFFFF;
    --color-primary-container: #C8E6FF;
    --color-on-primary-container: #001E31;

    --color-secondary: #4F6070;
    --color-on-secondary: #FFFFFF;
    --color-secondary-container: #D3E4F5;
    --color-on-secondary-container: #0B1D2B;

    --color-tertiary: #645A7C;
    --color-on-tertiary: #FFFFFF;

    --color-background: #F8F9FF;
    --color-on-background: #191C20;

    --color-surface: #F8F9FF;
    --color-on-surface: #191C20;
    --color-surface-variant: #DDE3EA;
    --color-on-surface-variant: #41484F;

    --color-outline: #727980;
    --color-outline-variant: #C1C7CE;

    --color-error: #BA1A1A;
    --color-on-error: #FFFFFF;
    --color-error-container: #FFDAD6;

    --color-success: #006D3B;
    --color-warning: #7B5800;

    --color-card: #FFFFFF;
    --color-card-foreground: #191C20;

    --color-muted: #F1F3F6;
    --color-muted-foreground: #727980;

    --color-input: #DDE3EA;
    --color-ring: #008CCD;
  }
}
```

## Usage in Components

### Tailwind Classes (Uniwind)

```tsx
// Backgrounds
className="bg-background"          // page background
className="bg-surface"             // card/sheet surface
className="bg-primary"             // primary accent
className="bg-primary-container"   // soft primary

// Text
className="text-on-background"     // primary text
className="text-on-surface"        // text on cards
className="text-on-surface-variant" // secondary text
className="text-primary"           // accent text
className="text-error"             // error text

// Borders
className="border-outline"         // default border
className="border-outline-variant" // subtle border

// Cards (M3 style)
className="bg-card rounded-2xl p-4 border border-outline-variant"

// Buttons
className="bg-primary rounded-full px-6 py-3"
className="text-on-primary font-medium"

// Input fields
className="bg-surface border border-outline rounded-xl px-4 py-3"

// Status badges
className="bg-success/15 text-success rounded-full px-3 py-1"
className="bg-error/15 text-error rounded-full px-3 py-1"
className="bg-warning/15 text-warning rounded-full px-3 py-1"
```

## Typography Scale (M3)

| Style            | Class                                     | Usage                    |
| ---------------- | ----------------------------------------- | ------------------------ |
| Display Large    | `text-[57px] font-normal tracking-tight`  | Hero numbers             |
| Headline Large   | `text-[32px] font-normal`                 | Page titles              |
| Headline Medium  | `text-[28px] font-normal`                 | Section headers          |
| Title Large      | `text-[22px] font-normal`                 | Card titles              |
| Title Medium     | `text-base font-medium tracking-wide`     | Subtitles                |
| Title Small      | `text-sm font-medium tracking-wide`       | Small titles             |
| Body Large       | `text-base font-normal`                   | Primary body text        |
| Body Medium      | `text-sm font-normal`                     | Secondary body text      |
| Body Small       | `text-xs font-normal`                     | Captions, timestamps     |
| Label Large      | `text-sm font-medium tracking-wide`       | Button text              |
| Label Medium     | `text-xs font-medium tracking-wider`      | Chips, badges            |
| Label Small      | `text-[11px] font-medium tracking-wider`  | Overlines                |

## Spacing & Radius (M3)

| Token       | Value  | Usage                            |
| ----------- | ------ | -------------------------------- |
| `rounded-sm`  | 4px  | Small elements (chips, badges)   |
| `rounded-md`  | 8px  | Inputs, small cards              |
| `rounded-lg`  | 12px | Medium cards                     |
| `rounded-xl`  | 16px | Large cards, sheets              |
| `rounded-2xl` | 20px | Primary cards                    |
| `rounded-full`| 9999px| Buttons, FABs, avatars          |

## Elevation (Surface Tint)

M3 uses surface tint instead of shadows for elevation. In Uniwind, use opacity-based overlays:

```tsx
// Level 0 — Flat
className="bg-surface"

// Level 1 — Cards
className="bg-card"

// Level 2 — Raised
className="bg-card shadow-sm"

// Level 3 — Modals, sheets
className="bg-card shadow-md"
```

## Icon Usage

Tabler Icons with M3 sizing conventions:

```tsx
import { IconLifebuoy, IconAlertTriangle } from "@tabler/icons-react-native";

// Standard (24dp)
<IconLifebuoy size={24} color="var(--color-on-surface)" />

// Small (20dp)
<IconAlertTriangle size={20} color="var(--color-on-surface-variant)" />

// Large (32dp)
<IconLifebuoy size={32} color="var(--color-primary)" />
```

## Severity Colors

Used for incidents and status indicators:

| Severity   | Background            | Text               | Icon Color           |
| ---------- | --------------------- | ------------------ | -------------------- |
| Low        | `bg-success/15`       | `text-success`     | `text-success`       |
| Medium     | `bg-warning/15`       | `text-warning`     | `text-warning`       |
| High       | `bg-error/15`         | `text-error`       | `text-error`         |
| Critical   | `bg-error`            | `text-on-error`    | `text-on-error`      |

## Tower Status Colors

| Status      | Indicator                                  |
| ----------- | ------------------------------------------ |
| Open        | `bg-success` dot + `text-success` label    |
| Closed      | `bg-error` dot + `text-error` label        |
| Restricted  | `bg-warning` dot + `text-warning` label    |
