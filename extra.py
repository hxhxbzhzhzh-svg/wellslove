BCSS=r'''<style>
.rbs{display:grid;grid-template-columns:400px 1fr;gap:24px;align-items:start}@media(max-width:980px){.rbs{grid-template-columns:1fr}}
.pn{background:#fff;border:1px solid var(--line);border-radius:3px;padding:20px;margin-bottom:16px}.pn h3{font-size:15px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.pn input,.pn select,.pn textarea{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:3px;font:13.5px var(--sans);background:var(--paper);color:var(--ink);margin-bottom:10px}.pn textarea{min-height:70px;resize:vertical}.pn label{display:block;font-size:12.5px;font-weight:600;color:var(--ink2);margin-bottom:4px}
.en{border:1px dashed var(--line);padding:12px;margin-bottom:10px;border-radius:3px}.rm{font-size:11.5px;color:var(--rust);border:1px solid var(--rust);background:none;border-radius:3px;padding:4px 9px;cursor:pointer;margin-bottom:8px}
.sm{padding:6px 12px;font-size:12.5px}
#stage{background:var(--paper2);border:1px solid var(--line);padding:22px;display:flex;justify-content:center;overflow-x:auto}
#pv{background:#fff;width:100%;max-width:210mm;aspect-ratio:210/297;display:grid;grid-template-columns:33% 67%;box-shadow:0 4px 18px rgba(22,35,61,.12)}#pv.letter{max-width:216mm;aspect-ratio:216/279}
.sd{background:var(--ink);color:#F8FAFC;padding:26px 20px;font-size:12.5px}.sd h4{color:#F8FAFC;font:11px var(--mono);letter-spacing:.05em;opacity:.75;margin:18px 0 8px;text-transform:uppercase}.sd h4:first-child{margin-top:0}.sd p{margin:0 0 4px}.sd ul{margin:0;padding-left:16px}
.mn{padding:30px 32px;font-size:12.5px;color:#333}.mn h2{font-size:22px;text-transform:uppercase}.mn .ro{color:var(--brass);font-weight:600}.mn hr{border:0;border-top:2px solid var(--ink);margin:12px 0 16px}.mn h4{font:11px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--brass);margin:16px 0 6px}
.jh{display:flex;justify-content:space-between;font-weight:600}.jm{font-size:11.5px;color:var(--slate)}.mn ul{margin:4px 0 10px;padding-left:16px}.ph{width:88px;height:88px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 14px}
@media print{html{-webkit-print-color-adjust:exact;print-color-adjust:exact}body *{visibility:hidden}#pv,#pv *{visibility:visible}#pv{position:absolute;top:0;left:0;width:210mm;max-width:none;aspect-ratio:auto;min-height:297mm;box-shadow:none}#pv.letter{width:216mm;min-height:279mm}}
</style>'''
BODY=head("CV &amp; Resume Builder","Build a two-column, ATS-friendly CV. US/UK/CA/AU (no photo) or Europass (photo). Runs in your browser; export to PDF.")+'''
<div class="rbs"><div>
<div class="pn"><h3>Region &amp; format</h3><label>Target region</label><select id="region"><option value="intl">US / UK / Canada / Australia (no photo)</option><option value="eu">Europe / Europass (photo allowed)</option></select>
<label>Page size</label><select id="fmt"><option value="a4">A4</option><option value="letter">US Letter</option></select><label>Profile photo (EU only)</label><input type="file" id="photo" accept="image/*"></div>
<div class="pn"><h3>Contact</h3><label>Full name</label><input id="f_name" placeholder="John Morgan"><label>Target job title</label><input id="f_title" placeholder="Financial Analyst"><label>Email</label><input id="f_email"><label>Phone</label><input id="f_phone"><label>City, Country</label><input id="f_loc"><label>LinkedIn / GitHub</label><input id="f_links"></div>
<div class="pn"><h3>Summary</h3><textarea id="f_summary" placeholder="2-3 sentence professional summary"></textarea></div>
<div class="pn"><h3>Experience <button class="btn o sm" type="button" onclick="addE('exp')">+ Add</button></h3><div id="lExp"></div></div>
<div class="pn"><h3>Education <button class="btn o sm" type="button" onclick="addE('edu')">+ Add</button></h3><div id="lEdu"></div></div>
<div class="pn"><h3>Skills</h3><label>Technical (comma-separated)</label><input id="f_tech"><label>Soft skills (comma-separated)</label><input id="f_soft"></div>
<div class="pn"><h3>Languages <button class="btn o sm" type="button" onclick="addE('lang')">+ Add</button></h3><div id="lLang"></div></div>
<div class="pn"><h3>Check this CV</h3><p class="note">Your CV is saved in this browser and can be loaded into the ATS Checker.</p><a class="btn" href="ats-checker.html">Open ATS Checker</a></div></div>
<div><div class="pn" style="display:flex;justify-content:space-between;align-items:center"><label style="margin:0"><input type="checkbox" id="show" disabled style="width:auto;margin:0 6px 0 0"> Show photo</label><button class="btn" type="button" onclick="expPdf()">Download PDF</button></div>
<div id="stage"><div id="pv"></div></div></div></div>'''
BJS=r'''<script>
(function(){var $=function(i){return document.getElementById(i)};
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML.replace(/"/g,'&quot;')}
var S=null;try{S=JSON.parse(localStorage.getItem('wl_cv'))}catch(e){}
S=S||{region:'intl',fmt:'a4',show:false,name:'',title:'',email:'',phone:'',loc:'',links:'',summary:'',tech:'',soft:'',exp:[{company:'',role:'',period:'',bullets:''}],edu:[{years:'',school:'',degree:''}],lang:[{name:'',level:''}]};
var photo='';function save(){try{localStorage.setItem('wl_cv',JSON.stringify(S))}catch(e){}}
['name','title','email','phone','loc','links','summary','tech','soft'].forEach(function(k){var el=$('f_'+k);el.value=S[k]||'';el.oninput=function(){S[k]=el.value;prev()}});
$('region').value=S.region;$('fmt').value=S.fmt;$('show').disabled=S.region!=='eu';
$('region').onchange=function(){S.region=this.value;$('show').disabled=S.region!=='eu';if(S.region!=='eu'){S.show=false;$('show').checked=false}prev()};
$('fmt').onchange=function(){S.fmt=this.value;prev()};$('show').onchange=function(){S.show=this.checked;prev()};
$('photo').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(v){photo=v.target.result;prev()};r.readAsDataURL(f)};
var L={exp:{id:'lExp',f:[['company','Company'],['role','Role'],['period','Period / location (e.g. 06/2023 - Present, London)'],['bullets','Bullets (one per line)',1]]},edu:{id:'lEdu',f:[['years','Years (e.g. 2018 - 2022)'],['school','School'],['degree','Degree / field']]},lang:{id:'lLang',f:[['name','Language'],['level','Level (B2, Native)']]}};
function form(){for(var k in L){$(L[k].id).innerHTML=S[k].map(function(e,i){return '<div class="en"><button type="button" class="rm" onclick="rmE(\''+k+'\','+i+')">Remove</button>'+L[k].f.map(function(f){return '<label>'+f[1]+'</label>'+(f[2]?'<textarea data-k="'+k+'" data-i="'+i+'" data-f="'+f[0]+'">'+esc(e[f[0]])+'</textarea>':'<input data-k="'+k+'" data-i="'+i+'" data-f="'+f[0]+'" value="'+esc(e[f[0]])+'">')}).join('')+'</div>'}).join('')}
document.querySelectorAll('[data-k]').forEach(function(el){el.oninput=function(){S[el.dataset.k][el.dataset.i][el.dataset.f]=el.value;prev()}})}
window.addE=function(k){S[k].push(k==='exp'?{company:'',role:'',period:'',bullets:''}:k==='edu'?{years:'',school:'',degree:''}:{name:'',level:''});form();prev()};
window.rmE=function(k,i){S[k].splice(i,1);form();prev()};
function prev(){save();var p=$('pv');p.className=S.fmt==='letter'?'letter':'';var tech=S.tech.split(',').map(function(s){return s.trim()}).filter(Boolean),soft=S.soft.split(',').map(function(s){return s.trim()}).filter(Boolean);
var ph=(S.region==='eu'&&S.show&&photo)?'<img class="ph" src="'+photo+'" alt="">':'';
p.innerHTML='<div class="sd">'+ph+'<h4>Contact</h4><p>'+esc(S.phone)+'</p><p>'+esc(S.email)+'</p><p>'+esc(S.loc)+'</p><p>'+esc(S.links)+'</p><h4>Education</h4>'+S.edu.map(function(e){return '<p><strong>'+esc(e.years)+'</strong><br>'+esc(e.school)+'<br>'+esc(e.degree)+'</p>'}).join('')+'<h4>Skills</h4><ul>'+tech.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ul>'+(soft.length?'<p style="margin-top:8px">'+soft.map(esc).join(' · ')+'</p>':'')+'<h4>Languages</h4>'+S.lang.map(function(l){return '<p>'+esc(l.name)+' <span style="opacity:.7">['+esc(l.level)+']</span></p>'}).join('')+'</div>'+
'<div class="mn"><h2>'+(esc(S.name)||'YOUR NAME')+'</h2><div class="ro">'+esc(S.title)+'</div><hr><h4>Summary</h4><p>'+esc(S.summary)+'</p><h4>Experience</h4>'+S.exp.map(function(j){return '<div><div class="jh"><span>'+esc(j.role)+'</span><span>'+esc(j.period)+'</span></div><div class="jm">'+esc(j.company)+'</div><ul>'+j.bullets.split('\n').filter(Boolean).map(function(b){return '<li>'+esc(b)+'</li>'}).join('')+'</ul></div>'}).join('')+'</div>'}
window.expPdf=function(){var t=$('pgsz');if(!t){t=document.createElement('style');t.id='pgsz';document.head.appendChild(t)}t.textContent='@page{size:'+(S.fmt==='letter'?'letter':'A4')+';margin:0}';window.print()};
form();prev()})();</script>'''
page("resume-builder.html","CV & Resume Builder","Free two-column CV builder with US/UK and Europass formats and PDF export.",'<section class="section"><div class="wrap">'+BCSS+BODY+'</div></section>',"resume-builder.html",BJS)

ACSS='''<style>.ab{height:8px;border-radius:4px;background:var(--paper2);overflow:hidden;margin:4px 0 12px}.ab i{display:block;height:100%;background:var(--forest)}.ab.w i{background:var(--brass)}.ab.l i{background:var(--rust)}
.ar{display:flex;justify-content:space-between;font-size:13.5px;font-weight:600}.big{font:700 56px var(--serif)}.ck{font-size:13.5px;padding:7px 0;border-bottom:1px dashed var(--line);color:var(--ink2)}.ck.ok:before{content:"✓ ";color:var(--forest);font-weight:700}.ck.no:before{content:"✗ ";color:var(--rust);font-weight:700}.ck.wn:before{content:"! ";color:var(--brass);font-weight:700}
.kw{display:inline-block;font:11px var(--mono);padding:3px 9px;border-radius:12px;margin:0 6px 6px 0}.kw.g{background:var(--forest-lt);color:var(--forest)}.kw.r{background:var(--rust-lt);color:var(--rust)}
.ab2{display:grid;grid-template-columns:1fr 1fr;gap:24px}@media(max-width:900px){.ab2{grid-template-columns:1fr}}.in textarea,.in input{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:3px;font:14px var(--sans);background:#fff;margin-bottom:12px}.in textarea{min-height:240px;resize:vertical}.in label{display:block;font-size:13px;font-weight:600;margin-bottom:5px}
.dz{position:relative;display:block;border:1.5px dashed var(--line);background:var(--paper);border-radius:3px;padding:18px 14px;text-align:center;cursor:pointer;margin-bottom:14px;transition:.15s}.dz:hover,.dz.on,.dz:focus-within{border-color:var(--forest);background:var(--forest-lt)}.dz input{position:absolute;opacity:0;width:1px;height:1px}.dz b{display:block;font-size:14.5px;margin-bottom:3px}.dz span{display:block;font-size:13px;color:var(--ink2)}.dz em{display:block;font-size:11.5px;color:var(--slate);font-style:normal;margin-top:6px}
.pf{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:14px 0}.pf div{background:var(--paper);border:1px solid var(--line);padding:10px 12px;border-radius:3px;font-size:13px}.pf b{display:block;font:700 18px var(--serif)}</style>'''
AB=head("Professional ATS Resume Analyzer","Upload your own resume (PDF, Word .docx or TXT) or paste its text, and optionally add a job description. The analyzer scores work experience, job titles, employers, education, certifications, keywords and impact, and runs entirely in your browser.")+'''
<div class="ab2"><div class="in"><label for="tt">Target job title</label><input id="tt" placeholder="e.g. Financial Analyst">
<label>Your resume file</label><label class="dz" id="dz" for="cvf"><input type="file" id="cvf" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"><b>Upload a resume</b><span>Drop a PDF, DOCX or TXT file here, or click to browse (max 10 MB)</span><em>The file is read in your browser and is never uploaded to our servers.</em></label>
<label for="rt">Resume text (or paste it here)</label><textarea id="rt" placeholder="Paste your full resume here (include section headings like Experience, Education, Skills and date ranges like Jan 2021 - Present)"></textarea>
<label for="jd">Job description (optional, recommended)</label><textarea id="jd" style="min-height:140px" placeholder="Paste the job posting to measure keyword match"></textarea>
<div class="acts" style="margin:0"><button class="btn" id="go" type="button">Analyze Resume</button><button class="btn o" id="ld" type="button">Load from CV Builder</button><a class="btn o" href="resume-builder.html">Open CV Builder</a></div><p class="note" id="msg"></p></div>
<div class="card" id="res"><p style="color:var(--slate)">Your score and detailed report will appear here.</p></div></div>
<div class="art" style="margin-top:36px"><h2>How the score is calculated</h2><p>Experience 25%, Keyword match 25% (15% without a job description, redistributed), Impact 20%, Education &amp; certifications 15%, Structure 10%, Format 5%. Experience considers total years (merged date ranges), relevance of titles to your target, seniority and progression, employment gaps, average tenure and recognized employers. Education rewards the highest degree, additional degrees, recognized institutions and professional certifications (CFA, CPA, PMP and others).</p>
<p class="note">This is a heuristic estimate. Real ATS products differ, and the employer and university lists are built-in and not exhaustive. Use the report as guidance, not a guarantee.</p></div>'''
AJS=r'''<script>
(function(){var $=function(i){return document.getElementById(i)};
function esc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}
var ST=new Set("the and for with that this from have has are was were will your you about into their our they not but can all any more who which such than then also been being over under per via using use used within across including must should would could their them its out able work working experience years year required requirements preferred ability strong role team company job candidate seek seeks seeking skill skills strong looking join ideal plus knowledge understanding excellent good great etc".split(" "));
var VB="led managed built launched designed delivered implemented automated reduced increased architected drove shipped scaled improved developed created coordinated streamlined executed achieved generated initiated resolved trained negotiated analyzed optimized spearheaded established mentored forecasted modeled advised secured closed owned grew cut saved".split(" ");
var WK=[/responsible for/gi,/helped with/gi,/worked on/gi,/assisted with/gi,/involved in/gi,/duties included/gi,/in charge of/gi,/familiar with/gi];
var CO="goldman sachs,morgan stanley,jpmorgan,j.p. morgan,citigroup,citi,bank of america,barclays,ubs,credit suisse,deutsche bank,blackstone,kkr,carlyle,apollo,blackrock,mckinsey,bain,boston consulting,bcg,deloitte,pwc,pricewaterhousecoopers,ernst & young,kpmg,google,alphabet,microsoft,amazon,apple,meta,facebook,netflix,nvidia,tesla,ibm,oracle,salesforce,jane street,citadel,two sigma,bloomberg,visa,mastercard,american express,hsbc,wells fargo,lazard,evercore,rothschild,openai,anthropic,stripe,jpmorgan chase".split(",");
var UN="harvard,massachusetts institute of technology,mit,stanford,princeton,yale,columbia,university of pennsylvania,wharton,university of chicago,caltech,oxford,cambridge,imperial college,london school of economics,lse,eth zurich,duke,cornell,berkeley,new york university,nyu,ucl,insead,london business school".split(",");
var CE=["cfa","cpa","frm","pmp","cfp","acca","caia","cisa","cissp","six sigma","aws certified","scrum master","series 7","series 63","chartered"];
var SK="excel,sql,python,r,java,javascript,react,aws,azure,tableau,power bi,powerpoint,financial modeling,valuation,data analysis,project management,sap,salesforce,git,machine learning,accounting,budgeting,forecasting,bloomberg,vba,leadership,communication,stakeholder,negotiation,presentation".split(",");
var SN=[["intern",0],["trainee",0],["junior",1],["assistant",1],["analyst",2],["associate",2],["specialist",2],["engineer",2],["consultant",2],["senior",3],["lead",4],["manager",4],["principal",4],["head of",5],["director",5],["vice president",5],["vp",5],["chief",6],["cfo",6],["ceo",6],["cto",6]];
var MO="jan feb mar apr may jun jul aug sep oct nov dec".split(" ");
function has(t,w){return new RegExp("(^|[^a-z0-9])"+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"([^a-z0-9]|$)","i").test(t)}
function lvl(t){var m=-1;SN.forEach(function(s){if(has(t,s[0])&&s[1]>m)m=s[1]});return m}
function idx(mn,nm,y,d){var m=mn?MO.indexOf(mn.slice(0,3).toLowerCase()):(nm?Math.min(11,Math.max(0,+nm-1)):d);return +y*12+m}
function sections(txt){var lines=txt.split(/\r?\n/),cur="top",o={top:[]},H=/^(work experience|professional experience|employment history|employment|experience|education|academic background|skills|technical skills|core competencies|summary|professional summary|profile|certifications?|licenses|languages|projects)\s*:?$/i;
lines.forEach(function(l){var t=l.trim();if(H.test(t)){var k=t.toLowerCase();cur=/exp|employ/.test(k)?"exp":/edu|academic/.test(k)?"edu":/skill|compet/.test(k)?"skills":/summ|profile/.test(k)?"sum":/cert|licen/.test(k)?"cert":k;o[cur]=o[cur]||[]}else{(o[cur]=o[cur]||[]).push(l)}});return o}
function run(){var txt=$("rt").value,jd=$("jd").value,tt=$("tt").value.trim().toLowerCase();
if(txt.trim().split(/\s+/).length<40){$("msg").textContent="Please paste a fuller resume (at least ~40 words).";return}$("msg").textContent="";
var S=sections(txt),low=txt.toLowerCase(),hasExp=!!S.exp,hasEdu=!!S.edu,expLines=hasExp?S.exp:txt.split(/\n/),expTxt=expLines.join("\n"),eduTxt=(S.edu||[]).join("\n");
var now=new Date(),nowI=now.getFullYear()*12+now.getMonth();
var R=/(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+|(\d{1,2})[\/.])?((?:19|20)\d{2})\s*(?:-|–|—|to|until)\s*(?:(present|current|now|today)|(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+|(\d{1,2})[\/.])?((?:19|20)\d{2}))/gi;
var roles=[],m;
expLines.forEach(function(l,i){R.lastIndex=0;while((m=R.exec(l))){var a=idx(m[1],m[2],m[3],0),b=m[4]?nowI:idx(m[5],m[6],m[7],11);if(b>=a&&b-a<600){var ctx=[expLines[i-1]||"",l,expLines[i+1]||""].join(" ");roles.push({a:a,b:Math.min(b,nowI),ctx:ctx,cur:!!m[4]})}}});
var iv=roles.slice().sort(function(x,y){return x.a-y.a}),tot=0,gaps=0,end=null;iv.forEach(function(r){if(end===null){tot+=r.b-r.a;end=r.b}else{if(r.a>end){if(r.a-end>6)gaps++;tot+=r.b-r.a;end=r.b}else if(r.b>end){tot+=r.b-end;end=r.b}}});
var yrs=tot/12,avgT=roles.length?roles.reduce(function(s,r){return s+(r.b-r.a)},0)/roles.length/12:0;
var cos=[];CO.forEach(function(c){if(has(expTxt,c)&&cos.indexOf(c)<0)cos.push(c)});
var recent=roles.slice().sort(function(x,y){return y.b-x.b})[0],levels=roles.slice().sort(function(x,y){return y.a-x.a}).map(function(r){return lvl(r.ctx)}).filter(function(v){return v>=0});
var prog=levels.length>1&&levels[0]>levels[levels.length-1],topL=levels.length?Math.max.apply(null,levels):-1;
var tm=0;if(tt){var tk=tt.split(/\s+/).filter(function(w){return w.length>2&&!ST.has(w)});var hit=tk.filter(function(w){return has(roles.map(function(r){return r.ctx}).join(" ").toLowerCase()+" "+((S.sum||[]).join(" ")+" "+(S.top||[]).slice(0,4).join(" ")).toLowerCase(),w)}).length;tm=tk.length?hit/tk.length:0}
var ex=[],exS=0;
exS+=Math.min(40,yrs*5);ex.push([yrs>=3?"ok":yrs>0?"wn":"no","Total experience: "+yrs.toFixed(1)+" years across "+roles.length+" dated role(s)"]);
if(tt){exS+=tm*20;ex.push([tm>=.67?"ok":tm>0?"wn":"no","Title relevance to \""+$("tt").value.trim()+"\": "+Math.round(tm*100)+"%"])}else{exS+=10;ex.push(["wn","Add a target job title to measure title relevance"])}
var sp=Math.max(0,topL)*2+(prog?5:0);exS+=Math.min(15,sp);ex.push([prog?"ok":roles.length>1?"wn":"no",prog?"Career progression detected (increasing seniority)":"No clear upward seniority progression detected"]);
exS+=Math.min(15,cos.length*8);ex.push([cos.length?"ok":"wn",cos.length?"Recognized employer(s): "+cos.join(", "):"No recognized major employer detected"]);
if(avgT>=1.5){exS+=5;ex.push(["ok","Average tenure "+avgT.toFixed(1)+" years (stable)"])}else if(roles.length)ex.push(["wn","Average tenure "+avgT.toFixed(1)+" years (short stints can read as job-hopping)"]);
exS+=gaps?0:5;ex.push([gaps?"wn":"ok",gaps?gaps+" employment gap(s) over 6 months; explain them briefly":"No employment gaps over 6 months"]);
if(!roles.length){exS=Math.min(exS,15);ex.push(["no","No date ranges found. Use formats like \"Jan 2021 - Present\" for each role"])}exS=Math.min(100,exS);
var dg=[[/ph\.?d|doctor(ate)?|dphil/i,70,"PhD"],[/\bmba\b|master|m\.?sc|\bm\.?a\.?\b|\bm\.?s\.?\b|meng|llm/i,60,"Master's/MBA"],[/bachelor|b\.?sc|\bb\.?a\.?\b|\bb\.?s\.?\b|beng|undergraduate|llb/i,45,"Bachelor's"],[/associate/i,25,"Associate"],[/diploma|certificate/i,15,"Diploma"]];
var eL=(S.edu||txt.split(/\n/)),found=[],cnt=0,best=0;eL.forEach(function(l){for(var i=0;i<dg.length;i++){if(dg[i][0].test(l)){cnt++;if(found.indexOf(dg[i][2])<0)found.push(dg[i][2]);if(dg[i][1]>best)best=dg[i][1];break}}});
var uni=UN.filter(function(u){return has(eduTxt||low,u)}),cert=CE.filter(function(c){return has(low,c)}),gpa=(low.match(/gpa[:\s]*([0-4]\.\d+)/)||[])[1];
var edS=best+Math.min(24,Math.max(0,cnt-1)*12)+(uni.length?12:0)+Math.min(16,cert.length*8)+(gpa&&+gpa>=3.5?4:0);edS=Math.min(100,edS);var ed=[];
ed.push([best?"ok":"no",best?"Degrees found: "+cnt+" ("+found.join(", ")+")":"No degree detected; list degree and institution"]);
ed.push([cnt>1?"ok":"wn",cnt>1?"Multiple degrees strengthen the profile":"Consider adding further degrees or advanced study if you have them"]);
ed.push([uni.length?"ok":"wn",uni.length?"Recognized institution: "+uni.join(", "):"No top-tier institution recognized (not a requirement)"]);
ed.push([cert.length?"ok":"wn",cert.length?"Certifications: "+cert.join(", ").toUpperCase():"No professional certifications (CFA, CPA, PMP etc.) found"]);if(gpa)ed.push([+gpa>=3.5?"ok":"wn","GPA "+gpa]);
var words=function(t){return (t.toLowerCase().match(/[a-z][a-z+#]{2,}/g)||[])};var rset=new Set(words(txt).map(function(w){return w.replace(/s$/,"")}));
var kw=[],kwS=0,hasJD=jd.trim().length>40,kg=[],kr=[];
if(hasJD){var f={};words(jd).forEach(function(w){w=w.replace(/s$/,"");if(!ST.has(w)&&w.length>3)f[w]=(f[w]||0)+1});SK.forEach(function(s){if(has(jd.toLowerCase(),s))f[s]=(f[s]||0)+3});
kw=Object.keys(f).sort(function(a,b){return f[b]-f[a]}).slice(0,30);kw.forEach(function(w){(rset.has(w)||has(low,w)?kg:kr).push(w)});kwS=Math.round(kg.length/Math.max(1,kw.length)*100)}
else{SK.forEach(function(s){(has(low,s)?kg:kr).push(s)});kwS=Math.min(100,Math.round(kg.length/10*100));kr=kr.slice(0,8)}
var bl=expLines.map(function(l){return l.trim()}).filter(function(l){return /^[-•*·▪–]/.test(l)||(l.split(/\s+/).length>=7&&!R.test(l)&&(R.lastIndex=0,true))}).map(function(l){return l.replace(/^[-•*·▪–\s]+/,"")});
var mR=/\d+(\.\d+)?\s?%|\$\s?\d|€\s?\d|£\s?\d|\b\d+[kKmMbB]\b|\b\d+x\b|\b\d{2,}\b/,mh=bl.filter(function(b){return mR.test(b)}).length,vh=bl.filter(function(b){return VB.indexOf((b.split(/\s+/)[0]||"").toLowerCase().replace(/[^a-z]/g,""))>=0}).length,wk=WK.reduce(function(n,r){return n+(txt.match(r)||[]).length},0);
var mp=bl.length?mh/bl.length*100:0,vp=bl.length?vh/bl.length*100:0,imS=Math.max(0,Math.min(100,Math.round(Math.min(100,mp*1.4)*.5+Math.min(100,vp*1.2)*.4+(bl.length>=6?10:bl.length*1.5)-wk*6)));
var im=[[mp>=50?"ok":mp>=25?"wn":"no","Quantified bullets: "+mh+" of "+bl.length+" ("+Math.round(mp)+"%). Aim for 50%+"],[vp>=60?"ok":"wn","Bullets starting with strong action verbs: "+vh+" of "+bl.length],[wk?"no":"ok",wk?wk+" passive phrase(s) such as \"responsible for\"":"No weak or passive phrases"],[bl.length>=6?"ok":"wn","Detected "+bl.length+" achievement bullet(s); 3-5 per role is ideal"]];
var em=/[\w.+-]+@[\w-]+\.[\w.]+/.test(txt),ph=/(\+?\d[\d\s().-]{8,}\d)/.test(txt),li=/linkedin\.com|github\.com/i.test(txt),sc=0,st=[];
[[hasExp||roles.length>0,20,"Experience section"],[hasEdu||best>0,20,"Education section"],[!!S.skills||kg.length>2,20,"Skills section"],[em,15,"Email address"],[ph,10,"Phone number"],[li,10,"LinkedIn/GitHub link"],[!!S.sum,5,"Summary/Profile section"]].forEach(function(c){if(c[0])sc+=c[1];st.push([c[0]?"ok":(c[1]>=15?"no":"wn"),c[2]+(c[0]?" found":" missing")])});
var wc=txt.trim().split(/\s+/).length,pr=(txt.match(/\b(I|my|me)\b/g)||[]).length,fm=100,ft=[];
if(wc<350){fm-=35;ft.push(["wn","Length "+wc+" words: short; aim for 400-900"])}else if(wc>1000){fm-=25;ft.push(["wn","Length "+wc+" words: long; aim for 1-2 pages"])}else ft.push(["ok","Length "+wc+" words is in the ideal range"]);
if(pr>3){fm-=15;ft.push(["wn","Avoid first-person pronouns ("+pr+" found)"])}else ft.push(["ok","No first-person pronouns"]);
if(/[│┃║■□★☆♦◆]|\t{2,}/.test(txt)){fm-=15;ft.push(["wn","Special symbols or tab columns may break ATS parsing"])}else ft.push(["ok","No parsing-hostile symbols"]);fm=Math.max(0,fm);
var W=hasJD?{ex:25,kw:25,im:20,ed:15,st:10,ft:5}:{ex:30,kw:15,im:25,ed:15,st:10,ft:5};
var all=Math.round((exS*W.ex+kwS*W.kw+imS*W.im+edS*W.ed+sc*W.st+fm*W.ft)/100),g=all>=85?"Excellent":all>=70?"Good":all>=50?"Fair":"Needs work",cl=all>=70?"":all>=50?"w":"l";
function bar(n,v,w){return '<div class="ar"><span>'+n+' ('+w+'%)</span><span>'+Math.round(v)+'</span></div><div class="ab '+(v>=70?'':v>=50?'w':'l')+'"><i style="width:'+v+'%"></i></div>'}
function lst(a){return a.map(function(c){return '<div class="ck '+c[0]+'">'+esc(c[1])+'</div>'}).join("")}
var fx=[];[ex,ed,im,st,ft].forEach(function(a){a.forEach(function(c){if(c[0]==="no")fx.push(c)})});
$("res").innerHTML='<div class="big">'+all+'<span style="font-size:18px;color:var(--slate)">/100</span></div><div class="badge '+(all>=70?'high':all>=50?'moderate':'low')+'" style="margin:0 0 16px">'+g+' ATS match'+(hasJD?' (with job description)':' (no job description)')+'</div>'+
'<div class="pf"><div><b>'+yrs.toFixed(1)+'</b>years of experience</div><div><b>'+roles.length+'</b>roles detected</div><div><b>'+(cnt||0)+'</b>degrees</div><div><b>'+(cos.length+uni.length+cert.length)+'</b>employer/school/cert signals</div></div>'+
bar("Work experience",exS,W.ex)+lst(ex)+bar("Keyword match",kwS,W.kw)+'<div style="margin:6px 0 12px">'+kg.slice(0,18).map(function(k){return '<span class="kw g">'+esc(k)+'</span>'}).join("")+kr.slice(0,14).map(function(k){return '<span class="kw r">'+esc(k)+'</span>'}).join("")+'</div><p class="note">Green: found. Red: missing'+(hasJD?' from your resume but present in the job description.':' common skills.')+'</p>'+
bar("Impact of bullet points",imS,W.im)+lst(im)+bar("Education & certifications",edS,W.ed)+lst(ed)+bar("Structure & contacts",sc,W.st)+lst(st)+bar("Format",fm,W.ft)+lst(ft)+
(fx.length?'<h3 style="margin:18px 0 8px;font-size:17px;color:var(--rust)">Priority fixes</h3>'+lst(fx):'')}

var CDN="https://cdnjs.cloudflare.com/ajax/libs/",LIBS={pdf:CDN+"pdf.js/3.11.174/pdf.min.js",mam:CDN+"mammoth/1.6.0/mammoth.browser.min.js"},PDFW=CDN+"pdf.js/3.11.174/pdf.worker.min.js",loaded={};
function msg(t){$("msg").textContent=t}
function loadLib(k,label){if(loaded[k])return loaded[k];return loaded[k]=new Promise(function(ok,no){var s=document.createElement("script");s.src=LIBS[k];s.onload=ok;s.onerror=function(){delete loaded[k];no(new Error("Could not load the "+label+" reader. Check your connection or paste the text instead."))};document.head.appendChild(s)})}
function linesFrom(segs){var a=segs.slice().sort(function(x,y){return y.y-x.y||x.x0-y.x0}),rows=[];a.forEach(function(g){var r=rows[rows.length-1];if(r&&Math.abs(r.y-g.y)<=3)r.g.push(g);else rows.push({y:g.y,g:[g]})});return rows.map(function(r){return r.g.sort(function(x,y){return x.x0-y.x0}).map(function(g){return g.s}).join("  ")})}
function pageToText(pg){return pg.getTextContent().then(function(tc){var W=pg.getViewport({scale:1}).width,its=tc.items.filter(function(i){return i.str&&i.str.trim()}).map(function(i){return{s:i.str,x:i.transform[4],y:i.transform[5],w:i.width||0,h:Math.abs(i.height)||10}});
its.sort(function(a,b){return b.y-a.y||a.x-b.x});var rows=[];its.forEach(function(it){var r=rows[rows.length-1];if(r&&Math.abs(r.y-it.y)<Math.max(2,it.h*.4))r.p.push(it);else rows.push({y:it.y,p:[it]})});
var segs=[];rows.forEach(function(r){r.p.sort(function(a,b){return a.x-b.x});var c=null;r.p.forEach(function(it){if(c&&it.x-c.x1<=Math.max(18,it.h*2.5)){c.s+=(it.x-c.x1>it.h*.15?" ":"")+it.s;c.x1=it.x+it.w}else{c={s:it.s,x0:it.x,x1:it.x+it.w,y:r.y};segs.push(c)}})});
var tot=segs.reduce(function(n,g){return n+g.s.length},0),cut=null;
for(var gx=W*.2;gx<=W*.8&&cut===null;gx+=4){var L=[],R=[],X=0;segs.forEach(function(g){if(g.x1<=gx)L.push(g);else if(g.x0>=gx)R.push(g);else X++});
var lc=L.reduce(function(n,g){return n+g.s.length},0),rc=R.reduce(function(n,g){return n+g.s.length},0);if(X<=2&&L.length>=6&&R.length>=6&&lc>=tot*.12&&rc>=tot*.12)cut=gx}
if(cut===null)return linesFrom(segs).join("\n");
var A=[],B=[];segs.forEach(function(g){(g.x0<cut?A:B).push(g)});var ac=A.reduce(function(n,g){return n+g.s.length},0),bc=B.reduce(function(n,g){return n+g.s.length},0);
return (ac>=bc?linesFrom(A).concat(linesFrom(B)):linesFrom(B).concat(linesFrom(A))).join("\n")})}
function readPdf(buf){return loadLib("pdf","PDF").then(function(){pdfjsLib.GlobalWorkerOptions.workerSrc=PDFW;return pdfjsLib.getDocument({data:buf}).promise}).then(function(doc){var out=[],p=Promise.resolve();for(var i=1;i<=Math.min(doc.numPages,10);i++)(function(n){p=p.then(function(){return doc.getPage(n)}).then(pageToText).then(function(t){out.push(t)})})(i);return p.then(function(){return out.join("\n")})}).catch(function(e){if(e&&e.name==="PasswordException")throw new Error("This PDF is password-protected. Remove the password and try again.");throw e})}
function htmlToLines(h){var d=new DOMParser().parseFromString(h.replace(/<br\s*\/?>/gi,"</p><p>"),"text/html"),out=[];function tx(n){return n.textContent.replace(/\s+/g," ").trim()}
function walk(n){Array.prototype.forEach.call(n.children,function(c){var t=c.tagName.toLowerCase();
if(t==="tr"){var cells=Array.prototype.map.call(c.children,function(td){var keep=out,sub=[];out=sub;walk(td);out=keep;if(!sub.length&&tx(td))sub.push(tx(td));return sub}).filter(function(s){return s.length});if(cells.length&&cells.every(function(s){return s.length===1}))out.push(cells.map(function(s){return s[0]}).join("  "));else cells.forEach(function(s){s.forEach(function(l){out.push(l)})})}
else if(t==="li"){var x=tx(c);if(x)out.push("\u2022 "+x)}
else if(/^(ul|ol|div|table|tbody|thead|section|td|th)$/.test(t))walk(c);
else{var y=tx(c);if(y)out.push(y)}})}
walk(d.body);return out}
function readDocx(buf){return loadLib("mam","Word").then(function(){return mammoth.convertToHtml({arrayBuffer:buf})}).then(function(r){return htmlToLines(r.value).join("\n")})}
function cleanTxt(t){return String(t).replace(/\r/g,"").replace(/[\u00a0\u2007\u202f]/g," ").replace(/[\uf000-\uf0ff\u25cf\u25aa\u2023\u2043]/g,"\u2022").replace(/[ \t]+$/gm,"").replace(/\n{3,}/g,"\n\n").trim()}
function ingest(f){if(!f)return;var ext=((f.name.toLowerCase().match(/\.([a-z0-9]+)$/)||[])[1])||"";
if(ext==="doc"){msg("Legacy .doc files are not supported. Save the file as .docx or PDF and upload it again.");return}
if(["pdf","docx","txt","md"].indexOf(ext)<0){msg("Unsupported file type. Please upload a PDF, DOCX or TXT file.");return}
if(f.size>10485760){msg("This file is larger than 10 MB.");return}
msg("Reading "+f.name+"...");
var p=ext==="pdf"?f.arrayBuffer().then(readPdf):ext==="docx"?f.arrayBuffer().then(readDocx):f.text();
p.then(function(t){t=cleanTxt(t);var wc=t.split(/\s+/).filter(Boolean).length;
if(wc<20){msg(ext==="pdf"?"No selectable text found. This looks like a scanned or image-only PDF, which ATS systems cannot read either. Export a text-based PDF from your editor, or paste the text.":"Very little text could be read from this file. Try another format or paste the text.");return}
$("rt").value=t;run();if(wc>=40)msg("Loaded "+f.name+" ("+wc+" words). Check the extracted text on the left; edit it if anything looks off and click Analyze again.")}).catch(function(e){msg((e&&e.message)||"Could not read this file. Try another format or paste the text.")})}
$("cvf").addEventListener("change",function(){var f=this.files&&this.files[0];ingest(f);this.value=""});
var dz=$("dz");["dragenter","dragover"].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.classList.add("on")})});
["dragleave","drop"].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.classList.remove("on")})});
dz.addEventListener("drop",function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];ingest(f)});
$("go").addEventListener("click",run);
$("ld").addEventListener("click",function(){var S=null;try{S=JSON.parse(localStorage.getItem("wl_cv"))}catch(e){}
if(!S||!S.name&&!S.summary&&!(S.exp&&S.exp[0]&&S.exp[0].role)){$("msg").textContent="No saved CV found. Fill it in on the CV Builder page first.";return}
var t=[S.name,S.title,S.email,S.phone,S.loc,S.links,"","Summary",S.summary,"","Experience"];(S.exp||[]).forEach(function(e){t.push(e.role+" - "+e.company);t.push(e.period);String(e.bullets||"").split("\n").filter(Boolean).forEach(function(b){t.push("• "+b)})});
t.push("","Education");(S.edu||[]).forEach(function(e){t.push(e.degree+", "+e.school);t.push(e.years)});t.push("","Skills",S.tech,S.soft,"","Languages");(S.lang||[]).forEach(function(l){t.push(l.name+" "+l.level)});
$("rt").value=t.join("\n");if(!$("tt").value)$("tt").value=S.title||"";$("msg").textContent="Loaded from CV Builder."});
})();</script>'''
page("ats-checker.html","Professional ATS Resume Analyzer","Score your resume on experience, titles, employers, degrees, certifications, keywords and impact.",'<section class="section"><div class="wrap">'+ACSS+AB+'</div></section>',"ats-checker.html",AJS)
