# 🚀 Sony Training Wiki - AI Agent Master Guide

Welcome! This document is a comprehensive map of the **Sony Training Wiki** project, designed specifically for AI Agents (like Cursor, Gemini, or custom agents) to understand the codebase instantly and generate parts of it with high accuracy.

---

## 🏗️ Project Overview
The **Sony Training Wiki** is a high-performance web application designed for product training, technical specification lookup, and AI-driven recommendations for Sony products. It features real-time analytics, a product database, and an AI RAG (Retrieval-Augmented Generation) system.

---

## 🛠️ Tech Stack
- **Framework**: `Next.js 15+` (App Router)
- **Language**: `Javascript` (ESM)
- **Authentication**: `Clerk` (Next.js integration)
- **Database**: `Firebase Firestore`
- **Vector Search**: `Pinecone`
- **AI Models**: `Google Gemini` (`@google/generative-ai`)
- **UI & Styling**: 
  - `TailwindCSS 4`
  - `Lucide-React` (Icons)
  - `Reactflow` (Visual diagrams)
  - `Recharts` (Analytics charts)
  - `Framer Motion` (Recommended for animations)
- **Integrations**: `MCP` (Model Context Protocol) for agentic tool use.

---

## 📂 Directory Structure

```text
/
├── src/
│   ├── app/                # Next.js App Router (Routes & API)
│   │   ├── api/            # Backend API Handlers
│   │   ├── dashboard/      # Admin & Analytics Dashboards
│   │   ├── wiki/           # Product knowledge base & ColorLab
│   │   └── layout.js       # Global wrap (Providers, etc)
│   ├── components/         # React Components (Atomic & Complex)
│   │   ├── admin/          # Admin-only UI tools
│   │   ├── SpecModal.jsx   # Detailed spec viewer
│   │   └── LiveStream.jsx  # Interactive stream diagram
│   ├── hooks/              # Custom React Hooks (State & Effects)
│   ├── lib/                # Shared utilities & configurations
│   │   ├── firebase.js     # Firestore Client Initialization
│   │   ├── roles.js        # User role & Permission logic
│   │   └── mcp.js          # MCP Server wrappers
│   └── scripts/            # Data migration & seeding tools
├── public/                 # Static assets (Images, Fonts)
├── parseCSV.js             # Root-level data processing script
└── package.json            # Dependencies & Scripts
```

---

## 🧩 Key Modules & Features

### 1. Product Knowledge Base (`/src/app/wiki`)
- **Product Database**: Searchable and filterable Sony product lists.
- **ColorLab**: Technical guides for Creative Looks, LUTs, and Picture Profiles.
- **Specs System**: Dynamic specs fetching via `/api/specs`.

### 2. AI & Recommendation (`/src/app/api/...`)
- **Chat API**: Handles AI-driven conversations.
- **Recommend API**: Logic for product matching and comparisons.
- **Insight API**: Extracts trends from user interactions.
- **MCP Server**: Integration layer for advanced agentic operations.

### 3. Analytics & Badges (`/src/app/dashboard`)
- **Real-time Analytics**: Tracks user actions and popular products.
- **Badge System**: Gamified user progression based on interaction depth.

---

## 📜 Development Guidelines for AI Agents

When generating code for this project, follow these rules:

1. **Use App Router**: Always use `src/app` for new routes. Prefer Server Components by default, use `'use client'` only when necessary for hooks/interactivity.
2. **State Management**: Use React Hooks (`useState`, `useContext`) or custom hooks in `src/hooks`.
3. **Styling**: Use **Vanilla TailwindCSS 4**. Avoid ad-hoc CSS unless strictly necessary. Follow the existing color palette (Premium Sony aesthetics).
4. **Data Fetching**: 
   - Prefer Firestore via `src/lib/firebase.js`.
   - Use `unstable_cache` for expensive AI/Pinecone lookups where appropriate.
   - Use Client-side fetching for real-time analytics.
5. **Role-Based Access**: Always check user roles via `src/lib/roles.js` before exposing sensitive UI or API functionality.
6. **Icons**: Use `lucide-react`.
7. **Modals/UI**: Use the existing design system found in `src/components/Layout.jsx` and `src/components/SpecModal.jsx`.

---

## 🚀 How to Run
```bash
npm install
npm run dev
```

Check `.env.local` for required keys (Firebase, Pinecone, Gemini, Clerk).
