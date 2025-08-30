## Cursor Rules: SSR-first and Authentication

These rules guide how we build components and fetch authentication state across the app.

### SSR-first Rendering Policy

- Prefer Server Components by default. Only use `'use client'` for interactivity that requires client APIs (state, effects, refs, event handlers, browser-only libraries).
- Never place `'use client'` in route-level layouts or top-level groups; isolate interactivity into leaf client islands.
- Keep client islands small and focused. Compose them into Server Components instead of marking whole trees client-side.
- When in doubt, start as a Server Component and lift only the minimal interactive piece into a client island.

### Server-side Authentication (Better Auth)

- Fetch the user/session server-side using helpers in `lib/auth-server.ts`:
  - `getServerSession()` → returns the current session or `null`.
  - `getCurrentUser()` → returns the current user or `null`.
- Use these helpers in Server Components, Route Handlers, and Actions to render authenticated state without client roundtrips.
- For auth-related interactivity (e.g., sign-out), use a tiny client island such as `components/SignOutButton.tsx`.

### Implementation Notes

- The home route (`app/[locale]/page.tsx`) is a Server Component that reads auth via `getCurrentUser()` and translations via `next-intl/server`.
- `components/AuthHeader.tsx` is a Server Component that renders client islands (`ThemeToggle`, `LanguageToggle`, `SignOutButton`).
- `app/[locale]/login` and `app/[locale]/register` are client pages (forms, navigation) – acceptable exceptions.

### Enforcement

- Run `pnpm check:ssr` to scan for unexpected `'use client'` directives. Allowed client islands are:
  - `ThemeToggle.tsx`
  - `LanguageToggle.tsx`
  - `SignOutButton.tsx`
  - `lib/auth-hooks.ts` (for legacy/client-only areas)

### Rationale

- SSR-first improves performance, SEO, and security by keeping sensitive operations (auth) on the server and reducing client JS.


