# Modern Rhythm Battle

> Multiplayer browser-based rhythm battle game built with a modern TypeScript monorepo architecture.

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Monorepo**: Bun Workspaces
- **Frontend (`apps/web`)**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend (`apps/server`)**: Bun, ElysiaJS, CORS
- **Database & ORM**: MySQL, Drizzle ORM
- **Shared Contracts (`packages/shared`)**: TypeScript types, Zod schemas, game configs
- **Game Data (`packages/game-data`)**: Songs, charts, characters metadata

---

## Project Structure

```text
modern-rhythm-battle/
├── apps/
│   ├── web/                     # React + Vite + Tailwind CSS frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── game/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   ├── utils/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server/                  # ElysiaJS + Bun backend
│       ├── src/
│       │   ├── config/
│       │   ├── modules/
│       │   ├── database/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── utils/
│       │   └── index.ts
│       ├── drizzle.config.ts
│       └── package.json
├── packages/
│   ├── shared/                  # Common types, errors, Zod validation, game constants
│   │   ├── src/
│   │   └── package.json
│   └── game-data/               # Characters, songs, and chart files
│       ├── characters/
│       ├── songs/
│       ├── charts/
│       └── package.json
├── docs/                        # Project documentation
├── scripts/                     # Helper & automation scripts
├── tests/                       # Global tests
├── .env.example                 # Environment template
├── .gitignore
├── package.json                 # Monorepo root configuration
├── bun.lock                     # Bun dependency lockfile
└── README.md
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= v1.1.0 installed
- [Laragon](https://laragon.org/) or MySQL running on port 3306

### 1. Installation

Clone repository and install dependencies from the root directory:

```bash
git clone https://github.com/wniagatama-gif/Rhythmbattle.git
cd Rhythmbattle
bun install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default environment variables:
```env
# Frontend Configuration
VITE_API_URL=http://localhost:3001

# Backend Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database Configuration (MySQL via Laragon)
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=modern_rhythm_battle
DATABASE_USER=root
DATABASE_PASSWORD=
```

---

## Available Scripts

Run from the root repository:

| Script | Description |
| --- | --- |
| `bun run dev` | Runs both frontend and backend concurrently |
| `bun run dev:web` | Runs frontend development server (`http://localhost:5173`) |
| `bun run dev:server` | Runs backend development server (`http://localhost:3001`) |
| `bun run build` | Builds both backend and frontend applications |
| `bun run typecheck` | Runs TypeScript type checking across all workspaces |
| `bun run db:test` | Tests MySQL database connectivity |

---

## API Health Check Endpoint

- **Endpoint**: `GET http://localhost:3001/api/health`
- **Response**:
```json
{
  "success": true,
  "message": "Modern Rhythm Battle API is running",
  "service": "server",
  "timestamp": "2026-11-11T09:49:50.360Z"
}
```

---

## Current Roadmap

- [x] **Phase 1: Project Foundation** (Issue 001)
  - Monorepo architecture with Bun Workspaces
  - React + Vite + TypeScript frontend with local Tailwind CSS
  - Bun + ElysiaJS backend with health endpoint and CORS
  - Shared package for types, Zod schemas, and game config
  - MySQL + Drizzle ORM integration setup
- [ ] **Phase 2: Rhythm Engine** (Chart parser, audio synchronizer, input listener, hit judgements)
- [ ] **Phase 3: Battle Mechanics** (HP, combo, damage multiplier, player gauge)
- [ ] **Phase 4: Multiplayer Networking** (WebSocket synchronization, matchmaking)
