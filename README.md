# TransitOps – Smart Transport Operations Platform

Welcome to the development repository for **TransitOps**, a Smart Transport Operations Platform built to streamline logistics, fleets, trip dispatches, and driver management.

This project is structured as a **monorepo** using npm workspaces.

---

## 📁 Project Structure

```
TransitOps/
├── frontend/             # Vite + React + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── app/          # Dashboard application pages, UI primitives, and components
│   │   ├── lib/          # Global client singletons (e.g., Supabase client)
│   │   ├── styles/       # Tailwind CSS v4 configuration, theme, and fonts
│   │   ├── App.tsx       # Root App router & TanStack Query wrapper
│   │   └── main.tsx      # DOM Entrypoint
│   ├── .env.example      # Template for frontend environment variables
│   ├── eslint.config.js  # ESLint configuration
│   └── vite.config.ts    # Vite bundler configuration (with proxy and path alias settings)
│
├── backend/              # Node.js + Express + TypeScript + Prisma ORM
│   ├── src/
│   │   ├── modules/      # Core API feature modules (Auth, Vehicles, Drivers, Trips, Reports, etc.)
│   │   ├── middleware/   # Authentication, RBAC, and error handlers
│   │   ├── prisma/
│   │   │   └── schema.prisma # Prisma Schema for PostgreSQL
│   │   ├── lib/          # DB connections and Supabase Admin helper singletons
│   │   └── index.ts      # Express application entrypoint
│   ├── .env.example      # Template for backend environment variables
│   ├── eslint.config.js  # ESLint configuration
│   └── tsconfig.json     # Backend TypeScript compiler settings
│
├── package.json          # Root Monorepo configuration (npm workspaces setup)
└── README.md             # Project documentation (this file)
```

---

## 🚀 Getting Started

From the root directory:

### Step 1: Install Monorepo Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Start Development Servers
* **Backend Dev Server** (starts on port `5000`):
  ```bash
  npm run dev:backend
  ```
* **Frontend Dev Server** (starts on port `5173`):
  ```bash
  npm run dev:frontend
  ```

  ##
