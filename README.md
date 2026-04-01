# CRM Calendar — Desktop-First Monorepo

> CRM para gestión de citas de centro de estética. Desktop app con Tauri v2 + Angular, arquitectura DDD, monorepo Turborepo con Bun.

## Architecture

```
Angular App → HTTP (JSON-RPC 2.0) → Bun Sidecar (Hono)
                                        ↓
                                    Drizzle + SQLite
                                        ↓
                                    Google Calendar API (Phase 2)
```

## Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| **Runtime**  | Bun 1.3+                                                |
| **Monorepo** | Turborepo                                               |
| **Frontend** | Angular 21 (standalone, signals)                        |
| **Desktop**  | Tauri v2                                                |
| **Backend**  | Bun + Hono (sidecar)                                    |
| **Database** | Drizzle ORM + SQLite                                    |
| **UI**       | PrimeNG 19 + Tailwind CSS v4                            |
| **Calendar** | FullCalendar 6 (free)                                   |
| **Testing**  | Vitest (Angular) + Bun test (domain) + Playwright (e2e) |

## Project Structure (DDD)

```
crm-calendar/
├── apps/
│   ├── desktop-tauri/          # Angular + Tauri desktop app
│   └── mobile-ionic/           # Phase 2 placeholder
├── packages/
│   ├── domain/                 # Entities, VOs, Events, Repository interfaces
│   ├── application/            # Use cases, Services, Ports
│   ├── infrastructure/         # Drizzle repos, Hono sidecar, Adapters
│   ├── shared-utils/           # Pure TS utilities
│   └── shared-ui/              # Angular component library (TBD)
└── tooling/
    ├── typescript-config/      # Shared TS configs
    ├── eslint-config/          # Shared ESLint configs
    └── tailwind-config/        # Shared Tailwind preset
```

## DDD Layer Dependencies

```
domain → (none)
application → domain
infrastructure → domain + application
shared-ui → domain (read-only)
apps → all packages
```

## Quick Start

```bash
# Install all dependencies
bun install

# Start dev server (Angular on :4200, Sidecar on :3001)
bun run dev

# Run all tests
bun run test

# Type check
bun run typecheck

# Lint
bun run lint

# Format all files
bun run format
```

## Development

### Start the sidecar independently

```bash
cd packages/infrastructure
bun run dev
```

### Start Angular dev server

```bash
cd apps/desktop-tauri
bun run dev
```

### Run domain tests

```bash
cd packages/domain
bun test
```

### Database migrations

```bash
cd packages/infrastructure
bun run db:generate   # Generate migration from schema changes
bun run db:migrate    # Apply migrations
bun run db:studio     # Open Drizzle Studio
```

## Phase Roadmap

### Phase 1 (MVP — Desktop) ← Current

- [x] Architecture setup (DDD + monorepo)
- [ ] CRUD citas con FullCalendar
- [ ] CRUD clientes
- [ ] Google Calendar sync (OAuth)
- [ ] SQLite local + export/import JSON

### Phase 2 (Mobile + Notificaciones)

- [ ] App Ionic con mismo domain/application
- [ ] Sync manual desktop ↔ mobile
- [ ] WhatsApp Twilio integration
- [ ] Email templates

### Phase 3 (Scale)

- [ ] Multi-tenant
- [ ] Analytics dashboard
- [ ] Online booking (web para clientes)
