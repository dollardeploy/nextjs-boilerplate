<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Guide — Next.js Boilerplate

A minimal **Next.js 16 (App Router)** starter that gets cloned for new apps, so every
pattern here gets copied. Keep it small, consistent and exemplary.

## Stack

| Concern   | Tool                                              |
| --------- | ------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), `@/*` → `./*` |
| Language  | TypeScript 5, strict mode                         |
| UI        | React 19 + Tailwind CSS v4 (`app/globals.css`)    |
| Lint      | oxlint (`.oxlintrc.json`)                         |

There is no test runner, formatter or pre-commit hook yet. Don't assume one exists.

## Commands

```bash
npm run dev     # dev server (Turbopack), outputs to .next/dev
npm run lint    # oxlint — there is no ESLint and `next lint` no longer exists
npm run build   # production build, includes the TypeScript check
npm run start   # serve the production build
```

Before reporting done, run `npm run lint` and `npm run build`. Both must pass.

## Project structure

```
app/        # routes: layout.tsx, page.tsx, route.ts, loading.tsx, error.tsx, globals.css
public/     # static assets served from /
```

Colocate components, types and helpers next to the route that uses them. Move them to a
shared top-level folder (`components/`, `lib/`) only once a second route needs them.

## Next.js 16 conventions

- **Server Components by default.** Add `"use client"` only to the leaf components that
  need state, effects, event handlers or browser APIs.
- **`params` and `searchParams` are Promises.** Type them as `Promise<...>` and `await`
  them in pages, layouts, `generateMetadata` and route handlers.
- **`middleware.ts` is deprecated; use `proxy.ts`**, which exports a `proxy` function and
  runs on the Node.js runtime.
- **`use cache` needs `cacheComponents: true`** in `next.config.ts`, which isn't enabled
  here. Turn it on deliberately before using `use cache`, `cacheLife` or `cacheTag`.
- **Cache invalidation:** call `revalidateTag(tag, "max")`, because the one-argument form
  is deprecated. Use `updateTag(tag)` for read-your-own-writes, but only inside Server
  Actions.
- **Mutations:** prefer Server Actions for forms and in-app mutations. Use route handlers
  (`route.ts`) for endpoints that external clients call.
- **The React Compiler is not enabled** (it needs `babel-plugin-react-compiler`). Don't
  remove existing `useMemo` or `useCallback` on the assumption that it is.
- Use `next/image` for images (with `width`/`height` or `fill`, plus `alt`), `next/font`
  in the root layout, and the Metadata API (`metadata` / `generateMetadata`) for SEO.
- Add `loading.tsx` / `<Suspense>` for streaming and `error.tsx` / `not-found.tsx` for
  error boundaries, at the route segment they apply to.

## Rules

1. **No `any`**, no dead code, no stray `console.log`.
2. **Validate external input** at every boundary (forms, route handlers, env vars).
3. **Secrets never reach the client.** Never put private values in `NEXT_PUBLIC_` vars.
   Keep real values in `.env.local` only.
4. **Use Tailwind with the theme tokens** from `globals.css` (`bg-background`,
   `text-foreground`) rather than hard-coded colors, and support dark mode.
5. **Small diffs.** Make the smallest correct change and don't refactor around the task.
6. **Conventional Commits:** `feat: ...`, `fix(scope): ...`, `chore(deps): ...`.
