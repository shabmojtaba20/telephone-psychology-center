(function(){
  if(window.FinanceReportAccess)return;
  const URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const db=window.supabase?.createClient?.(URL,KEY);
  if(!db)return;
  const viewed=new Set();
  const resources=new Set(['finance.dashboard','finance.formal_reports','finance.journal_ledger']);
  async function sessionReady(){
    try{
      const {data,error}=await db.auth.getSession();
      if(error||!data?.session){
        location.replace('/admin-login.html?redirect='+encodeURIComponent(location.pathname));
        return false;
      }
      return true;
    }catch(e){
      console.error('report audit session check failed',e);
      return false;
    }
  }
  async function hasPermission(permission){
    if(!(await sessionReady()))return false;
    const r=await db.rpc('has_admin_permission',{p_permission:permission});
    return !r.error&&r.data===true;
  }
  function metadata(filters,format){
    const out={};
    if(filters?.from)out.from=String(filters.from).slice(0,32);
    if(filters?.to)out.to=String(filters.to).slice(0,32);
    if(format)out.format=format;
    return out;
  }
  async function record(eventType,resource,meta){
    const r=await db.rpc('record_report_audit_event',{
      p_event_type:eventType,p_resource:resource,p_metadata:meta
    });
    if(r.error){
      console.error('report audit event failed',r.error);
      return false;
    }
    return true;
  }
  async function requireView(resource,filters){
    if(!resources.has(resource))return false;
    if(!(await hasPermission('finance.reports.view')))return false;
    if(viewed.has(resource))return true;
    if(!(await record('report.view',resource,metadata(filters))))return false;
    viewed.add(resource);
    return true;
  }
  async function requireExport(resource,format,filters){
    if(!resources.has(resource)||!['csv','xlsx','print'].includes(format))return false;
    if(!(await hasPermission('finance.reports.view')))return false;
    if(!(await hasPermission('finance.reports.export')))return false;
    const eventType={
      csv:'report.export.csv',
      xlsx:'report.export.xlsx',
      print:'report.export.print'
    }[format];
    return record(eventType,resource,metadata(filters,format));
  }
  window.FinanceReportAccess={hasPermission,requireView,requireExport};
})();