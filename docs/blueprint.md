# BeachBook - Project Blueprint

## Overview

BeachBook is a mobile documentation app for lifeguards operating on beaches. It digitizes the daily workflow of managing towers, tracking incidents, coordinating duty plans, and filling out protocols. The app follows a **local-first** architecture using Jazz as the sync engine, ensuring lifeguards can work offline in areas with poor connectivity and have their data sync automatically when back online.

## Target Users

| Role             | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| **Admin**        | Organization-level management. Full CRUD on all entities, user management.  |
| **Guard Leader** | Oversees all towers at a location. Can view/manage multiple towers.         |
| **Tower Leader** | Manages a single tower. Creates and fills out the daily towerbook.          |

## Core Workflow

```
Login → Select Organization → View Towers (by location) → Enter Tower
  → Dashboard (cards + quick actions: tower status, create protocol)
    → Create Towerbook (daily)
      → Fill: Guard/Tower Leader, Watchmen, Duty Plan, Todos, Incidents, Weather
```

1. User logs in (guard leader or tower leader)
2. Sees all towers they are invited to within their organization
3. Guard leader sees all towers at a location; tower leader sees only their assigned tower
4. Inside a tower: dashboard with summary cards and quick actions (tower status toggle, protocol creation)
5. Creates the daily **Towerbook** (one per tower per day)
6. Fills out towerbook sections: leaders, watchmen, duty plan, todos, incidents, weather

## Architecture

### Local-First with Jazz

- **Database**: Jazz (jazz-tools) — local-first relational DB with row-level permissions, real-time sync, and offline support
- **Auth**: Jazz local-first auth with device secret, upgradeable to external JWT auth later
- **Sync**: Jazz Cloud sync server (`https://v2.sync.jazz.tools/`)
- **Permissions**: Row-level policies defined in `permissions.ts`, enforced server-side
- **Schema**: Defined in `schema.ts` using `schema as s` from `jazz-tools`

### Expo / React Native

- **Framework**: Expo (managed workflow)
- **Router**: Expo Router (file-based routing)
- **Styling**: Uniwind (Tailwind CSS for React Native)

### Data Flow

```
Local DB (OPFS/SQLite) ←→ Jazz Sync Server ←→ Other Devices
         ↑
    Offline writes
    queued & synced
```

## Data Model (Schema)

The source of truth for the data model lives in `src/schema.ts`.
Use that file as the canonical schema reference as the project evolves.

## Soft Deletes

All major entities use a `deleted_at` column (`s.string().optional()`). Records are never physically removed — instead `deleted_at` is set to an ISO timestamp. All queries filter by `deleted_at` being null.

## Key Design Decisions

- **Local-first**: Lifeguards often work in areas with unreliable connectivity. Jazz ensures the app works offline and syncs when possible.
- **Soft deletes**: Regulatory/safety context means data should never be permanently lost.
- **Role-based access**: Three distinct roles with cascading permissions. Jazz row-level policies enforce this at the database level.
- **Daily towerbook pattern**: One towerbook per tower per day. All sub-entities (watchmen, duties, todos, incidents) reference the towerbook.
- **SurveyJS for protocols**: Complex form-based protocols (first aid, group registration) are rendered via SurveyJS in a WebView (`use-dom`), with the result stored as JSON.
