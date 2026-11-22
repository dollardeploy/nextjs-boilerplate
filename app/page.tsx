import type { ReactNode } from "react";
import { connection } from "next/server";
import { PixelLaunch } from "./pixel-launch";

const DEPLOY_URL = "https://dollardeploy.com/r/nextjs-boilerplate";
const DOCS_URL = "https://docs.dollardeploy.com";

// lucide icons (lucide.dev), inlined so the starter needs no icon package.
const ICONS = {
  GitBranch: (
    <>
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </>
  ),
  ShieldCheck: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  Clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  Activity: (
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
  ),
} satisfies Record<string, ReactNode>;

const FEATURES = [
  ["GitBranch", "Deploys from GitHub", "Every push to main builds and ships on your server."],
  ["ShieldCheck", "HTTPS", "Certificates issued and renewed for every domain."],
  ["Clock", "Cron", "Scheduled calls to /api/cron, with run history and logs."],
  ["Activity", "Monitoring and logs", "Host metrics, app logs and backups, built in."],
] as const;

const STEPS = [
  ["01", "git push origin main"],
  ["02", "npm ci && npm run build"],
  ["03", "live at https://app.example.com"],
] as const;

function Logo() {
  return (
    <svg viewBox="0 0 123 122" className="size-4" fill="currentColor" aria-hidden>
      <path d="M24.68.2h97.55v97.55L97.98 73.49V24.45H48.93z" />
      <path d="M48.93 24.45 97.98 73.5V122L.43 24.45z" />
    </svg>
  );
}

// Rendered on every request by your own Node.js process.
async function ServerFacts() {
  await connection();
  const rows = [
    ["runtime", `node ${process.version}`],
    ["platform", `${process.platform}/${process.arch}`],
    ["uptime", `${Math.floor(process.uptime())}s`],
    ["memory", `${Math.round(process.memoryUsage().rss / 1048576)} MB`],
    ["rendered", `${new Date().toISOString().slice(11, 19)} UTC`],
  ];
  return (
    <dl className="grid grid-cols-[6rem_1fr] gap-y-2 font-mono text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col overflow-x-clip px-5 sm:px-10">
      <header className="flex h-16 items-center justify-between">
        <a href={DEPLOY_URL} className="flex items-center gap-2 font-medium tracking-tight">
          <Logo />
          DollarDeploy
        </a>
        <a href={DOCS_URL} className="font-mono text-sm text-muted hover:text-foreground">
          docs
        </a>
      </header>

      <main className="flex-1">
        <section className="grid items-center gap-8 py-16 md:min-h-[calc(100svh-4rem)] md:grid-cols-[minmax(0,1.15fr)_1fr] md:py-0">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Next.js 16 boilerplate
            </p>
            <h1 className="mt-6 text-[clamp(36px,5vw,64px)] leading-[0.98]">
              <span className="block font-medium tracking-[-0.06em] md:whitespace-nowrap">Your app. Your server.</span>
              <span className="block font-dither text-[1.45em] leading-[0.85] tracking-[-0.015em]">
                Zero DevOps.
              </span>
            </h1>
            <p className="mt-8 max-w-[42ch] text-lg leading-[1.35] text-secondary">
              Ship this starter from GitHub to a server you own, with HTTPS, cron and
              redeploys on every push.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={DEPLOY_URL}
                className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
              >
                Deploy this template
              </a>
              <a
                href={DOCS_URL}
                className="rounded-full border border-border px-6 py-3 font-medium transition-colors hover:border-muted"
              >
                Read the docs
              </a>
            </div>
          </div>
          <div className="-mx-5 sm:-mx-10 md:mx-0">
            <PixelLaunch />
          </div>
        </section>

        <section className="grid gap-12 border-t border-border py-16 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.04em]">From push to production.</h2>
            <ol className="mt-6 space-y-3 font-mono text-sm">
              {STEPS.map(([n, line]) => (
                <li key={n} className="flex gap-4">
                  <span className="text-muted">{n}</span>
                  {line}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.04em]">Rendered on your server.</h2>
            <p className="mt-2 text-secondary">This request, just now. Refresh to see it change.</p>
            <div className="mt-6">
              <ServerFacts />
            </div>
          </div>
        </section>

        <section className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, title, body]) => (
            <div key={title} className="border-b border-border py-10 sm:pr-8 lg:border-b-0">
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {ICONS[icon]}
              </svg>
              <h3 className="mt-5 font-medium">{title}</h3>
              <p className="mt-1 text-sm leading-[1.45] text-muted">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-border py-8 font-mono text-xs text-muted">
        <span>edit app/page.tsx to start</span>
        <a href={DEPLOY_URL} className="hover:text-foreground">
          dollardeploy.com
        </a>
      </footer>
    </div>
  );
}
