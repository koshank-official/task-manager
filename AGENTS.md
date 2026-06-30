# AgencyOS Architecture Notes

This project is a TanStack Start React application for a digital marketing agency task and project management SaaS.

## Key Directories

- `src/routes/index.tsx`: Main product UI, including the responsive shell, dashboard widgets, kanban/table task views, charts, modals, auth surface, and team/project panels.
- `src/routes/__root.tsx`: Root document and page metadata.
- `src/styles.css`: Tailwind import plus global typography, selection, and entry animation styles.
- `db/schema.ts`: Drizzle schema for Netlify Database.
- `db/index.ts`: Netlify Database Drizzle client.
- `netlify/functions/workspace.ts`: Server-side API route for workspace reads, project/task CRUD, and demo seed data.
- `netlify/database/migrations`: SQL migrations generated for Netlify Database deployment.

## Conventions

- Use TypeScript and component-based React patterns.
- Keep UI components dense, operational, and dashboard-oriented. This is a SaaS tool for repeated work, not a marketing landing page.
- Use Tailwind utility classes and preserve the 8px card/control radius used throughout the interface.
- Use Lucide icons for controls and action affordances.
- Store persistent data in Netlify Database through Drizzle. Do not introduce external databases or local JSON persistence.
- Schema changes require updating `db/schema.ts` and generating or adding a migration under `netlify/database/migrations`.

## Security Model

The schema includes role enums for super admin, admin, project manager, team leader, employee, and client. Row-level security migrations use application-scoped Postgres settings (`app.current_company_id` and `app.current_user_id`) so server-side auth can constrain reads and writes by tenant and user.

## Non-Obvious Decisions

The authentication UI is present as a production-ready surface, while real identity provider wiring is intentionally isolated for a later pass. The project uses Netlify Database rather than Supabase or Firebase because this Netlify environment requires persistent application data to use Netlify platform primitives.
