const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');

html = html.replace(
  '<label>ایمیل</label><input id="signupEmail" type="email" placeholder="ایمیل شما">',
  '<label>ایمیل</label><input id="signupEmail" type="email" placeholder="ایمیل شما">'
);

const signupOld = /\$\('signupBtn'\)\.onclick=async\(\)=>\{.*?\};s\.auth\.onAuthStateChange/s;
const signupReplacement = `$('signupBtn').onclick=async()=>{const name=$('signupName').value.trim(),rawPhone=$('signupPhone').value.trim(),phone=normalizePhone(rawPhone),email=$('signupEmail').value.trim(),password=$('signupPassword').value,password2=$('signupPassword2').value;if(!name||!phone||!email||!password)return showMsg('نام، شماره موبایل، ایمیل و رمز عبور الزامی است.');if(password.length<6)return showMsg('رمز عبور باید حداقل ۶ کاراکتر باشد.');if(password!==password2)return showMsg('تکرار رمز عبور صحیح نیست.');const{data:existing,error:lookupError}=await s.rpc('lookup_email_by_phone',{p_phone:phone});if(lookupError)return showMsg('در بررسی شماره موبایل خطایی رخ داد. لطفاً دوباره تلاش کنید.');if(existing)return showMsg('این شماره موبایل قبلاً ثبت شده است.');const{data,error}=await s.auth.signUp({email,password,options:{data:{full_name:name,phone},emailRedirectTo:location.origin+'/'}});if(error){if(error.message&&/phone|provider/i.test(error.message))return showMsg('ورود با شماره موبایل هنوز در Supabase فعال نشده است. برای ثبت‌نام فعلاً ایمیل را وارد کنید.');return showMsg(error.message)}if(data.session){showMsg('ثبت‌نام و ذخیره اطلاعات کاربری با موفقیت انجام شد.',true);setTimeout(()=>{location.href=location.origin+'/'},700)}else{showMsg('ثبت‌نام انجام شد. لطفاً ایمیل خود را برای فعال‌سازی تأیید کنید.',true);setTimeout(()=>{location.href=location.origin+'/'},1200)}};s.auth.onAuthStateChange`;
if(!signupOld.test(html)) throw new Error('signup handler not found');
html = html.replace(signupOld, signupReplacement);

const bookingMarker = '<button class="btn" id="book">ثبت نوبت</button>';
const bookingUi = '<button class="btn" id="book">ادامه و مشاهده مبلغ</button><div id="paymentBox" class="panel hidden" style="margin-top:14px"><h3>تأیید و پرداخت</h3><div id="paymentSummary"></div><button class="btn" id="payBtn">پرداخت و ثبت نهایی نوبت</button><p id="paymentMsg" class="hint"></p></div>';
if (!html.includes(bookingMarker)) throw new Error('booking marker not found');
html = html.replace(bookingMarker, bookingUi);

const bookOld = /\$\('book'\)\.onclick=async\(\)=>\{.*?await loadSlots\(\)\};setupDate/s;
const bookReplacement = `$('book').onclick=async()=>{const{data:{user}}=await s.auth.getUser();if(!user)return openAuth();if(!selected||!$('consultant').value||!chosenSlot)return $('msg').textContent='لطفاً خدمت، مشاور و ساعت را انتخاب کنید.';if(selected.price==null||Number(selected.price)<=0)return $('msg').textContent='برای این خدمت هنوز مبلغ تعیین نشده است. لطفاً ابتدا مبلغ خدمت را در پنل مدیریت تعیین کنید.';const{data:appointment,error}=await s.from('appointments').insert({user_id:user.id,service_id:selected.id,consultant_id:$('consultant').value,scheduled_at:chosenSlot.dt.toISOString(),notes:$('notes').value.trim()||null,status:'pending',amount:Number(selected.price),payment_status:'pending'}).select('id').single();if(error){$('msg').textContent=error.code==='23505'?'این ساعت توسط فرد دیگری رزرو شده است. لطفاً ساعت دیگری انتخاب کنید.':'خطا در ایجاد پیش‌فاکتور نوبت: '+error.message;await loadSlots();return}const amount=Number(selected.price);$('paymentSummary').innerHTML='<div class="datebox"><div>خدمت: <strong>'+selected.name+'</strong></div><div>مدت جلسه: <strong>'+Number(selected.duration_minutes||30).toLocaleString('fa-IR')+' دقیقه</strong></div><div class="price" style="font-size:24px">مبلغ قابل پرداخت: '+amount.toLocaleString('fa-IR')+' تومان</div><div class="hint">نوبت تا تکمیل پرداخت در وضعیت انتظار پرداخت قرار دارد.</div></div>';$('paymentBox').classList.remove('hidden');$('book').disabled=true;$('payBtn').onclick=async()=>{const btn=$('payBtn');btn.disabled=true;$('paymentMsg').textContent='در حال اتصال امن به زرین‌پال…';try{const{data,error}=await s.functions.invoke('zarinpal-request',{body:{appointment_id:appointment.id}});if(error)throw error;if(!data||!data.payment_url)throw new Error(data?.error||'آدرس پرداخت دریافت نشد.');location.href=data.payment_url}catch(e){btn.disabled=false;$('paymentMsg').textContent='اتصال به درگاه انجام نشد: '+(e.message||e)}};$('msg').className='msg ok';$('msg').textContent='نوبت موقتاً ثبت شد. مبلغ را بررسی و پرداخت را ادامه دهید.';await loadSlots()};setupDate`;
if (!bookOld.test(html)) throw new Error('booking handler not found');
html = html.replace(bookOld, bookReplacement);

fs.writeFileSync(file, html);
console.log('Build completed successfully');
