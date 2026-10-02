import html, os
E=html.escape
OUT="/home/claude/site"
CATS={"roi":"College ROI & Finance","universities":"Top Universities","careers":"Career Paths & Internships"}
NAV=[("tools.html","Tools"),("roi-calculator.html","ROI Calculator"),("loan-calculator.html","Loan Calculator"),("pomodoro.html","Pomodoro"),("resume-builder.html","CV Builder"),("ats-checker.html","ATS Checker"),("category-universities.html","Top Universities"),("category-careers.html","Finance Careers"),("articles.html","Articles"),("about.html","About")]
CSS="""
:root{--ink:#16233D;--ink2:#2C3B57;--paper:#F6F3EC;--paper2:#EFEAE0;--line:#D9D2C3;--brass:#93702E;--forest:#2E5339;--forest-lt:#EAF0E7;--rust:#8A3B2E;--rust-lt:#F5E7E3;--slate:#5B6472;--serif:"Source Serif 4",Georgia,serif;--sans:"IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;--mono:"IBM Plex Mono","Courier New",monospace}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 var(--sans)}
a{color:inherit;text-decoration:none}h1,h2,h3,h4{font-family:var(--serif);margin:0;color:var(--ink)}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
.eyebrow{font:12.5px var(--mono);color:var(--brass)}.eyebrow:before{content:"§ "}
header{position:sticky;top:0;background:rgba(246,243,236,.95);border-bottom:1px solid var(--line);z-index:5}
.nav{display:flex;align-items:center;gap:24px;min-height:72px;flex-wrap:wrap}
.logo{font:700 22px var(--serif);display:flex;gap:10px;align-items:center}
.mark{width:34px;height:34px;border-radius:50%;background:var(--ink);color:var(--paper);display:flex;align-items:center;justify-content:center;border:1px solid var(--brass)}
.nav ul{display:flex;gap:20px;list-style:none;margin:0 0 0 auto;padding:0;flex-wrap:wrap}
.nav li a{font-size:14px;font-weight:500;color:var(--ink2);border-bottom:2px solid transparent;padding:4px 0}
.nav li a:hover,.nav li a.on{border-color:var(--brass)}
.btn{display:inline-block;padding:10px 20px;border-radius:3px;font-weight:600;font-size:14.5px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);cursor:pointer;font-family:inherit}
.btn.o{background:transparent;color:var(--ink)}.btn.o:hover{background:var(--ink);color:var(--paper)}
.hero{padding:70px 0 50px;border-bottom:1px solid var(--line)}.hero h1{font-size:clamp(32px,4.4vw,52px);line-height:1.1;max-width:780px;margin:12px 0}
.hero p{font-size:18px;color:var(--slate);max-width:600px}.acts{display:flex;gap:14px;margin-top:26px;flex-wrap:wrap}
.section{padding:56px 0}.sh{max-width:680px;margin-bottom:30px}.sh h1,.sh h2{font-size:clamp(26px,3vw,38px);margin-top:8px}.sh p{color:var(--slate)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}@media(max-width:900px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.grid{grid-template-columns:1fr}}
.card{background:#fff;border:1px solid var(--line);border-radius:3px;padding:22px;display:flex;flex-direction:column;gap:10px}.card:hover{border-color:var(--brass)}
.card h3{font-size:19px;line-height:1.3}.card p{margin:0;color:var(--slate);font-size:14.5px;flex:1}.tag{font:11.5px var(--mono);color:var(--brass)}.meta{font-size:12.5px;color:var(--slate);border-top:1px solid var(--line);padding-top:10px}
.chips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px}.chip{padding:8px 16px;border:1px solid var(--line);border-radius:20px;font-size:13.5px;font-weight:600;color:var(--slate);background:#fff}.chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.calc{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);background:#fff;border-radius:3px}@media(max-width:820px){.calc{grid-template-columns:1fr}}
.cf{padding:30px;border-right:1px solid var(--line)}.cr{padding:30px;background:var(--ink);color:var(--paper)}
.f{margin-bottom:18px}.f label{display:block;font-size:13.5px;font-weight:600;margin-bottom:6px;color:var(--ink2)}
.f input,.f select{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:3px;font:15px var(--sans);background:var(--paper);color:var(--ink)}
.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.15)}.row b{font:700 22px var(--serif)}
.badge{margin-top:20px;padding:14px;border-radius:3px;font-weight:700}.badge.high{background:var(--forest-lt);color:var(--forest)}.badge.moderate{background:#FBF1DC;color:var(--brass)}.badge.low{background:var(--rust-lt);color:var(--rust)}
.note{font-size:12px;color:var(--slate)}.cr .note{color:rgba(246,243,236,.65)}
.art{max-width:780px}.art p,.art li{color:var(--ink2)}.art h2{font-size:24px;margin:30px 0 10px}.art h3{font-size:20px;margin:24px 0 8px}
.rank{display:flex;gap:14px;padding:16px;border:1px solid var(--line);background:#fff;border-radius:3px;margin-bottom:12px}.rank span{font:700 24px var(--serif);color:var(--brass)}.rank p{margin:4px 0 0;font-size:14.5px}
.crumb{font-size:13px;color:var(--slate);margin-bottom:14px}.crumb a{text-decoration:underline}
.clock{font:500 clamp(64px,10vw,104px)/1 var(--mono);text-align:center;margin:20px 0}
footer{background:var(--ink);color:var(--paper);margin-top:40px}.fg{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px;padding:50px 0 30px}@media(max-width:820px){.fg{grid-template-columns:1fr 1fr}}
.fg h4{color:var(--paper);font:14px var(--mono);opacity:.75;margin-bottom:14px}.fg ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}.fg a{color:rgba(246,243,236,.8);font-size:14.5px}.fg a:hover{text-decoration:underline}
.fb{border-top:1px solid rgba(246,243,236,.15);padding:20px 0;font-size:13px;color:rgba(246,243,236,.6)}
@media(max-width:820px){.cf{border-right:0;border-bottom:1px solid var(--line)}}
"""
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">'
LEG=[("about","About Us"),("privacy","Privacy Policy"),("terms","Terms of Service"),("cookies","Cookie Policy"),("advertiser","Advertiser Disclosure"),("author","Author"),("editorial-policy","Editorial Policy"),("contact","Contact")]

def page(fn,title,desc,body,active="",script=""):
    nav="".join(f'<li><a href="{h}"{" class=on" if h==active else ""}>{t}</a></li>' for h,t in NAV)
    foot_l="".join(f'<li><a href="{k}.html">{t}</a></li>' for k,t in LEG)
    foot_c="".join(f'<li><a href="category-{k}.html">{v}</a></li>' for k,v in CATS.items())
    h=f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)} | Wells Love</title><meta name="description" content="{E(desc)}"><link rel="canonical" href="https://wellslove.com/{fn if fn!='index.html' else ''}">
<meta property="og:title" content="{E(title)} | Wells Love"><meta property="og:description" content="{E(desc)}">{FONTS}<link rel="stylesheet" href="style.css"></head><body>
<header><div class="wrap nav"><a href="index.html" class="logo"><span class="mark">W</span> Wells Love</a><ul>{nav}</ul></div></header>
<main>{body}</main>
<footer><div class="wrap fg"><div><a href="index.html" class="logo"><span class="mark">W</span> Wells Love</a><p style="color:rgba(246,243,236,.7);font-size:14.5px;max-width:280px">Free financial and career tools for students and young professionals.</p></div>
<div><h4>TOOLS</h4><ul><li><a href="roi-calculator.html">ROI Calculator</a></li><li><a href="loan-calculator.html">Loan Calculator</a></li><li><a href="pomodoro.html">Pomodoro Timer</a></li><li><a href="resume-builder.html">CV Builder</a></li><li><a href="ats-checker.html">ATS Checker</a></li><li><a href="articles.html">Article Library</a></li></ul></div>
<div><h4>CATEGORIES</h4><ul>{foot_c}</ul></div><div><h4>LEGAL</h4><ul>{foot_l}</ul></div></div>
<div class="wrap fb">© 2026 Wells Love. All content is educational and not financial, legal, or professional advice.</div></footer>{script}</body></html>'''
    open(f"{OUT}/{fn}","w",encoding="utf-8").write(h)

# ---------------- articles (core set) ----------------
A=[
dict(s="is-college-worth-it",t="Is College Still Worth It? A Data-Driven Look at Education ROI",c="roi",d="August 12, 2026",r="7 min read",
 x="We ran the numbers on tuition, opportunity cost, and lifetime earnings across popular majors.",
 b=["<p>Whether a degree pays off depends on three variables rankings tend to ignore: total cost after aid, time to complete, and the realistic starting salary for your major and region.</p><h2>Start with total cost, not tuition</h2><p>Add housing, books, lost income and loan interest, and the real number is often 30–50% above published tuition.</p><h2>Payback period is the metric that matters</h2><p>Calculate how many years of projected after-tax salary it takes to recoup the investment. Use the <a href=\"roi-calculator.html\">College ROI Calculator</a> with your own figures.</p><h2>The bottom line</h2><p>College remains a strong investment when major, cost and career path are aligned. The risk is attending without doing this arithmetic first.</p>"],items=[]),
dict(s="intern-to-analyst-career-path",t="From Intern to Analyst: A Realistic Career Path Timeline",c="careers",d="July 22, 2026",r="6 min read",
 x="What happens between your sophomore internship and your first full-time offer.",
 b=["<p>The path from student to analyst is more structured than most undergrads realize; missing an early step can close doors that are hard to reopen.</p><h2>Sophomore year: the diagnostic internship</h2><p>Many employers run sophomore programs that identify candidates a year before standard junior recruiting.</p><h2>Junior year: the internship that counts</h2><p>This is the main conversion pipeline to a full-time offer; performance and visible initiative outweigh GPA.</p><h2>Senior year and beyond</h2><p>If no return offer comes, the network you built is what generates a second chance.</p>"],items=[]),
dict(s="top-10-universities-world",t="Top 10 Universities in the World (2026 Edition)",c="universities",d="September 5, 2026",r="8 min read",
 x="An editorial look at ten of the world's most academically influential universities.",
 b=["<p>“Best in the world” depends on what you optimize for. This is Wells Love's own editorial list, not a scored index such as QS or THE.</p><p>Run your short list through the <a href=\"roi-calculator.html\">College ROI Calculator</a> before deciding.</p>"],
 items=[("MIT (USA)","Engineering, computer science, applied research."),("Stanford University (USA)","Silicon Valley startup and venture ecosystem."),("Harvard University (USA)","Law, business, research; deep alumni network."),("University of Oxford (UK)","Tutorial teaching; humanities, sciences, politics."),("University of Cambridge (UK)","Mathematics, natural sciences, engineering."),("Caltech (USA)","Physics, aerospace, applied science."),("ETH Zurich (Switzerland)","Engineering, CS, natural sciences."),("Imperial College London (UK)","Science, engineering, medicine, business."),("University of Chicago (USA)","Economics; discussion-driven curriculum."),("NUS (Singapore)","Asia's leading research university.")]),
dict(s="top-10-universities-usa",t="Top 10 Universities in the United States",c="universities",d="September 11, 2026",r="8 min read",
 x="Ten US universities with consistently strong reputations across engineering, business and the liberal arts.",
 b=["<p>Every school here has a high sticker price. Weigh total cost against realistic salary with the <a href=\"roi-calculator.html\">ROI Calculator</a>. Editorial list, not a third-party ranking.</p>"],
 items=[("MIT","Engineering, CS."),("Stanford","CS, entrepreneurship."),("Harvard","Law, business."),("Princeton","Economics, policy."),("Yale","Law, humanities."),("Caltech","Physics, engineering."),("University of Pennsylvania","Wharton business and finance."),("Columbia","Business, journalism."),("University of Chicago","Economics."),("Duke","Pre-med, public policy.")]),
dict(s="top-10-finance-specializations",t="Top 10 In-Demand Finance Specializations & Majors",c="roi",d="September 20, 2026",r="8 min read",
 x="“Finance” isn't one career: these ten specializations differ in skills, hours and entry path.",
 b=["<p>Talk to people working in a specialization before committing coursework to it, then plug the target salary into the <a href=\"roi-calculator.html\">ROI Calculator</a>. Compensation and hiring vary by firm and market.</p>"],
 items=[("Investment Banking & Corporate Finance","M&A and capital raising; high pay, long hours."),("Quantitative Finance","Math, statistics and programming for pricing and trading."),("Asset & Wealth Management","Portfolios for institutions or individuals."),("Private Equity & Venture Capital","Direct investing; usually post-IB."),("FinTech","Software behind payments, banking, trading."),("Risk Management","Credit, market and operational risk."),("Actuarial Science","Statistics for insurance; clear exam path."),("Real Estate Finance","Financing and analyzing property deals."),("Sustainable & ESG Finance","ESG factors in investment decisions."),("Corporate Development & Strategy","In-house M&A and capital allocation.")]),
]
def body_art(a):
    its="".join(f'<div class="rank"><span>{i}</span><div><h3>{E(n)}</h3><p>{E(d)}</p></div></div>' for i,(n,d) in enumerate(a["items"],1))
    return f'''<section class="section"><div class="wrap art"><p class="crumb"><a href="index.html">Home</a> / <a href="articles.html">Articles</a> / <a href="category-{a["c"]}.html">{E(CATS[a["c"]])}</a></p>
<p class="tag">{E(CATS[a["c"]])}</p><h1 style="font-size:clamp(28px,3.6vw,42px);line-height:1.15;margin:8px 0 14px">{E(a["t"])}</h1>
<p class="note">Wells Love Research Team · {a["d"]} · {a["r"]}</p>{its}{"".join(a["b"])}
<p class="note" style="margin-top:30px">Educational content only; not financial or professional advice.</p></div></section>'''
def card(a): return f'<a class="card" href="article-{a["s"]}.html"><span class="tag">{E(CATS[a["c"]])}</span><h3>{E(a["t"])}</h3><p>{E(a["x"])}</p><div class="meta">{a["r"]} · {a["d"]}</div></a>'
def listing(fn,title,desc,cur):
    chips=f'<a class="chip{" on" if cur is None else ""}" href="articles.html">All</a>'+"".join(f'<a class="chip{" on" if cur==k else ""}" href="category-{k}.html">{E(v)}</a>' for k,v in CATS.items())
    arts=[a for a in A if cur is None or a["c"]==cur]
    cards="".join(card(a) for a in arts) or '<p>No articles in this category yet.</p>'
    page(fn,title,desc,f'<section class="section"><div class="wrap"><div class="sh"><p class="eyebrow">GUIDES &amp; INSIGHTS</p><h1>{E(title)}</h1><p>{E(desc)}</p></div><div class="chips">{chips}</div><div class="grid">{cards}</div></div></section>',"articles.html" if cur is None else {"universities":"category-universities.html","careers":"category-careers.html"}.get(cur,"articles.html"))
exec(open("/home/claude/articles2.py",encoding="utf-8").read())
for a in A: page(f"article-{a['s']}.html",a["t"],a["x"],body_art(a),"articles.html")
listing("articles.html","Financial & Career Guides","Deep dives on college ROI, top universities and career paths.",None)
for k,v in CATS.items(): listing(f"category-{k}.html",v,f"Wells Love guides: {v}.",k)

# ---------------- tools ----------------
def head(t,p): return f'<div class="sh"><p class="eyebrow">INTERACTIVE TOOL</p><h1>{t}</h1><p>{p}</p></div>'
MAJ=[("Accounting",60000),("Computer Science",95000),("Economics",65000),("Education / Teaching",45000),("Electrical Engineering",75000),("Finance & Investment Banking",85000),("Healthcare/Nursing",72000),("Law (JD)",90000),("Marketing",55000),("Mechanical Engineering",72000),("Psychology",48000)]
opts="".join(f'<option value="{s}">{E(n)}</option>' for n,s in MAJ)
ROIJS="""<script>
(function(){var $=function(i){return document.getElementById(i)},T=.75;
function n(i,d){var v=parseFloat($(i).value);return isFinite(v)&&v>=0?v:d}
function f(x){return "$"+Math.round(x).toLocaleString("en-US")}
function run(){var c=n("annualCost",0),y=Math.max(1,n("years",1)),s=n("startSalary",0),tc=c*y,ni=s*T;
$("rTotalCost").textContent=f(tc);$("rNetIncome").textContent=f(ni);
var b=$("roiBadge"),t=$("roiBadgeText");b.className="badge";
if(ni<=0){$("rPayback").textContent="N/A";b.classList.add("low");t.textContent="Enter a salary above 0";return}
var p=tc/ni;$("rPayback").textContent=p.toFixed(1)+" yrs";
if(p<=4){b.classList.add("high");t.textContent="High ROI"}else if(p<=8){b.classList.add("moderate");t.textContent="Moderate ROI"}else{b.classList.add("low");t.textContent="Low ROI"}}
$("majorSelect").addEventListener("change",function(e){$("startSalary").value=e.target.value;run()});
["annualCost","years","startSalary"].forEach(function(i){$(i).addEventListener("input",run)});
$("calcBtn").addEventListener("click",run);run()})();</script>"""
roi=head("College ROI &amp; Salary Calculator","Enter your major, annual cost and starting salary to see your payback period.")+'''<div class="calc"><div class="cf">
<div class="f"><label for="majorSelect">Field of study</label><select id="majorSelect">'''+opts+'''</select><p class="note">Approximate US entry-level averages; they vary by employer and location.</p></div>
<div class="f"><label for="annualCost">Annual cost of tuition &amp; living ($)</label><input type="number" id="annualCost" value="42000" min="0" step="500"></div>
<div class="f"><label for="years">Years of study</label><input type="number" id="years" value="4" min="1" max="8"></div>
<div class="f"><label for="startSalary">Projected starting salary ($)</label><input type="number" id="startSalary" value="60000" min="0" step="500"></div>
<button class="btn" id="calcBtn" type="button" style="width:100%">Calculate ROI</button></div>
<div class="cr"><h3 style="color:#fff;font:500 15px var(--mono);opacity:.7">PROJECTED RESULTS</h3>
<div class="row"><span>Total cost</span><b id="rTotalCost">$168,000</b></div><div class="row"><span>Net income / year (after tax)</span><b id="rNetIncome">$45,000</b></div><div class="row"><span>Payback period</span><b id="rPayback">3.7 yrs</b></div>
<div class="badge high" id="roiBadge"><span id="roiBadgeText">High ROI</span></div></div></div>
<div class="art" style="margin-top:36px"><h2>How this calculator works</h2><p>Total cost = annual cost × years. Net income = 75% of gross salary (a flat simplified tax assumption). Payback = total cost ÷ net income. High ≤ 4 years, Moderate 4–8, Low &gt; 8. Results are estimates; they ignore aid, loan interest and real tax. See <a href="https://www.bls.gov/oes/" rel="nofollow noopener">BLS</a> and <a href="https://collegescorecard.ed.gov/" rel="nofollow noopener">College Scorecard</a> for data.</p>
<h2>FAQ</h2><h3>Is the result guaranteed?</h3><p>No. It is an estimate from the figures you enter.</p><h3>Does it model loan interest?</h3><p>No. Use the <a href="loan-calculator.html">Loan Calculator</a> for financing costs.</p></div>'''
page("roi-calculator.html","College ROI & Salary Calculator","Estimate college cost, after-tax income and payback period.",'<section class="section"><div class="wrap">'+roi+'</div></section>',"roi-calculator.html",ROIJS)

LJS="""<script>
(function(){var $=function(i){return document.getElementById(i)},sym="$";
function num(i){var v=parseFloat($(i).value);return isFinite(v)&&v>=0?v:0}
function m(x){return sym+Math.round(isFinite(x)?x:0).toLocaleString("en-US")}
function calc(){var P=num("loanAmount"),r=num("loanRate")/1200,u=$("loanUnit").value,n=num("loanTerm")*(u==="years"?12:1),pay=0;
if(n>0)pay=r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
var tot=pay*n;$("loanMonthly").textContent=m(pay);$("loanInterest").textContent=m(Math.max(0,tot-P));$("loanTotal").textContent=m(tot)}
$("loanCurrency").addEventListener("change",function(e){sym=e.target.value;calc()});
$("loanUnit").addEventListener("change",calc);
["loanAmount","loanRate","loanTerm"].forEach(function(i){$(i).addEventListener("input",calc)});
document.querySelectorAll("[data-p]").forEach(function(b){b.addEventListener("click",function(){var p=b.dataset.p.split(",");$("loanAmount").value=p[0];$("loanRate").value=p[1];$("loanTerm").value=p[2];$("loanUnit").value="years";calc()})});
calc()})();</script>"""
loan=head("Student Loan &amp; Personal Loan Calculator","Estimate monthly payment, total interest and total repayment.")+'''<div class="calc"><div class="cf">
<div class="f"><label for="loanCurrency">Currency symbol (no exchange rates applied)</label><select id="loanCurrency"><option value="$">USD $</option><option value="£">GBP £</option><option value="€">EUR €</option></select></div>
<div class="acts" style="margin:0 0 18px"><button type="button" class="btn o" data-p="25000,6.5,5">Car Loan</button><button type="button" class="btn o" data-p="35000,5.5,10">Student Loan</button><button type="button" class="btn o" data-p="10000,10.5,3">Personal Loan</button></div>
<div class="f"><label for="loanAmount">Loan amount</label><input type="number" id="loanAmount" value="25000" min="0" step="500"></div>
<div class="f"><label for="loanRate">Interest rate (APR, %)</label><input type="number" id="loanRate" value="6.5" min="0" max="35" step="0.1"></div>
<div class="f"><label for="loanTerm">Loan term</label><input type="number" id="loanTerm" value="5" min="1" max="360"></div>
<div class="f"><label for="loanUnit">Term unit</label><select id="loanUnit"><option value="years">Years</option><option value="months">Months</option></select></div></div>
<div class="cr"><h3 style="color:#fff;font:500 15px var(--mono);opacity:.7">LOAN SUMMARY</h3>
<div class="row"><span>Monthly payment</span><b id="loanMonthly">$489</b></div><div class="row"><span>Total interest</span><b id="loanInterest">$4,325</b></div><div class="row"><span>Total repaid</span><b id="loanTotal">$29,325</b></div>
<p class="note" style="margin-top:20px">Estimate for a fixed-rate amortizing loan with equal monthly payments. Not a loan offer.</p></div></div>'''
page("loan-calculator.html","Student Loan & Personal Loan Calculator","Free loan payment, interest and total repayment estimator.",'<section class="section"><div class="wrap">'+loan+'</div></section>',"loan-calculator.html",LJS)

PJS="""<script>
(function(){var W=1500,B=300,ph="work",rem=W,id=null,done=0,$=function(i){return document.getElementById(i)};
function fm(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function ui(){$("clock").textContent=fm(rem);$("mode").textContent=ph==="work"?"● WORK — 25 MIN":"● BREAK — 5 MIN";$("done").textContent=done;$("go").disabled=!!id;$("stop").disabled=!id}
function tick(){rem--;if(rem<=0){done+=ph==="work"?1:0;ph=ph==="work"?"break":"work";rem=ph==="work"?W:B}ui()}
$("go").onclick=function(){if(!id)id=setInterval(tick,1000);ui()};
$("stop").onclick=function(){clearInterval(id);id=null;ui()};
$("reset").onclick=function(){clearInterval(id);id=null;ph="work";rem=W;done=0;ui()};ui()})();</script>"""
pom=head("Pomodoro Focus Timer","Work for 25 minutes, rest for 5, repeat.")+'''<div class="card" style="text-align:center"><p class="tag" id="mode">● WORK — 25 MIN</p><div class="clock" id="clock">25:00</div>
<div class="acts" style="justify-content:center"><button class="btn" id="go" type="button">Start</button><button class="btn o" id="stop" type="button" disabled>Pause</button><button class="btn o" id="reset" type="button">Reset</button></div>
<p class="note">Completed focus sessions: <strong id="done">0</strong></p></div>'''
page("pomodoro.html","Pomodoro Focus Timer","Free browser Pomodoro timer: 25-minute focus, 5-minute break.",'<section class="section"><div class="wrap">'+pom+'</div></section>',"pomodoro.html",PJS)

tl=[("roi-calculator.html","College ROI Calculator","Payback period from cost, years and salary."),("loan-calculator.html","Loan Calculator","Monthly payment, interest and total repaid."),("pomodoro.html","Pomodoro Timer","25/5 focus and break cycles."),("resume-builder.html","CV & Resume Builder","Two-column CV with US/UK and Europass formats, PDF export."),("ats-checker.html","ATS Resume Analyzer","Experience, titles, employers, degrees, keywords and impact scoring.")]
page("tools.html","Free Tools for Students","College ROI, loan and focus tools, each on its own page.",'<section class="section"><div class="wrap"><div class="sh"><p class="eyebrow">TOOLS</p><h1>Free Tools for Students</h1><p>Each tool has its own page.</p></div><div class="grid">'+"".join(f'<a class="card" href="{h}"><h3>{t}</h3><p>{d}</p></a>' for h,t,d in tl)+'</div></div></section>',"tools.html")

page("index.html","College ROI Calculator, Finance Careers & University Insights","Free tools for students: college ROI, loan calculator, university and career guides.",
 '<section class="hero"><div class="wrap"><p class="eyebrow">FREE TOOLS FOR STUDENTS &amp; YOUNG PROFESSIONALS</p><h1>Master Your Financial &amp; Career Path in Higher Education</h1><p>Calculate college ROI, compare finance careers, and explore top university insights.</p><div class="acts"><a class="btn" href="roi-calculator.html">Calculate My ROI</a><a class="btn o" href="articles.html">Browse Articles</a></div></div></section>'
 '<section class="section"><div class="wrap"><div class="sh"><p class="eyebrow">TOOLS</p><h2>Interactive tools</h2></div><div class="grid">'+"".join(f'<a class="card" href="{h}"><h3>{t}</h3><p>{d}</p></a>' for h,t,d in tl)+'</div></div></section>'
 '<section class="section"><div class="wrap"><div class="sh"><p class="eyebrow">GUIDES</p><h2>Latest articles</h2></div><div class="grid">'+"".join(card(a) for a in A[:3])+'</div></div></section>')

# ---------------- legal ----------------
LT={
"about":("About Wells Love","<p>Wells Love is an independent information portal for students and young professionals: calculators plus editorial guides on college ROI, universities, careers and personal finance.</p><p>Tool outputs are estimates; articles are general education, not individualized advice.</p>"),
"privacy":("Privacy Policy","<p>Last updated: September 27, 2026.</p><h2>Information we collect</h2><p>Contact messages you send us, and standard technical data (IP address, browser, pages viewed) via logs, analytics and cookies. Calculators run in your browser and do not send inputs to a server.</p><h2>Advertising</h2><p>We may use Google AdSense; Google and partners may use cookies to serve ads based on prior visits.</p><h2>Your rights</h2><p>Depending on your region (GDPR, UK GDPR, CCPA/CPRA) you may request access, correction or deletion.</p><h2>Children</h2><p>The site is not directed to children under 13.</p><p>Contact: <a href=\"mailto:privacy@wellslove.com\">privacy@wellslove.com</a></p>"),
"terms":("Terms of Service","<p>Last updated: September 27, 2026.</p><h2>Informational service</h2><p>Content and calculators are educational and are not financial, legal or tax advice.</p><h2>No guarantees</h2><p>We do not guarantee salary, employment, admission, loan approval or any outcome.</p><h2>Acceptable use</h2><p>Do not misuse, scrape abusively or attempt unauthorized access.</p><h2>Liability</h2><p>To the extent permitted by law, we are not liable for indirect or consequential damages.</p>"),
"cookies":("Cookie Policy","<p>Last updated: September 27, 2026.</p><p>We may use essential, preference, analytics and advertising cookies, including third-party Google advertising technologies. You can manage or delete cookies in your browser settings; blocking some may affect functionality.</p>"),
"advertiser":("Advertiser Disclosure","<p>Wells Love may earn revenue from advertising such as Google AdSense. Ads do not imply endorsement and do not influence our calculators. Material affiliate relationships will be disclosed on the relevant page.</p>"),
"contact":("Contact Wells Love","<p>General questions, privacy requests, corrections and advertising: <a href=\"mailto:contact@wellslove.com\">contact@wellslove.com</a>.</p><p>Technical support: <a href=\"mailto:support@wellslove.com\">support@wellslove.com</a>.</p>"),
}
for k,(t,b) in LT.items():
    page(f"{k}.html",t,t+" — Wells Love",f'<section class="section"><div class="wrap art"><p class="eyebrow">LEGAL &amp; COMPANY</p><h1 style="font-size:36px;margin:8px 0 18px">{t}</h1>{b}</div></section>',"about.html" if k=="about" else "")
exec(open("/home/claude/extra.py",encoding="utf-8").read())
exec(open("enrich.py",encoding="utf-8").read())
open(f"{OUT}/style.css","w").write(CSS)
open(f"{OUT}/robots.txt","w").write("User-agent: *\nAllow: /\nSitemap: https://wellslove.com/sitemap.xml\n")
fs=sorted(f for f in os.listdir(OUT) if f.endswith(".html"))
open(f"{OUT}/sitemap.xml","w").write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+"".join(f"<url><loc>https://wellslove.com/{'' if f=='index.html' else f}</loc></url>" for f in fs)+"</urlset>")
print(len(fs),"pages")
