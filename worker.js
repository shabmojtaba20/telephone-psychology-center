export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // Always serve the professional admin shell without browser/edge caching.
    // This prevents an older HTML shell from hiding newly injected navigation fixes.
    if (path === "/admin-professional.html") {
      const response = await env.ASSETS.fetch(new Request(new URL("/admin-professional.html", url), request));
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    // Canonical education dashboard aliases.
    // All public forms resolve to the same real HTML asset.
    if (
      path === "/education-dashboard" ||
      path === "/education-dashboard.html" ||
      path === "/education-dashboard/index.html"
    ) {
      const target = new URL("/education-dashboard.html", url);
      const response = await env.ASSETS.fetch(new Request(target, request));
      return new Response(response.body, {
        status: response.status,
        headers: new Headers({
          ...Object.fromEntries(response.headers),
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Pragma": "no-cache"
        })
      });
    }

    // Explicitly support the directory-style URL.
    if (url.pathname === "/education-dashboard/") {
      const target = new URL("/education-dashboard.html", url);
      const response = await env.ASSETS.fetch(new Request(target, request));
      return new Response(response.body, {
        status: response.status,
        headers: new Headers({
          ...Object.fromEntries(response.headers),
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Pragma": "no-cache"
        })
      });
    }

    // Explicitly map the site root to the real homepage asset.\n    // This avoids relying on implicit index.html resolution at the Worker layer.\n    if (path === "/") {\n      const target = new URL("/index.html", url);\n      const response = await env.ASSETS.fetch(new Request(target, request));\n      const headers = new Headers(response.headers);\n      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");\n      headers.set("Pragma", "no-cache");\n      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });\n    }\n\n    return env.ASSETS.fetch(request);
  }
};
