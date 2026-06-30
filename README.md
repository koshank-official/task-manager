# AgencyOS Task & Project Management

AgencyOS is a production-oriented SaaS workspace for digital marketing and performance marketing agencies. It includes a premium responsive dashboard, project portfolio, kanban and table task views, team management, approvals, automation templates, time tracking, reporting charts, integrations, and authentication surfaces for email, Google, invites, and password recovery flows.

## Technology

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Tailwind CSS 4
- Chart.js with React bindings
- Lucide React icons
- Netlify Functions
- Netlify Database with Drizzle ORM

## Data Model

The database schema lives in `db/schema.ts` and is deployed through migrations in `netlify/database/migrations`. It models companies, users, roles, invites, clients, workflow templates, projects, project members, milestones, tasks, assignees, followers, dependencies, comments, approvals, time entries, attendance, leave, files, notifications, chat, calendar events, audit logs, and login history.

Row-level security is enabled in the migration layer with company and user scoped policies that can be activated by setting `app.current_company_id` and `app.current_user_id` in server-side database sessions.

## API

The Netlify Function at `netlify/functions/workspace.ts` exposes `/api/workspace` for dashboard reads, task creation and updates, project creation, and demo workspace seeding.

## Run Locally

Install dependencies, then run the development server:

```bash
npm install
npm run dev
```

For Netlify feature emulation, use:

```bash
netlify dev --port 8889
```

## Demo Accounts

The app includes non-secret demo account labels for UI and seed data:

- `super.admin@agencyos.demo`
- `manager@agencyos.demo`
- `client@agencyos.demo`
