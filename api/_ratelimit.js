/* Rate limiting for the hoc-hsk leaderboard API (FIX 4).
   Shared state lives in Upstash Redis (REST), NOT in process memory:
   Vercel serverless runs many function instances, so an in-memory
   counter would only count the requests that happen to land on one
   instance and would never trip under a real flood.

   Stack: @upstash/ratelimit (sliding window) over @upstash/redis.
   Credentials come ONLY from Vercel env vars:
     UPSTASH_REDIS_REST_URL
     UPSTASH_REDIS_REST_TOKEN
   Nothing secret is hardcoded here or in any file.

   Limits (per client IP, sliding window, 1 minute):
     score       60/min   normal play submits a few score calls per minute
     join        10/min   creates or claims an identity, stricter on purpose
     rename      10/min   renames an identity, stricter on purpose
     me          120/min  cheap profile read
     leaderboard 120/min  edge-cached anyway (s-maxage=10), belt and braces
     global      300/min  shared cap across all five endpoints above

   Keying: one Ratelimit instance per endpoint, each with its own
   prefix (rl:score, rl:join, ...), and limit() is called with the
   client IP. The effective Redis key is therefore prefix + IP, so a
   noisy score spammer cannot burn anyone else's join budget, and one
   IP's score budget is separate from another IP's.

   Client IP: first entry of the x-forwarded-for header, trimmed,
   falling back to the socket address, then 'unknown'. NOTE on trust:
   a client can send its own X-Forwarded-For value, and Vercel
   appends the real client IP at the END of the header, so first-entry
   keying is spoofable by a determined attacker who rotates the first
   entry. It still stops casual floods and shared-NAT accidents, which
   is what this fix targets. If first-entry spoofing becomes a real
   attack, switch getClientIp() to the last entry (or x-real-ip)
   instead; that is a one-line change here and needs no wiring change.

   FAIL-OPEN DECISION: when Upstash is unconfigured (env vars missing)
   or unreachable (store throws, free-tier quota exhausted, outage),
   checkLimit() returns allowed:true and logs a warning, and the
   request proceeds. Why fail-open instead of fail-closed:
     - Scoring is the site's core feature. Fail-closed would turn a
       missing env var, an Upstash outage, or a free-tier cap into a
       full outage of score/join/rename for every legit player.
     - The other fixes already bound the damage an unthrottled
       request can do: points are computed server-side from raw
       results, eventId is idempotent, and daily caps apply. Without
       the limiter the site degrades to its pre-fix abuse surface,
       not to unbounded damage.
     - The failure is visible: a console.warn lands in the Vercel
       function logs on every such incident (unconfigured warns once
       per cold start), so a missing env var is noticed, not silent.
   The tradeoff is real: an attacker who can break the store bypasses
   the limit. That is accepted for this small hobby leaderboard; a
   site where the limiter is a security boundary (not a flood brake)
   should fail closed instead.

   Cost: each request costs 2 Upstash commands (one global check, one
   per-endpoint check). At a few hundred API calls a day that is well
   under 1,000 commands/day, about 30K/month, roughly 6% of the free
   tier's 500K commands/month. See the report for the full numbers.

   This module does NOT wire itself into the endpoints. See the wiring
   instructions in the fix report (wave 2 applies them to score.js,
   join.js, rename.js, me.js and leaderboard.js). */
'use strict';

const LIMITS = {
  global: { max: 300, window: '1 m' },
  score: { max: 60, window: '1 m' },
  join: { max: 10, window: '1 m' },
  rename: { max: 10, window: '1 m' },
  me: { max: 120, window: '1 m' },
  leaderboard: { max: 120, window: '1 m' }
};

/* Injectable seams for tests (plain node, no Upstash account).
   Production never touches these; require() of the Upstash packages
   only happens inside getLimiters(), after the env check passes. */
let RatelimitClass = null;
let RedisClass = null;
let depsInjected = false;
let limitersCache = null;
let limitersBuilt = false;
let warnedUnconfigured = false;

function getDeps() {
  if (!RatelimitClass) RatelimitClass = require('@upstash/ratelimit').Ratelimit;
  if (!RedisClass) RedisClass = require('@upstash/redis').Redis;
  return { Ratelimit: RatelimitClass, Redis: RedisClass };
}

function buildLimiters() {
  const { Ratelimit, Redis } = getDeps();
  const redis = Redis.fromEnv();
  const mk = (name) => new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(LIMITS[name].max, LIMITS[name].window),
    prefix: 'rl:' + name,
    analytics: false
  });
  const out = {};
  for (const name of Object.keys(LIMITS)) out[name] = mk(name);
  return out;
}

function getLimiters() {
  if (limitersBuilt) return limitersCache;
  limitersBuilt = true;
  if (!depsInjected && (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.warn('[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set, rate limiting disabled (fail-open).');
    }
    limitersCache = null;
    return null;
  }
  limitersCache = buildLimiters();
  return limitersCache;
}

function getClientIp(req) {
  const headers = (req && req.headers) || {};
  const xff = headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff.length) return String(xff[0]).split(',')[0].trim();
  const sock = req && req.socket && req.socket.remoteAddress;
  if (sock) return String(sock);
  return 'unknown';
}

function retryAfterSeconds(reset) {
  if (!reset) return 60;
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}

/* Pure check: returns a result object, never touches res.
   Throws only for an unknown endpoint name (a wiring bug, fail
   loudly in dev rather than silently passing traffic). */
async function checkLimit(req, endpoint) {
  if (!LIMITS[endpoint]) throw new Error('unknown rate limit endpoint: ' + endpoint);
  const limiters = getLimiters();
  if (!limiters) return { allowed: true, reason: 'unconfigured' };
  const ip = getClientIp(req);
  try {
    const g = await limiters.global.limit(ip);
    if (!g.success) {
      return { allowed: false, scope: 'global', limit: g.limit, remaining: 0, reset: g.reset, retryAfter: retryAfterSeconds(g.reset) };
    }
    if (endpoint === 'global') {
      return { allowed: true, scope: 'global', limit: g.limit, remaining: g.remaining, reset: g.reset };
    }
    const r = await limiters[endpoint].limit(ip);
    if (!r.success) {
      return { allowed: false, scope: endpoint, limit: r.limit, remaining: 0, reset: r.reset, retryAfter: retryAfterSeconds(r.reset) };
    }
    return { allowed: true, scope: endpoint, limit: r.limit, remaining: r.remaining, reset: r.reset };
  } catch (e) {
    /* Fail-open: store unreachable, quota exhausted, or Upstash down.
       Log it so Vercel logs show the incident; let the request through. */
    console.warn('[ratelimit] store error, failing open:', e && e.message);
    return { allowed: true, reason: 'store_error' };
  }
}

/* Handler guard: call at the top of an endpoint handler, before any
   validation or DB work. Returns true when the request may proceed.
   Returns false after sending HTTP 429 with a JSON error and a
   Retry-After header (seconds). Same response shape as _supabase.send. */
async function checkRateLimit(req, res, endpoint) {
  const result = await checkLimit(req, endpoint);
  if (result.allowed) return true;
  const retryAfter = result.retryAfter || 60;
  res.status(429);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Retry-After', String(retryAfter));
  res.json({ error: 'rate_limited', retryAfter: retryAfter });
  return false;
}

/* Test-only seams. _injectForTest({ limiters }) installs prebuilt
   limiter objects (same .limit() interface as @upstash/ratelimit);
   _injectForTest({ Ratelimit, Redis }) swaps the classes used by
   buildLimiters(). _resetForTest() restores production behavior. */
function _injectForTest(overrides) {
  overrides = overrides || {};
  if (overrides.limiters) {
    limitersCache = overrides.limiters;
    limitersBuilt = true;
    return;
  }
  if (overrides.Ratelimit) { RatelimitClass = overrides.Ratelimit; depsInjected = true; }
  if (overrides.Redis) { RedisClass = overrides.Redis; depsInjected = true; }
  limitersBuilt = false;
  limitersCache = null;
}

function _resetForTest() {
  RatelimitClass = null;
  RedisClass = null;
  depsInjected = false;
  limitersCache = null;
  limitersBuilt = false;
  warnedUnconfigured = false;
}

module.exports = { LIMITS, getClientIp, checkLimit, checkRateLimit, _injectForTest, _resetForTest };
