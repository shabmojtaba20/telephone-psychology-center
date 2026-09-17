(()=>{
  const start=()=>{
    if(location.pathname!=='/finance-reports.html')return;
    window.guard=async function(){
      const {data:{session}}=await db.auth.getSession();
      if(!session){location.replace('/admin-login.html?redirect=/finance-reports.html');return false}
      const r=await db.rpc('has_admin_permission',{p_permission:'finance.manage'});
      if(r.error||r.data!==true){
        if(typeof note==='function')note('این حساب دسترسی مدیریت گزارش مالی ندارد.',true);
        return false;
      }
      return true;
    };
    if(typeof window.loadReport==='function')window.loadReport();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
