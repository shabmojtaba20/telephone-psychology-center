const fs=require('fs');
const path=require('path');
const root=__dirname;
const version=process.env.BUILD_VERSION||new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const files=['admin-professional.html','admin-v5.html','admin-invoices.html','finance-reports.html','finance-audit.html','consultant-settlements.html','consultant-panel-professional.html'];
for(const name of files){
 const file=path.join(root,name);if(!fs.existsSync(file))continue;
 let h=fs.readFileSync(file,'utf8');
 h=h.replace(/\s*<script[^>]+src=["']\/panel-persian-calendar\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');
 const tag=`<script src="/panel-persian-calendar.js?v=${version}"></script>`;
 h=h.includes('</head>')?h.replace('</head>',`\n<!-- panel-persian-calendar -->\n${tag}\n</head>`):h.replace('</body>',`\n<!-- panel-persian-calendar -->\n${tag}\n</body>`);
 if(name==='admin-v5.html'){
   const quick=`<script src="/finance-quick-access.js?v=${version}"></script>`;
   h=h.replace(/\s*<script[^>]+src=["']\/finance-quick-access\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');
   h=h.replace('</body>',`\n<!-- finance-quick-access -->\n${quick}\n</body>`);
 }
 fs.writeFileSync(file,h,'utf8');
}
console.log('PANEL BUILD: Persian calendar and finance shortcuts injected into management panels');
