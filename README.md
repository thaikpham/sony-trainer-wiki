# 🚀 Sony Training Wiki - AI Agent Master Guide

Welcome! This document is a comprehensive map of the **Sony Training Wiki** project, designed specifically for AI Agents (like Cursor, Gemini, or custom agents) to understand the codebase instantly and generate parts of it with high accuracy.

**Định hướng dài hạn**: Xem [ROADMAP.md](ROADMAP.md) cho tầm nhìn, stack, khuyến nghị và roadmap theo giai đoạn.

---

## 🏗️ Project Overview
The **Sony Training Wiki** is a high-performance web application designed for product training, technical specification lookup, and AI-driven recommendations for Sony products. It features real-time analytics, a product database, and an AI RAG (Retrieval-Augmented Generation) system.

---

## 🛠️ Tech Stack
- **Framework**: `Next.js 16+` (App Router)
- **Language**: `JavaScript` (current); **target: TypeScript** (migrate gradually `.js`/`.jsx` → `.ts`/`.tsx`)
- **Authentication**: `Clerk` (Next.js integration)
- **Database**: **Supabase** (primary). Note: Firebase still exists in legacy/MCP; plan is to unify on Supabase (including MCP on refactor).
- **Vector Search**: `Pinecone` (MCP, RAG)
- **AI Models**: **Google Gemini API** (`@google/generative-ai`) – Server Actions + MCP
- **Personal AI / Automation**: **OpenClaw** ([openclaw.ai](https://openclaw.ai/)) – integration via MCP (see OpenClaw section below).
- **UI & Styling**:
  - `TailwindCSS 4`, `Lucide-React` (Icons), `Reactflow` (Visual diagrams), `Recharts` (Analytics), `Framer Motion` (animations)
  - **Design system**: Reference template **Rayo** in `REFERENCES` (see Design system section).

---

## 🦞 OpenClaw Integration
[OpenClaw](https://openclaw.ai/) is a personal AI assistant that runs on the user’s machine and can connect to **MCP servers** (tools, resources, prompts). This project ships a **Sony Ecosystem MCP Server** (`packages/mcp-server`) that exposes product specs, ColorLab recipes, camera comparison, and wiki RAG. OpenClaw can attach this MCP server so users can query Sony Wiki (specs, ColorLab, RAG) from WhatsApp, Telegram, Discord, etc.

**How to connect**
- Run the MCP server (e.g. `cd packages/mcp-server && npm run build && npm start`). It exposes an SSE endpoint, e.g. `http://<host>:8080/sse`.
- In OpenClaw, add this MCP server via the plugins/MCP configuration (e.g. in `openclaw.json`). See [OpenClaw MCP guide](https://openclawlaunch.com/guides/openclaw-mcp) for exact steps.
- Optional: later you can publish a custom OpenClaw skill (ClawHub) that calls the Sony Wiki API/MCP.

---

## 🎨 Design System & REFERENCES
The main design reference is the **Rayo** template (ThemeForest) at:

**`REFERENCES/themeforest-rayo-template/rayo`**

Use it as the **primary design language** (layout, typography, colors, component patterns). Do not copy the template repo into `src`; use it as a **reference** and source to port/adapt components.

**Conventions (for AI and developers)**
- **Layout & navigation**: When building or refactoring the app shell (sidebar, header, footer), reference `components/layout/ClientLayout.tsx`, `components/headers/`, `components/footers/` in the Rayo template.
- **UI components**: Use Rayo components (e.g. `common/` – Cta, Counter, Testimonials; `other-pages/contact/ContactForm`; `animation/` – AnimatedButton, Parallax, RevealText) as reference; **re-implement in this project with Tailwind** so the codebase stays on one styling system.
- **Typography & theme**: Pull color variables, fonts, and spacing from Rayo’s `public/css/` and mirror them in `globals.css` / Tailwind theme (keep Sony palette + Rayo feel).
- **Page structure**: For new Wiki, Academy, or Dashboard pages, use Rayo’s About, Services, Contact, FAQ, Pricing structure and layout as reference.

---

## 📂 Directory Structure

```text
/
├── src/
│   ├── app/                # Next.js App Router (Routes & API)
│   │   ├── actions/        # Server Actions (e.g. gemini-ai)
│   │   ├── api/            # Backend API Handlers
│   │   ├── academy/        # Academy & learning flows
│   │   ├── dashboard/      # Admin & Analytics Dashboards
│   │   ├── livestream/     # Livestream setup & studio tools
│   │   ├── wiki/           # Product knowledge base & ColorLab
│   │   └── layout.js       # Global wrap (Providers, etc)
│   ├── components/         # React Components (Atomic & Complex)
│   │   ├── admin/          # Admin-only UI tools
│   │   ├── livestream/     # Studio diagram, sections, preview
│   │   ├── wiki/           # Wiki shell, ColorLab sections
│   │   ├── SpecModal.jsx   # Detailed spec viewer
│   │   └── Layout.jsx      # App shell & navigation
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Shared utilities & config
│   │   ├── supabaseClient.ts  # Supabase client & data helpers
│   │   ├── roles.js        # User role & permission logic
│   │   └── mcp.js          # MCP Server wrappers
│   ├── services/           # Data layer (db.js re-exports Supabase)
│   └── scripts/            # Data migration & seeding
├── packages/
│   └── mcp-server/         # Sony Ecosystem MCP (TypeScript, SSE)
├── REFERENCES/
│   └── themeforest-rayo-template/rayo   # Design reference (Rayo)
├── public/                 # Static assets (Images, Fonts)
└── package.json
```

---

## 🧩 Key Modules & Features

### 1. Product Knowledge Base (`/src/app/wiki`)
- **Product Database**: Searchable and filterable Sony product lists.
- **ColorLab**: Technical guides for Creative Looks, LUTs, and Picture Profiles.
- **Specs System**: Dynamic specs fetching via `/api/specs`.

### 2. AI & Recommendation (`/src/app/api/...`, `src/app/actions/`)
- **Chat API**: AI-driven conversations.
- **Gemini Server Actions**: e.g. timeline generation, Studio bot chat (`src/app/actions/gemini-ai.js`).
- **Recommend / Insight APIs**: Product matching, trend extraction.
- **MCP Server** (`packages/mcp-server`): Tools for specs, color recipes, camera comparison, wiki RAG.

### 3. Livestream & Academy
- **Livestream**: Studio diagram, camera/lighting/equipment/content sections, live config (Supabase). Quy trình vận hành chuẩn (SOP) cho training và vận hành phòng live: [LIVESTREAM-SOP.md](LIVESTREAM-SOP.md). Mục Chuẩn bị thiết bị dùng cho kiểm soát tài sản, chống trộm cắp và trách nhiệm khi hư hỏng.
- **Academy**: Learning flows and admin (see `src/app/academy`, `src/app/admin`).

### 4. Analytics & Badges (`/src/app/dashboard`)
- **Real-time Analytics**: User actions and popular products.
- **Badge System**: Gamified progression based on interaction depth.

---

## 📜 Development Guidelines for AI Agents

When generating code for this project, follow these rules:

1. **Use App Router**: Always use `src/app` for new routes. Prefer Server Components by default; use `'use client'` only when needed for hooks/interactivity.
2. **Language**: Prefer **TypeScript** for new files (`.ts`/`.tsx`). Existing JS can be migrated gradually.
3. **State Management**: Use React Hooks (`useState`, `useContext`) or custom hooks in `src/hooks`.
4. **Styling**: Use **TailwindCSS 4**. When adding new UI, reference the Rayo template in `REFERENCES/themeforest-rayo-template/rayo` and implement with Tailwind so the app stays consistent (Premium Sony aesthetics + Rayo-inspired layout/patterns).
5. **Data**: Prefer **Supabase** via `src/services/db.js` (re-exports from `src/lib/supabaseClient.ts`). Use `unstable_cache` for expensive AI/Pinecone lookups where appropriate. Client-side fetching for real-time analytics.
6. **Role-Based Access**: Check user roles via `src/lib/roles.js` before exposing sensitive UI or API.
7. **Icons**: Use `lucide-react`.
8. **Modals/UI**: Align with existing patterns in `src/components/Layout.jsx` and `src/components/SpecModal.jsx`; for new patterns, use Rayo as reference and Tailwind for implementation.

---

## 🚀 How to Run
```bash
npm install
npm run dev
```

**Environment**: Copy `.env.example` to `.env.local` and fill values. Required: **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), **Pinecone**, **Gemini** (`GEMINI_API_KEY`), **Clerk**. Legacy Firebase keys may be needed until full migration (see ROADMAP).

**OpenClaw**: Run `npm run mcp` (builds and starts the MCP server) or `cd packages/mcp-server && npm run build && npm start`, then add the SSE URL to your OpenClaw MCP config.
