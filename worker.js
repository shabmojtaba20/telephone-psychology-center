export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/api/consultant-call" && request.method === "POST") {
      try {
        const auth = request.headers.get("Authorization") || "";
        if (!auth.startsWith("Bearer ")) return new Response(JSON.stringify({error:"ابتدا وارد حساب کاربری شوید."}),{status:401,headers:{"Content-Type":"application/json"}});
        const body = await request.json().catch(()=>({}));
        const appointmentId = String(body.appointment_id || "").trim();
        if (!appointmentId) return new Response(JSON.stringify({error:"شناسه نوبت ارسال نشده است."}),{status:400,headers:{"Content-Type":"application/json"}});

        const sbUrl = env.SUPABASE_URL || "https://aserkyiwwyggtixckjsv.supabase.co";
        const sbKey = env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX";
        const rpc = await fetch(sbUrl + "/rest/v1/rpc/prepare_my_consultant_twilio_call", {
          method:"POST",headers:{"apikey":sbKey,"Authorization":auth,"Content-Type":"application/json"},
          body:JSON.stringify({p_appointment_id:appointmentId})
        });
        const prepared = await rpc.json().catch(()=>null);
        if (!rpc.ok) return new Response(JSON.stringify({error:prepared?.message || prepared?.error || "این نوبت برای تماس قابل استفاده نیست."}),{status:400,headers:{"Content-Type":"application/json"}});

        const account = env.TWILIO_ACCOUNT_SID, from = env.TWILIO_FROM_NUMBER;
        const secret = env.TWILIO_API_SECRET || env.TWILIO_AUTH_TOKEN;
        const user = env.TWILIO_API_KEY || account;
        if (!account || !from || !secret) return new Response(JSON.stringify({error:"تنظیمات Twilio روی Worker کامل نشده است."}),{status:500,headers:{"Content-Type":"application/json"}});

        const callback = new URL("/api/twilio/voice-status", url);
        callback.searchParams.set("session_id", prepared.session_id);
        const consultant = String(prepared.consultant_phone).replace(/[^+\d]/g,"");
        const twiml = `<Response><Dial timeout="25"><Number>${consultant}</Number></Dial></Response>`;
        const form = new URLSearchParams({To:String(prepared.customer_phone),From:String(from),Twiml:twiml,StatusCallback:callback.toString(),StatusCallbackMethod:"POST",StatusCallbackEvent:"initiated ringing answered completed"});
        const callResp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(account)}/Calls.json`,{
          method:"POST",headers:{"Authorization":"Basic "+btoa(user+":"+secret),"Content-Type":"application/x-www-form-urlencoded"},body:form
        });
        const callData=await callResp.json().catch(()=>null);
        if(!callResp.ok) return new Response(JSON.stringify({error:callData?.message||"برقراری تماس از طریق Twilio انجام نشد.",code:callData?.code||null}),{status:502,headers:{"Content-Type":"application/json"}});

        const attach=await fetch(sbUrl+"/rest/v1/rpc/attach_my_twilio_call_sid",{
          method:"POST",headers:{"apikey":sbKey,"Authorization":auth,"Content-Type":"application/json"},
          body:JSON.stringify({p_session_id:prepared.session_id,p_twilio_call_sid:callData.sid})
        });
        if(!attach.ok) return new Response(JSON.stringify({error:"تماس ایجاد شد ولی ثبت شناسه تماس انجام نشد.",call_sid:callData.sid}),{status:502,headers:{"Content-Type":"application/json"}});
        return new Response(JSON.stringify({ok:true,session_id:prepared.session_id,call_sid:callData.sid,status:callData.status||"queued"}),{headers:{"Content-Type":"application/json"}});
      } catch(e) {
        return new Response(JSON.stringify({error:e?.message||"خطای غیرمنتظره در برقراری تماس."}),{status:500,headers:{"Content-Type":"application/json"}});
      }
    }

    if (path === "/api/twilio/voice-status" && request.method === "POST") {
      try {
        const body=await request.formData(), sessionId=url.searchParams.get("session_id");
        if(!sessionId) return new Response("",{status:204});
        const status=String(body.get("CallStatus")||""), duration=Number(body.get("CallDuration")||0);
        if(!env.SUPABASE_SERVICE_ROLE_KEY) return new Response("",{status:500});
        const sbUrl=env.SUPABASE_URL||"https://aserkyiwwyggtixckjsv.supabase.co";
        const finalStatus=["completed","failed","busy","no-answer","canceled"].includes(status);
        const patch={status:status==="completed"?"completed":finalStatus?"failed":"calling",duration_seconds:duration||null,updated_at:new Date().toISOString()};
        if(finalStatus)patch.ended_at=new Date().toISOString();
        await fetch(sbUrl+"/rest/v1/consultant_call_sessions?id=eq."+encodeURIComponent(sessionId),{
          method:"PATCH",headers:{"apikey":env.SUPABASE_SERVICE_ROLE_KEY,"Authorization":"Bearer "+env.SUPABASE_SERVICE_ROLE_KEY,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(patch)
        });
        return new Response("",{status:204});
      } catch { return new Response("",{status:204}); }
    }

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
