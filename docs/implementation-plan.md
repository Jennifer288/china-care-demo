# China Care implementation plan

Goal: An English-first bilingual international patient coordination demo, with public directories, private patient case intake, and a coordinator workspace.
Architecture: Next.js App Router + TypeScript + Tailwind. Server endpoints own identity and file access. Supabase Auth/PostgreSQL/private Storage when configured. Without credentials, a local-only server-memory demo supports synthetic records; no patient data in browser storage. Demo sessions use HttpOnly cookies and expire; demo never claims durable storage or actual delivery.

1. Foundation: package.json, app/layout.tsx, globals.css, lib/content.ts, components/site-shell.tsx; establish responsive navy/ivory palette, editorial typography, bilingual content, descriptive mock hospital/doctor labels.
2. Security tests first: tests/security.test.ts covers invalid uploads, maximum size, forged signatures, cross-user ownership, submission consent and session expiry. Implement lib/security.ts and lib/store.ts.
3. Public experience: app/[[...slug]]/page.tsx and components/public-pages.tsx cover every directory/detail/information route; search/filter, all eight treatment directions, six hospitals and twelve fictional specialists.
4. Authentication and intake: API auth/session/reset, case endpoints, files endpoints; app/dashboard routes via route dispatcher; patient wizard, consent checkpoint, preview/download/delete, review before submit. No PHI in localStorage or logs.
5. Production backend: lib/supabase.ts, supabase/migrations/001_initial.sql, .env.example. RLS owner policies, coordinator app-metadata role, private bucket and scoped object keys, submission RPC records versioned consent atomically.
6. Coordinator/contact: admin-only case list, detail, notes and service status; inquiry endpoint validates input; demo clearly distinguishes simulated delivery.
7. Verification: unit tests, typecheck, production build; start at localhost:3100, HTTP flow test two accounts, auth/admin denial, upload/read/delete/consent; browser desktop/mobile QA. Document Supabase setup and verified/unverified limits in README.md.

Brand: “ChinaCare / International Patient Services”; spacious white/navy, light-blue backgrounds, restrained sage accents, photography as illustrative imagery. No outcome guarantees, fabricated activity metrics or partnership claims. Travel arranged by patients; no visa agency services.
