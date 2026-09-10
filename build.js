const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');

html = html.replace(
  '<label>ایمیل</label><input id="signupEmail" type="email" placeholder="ایمیل شما">',
  '<label>ایمیل</label><input id="signupEmail" type="email" placeholder="ایمیل شما">'
);

const old = /\$\('signupBtn'\)\.onclick=async\(\)=>\{.*?\};s\.auth\.onAuthStateChange/s;
const replacement = `$('signupBtn').onclick=async()=>{const name=$('signupName').value.trim(),rawPhone=$('signupPhone').value.trim(),phone=normalizePhone(rawPhone),email=$('signupEmail').value.trim(),password=$('signupPassword').value,password2=$('signupPassword2').value;if(!name||!phone||!email||!password)return showMsg('نام، شماره موبایل، ایمیل و رمز عبور الزامی است.');if(password.length<6)return showMsg('رمز عبور باید حداقل ۶ کاراکتر باشد.');if(password!==password2)return showMsg('تکرار رمز عبور صحیح نیست.');const{data:existing,error:lookupError}=await s.rpc('lookup_email_by_phone',{p_phone:phone});if(lookupError)return showMsg('در بررسی شماره موبایل خطایی رخ داد. لطفاً دوباره تلاش کنید.');if(existing)return showMsg('این شماره موبایل قبلاً ثبت شده است.');const{data,error}=await s.auth.signUp({email,password,options:{data:{full_name:name,phone},emailRedirectTo:location.origin+'/'}});if(error){if(error.message&&/phone|provider/i.test(error.message))return showMsg('ورود با شماره موبایل هنوز در Supabase فعال نشده است. برای ثبت‌نام فعلاً ایمیل را وارد کنید.');return showMsg(error.message)}if(data.session){showMsg('ثبت‌نام و ذخیره اطلاعات کاربری با موفقیت انجام شد.',true);setTimeout(()=>{location.href=location.origin+'/'},700)}else{showMsg('ثبت‌نام انجام شد. لطفاً ایمیل خود را برای فعال‌سازی تأیید کنید.',true);setTimeout(()=>{location.href=location.origin+'/'},1200)}};s.auth.onAuthStateChange`;
if(!old.test(html)) throw new Error('signup handler not found');
html = html.replace(old, replacement);
fs.writeFileSync(file, html);
console.log('Build completed successfully');
