# 🏏 Helsingborg United Sports Club

> Leisure cricket for everyone in Helsingborg, Sweden — weekends year-round, plus weekday sessions in the summer.

A full-stack web application for the **Helsingborg United Sports Club** — managing member registrations, training schedules, club announcements, board information, photo gallery, contact forms, and club statutes. Built with React, TypeScript, and Supabase.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Application Routes](#application-routes)
- [Authentication & Authorization](#authentication--authorization)
- [Testing](#testing)
- [CI/CD](#cicd)
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
| **TypeScript (strict)** | Type-safe Supabase client via auto-generated `Database` types |
| **ErrorBoundary** | Graceful crash recovery at the app root |
| **Cloudflare Turnstile** | Bot protection on the Contact form |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev) + [TypeScript 5](https://www.typescriptlang.org) |
| **Build Tool** | [Vite 5](https://vitejs.dev) (SWC plugin) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com) + CSS Variables (HSL) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Radix primitives) — 17 components |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Routing** | [React Router DOM 6](https://reactrouter.com) |
| **Server State** | [TanStack React Query 5](https://tanstack.com/query) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Backend** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, RLS) |
| **SEO** | [react-helmet-async](https://github.com/staylor/react-helmet-async) — per-page meta, OG tags, canonical URLs |
| **CAPTCHA** | [react-turnstile](https://github.com/marsidev/react-turnstile) (Cloudflare Turnstile) |
| **Testing** | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + jsdom |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) — lint, typecheck, test, build |
| **Fonts** | Oswald (display) + Source Sans 3 (body) |
| **Package Manager** | npm |

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
│   │   ├── AdminLayout.tsx     # Shared admin page shell (title, accent, loading)
│   │   ├── ErrorBoundary.tsx   # React error boundary with fallback UI
│   │   ├── Layout.tsx          # Public shell: Navbar → <Outlet /> → Footer
│   │   ├── Navbar.tsx          # Responsive nav with admin dropdown
│   │   ├── Footer.tsx          # Site-wide footer with contact info & social links
│   │   ├── PageHeader.tsx      # Reusable page title/subtitle banner
│   │   ├── ProtectedRoute.tsx  # Auth guard — redirects to /auth if not admin
│   │   ├── SEO.tsx             # Per-page <Helmet> for title, meta, OG, canonical
│   │   └── ui/                 # 17 shadcn/ui primitives (button, card, dialog…)
│   ├── hooks/
│   │   ├── useAuth.tsx         # AuthContext — session, user, isAdmin, sign-in/out
│   │   └── use-toast.ts        # Toast notification hook (Radix)
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client singleton (with env validation)
│   │       └── types.ts        # Auto-generated Database type definitions
│   ├── lib/
│   │   └── utils.ts            # cn() — clsx + tailwind-merge helper
│   ├── pages/
│   │   ├── Index.tsx           # Landing — hero, features, latest announcements
│   │   ├── Registration.tsx    # Public membership form (consent to Statutes + Privacy)
│   │   ├── Members.tsx         # Public member directory (approved only)
│   │   ├── Board.tsx           # Board of directors listing
│   │   ├── Schedule.tsx        # Weekly training + upcoming events
│   │   ├── Gallery.tsx         # Photo gallery (Supabase Storage + fallbacks)
│   │   ├── Contact.tsx         # Contact form (Supabase + Turnstile CAPTCHA)
│   │   ├── Statutes.tsx        # Full club statutes (9 sections)
│   │   ├── Auth.tsx            # Login / Sign-up with membership verification
│   │   ├── Privacy.tsx         # Privacy policy (9 sections)
│   │   ├── AdminAnnouncements.tsx  # CRUD for club news (admin-only)
│   │   ├── AdminMembers.tsx    # Manage member approvals (admin-only)
│   │   ├── AdminBoard.tsx      # Manage board members (admin-only)
│   │   ├── AdminSchedule.tsx   # Manage schedule entries (admin-only)
│   │   ├── AdminGallery.tsx    # Upload/manage gallery images (admin-only)
│   │   └── NotFound.tsx        # 404 page (within Layout shell)
│   └── test/
│       ├── setup.ts                # Vitest global setup (jsdom + testing-library)
│       ├── AdminLayout.test.tsx    # AdminLayout component tests (4)
│       ├── ErrorBoundary.test.tsx  # Error boundary tests (4)
│       ├── PageHeader.test.tsx     # PageHeader tests (3)
│       ├── ProtectedRoute.test.tsx # Auth guard tests (3)
│       └── envValidation.test.ts   # Env variable validation tests (3)
├── supabase/
│   ├── config.toml             # Supabase project configuration
│   └── migrations/             # SQL migration files (schema versioned)
├── .env.example                # Required environment variables template
├── .github/
│   └── workflows/
│       └── ci.yml              # CI pipeline: lint → typecheck → test → build
├── tailwind.config.ts          # Theme: colors, fonts, animations
├── vite.config.ts              # Vite: SWC, path aliases, dev server @ :8080
├── vitest.config.ts            # Vitest: jsdom, path aliases, globals
├── tsconfig.json               # TypeScript: `@/` path alias → `./src/*`
├── components.json             # shadcn/ui configuration
├── E2E_TEST_LOG.md             # End-to-end test results & audit log
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
│ tag               │     │ email            │     │ sort_order       │
│ published_at      │     │ phone            │     │ created_at       │
│ created_by   (FK)│     │ date_of_birth    │     │ updated_at       │
│ created_at       │     │ experience_level │     └──────────────────┘
│ updated_at       │     │ message          │
└──────────────────┘     │ status           │     ┌──────────────────┐
                         │ registered_at    │     │ contact_messages │
                         └──────────────────┘     ├──────────────────┤
                                                  │ id          (PK) │
┌──────────────────┐     ┌──────────────────┐     │ name             │
│ schedule_entries │     │  gallery_images  │     │ email            │
├──────────────────┤     ├──────────────────┤     │ subject          │
│ id          (PK) │     │ id          (PK) │     │ message          │
│ day              │     │ alt              │     │ created_at       │
│ time             │     │ storage_path     │     └──────────────────┘
│ type             │     │ sort_order       │
│ location         │     │ uploaded_by (FK) │     ┌──────────────────┐
│ category         │     │ created_at       │     │   user_roles     │
│ event_date       │     └──────────────────┘     ├──────────────────┤
│ sort_order       │                              │ id          (PK) │
│ created_at       │                              │ user_id     (FK) │
│ updated_at       │                              │ role (enum)      │
└──────────────────┘                              │  → admin         │
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
| `/registration` | Registration | Membership application form (consent to Statutes + Privacy) |
| `/members` | Members | Directory of approved members |
| `/board` | Board | Board of directors listing |
| `/schedule` | Schedule | Weekly training sessions & upcoming events |
| `/gallery` | Gallery | Photo gallery with Supabase Storage images |
| `/contact` | Contact | Contact form with Cloudflare Turnstile CAPTCHA |
| `/statutes` | Statutes | Full club statutes (9 sections) |
| `/auth` | Auth | Login / Sign-up (membership-gated) |
| `/privacy` | Privacy | Privacy policy |
| `*` | NotFound | 404 page (within Layout shell) |

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
5. Admin pages are wrapped in `<ProtectedRoute requireAdmin>` which redirects unauthorized users to `/auth`.
6. A **password reset** flow is available from the login page.

---

## Testing

The project uses **Vitest** with **Testing Library** and **jsdom** for unit and component tests.

| Test File | Tests | Description |
|---|---|---|
| `AdminLayout.test.tsx` | 4 | Loading state, renders children, accent text, header action |
| `ErrorBoundary.test.tsx` | 4 | Renders children, catches errors, shows fallback UI, recovery button |
| `PageHeader.test.tsx` | 3 | Renders title, subtitle, handles missing subtitle |
| `ProtectedRoute.test.tsx` | 3 | Loading spinner, redirect when unauthenticated, renders children |
| `envValidation.test.ts` | 3 | Valid env passes, missing URL detected, missing key detected |

**Total: 5 files · 17 tests**

```sh
# Run once
npm test

# Watch mode
npm run test:watch
```

---

## CI/CD

GitHub Actions runs on every push to `main` and on pull requests:

```
Lint → Typecheck → Test → Build
```

- **Workflow:** `.github/workflows/ci.yml`
- **Runner:** `ubuntu-latest`, Node 20
- **Concurrency:** Cancels in-progress runs for the same branch

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- A **Supabase** project (for database, auth, and storage)
- A **Cloudflare Turnstile** site key (for the Contact form CAPTCHA)

### Installation

```sh
# Clone the repository
git clone https://github.com/subhadeep-bose/helsingborgusc.git
cd helsingborgusc

# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env

# Start the development server (http://localhost:8080)
npm run dev
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `npm run dev` | Start Vite dev server with HMR on port 8080 |
| **Build** | `npm run build` | Production build to `dist/` |
| **Build (dev)** | `npm run build:dev` | Development-mode build |
| **Preview** | `npm run preview` | Locally preview the production build |
| **Lint** | `npm run lint` | Run ESLint across the project |
| **Test** | `npm test` | Run Vitest test suite once |
| **Test (watch)** | `npm run test:watch` | Run Vitest in watch mode |

---

## Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public API key |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile CAPTCHA site key (for registration & Contact form) |
| `VITE_CRICAPI_KEY` | *(Optional)* CricAPI key for live India cricket scores — [get one free](https://cricapi.com) |

> ⚠️ Never commit your `.env` file. The Supabase anon key is safe for client-side use but should be paired with proper Row-Level Security policies.

---

## Deployment

### Static Hosting

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

© 2025 Helsingborg United Sports Club. All rights reserved.
