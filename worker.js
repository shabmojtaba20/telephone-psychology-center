export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/admin-professional.html") {
      const response = await env.ASSETS.fetch(new Request(new URL("/admin-professional.html", url), request));
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    if (["/education-dashboard", "/education-dashboard.html", "/education-dashboard/index.html", "/education-dashboard/"].includes(url.pathname)) {
      const target = new URL("/education-dashboard.html", url);
      const response = await env.ASSETS.fetch(new Request(target, request));
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    if (path === "/") {
      const response = await env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      const type = headers.get("Content-Type") || "text/html; charset=utf-8";
      if (!response.ok || !type.toLowerCase().includes("text/html")) {
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }
      let html = await response.text();
      const navigationFix = `<style>
        header .links a[href="/admin.html"],header .links a[href="/consultant-panel.html"],header .links a[href="/admin-v5.html"]{display:inline-flex!important;align-items:center;white-space:nowrap;font-size:13px;padding:7px 10px;border-radius:9px}
        header .links{flex-wrap:wrap}
        .footer-panel-links{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:16px}
        .footer-panel-links a{display:inline-flex;align-items:center;justify-content:center;background:#fff;color:#344054!important;text-decoration:none;border:1px solid #d0d5dd;border-radius:8px;padding:6px 11px;font-size:12px;min-width:92px}.footer-panel-links a[href="/admin.html"]{background:#2563eb;color:#fff!important;border-color:#2563eb}
        @media(max-width:700px){header .nav{align-items:flex-start;flex-direction:column;padding:10px 0}header .links{width:100%;justify-content:flex-start;gap:8px}header .links a{display:inline-flex!important;align-items:center;white-space:nowrap;font-size:12px;padding:6px 9px}header .links #accountBtn{display:inline-flex!important;font-size:12px;padding:6px 9px}}
      </style><script>
      (()=>{
        const run=()=>{
          const nav=document.querySelector('header nav.links');
          if(!nav)return;
          const targets=[
            ['/admin.html','پنل مدیریت'],
            ['/admin-v5.html','پنل مالی'],
            ['/consultant-panel.html','پنل مشاور']
          ];
          for(const [href,label] of targets){
            let link=[...nav.querySelectorAll('a')].find(a=>{try{return new URL(a.getAttribute('href'),location.href).pathname===href}catch{return false}});
            if(!link){link=document.createElement('a');link.href=href;nav.appendChild(link);}
            link.textContent=label;
            link.classList.add('btn','role-panel-link');
          }
          const footer=document.querySelector('footer .c');
          if(footer&&!footer.querySelector('.footer-panel-links')){
            const group=document.createElement('nav');group.className='footer-panel-links';group.setAttribute('aria-label','دسترسی به پنل‌ها');
            for(const [href,label] of targets){const a=document.createElement('a');a.href=href;a.textContent=label;group.appendChild(a);}
            footer.appendChild(group);
          }
        };
        if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
      })();
      </script>`;
      if (html.includes("</body>")) html = html.replace("</body>", navigationFix + "</body>");
      else html += navigationFix;
      headers.set("Content-Length", String(new TextEncoder().encode(html).length));
      return new Response(html, { status: response.status, statusText: response.statusText, headers });
    }

    if (path === "/zarinpal-callback") {
      const target = new URL("https://aserkyiwwyggtixckjsv.supabase.co/functions/v1/zarinpal-callback");
      target.search = url.search;
      return fetch(new Request(target, {
        method: "GET",
        headers: { "Accept": "text/html,application/xhtml+xml" }
      }));
    }

    return env.ASSETS.fetch(request);
  }
};
