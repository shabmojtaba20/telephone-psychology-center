import { DurableObject } from "cloudflare:workers";

const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {
  status,
  headers: {"Content-Type":"application/json; charset=utf-8", ...extra}
});

function getSupabaseAdminKey(env){
  return env.supabase_service_role_key || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "";
}

function getSupabaseUrl(env){
  return env.SUPABASE_URL || "https://aserkyiwwyggtixckjsv.supabase.co";
}


function base64UrlFromBytes(bytes){
  let binary="";
  const arr=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
  for(const b of arr)binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/g,"");
}
function base64UrlFromText(text){return base64UrlFromBytes(new TextEncoder().encode(text));}
async function createLiveKitToken({apiKey,apiSecret,identity,name,roomName,ttlSeconds=3600}){
  const now=Math.floor(Date.now()/1000);
  const header={alg:"HS256",typ:"JWT"};
  const payload={
    iss:apiKey,
    sub:identity,
    nbf:now,
    exp:now+ttlSeconds,
    name,
    video:{room:roomName,roomJoin:true,canPublish:true,canSubscribe:true,canPublishData:false}
  };
  const unsigned=base64UrlFromText(JSON.stringify(header))+"."+base64UrlFromText(JSON.stringify(payload));
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(apiSecret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signature=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(unsigned));
  return unsigned+"."+base64UrlFromBytes(signature);
}

async function addDesignerFooter(response){
  const type=response.headers.get("Content-Type")||"";
  if(!response.ok||!type.toLowerCase().includes("text/html")) return response;
  return response.text().then(html=>{
    const footer='<style>.site-designer-credit{padding:14px 12px 18px;text-align:center;color:#98a2b3;font-size:11px;line-height:1.8;font-weight:500}.site-designer-credit span{display:inline-block;border-top:1px solid #e5e7eb;padding-top:7px;min-width:170px}@media print{.site-designer-credit{color:#667085;font-size:10px}}</style><div class="site-designer-credit" dir="rtl"><span>طراح مهندس مجتبی شبیهی</span></div>';
    if(html.includes("site-designer-credit")) return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    const out=html.includes("</body>")?html.replace("</body>",footer+"</body>"):html+footer;
    const headers=new Headers(response.headers);headers.delete("Content-Length");
    return new Response(out,{status:response.status,statusText:response.statusText,headers});
  });
}

async function getBearer(request){
  const h=request.headers.get("Authorization")||"";
  if(h.startsWith("Bearer "))return h.slice(7).trim();
  const p=request.headers.get("Sec-WebSocket-Protocol")||"";
  const token=p.split(",").map(x=>x.trim()).find(x=>x.startsWith("call-bearer."));
  return token?token.slice("call-bearer.".length).trim():"";
}

async function getUserId(token, env){
  if(!token) return null;
  const sbUrl=getSupabaseUrl(env);
  const sbKey=env.SUPABASE_PUBLISHABLE_KEY||"sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX";
  const r=await fetch(sbUrl+"/auth/v1/user",{headers:{"apikey":sbKey,"Authorization":"Bearer "+token}});
  if(!r.ok)return null;
  const u=await r.json().catch(()=>null);
  return u?.id||null;
}

async function sbSelect(env, path){
  const key=getSupabaseAdminKey(env);
  if(!key) throw new Error("supabase_service_role_key is not configured");
  const r=await fetch(getSupabaseUrl(env)+"/rest/v1/"+path,{headers:{"apikey":key,"Authorization":"Bearer "+key}});
  const data=await r.json().catch(()=>null);
  if(!r.ok) throw new Error(data?.message||data?.error||"Supabase request failed");
  return data;
}

async function hasPermission(env, token, permission){
  if(!token)return false;
  const sbUrl=getSupabaseUrl(env);
  const sbKey=env.SUPABASE_PUBLISHABLE_KEY||"sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX";
  const r=await fetch(sbUrl+"/rest/v1/rpc/has_admin_permission",{
    method:"POST",headers:{"apikey":sbKey,"Authorization":"Bearer "+token,"Content-Type":"application/json"},
    body:JSON.stringify({p_permission:permission})
  });
  if(!r.ok)return false;
  return (await r.json().catch(()=>false))===true;
}

async function authorizeCallRoom(request, env, roomKey){
  const token=getBearer(request);
  const userId=await getUserId(token,env);
  if(!userId)return {ok:false,status:401,error:"احراز هویت لازم است."};
  const rooms=await sbSelect(env,"call_rooms?select=id,room_type,appointment_id,workshop_id,room_key,status,starts_at,ends_at&room_key=eq."+encodeURIComponent(roomKey)+"&limit=1");
  const room=rooms?.[0];
  if(!room)return {ok:false,status:404,error:"اتاق تماس پیدا نشد."};
  if(["expired","cancelled"].includes(room.status))return {ok:false,status:410,error:"این اتاق تماس منقضی یا لغو شده است."};
  const now=Date.now(), start=new Date(room.starts_at).getTime()-15*60*1000, end=new Date(room.ends_at).getTime()+30*60*1000;
  if(!Number.isFinite(start)||!Number.isFinite(end)||now<start||now>end)return {ok:false,status:403,error:"خارج از بازه مجاز ورود به اتاق هستید."};

  let role=null;
  if(await hasPermission(env,token,"content.manage") || await hasPermission(env,token,"calls.manage")) role="admin";

  if(room.room_type==="private_consultation"){
    const ap=(await sbSelect(env,"appointments?select=id,user_id,consultant_id,scheduled_at,status&id=eq."+encodeURIComponent(room.appointment_id)+"&limit=1"))?.[0];
    if(!ap)return {ok:false,status:404,error:"نوبت مرتبط با اتاق پیدا نشد."};
    if(userId===ap.user_id)role=role||"client";
    const links=await sbSelect(env,"consultant_user_links?select=consultant_id&user_id=eq."+encodeURIComponent(userId)+"&consultant_id=eq."+encodeURIComponent(ap.consultant_id)+"&limit=1");
    if(links?.length)role=role||"consultant";
    if(!role)return {ok:false,status:403,error:"شما عضو این جلسه نیستید."};
  } else if(room.room_type==="workshop"){
    const ws=(await sbSelect(env,"workshops?select=id,created_by&id=eq."+encodeURIComponent(room.workshop_id)+"&limit=1"))?.[0];
    if(ws?.created_by===userId)role=role||"instructor";
    if(!role){
      const regs=await sbSelect(env,"workshop_registrations?select=id&workshop_id=eq."+encodeURIComponent(room.workshop_id)+"&user_id=eq."+encodeURIComponent(userId)+"&payment_status=in.(free,paid)&limit=1");
      if(regs?.length)role="attendee";
    }
    if(!role)return {ok:false,status:403,error:"ثبت‌نام معتبر برای این کارگاه پیدا نشد."};
  }
  return {ok:true,room,userId,role,token};
}

export class CallSignalingRoom extends DurableObject {
  constructor(ctx, env){super(ctx,env);this.clients=new Map();}
  fetch(request){
    if(request.headers.get("Upgrade")!=="websocket")return new Response("WebSocket required",{status:426});
    const pair=new WebSocketPair(),client=pair[0],server=pair[1];
    server.accept();
    const id=crypto.randomUUID();
    const userId=request.headers.get("X-Call-User-Id")||"";
    const role=request.headers.get("X-Call-Role")||"participant";
    this.clients.set(id,{ws:server,userId,role});
    const peers=[...this.clients.entries()].filter(([k])=>k!==id).map(([k,v])=>({id:k,user_id:v.userId,role:v.role}));
    server.send(JSON.stringify({type:"joined",self_id:id,peers}));
    for(const [k,peer] of this.clients){if(k!==id)try{peer.ws.send(JSON.stringify({type:"peer_joined",peer:{id,user_id:userId,role}}));}catch{}}
    const relay=(payload)=>{
      if(payload.to){const peer=this.clients.get(String(payload.to));if(peer)peer.ws.send(JSON.stringify({...payload,from:id}));}
      else for(const [k,peer] of this.clients)if(k!==id)peer.ws.send(JSON.stringify({...payload,from:id}));
    };
    server.addEventListener("message",event=>{
      try{
        const m=JSON.parse(event.data);
        if(!["offer","answer","ice","ready","hangup"].includes(m.type))return;
        relay(m);
      }catch{}
    });
    const leave=()=>{
      if(!this.clients.has(id))return;
      this.clients.delete(id);
      for(const peer of this.clients.values())try{peer.ws.send(JSON.stringify({type:"peer_left",peer_id:id}));}catch{}
    };
    server.addEventListener("close",leave);server.addEventListener("error",leave);
    const protocol=request.headers.get("Sec-WebSocket-Protocol");
    const headers=protocol?{"Sec-WebSocket-Protocol":protocol}:{};
    return new Response(null,{status:101,webSocket:client,headers});
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path.startsWith("/api/call-signal/") && request.headers.get("Upgrade") === "websocket") {
      try {
        const roomKey = decodeURIComponent(path.slice("/api/call-signal/".length));
        if (!roomKey) return json({error:"کلید اتاق تماس ارسال نشده است."},400);
        const authz = await authorizeCallRoom(request, env, roomKey);
        if (!authz.ok) return json({error:authz.error},authz.status);
        const id = env.CALL_SIGNALING.idFromName(roomKey);
        const stub = env.CALL_SIGNALING.get(id);
        const headers = new Headers(request.headers);
        headers.set("X-Call-User-Id", authz.userId);
        headers.set("X-Call-Role", authz.role);
        return stub.fetch(new Request(new URL("/signal", request.url), {method:"GET",headers}));
      } catch (e) { return json({error:e?.message||"اتصال سیگنال تماس برقرار نشد."},500); }
    }

    if (path === "/api/call-ice" && request.method === "GET") {
      try {
        const auth = request.headers.get("Authorization") || "";
        if (!auth.startsWith("Bearer ")) return json({error:"ابتدا وارد حساب کاربری شوید."},401,{"Cache-Control":"no-store"});
        const userId = await getUserId(auth.slice(7).trim(), env);
        if (!userId) return json({error:"جلسه ورود معتبر نیست."},401,{"Cache-Control":"no-store"});

        const account = env.TWILIO_ACCOUNT_SID;
        const apiKey = env.TWILIO_API_KEY;
        const apiSecret = env.TWILIO_API_SECRET;
        const authToken = env.TWILIO_AUTH_TOKEN;
        if (!account || (!apiKey && !authToken) || (!apiSecret && !authToken)) {
          return json({error:"تنظیمات Twilio برای TURN روی Worker کامل نشده است."},500,{"Cache-Control":"no-store"});
        }

        const credentialsUser = apiKey || account;
        const credentialsSecret = apiSecret || authToken;
        const tokenResp = await fetch("https://api.twilio.com/2010-04-01/Accounts/"+encodeURIComponent(account)+"/Tokens.json",{
          method:"POST",
          headers:{
            "Authorization":"Basic "+btoa(credentialsUser+":"+credentialsSecret),
            "Content-Type":"application/x-www-form-urlencoded"
          },
          body:new URLSearchParams({Ttl:"3600"})
        });
        const data = await tokenResp.json().catch(()=>null);
        if (!tokenResp.ok || !Array.isArray(data?.ice_servers)) {
          return json({error:data?.message||"دریافت سرور TURN انجام نشد."},502,{"Cache-Control":"no-store"});
        }
        return json({ok:true,ice_servers:data.ice_servers,ttl:Number(data.ttl)||3600},200,{"Cache-Control":"no-store"});
      } catch (e) {
        return json({error:e?.message||"خطا در دریافت تنظیمات TURN."},502,{"Cache-Control":"no-store"});
      }
    }

    if (path === "/api/livekit-token" && request.method === "POST") {
      try {
        const auth=request.headers.get("Authorization")||"";
        if(!auth.startsWith("Bearer ")) return json({error:"ابتدا وارد حساب کاربری شوید."},401,{"Cache-Control":"no-store"});
        const token=auth.slice(7).trim();
        const userId=await getUserId(token,env);
        if(!userId)return json({error:"جلسه ورود معتبر نیست."},401,{"Cache-Control":"no-store"});
        const body=await request.json().catch(()=>({}));
        const appointmentId=String(body?.appointment_id||"").trim();
        if(!appointmentId)return json({error:"شناسه نوبت ارسال نشده است."},400,{"Cache-Control":"no-store"});
        const rooms=await sbSelect(env,"call_rooms?select=id,room_type,appointment_id,room_key,status,starts_at,ends_at&appointment_id=eq."+encodeURIComponent(appointmentId)+"&room_type=eq.private_consultation&limit=1");
        let callRoom=rooms?.[0];
        if(!callRoom){
          const sbUrl=getSupabaseUrl(env);
          const sbKey=env.SUPABASE_PUBLISHABLE_KEY||"sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX";
          const rpcName=(await hasPermission(env,token,"content.manage") || await hasPermission(env,token,"calls.manage"))
            ?"get_or_create_my_consultant_call_room"
            :"get_or_create_my_call_room";
          const rpc=await fetch(sbUrl+"/rest/v1/rpc/"+rpcName,{
            method:"POST",
            headers:{"apikey":sbKey,"Authorization":"Bearer "+token,"Content-Type":"application/json"},
            body:JSON.stringify({p_appointment_id:appointmentId})
          });
          const created=await rpc.json().catch(()=>null);
          if(!rpc.ok)return json({error:created?.message||created?.error||"اتاق تماس این نوبت ساخته نشد."},400,{"Cache-Control":"no-store"});
          const row=Array.isArray(created)?created[0]:created;
          const roomId=row?.room_id||row?.id;
          if(!row?.room_key)return json({error:"کلید اتاق تماس دریافت نشد."},500,{"Cache-Control":"no-store"});
          callRoom={id:roomId,room_type:"private_consultation",appointment_id:appointmentId,room_key:row.room_key,status:row.room_status||row.status};
          const refreshed=await sbSelect(env,"call_rooms?select=id,room_type,appointment_id,room_key,status,starts_at,ends_at&id=eq."+encodeURIComponent(roomId)+"&limit=1");
          if(refreshed?.[0])callRoom=refreshed[0];
        }
        const authz=await authorizeCallRoom(request,env,callRoom.room_key);
        if(!authz.ok)return json({error:authz.error},authz.status,{"Cache-Control":"no-store"});
        const livekitUrl=env.LIVEKIT_URL||"";
        const livekitKey=env.LIVEKIT_API_KEY||"";
        const livekitSecret=env.LIVEKIT_API_SECRET||"";
        if(!livekitUrl||!livekitKey||!livekitSecret)return json({error:"تنظیمات LiveKit روی Worker کامل نشده است."},503,{"Cache-Control":"no-store"});
        const roomName="consultation-"+String(callRoom.id).replace(/[^a-zA-Z0-9_-]/g,"");
        const identity="u-"+authz.userId;
        const displayName=authz.role==="consultant"?"consultant":"client";
        const participantToken=await createLiveKitToken({apiKey:livekitKey,apiSecret:livekitSecret,identity,name:displayName,roomName});
        return json({server_url:livekitUrl,participant_token:participantToken,room_name:roomName,role:authz.role},201,{"Cache-Control":"no-store"});
      } catch(e) {
        return json({error:e?.message||"صدور مجوز LiveKit انجام نشد."},500,{"Cache-Control":"no-store"});
      }
    }

    if (path === "/api/consultant-call" && request.method === "POST") {
      try {
        const auth = request.headers.get("Authorization") || "";
        if (!auth.startsWith("Bearer ")) return new Response(JSON.stringify({error:"ابتدا وارد حساب کاربری شوید."}),{status:401,headers:{"Content-Type":"application/json"}});
        const body = await request.json().catch(()=>({}));
        const appointmentId = String(body.appointment_id || "").trim();
        if (!appointmentId) return new Response(JSON.stringify({error:"شناسه نوبت ارسال نشده است."}),{status:400,headers:{"Content-Type":"application/json"}});

        const sbUrl = getSupabaseUrl(env);
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
      } catch(e) { return new Response(JSON.stringify({error:e?.message||"خطای غیرمنتظره در برقراری تماس."}),{status:500,headers:{"Content-Type":"application/json"}}); }
    }

    if (path === "/api/twilio/voice-status" && request.method === "POST") {
      try {
        const twilioAuthToken = env.TWILIO_AUTH_TOKEN;
        if (!twilioAuthToken) return new Response("",{status:500});
        const signature = request.headers.get("X-Twilio-Signature") || "";
        if (!signature) return new Response("",{status:403});

        const body = await request.formData();
        const sessionId = url.searchParams.get("session_id");
        if(!sessionId) return new Response("",{status:204});

        const params = [...body.entries()].sort(([a],[b])=>a.localeCompare(b));
        const data = url.toString() + params.map(([key,value])=>String(key)+String(value)).join("");
        const bytes = new TextEncoder().encode(data);
        const keyBytes = new TextEncoder().encode(twilioAuthToken);
        const cryptoKey = await crypto.subtle.importKey("raw",keyBytes,{name:"HMAC",hash:"SHA-1"},false,["sign"]);
        const digest = await crypto.subtle.sign("HMAC",cryptoKey,bytes);
        let binary="";
        for(const byte of new Uint8Array(digest)) binary += String.fromCharCode(byte);
        const expected = btoa(binary);
        if(signature.length !== expected.length) return new Response("",{status:403});
        const a=new TextEncoder().encode(signature), b=new TextEncoder().encode(expected);
        let diff=0;
        for(let i=0;i<a.length;i++) diff |= a[i]^b[i];
        if(diff!==0) return new Response("",{status:403});

        const status=String(body.get("CallStatus")||""), duration=Number(body.get("CallDuration")||0);
        const adminKey=getSupabaseAdminKey(env);
        if(!adminKey) return new Response("",{status:500});
        const sbUrl=getSupabaseUrl(env);
        const finalStatus=["completed","failed","busy","no-answer","canceled"].includes(status);
        const patch={status:status==="completed"?"completed":finalStatus?"failed":"calling",duration_seconds:duration||null,updated_at:new Date().toISOString()};
        if(finalStatus)patch.ended_at=new Date().toISOString();
        await fetch(sbUrl+"/rest/v1/consultant_call_sessions?id=eq."+encodeURIComponent(sessionId),{
          method:"PATCH",headers:{"apikey":adminKey,"Authorization":"Bearer "+adminKey,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(patch)
        });
        return new Response("",{status:204});
      } catch { return new Response("",{status:204}); }
    }

    if (path === "/api/marketing/health" && request.method === "GET") {
      try {
        const sbKey=env.SUPABASE_PUBLISHABLE_KEY||"sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX";
        const r=await fetch(getSupabaseUrl(env)+"/rest/v1/rpc/marketing_health",{
          method:"POST",
          headers:{"apikey":sbKey,"Authorization":"Bearer "+sbKey,"Content-Type":"application/json"}
        });
        const data=await r.json().catch(()=>null);
        return json({ok:r.ok,status:r.status,key_type:"publishable",detail:r.ok?(data||{ok:true}):data},r.ok?200:502,{"Cache-Control":"no-store"});
      } catch(e) {
        return json({ok:false,error:String(e?.message||e)},502,{"Cache-Control":"no-store"});
      }
    }

    if (path === "/api/marketing/session" && request.method === "POST") {
      try {
        const body=await request.json();
        const sessionKey=String(body?.session_key||"").slice(0,200);
        if(!sessionKey)return json({error:"session_key required"},400,{"Cache-Control":"no-store"});
        const sbKey=env.SUPABASE_PUBLISHABLE_KEY||"sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX";
        const payload={
          p_id:body?.id||crypto.randomUUID(),
          p_session_key:sessionKey,
          p_source:body?.source?String(body.source).slice(0,200):null,
          p_medium:body?.medium?String(body.medium).slice(0,200):null,
          p_campaign:body?.campaign?String(body.campaign).slice(0,200):null,
          p_content:body?.content?String(body.content).slice(0,200):null,
          p_term:body?.term?String(body.term).slice(0,200):null,
          p_landing_path:body?.landing_path?String(body.landing_path).slice(0,500):"/",
          p_referrer:body?.referrer?String(body.referrer).slice(0,1000):null
        };
        const r=await fetch(getSupabaseUrl(env)+"/rest/v1/rpc/marketing_upsert_session",{
          method:"POST",
          headers:{"apikey":sbKey,"Authorization":"Bearer "+sbKey,"Content-Type":"application/json"},
          body:JSON.stringify(payload)
        });
        const data=await r.json().catch(()=>null);
        if(!r.ok)return json({error:"session insert failed",status:r.status,detail:typeof data==="string"?data:String(data?.message||data?.error||"")},502,{"Cache-Control":"no-store"});
        const id=Array.isArray(data)?data[0]?.id:data?.id||data;
        return json({id},200,{"Cache-Control":"no-store"});
      } catch(e) { return json({error:"invalid request",detail:String(e?.message||e)},400,{"Cache-Control":"no-store"}); }
    }

    if (path === "/api/marketing/event" && request.method === "POST") {
      try {
        const body=await request.json();
        const sessionId=String(body?.session_id||"");
        const eventName=String(body?.event_name||"").slice(0,100);
        if(!sessionId||!eventName)return json({error:"session_id and event_name required"},400,{"Cache-Control":"no-store"});
        const sbKey=env.SUPABASE_PUBLISHABLE_KEY||"sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX";
        const payload={
          p_session_id:sessionId,
          p_event_name:eventName,
          p_page_path:body?.page_path?String(body.page_path).slice(0,500):"/",
          p_service_id:body?.service_id||null,
          p_consultant_id:body?.consultant_id||null,
          p_metadata:body?.metadata&&typeof body.metadata==="object"?body.metadata:{}
        };
        const r=await fetch(getSupabaseUrl(env)+"/rest/v1/rpc/marketing_insert_event",{
          method:"POST",
          headers:{"apikey":sbKey,"Authorization":"Bearer "+sbKey,"Content-Type":"application/json"},
          body:JSON.stringify(payload)
        });
        const data=await r.json().catch(()=>null);
        if(!r.ok)return json({error:"event insert failed",status:r.status,detail:String(data?.message||data?.error||data||"")},502,{"Cache-Control":"no-store"});
        return json({ok:true,id:Array.isArray(data)?data[0]?.id:data?.id||data},200,{"Cache-Control":"no-store"});
      } catch(e) { return json({error:"invalid request",detail:String(e?.message||e)},400,{"Cache-Control":"no-store"}); }
    }

    if (path === "/admin-professional.html") {
      const response = await env.ASSETS.fetch(new Request(new URL("/admin-professional.html", url), request));
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      return addDesignerFooter(new Response(response.body, { status: response.status, statusText: response.statusText, headers }));
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
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    if (path === "/zarinpal-callback") {
      const target = new URL("https://aserkyiwwyggtixckjsv.supabase.co/functions/v1/zarinpal-callback");
      target.search = url.search;
      return fetch(new Request(target, {
        method: "GET",
        headers: { "Accept": "text/html,application/xhtml+xml" }
      }));
    }

    return addDesignerFooter(await env.ASSETS.fetch(request));
  }
};
