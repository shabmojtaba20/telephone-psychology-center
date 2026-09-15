(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const db=supabase.createClient(SB_URL,SB_KEY);
  const $=id=>document.getElementById(id), money=n=>Number(n||0).toLocaleString('fa-IR'), esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate=d=>d?new Date(d).toLocaleDateString('fa-IR'):'—';
  const msg=(text,bad=false)=>{const n=$('financeToolsNotice');if(n){n.textContent=text;n.className='notice '+(bad?'err':'');setTimeout(()=>{n.textContent=''},4000)}};
  let canManage=false;
  async function permissions(){
    const {data:{session}}=await db.auth.getSession();
    if(!session)return false;
    const role=sessionStorage.getItem('activeAdminRole')||'finance_manager';
    const [view,manage]=await Promise.all([
      db.rpc('has_admin_role_permission',{p_role:role,p_permission:'finance.view'}),
      db.rpc('has_admin_role_permission',{p_role:role,p_permission:'finance.manage'})
    ]);
    if(view.error||view.data!==true)return false;
    canManage=!manage.error&&manage.data===true;
    return true;
  }
  function inject(){
    if(document.getElementById('financeTools'))return;
    const notice=document.getElementById('notice');
    if(!notice)return;
    const wrap=document.createElement('div');
    wrap.id='financeTools';
    wrap.innerHTML=`
      <div id="financeToolsNotice" class="notice"></div>
      <section class="card" id="expenseManagement">
        <div class="toolbar"><h2 style="margin-left:auto">💸 مدیریت هزینه‌ها</h2><button class="btn gray" id="refreshExpenses">🔄 بروزرسانی</button></div>
        <p class="muted">ابتدا عنوان هزینه را تعریف کنید؛ سپس هر تعداد ثبت هزینه با تاریخ، مبلغ و شرح دلخواه انجام دهید.</p>
        <div class="fields">
          <div><label>تعریف نوع هزینه<input id="expenseCategoryName" placeholder="مثلاً اجاره، حقوق، تبلیغات"></label><label>توضیح<input id="expenseCategoryDesc" placeholder="اختیاری"></label><button class="btn green" id="addExpenseCategory">➕ ساخت هزینه</button></div>
          <div><label>نوع هزینه<select id="expenseCategory"></select></label><label>تاریخ هزینه<input id="expenseDate" type="date"></label><label>مبلغ (تومان)<input id="expenseAmount" type="number" min="1" step="1" placeholder="مثلاً 2500000"></label><label>روش پرداخت<input id="expenseMethod" placeholder="کارت، نقدی، انتقال و..." ></label><label>شرح<input id="expenseDescription" placeholder="شرح هزینه"></label><label>شماره مرجع<input id="expenseReference" placeholder="اختیاری"></label><button class="btn green" id="addExpense">💾 ثبت هزینه</button></div>
        </div>
        <div class="table"><table><thead><tr><th>تاریخ</th><th>نوع هزینه</th><th>مبلغ</th><th>روش پرداخت</th><th>شرح</th><th>مرجع</th><th>عملیات</th></tr></thead><tbody id="expensesBody"></tbody></table></div>
      </section>
      <section class="card" id="profitLoss">
        <div class="toolbar"><h2 style="margin-left:auto">📈 صورتحساب سود و زیان مرکز</h2><button class="btn gray" id="refreshProfitLoss">🔄 محاسبه مجدد</button></div>
        <div class="cards" style="margin-bottom:14px"><div class="stat"><span class="muted">کل درآمد</span><b id="plIncome">۰ تومان</b></div><div class="stat"><span class="muted">کل هزینه‌ها</span><b id="plExpenses">۰ تومان</b></div><div class="stat"><span class="muted">سود / زیان خالص</span><b id="plNet">۰ تومان</b></div></div>
        <p class="muted">سود/زیان خالص = درآمدهای موفق و تأییدشده − مجموع هزینه‌های ثبت‌شده.</p>
        <div class="table"><table><thead><tr><th>دوره</th><th>درآمد</th><th>هزینه</th><th>سود / زیان</th><th>نتیجه</th></tr></thead><tbody id="plBody"></tbody></table></div>
      </section>`;
    notice.insertAdjacentElement('afterend',wrap);
    const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('expenseDate').value=d.toISOString().slice(0,10);
    $('addExpenseCategory').onclick=addCategory;$('addExpense').onclick=addExpense;$('refreshExpenses').onclick=loadExpenses;$('refreshProfitLoss').onclick=loadProfitLoss;
  }
  async function loadCategories(){
    const r=await db.from('expense_categories').select('id,name,description,is_active').order('name');
    if(r.error){msg(r.error.message,true);return}
    const sel=$('expenseCategory');sel.innerHTML=(r.data||[]).filter(x=>x.is_active).map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');
  }
  async function addCategory(){
    if(!canManage)return msg('این نقش اجازه ثبت هزینه را ندارد.',true);
    const name=$('expenseCategoryName').value.trim();if(!name)return msg('نام هزینه را وارد کنید.',true);
    const {data:{user}}=await db.auth.getUser();
    const r=await db.from('expense_categories').insert({name,description:$('expenseCategoryDesc').value.trim()||null,created_by:user?.id}).select().single();
    if(r.error)return msg(r.error.message,true);
    $('expenseCategoryName').value='';$('expenseCategoryDesc').value='';await loadCategories();$('expenseCategory').value=r.data.id;msg('نوع هزینه با موفقیت ساخته شد.');
  }
  async function addExpense(){
    if(!canManage)return msg('این نقش اجازه ثبت هزینه را ندارد.',true);
    const category_id=$('expenseCategory').value, amount=Number($('expenseAmount').value), expense_date=$('expenseDate').value;
    if(!category_id||!amount||amount<=0||!expense_date)return msg('نوع هزینه، تاریخ و مبلغ الزامی است.',true);
    const {data:{user}}=await db.auth.getUser();
    const r=await db.from('expenses').insert({category_id,amount,expense_date,payment_method:$('expenseMethod').value.trim()||null,description:$('expenseDescription').value.trim()||null,reference_id:$('expenseReference').value.trim()||null,created_by:user?.id}).select().single();
    if(r.error)return msg(r.error.message,true);
    $('expenseAmount').value='';$('expenseDescription').value='';$('expenseReference').value='';await loadExpenses();await loadProfitLoss();msg('هزینه با موفقیت ثبت شد.');
  }
  async function removeExpense(id){
    if(!canManage)return msg('این نقش اجازه حذف هزینه را ندارد.',true);
    if(!confirm('این هزینه حذف شود؟'))return;
    const r=await db.from('expenses').delete().eq('id',id);if(r.error)return msg(r.error.message,true);await loadExpenses();await loadProfitLoss();msg('هزینه حذف شد.');
  }
  async function loadExpenses(){
    const r=await db.from('expenses').select('id,amount,expense_date,payment_method,description,reference_id,expense_categories(name)').order('expense_date',{ascending:false}).order('created_at',{ascending:false}).limit(1000);
    if(r.error){$('expensesBody').innerHTML=`<tr><td colspan="7">${esc(r.error.message)}</td></tr>`;return;}
    const rows=r.data||[];$('expensesBody').innerHTML=rows.length?rows.map(x=>`<tr><td>${fmtDate(x.expense_date)}</td><td>${esc(x.expense_categories?.name||'—')}</td><td>${money(x.amount)} تومان</td><td>${esc(x.payment_method||'—')}</td><td>${esc(x.description||'—')}</td><td>${esc(x.reference_id||'—')}</td><td>${canManage?`<button class="btn red" onclick="window.financeRemoveExpense('${x.id}')">حذف</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">هنوز هزینه‌ای ثبت نشده است.</td></tr>';
  }
  async function loadProfitLoss(){
    const s=await db.from('finance_profit_loss_summary').select('*').maybeSingle();
    if(s.error){msg(s.error.message,true);return;}
    $('plIncome').textContent=money(s.data?.total_income)+' تومان';$('plExpenses').textContent=money(s.data?.total_expenses)+' تومان';$('plNet').textContent=money(s.data?.net_profit_loss)+' تومان';
    const r=await db.from('finance_profit_loss_monthly').select('*').order('period',{ascending:false}).limit(120);
    if(r.error){$('plBody').innerHTML=`<tr><td colspan="5">${esc(r.error.message)}</td></tr>`;return;}
    const rows=r.data||[];$('plBody').innerHTML=rows.length?rows.map(x=>`<tr><td>${fmtDate(x.period)}</td><td>${money(x.income)} تومان</td><td>${money(x.expenses)} تومان</td><td>${money(x.profit_loss)} تومان</td><td>${Number(x.profit_loss)>=0?'<span class="badge">سود</span>':'<span class="badge" style="background:#fee2e2;color:#991b1b">زیان</span>'}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">برای نمایش گزارش، درآمد یا هزینه ثبت کنید.</td></tr>';
  }
  window.financeRemoveExpense=removeExpense;
  async function start(){
    if(location.pathname!='/admin-v5.html')return;
    if(!(await permissions()))return;
    inject();
    if(!canManage){document.getElementById('addExpenseCategory').style.display='none';document.getElementById('addExpense').style.display='none';document.querySelectorAll('#expenseManagement input').forEach(x=>x.disabled=true)}
    await loadCategories();await loadExpenses();await loadProfitLoss();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
