(() => {
  if (!location.pathname.endsWith('/admin-v5.html')) return;
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const client=window.supabase.createClient(SB_URL,SB_KEY);
  const $=id=>document.getElementById(id);
  const show=(text,bad=false)=>{const el=$('notice');if(el){el.className=bad?'notice err':'notice';el.textContent=text;window.scrollTo({top:0,behavior:'smooth'});}};
  window.saveBank=async function(){
    const {data:{session}}=await client.auth.getSession();
    if(!session){location.replace('/admin-login.html');return;}
    show('در حال ذخیره اطلاعات بانکی...');
    const payload={
      p_center_name:$('center_name')?.value.trim()||null,
      p_bank_name:$('bank_name')?.value.trim()||null,
      p_account_number:$('account_number')?.value.trim()||null,
      p_iban:$('iban')?.value.trim()||null,
      p_card_number:$('card_number')?.value.trim()||null,
      p_card_holder:$('card_holder')?.value.trim()||null,
      p_payment_notes:$('payment_notes')?.value.trim()||null,
      p_card_active:!!$('card_active')?.checked
    };
    const {data,error}=await client.rpc('save_center_financial_settings',payload);
    if(error){show('خطا در ذخیره اطلاعات بانکی: '+error.message,true);return;}
    if(!data || data.id!==1){show('ذخیره انجام شد اما تأیید رکورد ناموفق بود.',true);return;}
    const {data:verify,error:verifyError}=await client.from('center_financial_settings').select('id,center_name,bank_name,account_number,iban,card_number,card_holder,payment_notes,updated_at').eq('id',1).maybeSingle();
    if(verifyError){show('اطلاعات ذخیره شد، اما تأیید مجدد با خطا مواجه شد: '+verifyError.message,true);return;}
    show('✅ اطلاعات حساب بانکی با موفقیت ذخیره و تأیید شد.');
  };
})();
