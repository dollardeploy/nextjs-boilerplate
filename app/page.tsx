import { connection } from "next/server";
import { PixelLaunch } from "./pixel-launch";

const DEPLOY_URL = "https://dollardeploy.com/r/nextjs-boilerplate";
const DOCS_URL = "https://docs.dollardeploy.com";

const FEATURES = [
  ["Push to deploy", "Every git push builds and ships. Rollbacks are one click."],
  ["Your own server", "Hetzner, DigitalOcean or any VPS. You keep the box and the data."],
  ["HTTPS by default", "Certificates are issued and renewed for every domain you attach."],
  ["Cron jobs", "Hit /api/cron on a schedule with a bearer secret. Run history included."],
  ["Backups & monitoring", "Scheduled backups, live metrics and host inspection built in."],
  ["Works with Claude", "Deploy and debug from Claude Code with the DollarDeploy MCP."],
] as const;

const TERMINAL = [
  ["$", "ddc deploy"],
  ["›", "cloning github.com/you/nextjs-boilerplate"],
  ["›", "npm ci && npm run build"],
  ["›", "starting systemd service · node 24"],
  ["›", "issuing certificate for app.example.com"],
  ["✓", "live at https://app.example.com in 48s"],
] as const;

function Logo() {
  return (
    <svg viewBox="0 0 128 128" className="size-5" fill="currentColor" aria-hidden>
      <path d="M21.6 15.5h90v87.3L89.2 81.1V37.2H44z" />
      <path d="M44 37.2 89.2 81.1v43.4L-.7 37.2z" />
    </svg>
  );
}

// Rendered on every request, on your server. Proof the app runs on real infra.
async function ServerPanel() {
  await connection();
  const mem = process.memoryUsage().rss / 1024 / 1024;
  const rows = [
    ["runtime", `node ${process.version}`],
    ["platform", `${process.platform} / ${process.arch}`],
    ["uptime", `${Math.floor(process.uptime())}s`],
    ["memory", `${mem.toFixed(0)} MB rss`],
    ["rendered", new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="truncate">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between py-6">
        <a href={DEPLOY_URL} className="flex items-center gap-2 font-medium">
          <Logo />
          DollarDeploy
        </a>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <a href={DOCS_URL} className="hover:text-foreground">
            Docs
          </a>
          <a
            href={DEPLOY_URL}
            className="rounded-full bg-foreground px-4 py-1.5 text-background transition-opacity hover:opacity-85"
          >
            Deploy
          </a>
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-20 pb-20 pt-10 sm:pt-16">
        <section className="flex flex-col items-start gap-6">
          <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-live" />
            Next.js 16 · live on your own server
          </span>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Your app. Your server. <em className="text-muted">Zero DevOps.</em>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            A tiny Next.js starter that ships straight from GitHub to a VPS you own, with
            HTTPS, cron jobs and redeploys on every push. Edit{" "}
            <code className="font-mono text-sm text-foreground">app/page.tsx</code> to make it
            yours.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={DEPLOY_URL}
              className="flex h-11 items-center gap-2 rounded-full bg-foreground px-5 font-medium text-background transition-opacity hover:opacity-85"
            >
              <Logo />
              Deploy this template
            </a>
            <a
              href={DOCS_URL}
              className="flex h-11 items-center rounded-full border border-border px-5 font-medium transition-colors hover:bg-surface"
            >
              Read the docs
            </a>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-xs text-muted">
            <span>~/launchpad</span>
            <span>click to launch</span>
          </div>
          <PixelLaunch />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-foreground p-5 font-mono text-sm text-background">
            {TERMINAL.map(([sign, line]) => (
              <p key={line} className="flex gap-3 py-0.5">
                <span className="opacity-50">{sign}</span>
                {line}
              </p>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border p-5">
            <div>
              <h2 className="font-serif text-3xl">This page was just rendered.</h2>
              <p className="mt-1 text-sm text-muted">
                By your Node.js process, on your hardware. Refresh to see it change.
              </p>
            </div>
            <ServerPanel />
          </div>
        </section>

        <section className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([title, body]) => (
            <div key={title} className="bg-background p-6">
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-border py-6 font-mono text-xs text-muted">
        <span>Next.js 16 · React 19 · Tailwind v4</span>
        <span>
          Plans from $4/mo ·{" "}
          <a href={DEPLOY_URL} className="text-foreground hover:underline">
            dollardeploy.com
          </a>
        </span>
      </footer>
    </div>
  );
}
