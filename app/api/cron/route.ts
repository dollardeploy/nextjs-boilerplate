import { timingSafeEqual } from "node:crypto";

// Called by DollarDeploy cron jobs: https://docs.dollardeploy.com/cron/
// DollarDeploy generates CRON_SECRET on the first HTTP cron job; redeploy once to load it.
// Runs are capped at 60s, so queue long work and return quickly.

function authorized(request: Request, secret: string) {
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("Internal server error", { status: 500 });
  }
  if (!authorized(request, secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ... do the scheduled work here ...

  return Response.json({
    ok: true,
    cronId: request.headers.get("x-dollardeploy-cron-id"),
    ranAt: new Date().toISOString(),
  });
}

export const GET = handle;
export const POST = handle;
