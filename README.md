# 🏏 Helsingborg United Sports Club

> Weekend leisure cricket for everyone in Helsingborg, Sweden.

A full-stack web application for the **Helsingborg United Sports Club** — managing member registrations, training schedules, club announcements, board information, and a photo gallery. Built with React, TypeScript, and Supabase.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Application Routes](#application-routes)
- [Authentication & Authorization](#authentication--authorization)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React SPA (Vite)                       │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Pages  │  │Components│  │  Hooks   │  │   Lib    │  │  │
│  │  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │  │
│  │       │             │             │              │        │  │
│  │       └─────────────┴──────┬──────┴──────────────┘        │  │
│  │                            │                              │  │
│  │  ┌─────────────────────────┴───────────────────────────┐  │  │
│  │  │              State & Data Layer                     │  │  │
│  │  │  React Query ◄──► Supabase JS Client ◄──► AuthCtx  │  │  │
│  │  └─────────────────────────┬───────────────────────────┘  │  │
│  └────────────────────────────┼──────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────┘
                                │ HTTPS (REST + Realtime)
┌───────────────────────────────┼─────────────────────────────────┐
│                        Supabase Cloud                           │
│  ┌────────────────┐  ┌───────┴────────┐  ┌──────────────────┐  │
│  │  Auth Service  │  │  PostgreSQL DB │  │  Storage (S3)    │  │
│  │  (email/pass)  │  │  (public schema)│  │  (gallery imgs)  │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │  Row-Level     │  │  DB Functions  │                        │
│  │  Security (RLS)│  │  (has_role)    │                        │
│  └────────────────┘  └────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Vite + React SPA** | Fast HMR, optimized builds, great DX for a content-driven club website |
| **Supabase BaaS** | Zero backend code — auth, database, storage, and RLS out of the box |
| **shadcn/ui + Tailwind** | Accessible, themeable component primitives with utility-first styling |
| **React Query** | Declarative server-state caching and synchronization |
| **React Router v6** | Nested, layout-based routing with a shared `Layout` shell |
| **Zod** | Runtime form validation on both login and admin forms |
| **TypeScript (strict-ish)** | Type-safe Supabase client via auto-generated `Database` types |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev) + [TypeScript 5](https://www.typescriptlang.org) |
| **Build Tool** | [Vite 5](https://vitejs.dev) (SWC plugin) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com) + CSS Variables (HSL) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Radix primitives) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Routing** | [React Router DOM 6](https://reactrouter.com) |
| **Server State** | [TanStack React Query 5](https://tanstack.com/query) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Backend** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, RLS) |
| **Charts** | [Recharts](https://recharts.org) |
| **Testing** | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + jsdom |
| **Fonts** | Oswald (display) + Source Sans 3 (body) |
| **Package Manager** | Bun / npm |

---

## Project Structure

```
helsingborgusc/
├── public/                     # Static assets served as-is
│   └── robots.txt
├── src/
│   ├── main.tsx                # App entry point — renders <App />
│   ├── App.tsx                 # Root component — providers + routes
│   ├── index.css               # Tailwind directives + CSS custom properties
│   ├── assets/                 # Static images (hero, gallery fallbacks)
│   ├── components/
│   │   ├── Layout.tsx          # Shared shell: Navbar → <Outlet /> → Footer
│   │   ├── Navbar.tsx          # Responsive nav with admin dropdown
│   │   ├── Footer.tsx          # Site-wide footer with contact info
│   │   ├── NavLink.tsx         # Reusable navigation link
│   │   ├── PageHeader.tsx      # Reusable page title/subtitle banner
│   │   └── ui/                 # ~50 shadcn/ui primitives (button, card, dialog…)
│   ├── hooks/
│   │   ├── useAuth.tsx         # AuthContext — session, user, isAdmin, sign-in/out
│   │   ├── use-mobile.tsx      # Viewport breakpoint hook
│   │   └── use-toast.ts        # Toast notification hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client singleton
│   │       └── types.ts        # Auto-generated Database type definitions
│   ├── lib/
│   │   └── utils.ts            # cn() — clsx + tailwind-merge helper
│   ├── pages/
│   │   ├── Index.tsx           # Landing page — hero, features, latest news
│   │   ├── Registration.tsx    # Public membership registration form
│   │   ├── Members.tsx         # Public member directory
│   │   ├── Board.tsx           # Board members listing
│   │   ├── Schedule.tsx        # Weekly training + upcoming events
│   │   ├── Gallery.tsx         # Photo gallery (Supabase Storage + fallbacks)
│   │   ├── Auth.tsx            # Login / Sign-up with membership verification
│   │   ├── Privacy.tsx         # Privacy policy page
│   │   ├── AdminAnnouncements.tsx  # CRUD for club news (admin-only)
│   │   ├── AdminMembers.tsx    # Manage member approvals (admin-only)
│   │   ├── AdminBoard.tsx      # Manage board members (admin-only)
│   │   ├── AdminSchedule.tsx   # Manage schedule entries (admin-only)
│   │   ├── AdminGallery.tsx    # Upload/manage gallery images (admin-only)
│   │   └── NotFound.tsx        # 404 page
│   └── test/
│       ├── setup.ts            # Vitest global setup
│       └── example.test.ts     # Example test
├── supabase/
│   ├── config.toml             # Supabase project configuration
│   └── migrations/             # SQL migration files (schema versioned)
├── tailwind.config.ts          # Theme: colors, fonts, animations
├── vite.config.ts              # Vite: SWC, path aliases, dev server @ :8080
├── vitest.config.ts            # Vitest: jsdom, path aliases, globals
├── tsconfig.json               # TypeScript: `@/` path alias → `./src/*`
├── components.json             # shadcn/ui configuration
└── package.json                # Dependencies & scripts
```

---

## Data Model

The Supabase PostgreSQL database uses the following tables:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   announcements  │     │     members       │     │  board_members   │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id          (PK) │     │ id          (PK) │     │ id          (PK) │
│ title             │     │ first_name       │     │ name             │
│ summary           │     │ last_name        │     │ role             │
│ tag               │     │ email            │     │ bio              │
│ published_at      │     │ phone            │     │ email            │
│ created_by   (FK)│     │ date_of_birth    │     │ sort_order       │
│ created_at       │     │ experience_level │     │ created_at       │
│ updated_at       │     │ message          │     │ updated_at       │
└──────────────────┘     │ status           │     └──────────────────┘
                         │ registered_at    │
                         └──────────────────┘
┌──────────────────┐     ┌──────────────────┐
│ schedule_entries │     │  gallery_images  │
├──────────────────┤     ├──────────────────┤
│ id          (PK) │     │ id          (PK) │
│ day              │     │ alt              │
│ time             │     │ storage_path     │
│ type             │     │ sort_order       │
│ location         │     │ uploaded_by (FK) │
│ category         │     │ created_at       │
│ event_date       │     └──────────────────┘
│ sort_order       │
│ created_at       │     ┌──────────────────┐
│ updated_at       │     │   user_roles     │
└──────────────────┘     ├──────────────────┤
                         │ id          (PK) │
                         │ user_id     (FK) │
                         │ role (enum)      │
                         │  → admin         │
                         │  → moderator     │
                         │  → user          │
                         └──────────────────┘
```

### Roles Enum

| Role | Description |
|---|---|
| `admin` | Full CRUD access to all admin pages |
| `moderator` | Reserved for future moderation features |
| `user` | Default role for authenticated members |

---

## Application Routes

### Public Routes

| Path | Page | Description |
|---|---|---|
| `/` | Index | Landing page with hero, features, and latest announcements |
| `/registration` | Registration | Membership application form (inserts into `members`) |
| `/members` | Members | Directory of all registered members |
| `/board` | Board | Board of directors listing |
| `/schedule` | Schedule | Weekly training sessions & upcoming events |
| `/gallery` | Gallery | Photo gallery with Supabase Storage images |
| `/auth` | Auth | Login / Sign-up (membership-gated) |
| `/privacy` | Privacy | Privacy policy page |

### Admin Routes (requires `admin` role)

| Path | Page | Description |
|---|---|---|
| `/admin/announcements` | AdminAnnouncements | Create, edit, delete club news |
| `/admin/members` | AdminMembers | Approve/manage member applications |
| `/admin/board` | AdminBoard | Manage board member profiles |
| `/admin/schedule` | AdminSchedule | Manage training schedule & events |
| `/admin/gallery` | AdminGallery | Upload & manage gallery images |

---

## Authentication & Authorization

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  User visits │────►│  /auth page  │────►│ Supabase Auth │
│   /auth      │     │  Login form  │     │ (email/pass)  │
└─────────────┘     └──────┬───────┘     └───────┬───────┘
                           │                     │
                    ┌──────▼───────┐     ┌───────▼───────┐
                    │  Check member │◄───│ Session token  │
                    │  table status │     │ returned       │
                    └──────┬───────┘     └───────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ approved │ │ pending  │ │ not found│
        │  → enter │ │  → deny  │ │  → deny  │
        └──────────┘ └──────────┘ └──────────┘
```

**Flow:**
1. Users first **register** via `/registration` (public form → `members` table with `status = "pending"`).
2. An **admin approves** the membership via `/admin/members`.
3. Only **approved members** can log in at `/auth`.
4. The `useAuth` hook provides `user`, `session`, `isAdmin`, and auth methods via React Context.
5. Admin pages check `isAdmin` on mount and redirect unauthenticated/unauthorized users to `/auth`.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- **Bun** (optional, used as package manager — npm works too)
- A **Supabase** project (for database, auth, and storage)

### Installation

```sh
# Clone the repository
git clone https://github.com/subhadeep-bose/helsingborgusc.git
cd helsingborgusc

# Install dependencies
bun install    # or: npm install

# Start the development server (http://localhost:8080)
bun run dev    # or: npm run dev
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `bun run dev` | Start Vite dev server with HMR on port 8080 |
| **Build** | `bun run build` | Production build to `dist/` |
| **Build (dev)** | `bun run build:dev` | Development-mode build |
| **Preview** | `bun run preview` | Locally preview the production build |
| **Lint** | `bun run lint` | Run ESLint across the project |
| **Test** | `bun run test` | Run Vitest test suite once |
| **Test (watch)** | `bun run test:watch` | Run Vitest in watch mode |

---

## Environment Variables

Create a `.env` file in the project root (or set in your hosting provider):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public API key |

> ⚠️ Never commit your `.env` file. The Supabase anon key is safe for client-side use but should be paired with proper Row-Level Security policies.

---

## Deployment

### Lovable (Primary)

This project was bootstrapped with [Lovable](https://lovable.dev). To deploy:

1. Open the project in Lovable.
2. Click **Share → Publish**.
3. Optionally connect a custom domain via **Project → Settings → Domains**.

### Other Platforms

Since this is a standard Vite SPA, it can be deployed to any static hosting:

- **Vercel**: `vercel --prod`
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`
- **Cloudflare Pages**: Connect repo, build command `npm run build`, output `dist`

> For SPA routing to work, configure a catch-all redirect: all paths → `index.html` (200).

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Make your changes and commit: `git commit -m "feat: add my feature"`.
4. Push and open a Pull Request.

Please follow [Conventional Commits](https://www.conventionalcommits.org) for commit messages.

---

## License

© 2026 Helsingborg United Sports Club. All rights reserved.
