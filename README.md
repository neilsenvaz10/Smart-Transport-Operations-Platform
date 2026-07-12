# TransitOps – Smart Transport Operations Platform

A monorepo containing the frontend and backend for TransitOps.

## Project Structure

```
transitops/
├── frontend/          # Vite + React + TypeScript
├── backend/           # Node.js + Express + TypeScript
└── package.json       # Monorepo root
```

## Prerequisites

- Node.js >= 18
- npm >= 9
- A [Supabase](https://supabase.com) project (PostgreSQL + Auth)

## Getting Started

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <repo-url>
   cd transitops
   npm install
   ```

2. **Configure environment variables:**
   - Copy `frontend/.env.example` → `frontend/.env` and fill in your values.
   - Copy `backend/.env.example` → `backend/.env` and fill in your values.

3. **Run the development servers:**
   ```bash
   # Run both frontend and backend concurrently
   npm run dev

   # Or individually
   npm run dev:frontend   # http://localhost:5173
   npm run dev:backend    # http://localhost:3001
   ```

4. **Verify setup:**
   - Frontend: http://localhost:5173
   - Backend health: http://localhost:3001/health

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite, React, TypeScript, Tailwind CSS |
| State / Data | TanStack Query, React Hook Form, Zod |
| Routing | React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Database ORM | Prisma |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Linting | ESLint, Prettier |