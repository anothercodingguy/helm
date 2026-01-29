# Moltbot SaaS Chat Application

A production-ready AI chat application wrapping a self-hosted Moltbot instance.

## Architecture

- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, SQLite (Mock/Dev), JWT Auth
- **Integration**: Proxies requests to internal Moltbot service (`http://localhost:7000`)

## Prerequisites

- Node.js v18+
- npm

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:5001`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`.

### 3. Usage

1. Open `http://localhost:3000`.
2. Click **Sign In** (uses mock credentials).
3. Start chatting.
   - If Moltbot is running at `http://localhost:7000`, it will reply.
   - If not, a mock fallback response will be shown.

## Features

- **Authentication**: JWT-based mock auth.
- **Rate Limiting**: 10 requests/hour per user.
- **Optimistic UI**: Instant message updates.
- **Dark Mode**: Premium default theme.
