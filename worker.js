export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

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

    return env.ASSETS.fetch(request);
  }
};
