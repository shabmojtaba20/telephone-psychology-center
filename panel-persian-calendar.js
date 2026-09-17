(()=>{
'use strict';
const PERSIAN_LOCALE='fa-IR-u-ca-persian';
const pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

// Make all normal JS date formatting in management panels use the Persian calendar.
const proto=Date.prototype;
if(!proto.__panelPersianCalendarPatched){
  const oldString=proto.toLocaleString;
  const oldDate=proto.toLocaleDateString;
  const oldTime=proto.toLocaleTimeString;
  proto.toLocaleString=function(locales,options){
    if(locales==='fa-IR' || locales==='fa') locales=PERSIAN_LOCALE;
    else if(!locales) locales=PERSIAN_LOCALE;
    return oldString.call(this,locales,options);
  };
  proto.toLocaleDateString=function(locales,options){
    if(locales==='fa-IR' || locales==='fa') locales=PERSIAN_LOCALE;
    else if(!locales) locales=PERSIAN_LOCALE;
    return oldDate.call(this,locales,options);
  };
  proto.toLocaleTimeString=function(locales,options){
    if(locales==='fa-IR' || locales==='fa') locales=PERSIAN_LOCALE;
    else if(!locales) locales=PERSIAN_LOCALE;
    return oldTime.call(this,locales,options);
  };
  Object.defineProperty(proto,'__panelPersianCalendarPatched',{value:true});
}

function g2j(gy,gm,gd){
  const gdm=[0,31,28,31,30,31,30,31,31,30,31,30,31];
  let gy2=gm>2?gy+1:gy, days=355666+365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)+gd;
  for(let i=1;i<gm;i++) days+=gdm[i];
  let jy=-1595+33*Math.floor(days/12053);days%=12053;jy+=4*Math.floor(days/1461);days%=1461;
  if(days>365){jy+=Math.floor((days-1)/365);days=(days-1)%365;}
  let jm=days<186?1+Math.floor(days/31):7+Math.floor((days-186)/30),jd=1+(days<186?days%31:(days-186)%30);
  return [jy,jm,jd];
}
function j2g(jy,jm,jd){
  let jy2=jy+1595, days=-355668+365*jy2+Math.floor(jy2/33)*8+Math.floor((jy2%33+3)/4)+jd;
  days+=jm<7?(jm-1)*31:(jm-7)*30+186;
  let gy=400*Math.floor(days/146097);days%=146097;
  if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++;}
  gy+=4*Math.floor(days/1461);days%=1461;
  if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365;}
  let gd=days+1, gdm=[31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;
  while(gm<12&&gd>gdm[gm]){gd-=gdm[gm];gm++;}
  return [gy,gm+1,gd];
}
function isoToJ(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return '';const [y,m,d]=iso.split('-').map(Number),j=g2j(y,m,d);return `${j[0]}/${pad(j[1])}/${pad(j[2])}`;}
function jToIso(v){const m=String(v||'').trim().replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);if(!m)return '';const g=j2g(+m[1],+m[2],+m[3]);return `${g[0]}-${pad(g[1])}-${pad(g[2])}`;}
function monthDays(y,m){return m<=6?31:m<=11?30:((y%33===1||y%33===5||y%33===9||y%33===13||y%33===17||y%33===22||y%33===26||y%33===30)?30:29);}
const monthNames=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function makePicker(original){
  if(original.dataset.persianPicker==='1')return;
  original.dataset.persianPicker='1';
  const wrap=document.createElement('div');wrap.className='ppc-wrap';
  const input=document.createElement('input');input.type='text';input.className=original.className;input.placeholder='۱۴۰۵/۰۱/۰۱';input.autocomplete='off';input.dir='ltr';input.setAttribute('aria-label',original.previousElementSibling?.textContent||'تاریخ شمسی');
  input.value=isoToJ(original.value);
  original.type='hidden';original.style.display='none';
  original.parentNode.insertBefore(wrap,original);wrap.appendChild(input);wrap.appendChild(original);
  const pop=document.createElement('div');pop.className='ppc-pop';pop.hidden=true;wrap.appendChild(pop);
  let view;
  function render(){
    const base=original.value?g2j(...original.value.split('-').map(Number)):(()=>{const d=new Date(),j=g2j(d.getFullYear(),d.getMonth()+1,d.getDate());return j})();
    if(!view)view={y:base[0],m:base[1]};
    const first=j2g(view.y,view.m,1), dow=new Date(first[0],first[1]-1,first[2]).getDay();
    const start=(dow+1)%7, total=monthDays(view.y,view.m), cells=[];
    for(let i=0;i<start;i++)cells.push('<span></span>');
    for(let d=1;d<=total;d++){const iso=jToIso(`${view.y}/${view.m}/${d}`),sel=iso===original.value?' selected':'';cells.push(`<button type="button" class="ppc-day${sel}" data-iso="${iso}">${d}</button>`)}
    pop.innerHTML=`<div class="ppc-head"><button type="button" data-nav="prev">‹</button><b>${monthNames[view.m-1]} ${view.y}</b><button type="button" data-nav="next">›</button></div><div class="ppc-week"><b>ش</b><b>ی</b><b>د</b><b>س</b><b>چ</b><b>پ</b><b>ج</b></div><div class="ppc-grid">${cells.join('')}</div>`;
    pop.querySelectorAll('.ppc-day').forEach(b=>b.onclick=()=>{original.value=b.dataset.iso;input.value=isoToJ(original.value);pop.hidden=true;original.dispatchEvent(new Event('change',{bubbles:true}));});
    pop.querySelector('[data-nav="prev"]').onclick=()=>{view.m--;if(view.m<1){view.m=12;view.y--}render()};
    pop.querySelector('[data-nav="next"]').onclick=()=>{view.m++;if(view.m>12){view.m=1;view.y++}render()};
  }
  input.onclick=()=>{render();pop.hidden=false};
  input.onblur=()=>{const iso=jToIso(input.value);if(iso){original.value=iso;input.value=isoToJ(iso);original.dispatchEvent(new Event('change',{bubbles:true}));}setTimeout(()=>{if(!wrap.contains(document.activeElement))pop.hidden=true},120)};
}
function init(){
  document.querySelectorAll('input[type="date"]').forEach(makePicker);
  const style=document.createElement('style');style.textContent=`.ppc-wrap{position:relative}.ppc-wrap>input{direction:ltr;text-align:center}.ppc-pop{position:absolute;z-index:9999;top:calc(100% - 7px);right:0;width:285px;background:#fff;border:1px solid #d6dbe5;border-radius:14px;padding:10px;box-shadow:0 14px 35px rgba(0,0,0,.16)}.ppc-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.ppc-head button{border:0;background:#eef2ff;border-radius:8px;width:34px;height:30px;cursor:pointer;font-size:20px}.ppc-week,.ppc-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}.ppc-week{font-size:11px;color:#667085;margin-bottom:4px}.ppc-day,.ppc-grid>span{height:30px}.ppc-day{border:0;border-radius:8px;background:#f8fafc;cursor:pointer;font:inherit}.ppc-day:hover,.ppc-day.selected{background:#4f46e5;color:#fff}.ppc-grid>span{display:block}@media(max-width:600px){.ppc-pop{position:fixed;left:12px;right:12px;bottom:12px;top:auto;width:auto}}`;document.head.appendChild(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.PersianPanelCalendar={isoToJ,jToIso,g2j,j2g};
})();