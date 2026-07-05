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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url);
    const canonical = toCanonicalUrl(requestUrl);

    if (shouldRedirect(requestUrl, canonical)) {
      return Response.redirect(canonical.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
