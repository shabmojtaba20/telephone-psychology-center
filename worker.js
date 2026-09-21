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
        header .links a[href="/admin.html"],header .links a[href="/consultant-panel.html"],header .links a[href="/admin-v5.html"]{display:inline-flex!important;align-items:center;white-space:nowrap}
        header .links a[href="/admin.html"],header .links a[href="/consultant-panel.html"],header .links a[href="/admin-v5.html"]{font-size:13px;padding:7px 10px;border-radius:9px}
        @media(max-width:700px){header .links a[href="/admin.html"],header .links a[href="/consultant-panel.html"],header .links a[href="/admin-v5.html"]{display:none!important}header .links #accountBtn{display:inline-flex!important}}
      </style><script>
      (()=>{
        const run=()=>{
          const nav=document.querySelector('header nav.links');
          if(!nav)return;
          const account=document.getElementById('accountBtn');
          if(account){account.textContent='پروفایل';account.setAttribute('aria-label','ورود و مشاهده پروفایل');}
          const targets=[
            ['/admin.html','پنل مدیریت'],
            ['/admin-v5.html','پنل مالی'],
            ['/consultant-panel.html','پنل مشاور']
          ];
          for(const [href,label] of targets){
            let link=[...document.querySelectorAll('a')].find(a=>{try{return new URL(a.getAttribute('href'),location.href).pathname===href}catch{return false}});
            if(!link){link=document.createElement('a');link.href=href;}
            link.textContent=label;
            link.classList.add('btn','role-panel-link');
            if(link.parentElement!==nav)nav.appendChild(link);
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

    return env.ASSETS.fetch(request);
  }
};
