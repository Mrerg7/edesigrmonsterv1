interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = 'edesigr.monster';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

function toCanonicalUrl(requestUrl: URL): URL {
  let pathname = requestUrl.pathname;

  if (pathname === '/index.html') {
    pathname = '/';
  }

  const canonical = new URL(pathname + requestUrl.search, CANONICAL_ORIGIN);

  if (!canonical.pathname.includes('.') && !canonical.pathname.endsWith('/')) {
    canonical.pathname += '/';
  }

  return canonical;
}

function shouldRedirect(requestUrl: URL, canonical: URL): boolean {
  if (requestUrl.hostname !== CANONICAL_HOST) return true;
  if (requestUrl.protocol !== 'https:') return true;
  if (requestUrl.pathname === '/index.html') return true;

  return (
    requestUrl.pathname !== canonical.pathname ||
    requestUrl.search !== canonical.search
  );
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Free-plan serverless function: validated inquiry intake (no KV/paid bindings).
// Stores nothing server-side; returns a mailto fallback so the static form
// degrades gracefully. Wire to email/Slack/Discord via a webhook env if added later.
async function handleInquire(request: Request): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  const name = String(body.name ?? '').trim().slice(0, 120);
  const email = String(body.email ?? '').trim().slice(0, 160);
  const kind =
    body.kind === 'offer' ? 'offer' : body.kind === 'agent' ? 'agent' : 'buy';
  const message = String(body.message ?? '').trim().slice(0, 2000);
  const offerRaw = body.offer;
  const offer =
    offerRaw === undefined || offerRaw === null || offerRaw === ''
      ? null
      : Number(offerRaw);

  if (!name) return json({ ok: false, error: 'Name is required.' }, 400);
  if (!isValidEmail(email))
    return json({ ok: false, error: 'Valid email is required.' }, 400);
  if (kind === 'offer') {
    if (offer === null || !Number.isFinite(offer) || offer < 1000) {
      return json(
        { ok: false, error: 'Offer must be a number of at least $1,000 USD.' },
        400,
      );
    }
  }
  if (!message) return json({ ok: false, error: 'Message is required.' }, 400);

  const subject = encodeURIComponent(
    `eDesigr.monster ${kind === 'offer' ? `Offer $${offer}` : kind === 'agent' ? 'Agent inquiry' : 'Buy inquiry'} — ${name}`,
  );
  const mailBody = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nType: ${kind}\n${offer !== null ? `Offer: $${offer} USD\n` : ''}Message:\n${message}`,
  );
  const mailto = `mailto:sales@desertrich.com?subject=${subject}&body=${mailBody}`;

  return json({ ok: true, kind, mailto });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url);

    // Serverless API (Cloudflare Workers free plan — no extra services needed)
    if (requestUrl.pathname === '/api/inquire' && request.method === 'POST') {
      return handleInquire(request);
    }
    if (requestUrl.pathname === '/api/views' && request.method === 'GET') {
      // Stateless view signal; client adds local variance for urgency display.
      return json({ ok: true, base: 42 });
    }
    if (requestUrl.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'Not found.' }, 404);
    }

    const canonical = toCanonicalUrl(requestUrl);

    if (shouldRedirect(requestUrl, canonical)) {
      return Response.redirect(canonical.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
