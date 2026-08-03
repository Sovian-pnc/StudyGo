const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
};

function normalizePath(pathname) {
  if (pathname === "/") return "/index.html";
  if (pathname.endsWith("/")) return `${pathname}index.html`;
  if (!pathname.includes(".")) return `${pathname}.html`;
  return pathname;
}

function contentType(pathname) {
  const ext = pathname.match(/\.[^.]+$/)?.[0]?.toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

async function assetResponse(request, env, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  const response = await env.ASSETS.fetch(new Request(url, request));
  if (response.status === 404) return null;

  const headers = new Headers(response.headers);
  headers.set("content-type", contentType(pathname));
  headers.set("x-content-type-options", "nosniff");

  if (pathname.startsWith("/assets/images/")) {
    headers.set("cache-control", "public, max-age=31536000, immutable");
  }

  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);
    const response = await assetResponse(request, env, pathname);
    if (response) return response;

    return (
      (await assetResponse(request, env, "/index.html")) ||
      new Response("StudyGo page not found", { status: 404 })
    );
  },
};
