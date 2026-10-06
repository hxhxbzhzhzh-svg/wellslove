#!/usr/bin/env python3
"""
seo_boost.py - SEO package for wellslovehub.com (static site).

Run it from the site folder AFTER build.py / extra.py (they regenerate the HTML):
    python3 seo_boost.py

It is idempotent: running it twice gives the same result. What it does:
  1. Rewrites <title>, meta description and H1 of tool/index/list pages for narrower queries.
  2. Adds Open Graph + Twitter Cards, robots max-image-preview, JSON-LD
     (WebSite/Organization, WebApplication, BreadcrumbList, richer Article).
  3. Generates 1200x630 cover images + thumbnails (img/) and puts them into pages.
  4. Adds explanatory content (tables, FAQ, how-it-works) under the tools.
  5. Creates methodology.html, adds it to the footer, rebuilds sitemap.xml with lastmod.
Requires: Pillow (pip install pillow).
"""
import os, re, json, html, glob, datetime
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
BASE = 'https://wellslovehub.com'
TODAY = '2026-10-05'
LOGO = BASE + '/android-chrome-512x512.png'


def rd(p):
    with open(p, encoding='utf8') as f:
        return f.read()


def wr(p, s):
    with open(p, 'w', encoding='utf8') as f:
        f.write(s)


def esc(s):
    return html.escape(s, quote=True)


# --------------------------------------------------------------------------
# 0. Methodology page (created from the editorial-policy template)
# --------------------------------------------------------------------------
METHOD_MAIN = '''<main><section class="section"><div class="wrap art"><p class="eyebrow">ABOUT WELLS LOVE</p><h1 style="font-size:36px;margin:8px 0 18px">How Our Tools and Guides Work</h1>
<p>This page explains, in plain language, how each tool on Wells Love produces its numbers and where our guides get their facts. Every calculator uses simplified, documented assumptions. Results are estimates, not financial, legal or hiring advice.</p>
<h2>College Cost &amp; ROI Calculator</h2>
<p>Gross yearly cost is the sum of ten recurring expense categories (everything except the one-time application and enrollment fees). Net yearly cost subtracts the yearly scholarships and grants you enter. Total program cost = net yearly cost &times; years of study + one-time fees. Net income is assumed to be 75% of gross salary (a flat, simplified tax assumption), and payback = total program cost &divide; net income. We label a payback of 4 years or less High ROI, 4 to 8 years Moderate and above 8 years Low. This is a rule of thumb, not an official benchmark. The calculator ignores loan interest and real tax rules; use the <a href="loan-calculator.html">Loan Calculator</a> for financing costs.</p>
<h2>Loan Payment Calculator</h2>
<p>The calculator assumes a fixed-rate loan with equal monthly payments. With P as the amount borrowed, r as the annual rate divided by 12 and n as the number of monthly payments, payment = P &times; r &divide; (1 &minus; (1 + r)<sup>&minus;n</sup>). At a 0% rate the payment is simply P &divide; n. Total repaid = payment &times; n and total interest = total repaid &minus; P. Fees, variable rates, grace periods and capitalized interest are not modeled.</p>
<h2>ATS Resume Checker</h2>
<p>The score is a heuristic, not the output of any real employer system. Weights: experience 25%, keyword match 25% (15% when no job description is provided, with the difference redistributed), impact 20%, education and certifications 15%, structure 10% and format 5%. Real applicant tracking systems differ, so use the report as a checklist for fixing obvious problems. Your file is read in your browser and is not uploaded to our servers.</p>
<h2>CV &amp; Resume Builder</h2>
<p>The builder runs in your browser. Your CV is saved in this browser so you can return to it, and the PDF is created through your browser's print dialog, so the text stays selectable. Formats follow common conventions for US/CA/AU resumes, UK CVs and the Europass layout.</p>
<h2>Pomodoro Timer</h2>
<p>The timer counts 25 minutes of focus followed by 5 minutes of rest and repeats the cycle.</p>
<h2>Where the facts in our guides come from</h2>
<p>Guides rely on primary or authoritative sources and list them at the end of each article. The most common ones are the U.S. Department of Education's <a href="https://collegescorecard.ed.gov/" rel="noopener" target="_blank">College Scorecard</a>, the College Board's <a href="https://research.collegeboard.org/trends/college-pricing/highlights" rel="noopener" target="_blank">Trends in College Pricing</a>, <a href="https://studentaid.gov/" rel="noopener" target="_blank">Federal Student Aid</a> and the U.S. Bureau of Labor Statistics. When we cite a ranking we name its publisher, and lists marked "editorial" are our own judgment. Read more in our <a href="editorial-policy.html">Editorial Policy</a>.</p>
<h2>Corrections</h2>
<p>If you find an error in a tool or a guide, write to <a href="contact.html">our contact page</a>. We verify it against the source, fix the page and update the review date.</p>
</div></section></main>'''


def make_methodology():
    s = rd('editorial-policy.html')
    s = re.sub(r'<main>.*?</main>', lambda m: METHOD_MAIN, s, flags=re.S)
    s = re.sub(r'<link rel="canonical" href="[^"]*">',
               '<link rel="canonical" href="%s/methodology.html">' % BASE, s)
    s = re.sub(r'<title>.*?</title>', '<title>Methodology | Wells Love</title>', s, flags=re.S)
    wr('methodology.html', s)


make_methodology()

# --------------------------------------------------------------------------
# 1. Metadata overrides
# --------------------------------------------------------------------------
META = {
    'index.html': dict(
        title='Free College Cost, Loan & Resume Tools | Wells Love',
        desc='Free calculators and guides for students: college cost and ROI, student loan payments, an ATS resume checker, a CV builder and a Pomodoro timer.',
        h1='Plan College Costs, Loans and Your Resume with Free Tools'),
    'roi-calculator.html': dict(
        title='College Cost Calculator: Net Price & Payback | Wells Love',
        desc='Free college cost calculator: enter 11 expense categories, subtract grants and scholarships, and see your net yearly cost, total price and payback period.',
        h1='College Cost Calculator with ROI &amp; Payback Period'),
    'loan-calculator.html': dict(
        title='Loan Payment Calculator: Student & Personal Loans | Wells Love',
        desc='Free loan payment calculator: enter the amount, interest rate and term to see your monthly payment, total interest and total repaid. No signup needed.',
        h1='Student Loan &amp; Personal Loan Payment Calculator'),
    'ats-checker.html': dict(
        title='Free ATS Resume Checker: Score Your Resume Online | Wells Love',
        desc='Free ATS resume checker: upload a PDF, Word or TXT file, add a job description and get a score for experience, keywords, impact and format. No signup.',
        h1='Free ATS Resume Checker &amp; Analyzer'),
    'resume-builder.html': dict(
        title='Free ATS-Friendly Resume & CV Builder | Wells Love',
        desc='Free resume and CV builder with US/UK and Europass formats. Fill in your details, preview live and save as a PDF. Your data stays in your browser.',
        h1='Free ATS-Friendly Resume &amp; CV Builder'),
    'pomodoro.html': dict(
        title='Pomodoro Timer: Free Online 25/5 Focus Timer | Wells Love',
        desc='Free online Pomodoro timer for studying and work: 25 minutes of focus, 5 minutes of rest, repeat. Learn how the technique works and how to use it.',
        h1='Free Online Pomodoro Timer (25/5)'),
    'tools.html': dict(
        title='Free Student Tools: Calculators, Resume & Timer | Wells Love',
        desc='Free tools for students and young professionals: college cost and ROI calculator, loan payment calculator, ATS resume checker, CV builder and Pomodoro timer.',
        h1='Free Tools for Students and Young Professionals'),
    'articles.html': dict(
        title='College Cost, Loan & Career Guides | Wells Love',
        desc='Guides on college costs, student loans, FAFSA, scholarships, top universities and finance careers, with sources and links to free calculators.'),
    'category-roi.html': dict(
        title='College ROI & Finance Guides: Costs, Loans, Aid | Wells Love',
        desc='Guides on the true cost of college, student loans, FAFSA, community college transfers and which majors pay back fastest, with links to free calculators.'),
    'category-universities.html': dict(
        title='Top Universities & Best-Value Colleges Guides | Wells Love',
        desc='Guides to top US, UK and European universities, the cheapest quality colleges, tuition-free schools and the universities that give the most grant aid.'),
    'category-careers.html': dict(
        title='Finance Careers & Internships Guides | Wells Love',
        desc='Guides to finance internships, the intern-to-analyst career path, paying for college with co-ops and work, and universities for launching an AI startup.'),
    'methodology.html': dict(
        title='Methodology: How Our Tools Work | Wells Love',
        desc='How the Wells Love calculators and checkers produce their numbers, which assumptions they use and where the facts in our guides come from.'),
}

ART = {
 'article-best-roi-majors-cost-vs-salary.html': ('Best ROI College Majors: Cost vs. Salary | Wells Love', 'Compare payback periods by major: how the same four years can have very different returns, with simple, transparent math and a free calculator.'),
 'article-best-us-companies-for-finance-internships.html': ('Best US Companies for Finance Internships | Wells Love', 'Ten large US employers with structured finance internship programs, how recruiting timelines work and how to prepare for interviews and applications.'),
 'article-cheapest-quality-universities-usa.html': ('10 Cheapest Quality Universities in the USA (2026) | Wells Love', "Ten public universities that pair low in-state costs with strong graduation rates and earnings, plus a 10-minute way to compare any school's real price."),
 'article-community-college-transfer-save-money.html': ('Community College First: The 2+2 Transfer Path | Wells Love', 'Start at a community college and finish at a university: the savings math, the transfer steps and the risks to avoid before you commit.'),
 'article-fafsa-css-profile-scholarships-playbook.html': ('FAFSA, CSS Profile & Scholarships: Step-by-Step Guide', 'A six-step playbook for the FAFSA, CSS Profile and scholarships: the forms, deadlines and habits that unlock grants, plus how to compare offers and appeal.'),
 'article-hidden-college-costs-insurance-tech-fees.html': ('Hidden College Costs: Insurance, Laptops & Fees | Wells Love', 'The expenses that rarely appear in a college brochure, from health insurance and technology to student fees and application costs, and how to lower each one.'),
 'article-intern-to-analyst-career-path.html': ('From Intern to Analyst: Career Path Timeline | Wells Love', 'What happens between a sophomore internship and a first full-time offer: the recruiting calendar, how to build a profile and how to write a CV that passes screening.'),
 'article-is-college-worth-it.html': ('Is College Worth It? Cost, Payback & Earnings | Wells Love', 'We ran the numbers on tuition, opportunity cost and lifetime earnings across popular majors, and explain why averages mislead and payback period matters most.'),
 'article-pay-for-college-internships-coop-work.html': ('Pay for College with Internships, Co-ops & Jobs | Wells Love', 'A practical plan for earning while you learn: paid internships, co-ops and part-time work, how they change your total cost and how to land interviews.'),
 'article-student-loans-2026-federal-vs-private.html': ('Student Loans 2026: Federal vs. Private & Limits | Wells Love', 'What changed on July 1, 2026, how federal and private student loans differ, and a simple rule for how much to borrow and in which order.'),
 'article-top-10-finance-specializations.html': ('Top 10 Finance Specializations & Majors | Wells Love', 'Finance is not one career. Compare ten specializations by skills, hours, entry path, certifications and compensation before you choose a major.'),
 'article-top-10-universities-most-grant-aid-americans.html': ('Universities That Give the Most Grants (2026-27) | Wells Love', 'Ten universities that guarantee free tuition or loan-free grant packages to US families under published income lines, and how to apply for them.'),
 'article-top-10-universities-usa.html': ('Top 10 Universities in the United States | Wells Love', 'Ten US universities with strong reputations in engineering, business and the liberal arts, and how to read a top-10 list by fit, cost and selectivity.'),
 'article-top-10-universities-world.html': ('Top 10 Universities in the World (2026) | Wells Love', "An editorial look at ten of the world's most academically influential universities, with notes on study systems, admissions, costs and career outcomes."),
 'article-top-european-universities-for-ai-and-finance.html': ('Best European Universities for AI & Finance | Wells Love', 'Continental European universities that combine strong research, lower tuition and growing technology and finance sectors, plus language, cost and work-rights notes.'),
 'article-top-uk-universities-for-finance-and-ai.html': ('Best UK Universities for Finance, Economics & AI | Wells Love', 'Ten UK universities with strong finance, economics and technology credentials, plus costs, visas and what to check before you apply.'),
 'article-top-us-universities-for-ai.html': ('Top US Universities for AI and Machine Learning | Wells Love', 'Where to study AI in the United States and how to judge a program beyond the brand name: research strength, industry placement, location, cost and funding.'),
 'article-true-cost-of-college-11-expenses.html': ('True Cost of College: 11 Expenses to Budget | Wells Love', 'Tuition is only the start. Learn the 11 cost categories behind every college budget, typical 2025-26 averages and how to estimate each one.'),
 'article-tuition-free-and-work-colleges-usa.html': ('Tuition-Free & Work Colleges in the USA | Wells Love', 'Work colleges, full-scholarship institutes and service academies where tuition is covered, and the trade-offs you accept in exchange.'),
 'article-us-universities-for-ai-startups.html': ('Best US Universities for Launching an AI Startup | Wells Love', 'The schools that give AI founders talent, funding access and a practical support network, and how to evaluate a startup-friendly program.'),
}
for _k, (_t, _d) in ART.items():
    META[_k] = dict(title=_t, desc=_d)
LEGAL = {
 'about.html': 'Wells Love is an independent education and career resource: free browser-based tools and plain-language guides on universities, college costs and early careers.',
 'advertiser.html': 'How Wells Love uses advertising such as Google AdSense and how affiliate relationships are disclosed. Ads do not influence our calculators.',
 'contact.html': 'Contact Wells Love with questions, privacy requests, corrections or advertising enquiries, or reach our technical support.',
 'cookies.html': 'How Wells Love uses essential, preference, analytics and advertising cookies, including Google advertising technologies, and how you can manage them.',
 'privacy.html': 'What information Wells Love collects, how cookies and analytics are used and how to make a privacy request. Last updated September 27, 2026.',
 'terms.html': 'The terms for using Wells Love: our tools and guides are educational, not financial, legal or tax advice, and come with no guarantees.',
 'author.html': 'Meet the wellslovehub.com editorial team covering higher education, personal finance and early-career recruiting for students and young professionals.',
 'editorial-policy.html': 'How Wells Love sources its facts, stays independent from advertisers, reviews guides at least once a year and handles corrections.',
}
for _k, _d in LEGAL.items():
    META[_k] = dict(desc=_d)

TOOLS = {
    'roi-calculator.html': ('FinanceApplication', 'College Cost & ROI Calculator'),
    'loan-calculator.html': ('FinanceApplication', 'Loan Payment Calculator'),
    'ats-checker.html': ('BusinessApplication', 'ATS Resume Checker'),
    'resume-builder.html': ('BusinessApplication', 'Resume & CV Builder'),
    'pomodoro.html': ('EducationalApplication', 'Pomodoro Timer'),
}

CAT = {  # category page -> (label, accent colour on the navy cover)
    'category-roi.html': ('College ROI & Finance', (94, 156, 115)),
    'category-universities.html': ('Top Universities', (196, 154, 74)),
    'category-careers.html': ('Career Paths & Internships', (192, 97, 79)),
}
CAT_BY_LABEL = {v[0]: (k, v[1]) for k, v in CAT.items()}
BRASS = (196, 154, 74)

# --------------------------------------------------------------------------
# 2. Cover images
# --------------------------------------------------------------------------
os.makedirs('img', exist_ok=True)
F_SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
F_MONO = '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf'
F_SANS = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
NAVY = (22, 35, 61)
PAPER = (246, 243, 236)


def font(p, n):
    return ImageFont.truetype(p, n)


def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=fnt) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def cover(slug, label, title, accent):
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), NAVY)
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    for i, r in enumerate((420, 330, 240)):
        od.ellipse((W - 250 - r, H - 120 - r, W - 250 + r, H - 120 + r),
                   outline=accent + (34 - i * 8,), width=3)
    im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 16, H), fill=accent)
    # logo
    d.ellipse((80, 62, 128, 110), fill=NAVY, outline=BRASS, width=2)
    fm = font(F_SERIF, 30)
    d.text((104, 86), 'W', font=fm, fill=PAPER, anchor='mm')
    d.text((146, 86), 'Wells Love', font=font(F_SERIF, 30), fill=PAPER, anchor='lm')
    # label
    d.text((80, 168), label.upper(), font=font(F_MONO, 24), fill=accent, anchor='lm')
    # title (auto-fit)
    maxw, chosen = W - 160, None
    for size in range(74, 36, -2):
        f = font(F_SERIF, size)
        lines = wrap(d, title, f, maxw)
        if len(lines) <= 4 and len(lines) * size * 1.18 <= 330:
            chosen = (f, size, lines)
            break
    if not chosen:
        f = font(F_SERIF, 38)
        lines = wrap(d, title, f, maxw)[:4]
        lines[-1] = lines[-1].rstrip('., ') + '...'
        chosen = (f, 38, lines)
    f, size, lines = chosen
    y = 212
    for ln in lines:
        d.text((80, y), ln, font=f, fill=PAPER)
        y += int(size * 1.18)
    # footer
    d.line((80, 556, W - 80, 556), fill=(60, 76, 106), width=2)
    d.text((80, 584), 'wellslovehub.com', font=font(F_MONO, 24), fill=BRASS, anchor='lm')
    d.text((W - 80, 584), 'Free tools & guides for students', font=font(F_SANS, 24),
           fill=(190, 196, 208), anchor='rm')
    im.save('img/cover-%s.jpg' % slug, quality=86, optimize=True, progressive=True)
    im.resize((640, 336), Image.LANCZOS).save('img/thumb-%s.jpg' % slug, quality=80,
                                              optimize=True, progressive=True)


# --------------------------------------------------------------------------
# 3. Tool-page content blocks
# --------------------------------------------------------------------------
def pay(P, rate, years):
    r, n = rate / 1200.0, years * 12
    return P * r * (1 + r) ** n / ((1 + r) ** n - 1)


def money(x):
    return '${:,.0f}'.format(x)


def payoff_with_extra(P, rate, years, extra):
    r, base = rate / 1200.0, pay(P, rate, years)
    bal, months, interest = P, 0, 0.0
    while bal > 0.005 and months < 1200:
        i = bal * r
        interest += i
        bal = bal + i - (base + extra)
        months += 1
    return months, interest


def table(head, rows):
    h = ''.join('<th>%s</th>' % c for c in head)
    b = ''.join('<tr>' + ''.join('<td>%s</td>' % c for c in r) + '</tr>' for r in rows)
    return '<div style="overflow-x:auto"><table class="tbl"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (h, b)


def loan_block():
    t1 = table(['Amount borrowed', '5 years', '10 years', '15 years', '20 years'],
               [[money(a)] + [money(pay(a, 6, y)) for y in (5, 10, 15, 20)]
                for a in (10000, 20000, 30000, 50000, 100000)])
    rates = (4, 5, 6, 7, 8, 10)
    t2 = table(['Annual rate', 'Monthly payment', 'Total interest', 'Total repaid'],
               [['%d%%' % r, money(pay(30000, r, 10)), money(pay(30000, r, 10) * 120 - 30000),
                 money(pay(30000, r, 10) * 120)] for r in rates])
    diff = (pay(30000, 7, 10) - pay(30000, 5, 10)) * 120
    m_extra, i_extra = payoff_with_extra(30000, 6, 10, 50)
    i_base = pay(30000, 6, 10) * 120 - 30000
    yrs, mos = divmod(m_extra, 12)
    return '''
<h2>How to use the loan payment calculator</h2>
<ol>
<li>Enter the amount you plan to borrow.</li>
<li>Enter the annual interest rate. When you compare offers, use the APR shown in each offer.</li>
<li>Enter the term and choose years or months with the unit selector.</li>
<li>Read the monthly payment, total interest and total repaid, then change the term or the rate to see how each one moves the result.</li>
</ol>
<h2>Monthly payment for common loan amounts</h2>
<p>The figures below are hypothetical. They were calculated with the same formula as the calculator at a 6% annual rate, so you can see how the amount and the term interact. They are not current market rates.</p>
[[T1]]
<p>Look at the $30,000 row: stretching the term from 5 to 20 years cuts the monthly payment by more than half, but the total interest paid grows a lot. A lower payment is not the same as a cheaper loan.</p>
<h2>How the interest rate changes the cost</h2>
<p>Here is a $30,000 loan repaid over 10 years at different example rates.</p>
[[T2]]
<p>On this example, a 7% rate instead of 5% adds about [[DIFF]] in interest over the life of the loan. Shopping for a lower rate matters as much as choosing the term.</p>
<h2>What an extra payment can save</h2>
<p>Take the same $30,000 loan at 6% over 10 years. The scheduled payment is about [[BASE]] a month and the total interest is about [[IBASE]]. If you add $50 to every payment, the loan is paid off in about [[YRS]] years and [[MOS]] months instead of 10 years, and the interest falls to about [[IEXTRA]]. Before you do this, check that your lender applies extra money to principal and charges no prepayment penalty. The calculator itself does not model extra payments, so treat this as an illustration.</p>
<h2>Student loans and personal loans: what changes</h2>
<p>The math is the same for any fixed-rate loan with equal monthly payments, which is why one calculator works for student, car and personal loans. The rules around the loan are not the same. Federal student loan terms, rates and repayment plans are set by federal rules and change over time, so confirm the current details on <a href="https://studentaid.gov/" rel="noopener" target="_blank">Federal Student Aid</a>. Private lenders set their own rates based on your credit and sometimes your co-signer's. On many student loans, interest starts to accrue while you are still in school, so the balance at graduation can be higher than the amount you borrowed. Mortgage payments usually also include taxes and insurance, which this calculator does not add.</p>
<h2>Before you borrow</h2>
<ul>
<li>Compare offers by APR and by total cost, not only by the monthly payment.</li>
<li>Ask about origination fees, late fees and when the first payment is due.</li>
<li>Exhaust grants, scholarships and federal aid before private loans. Our <a href="article-fafsa-css-profile-scholarships-playbook.html">FAFSA and scholarships playbook</a> shows how.</li>
<li>Estimate the full price of your degree first with the <a href="roi-calculator.html">College Cost Calculator</a> and borrow only what you need.</li>
</ul>
<h2>Frequently asked questions</h2>
<h3>How is the monthly payment calculated?</h3>
<p>The calculator divides your annual rate by 12 to get a monthly rate r, then uses payment = P &times; r &divide; (1 &minus; (1 + r)<sup>&minus;n</sup>), where P is the amount borrowed and n is the number of monthly payments. If the rate is 0%, the payment is P &divide; n.</p>
<h3>Can I enter the term in months?</h3>
<p>Yes. Use the unit selector next to the term to switch between years and months.</p>
<h3>Does the result include fees, insurance or taxes?</h3>
<p>No. It covers principal and interest only. Origination fees, insurance and taxes would raise your real cost.</p>
<h3>Is it only for student loans?</h3>
<p>No. It works for any fixed-rate loan with equal monthly payments, such as a personal loan or a car loan.</p>
<h3>How much should I borrow for college?</h3>
<p>There is no single answer. A common rule of thumb is to avoid borrowing more in total than you expect to earn in your first year after graduation. Read <a href="article-student-loans-2026-federal-vs-private.html">Student Loans in 2026</a> for the current federal limits and a step-by-step way to decide.</p>
<h3>Are the numbers I enter saved or sent anywhere?</h3>
<p>The calculation runs in your browser and the amounts you type are not sent to our servers.</p>
<h2>Related guides and tools</h2>
<ul>
<li><a href="roi-calculator.html">College Cost &amp; ROI Calculator</a></li>
<li><a href="article-student-loans-2026-federal-vs-private.html">Student Loans in 2026: Federal vs. Private</a></li>
<li><a href="article-true-cost-of-college-11-expenses.html">The True Cost of College: 11 Expenses to Budget</a></li>
<li><a href="methodology.html">How our calculators work</a></li>
</ul>'''.replace('[[T1]]', t1).replace('[[T2]]', t2).replace('[[DIFF]]', money(diff)) \
        .replace('[[BASE]]', money(pay(30000, 6, 10))).replace('[[IBASE]]', money(i_base)) \
        .replace('[[YRS]]', str(yrs)).replace('[[MOS]]', str(mos)).replace('[[IEXTRA]]', money(i_extra))


ROI_BLOCK = '''
<h2>How to read your results</h2>
<p>The calculator shows three numbers. The <strong>net yearly cost</strong> is what you pay in a typical year after the scholarships and grants you entered. The <strong>total program cost</strong> multiplies that by the years of study and adds the one-time fees. The <strong>payback period</strong> divides the total cost by an estimated take-home income, so it answers a simple question: how many years of work does it take to earn back the price of the degree? In this calculator a payback of 4 years or less is rated High ROI, 4 to 8 years Moderate and above 8 years Low. That is a rule of thumb we use, not an official benchmark.</p>
<h2>Compare two colleges in five steps</h2>
<ol>
<li>Open each school's official cost-of-attendance page and copy the tuition, housing, food, books and fee lines.</li>
<li>Enter the first school's numbers and write down the net yearly cost and the total program cost.</li>
<li>Subtract only aid you have actually been offered. Loans are not aid, because you repay them.</li>
<li>Repeat for the second school. Use the in-state or out-of-state tuition that really applies to you.</li>
<li>Enter a realistic starting salary for your intended major from the <a href="https://collegescorecard.ed.gov/" rel="noopener" target="_blank">College Scorecard</a> or the Bureau of Labor Statistics and compare the payback periods.</li>
</ol>
<h2>Common mistakes to avoid</h2>
<ul>
<li>Using the sticker price of tuition and forgetting housing, food, books and fees.</li>
<li>Counting student loans as financial aid. Test your financing in the <a href="loan-calculator.html">Loan Payment Calculator</a> instead.</li>
<li>Entering the one-time application and enrollment fee as a yearly cost. The calculator counts it once.</li>
<li>Comparing schools with salary guesses that are far apart. Use the same salary source for both.</li>
</ul>
<h2>More questions</h2>
<h3>Is a payback period of 4 years good?</h3>
<p>Within this calculator it is the upper edge of High ROI. A shorter payback means the cost is recovered faster, but the number depends on the salary you enter, and real careers rarely follow a flat salary.</p>
<h3>Why does the calculator assume 75% net income?</h3>
<p>It is a flat, simplified tax assumption so the tool works for any country and state. Your real take-home pay will differ.</p>
<h3>Can I compare in-state and out-of-state costs?</h3>
<p>Yes. Run the calculator twice with each tuition and housing figure and compare the totals.</p>
<h3>Where can I find grants and scholarships to subtract?</h3>
<p>Start with <a href="article-fafsa-css-profile-scholarships-playbook.html">our FAFSA, CSS Profile and scholarships playbook</a> and see which schools give the most aid in <a href="article-top-10-universities-most-grant-aid-americans.html">this ranking</a>.</p>
<p>Want to see how the numbers are produced? Read our <a href="methodology.html">methodology</a>.</p>'''

ATS_BLOCK = '''
<h2>Seven checks before you send a resume</h2>
<ol>
<li>Use standard section headings such as Experience, Education and Skills.</li>
<li>Put dates on every role and keep one consistent format, for example "Jan 2021 - Present".</li>
<li>Mirror the wording of the job posting where it is true for you: the job title, tools and certifications.</li>
<li>Start each bullet with an action verb and add numbers where you have them.</li>
<li>Keep key information as real text. Text boxes, tables, icons and images can break parsing.</li>
<li>Save a text-based PDF or a .docx file unless the posting asks for another format.</li>
<li>Run the file through the checker, fix the weakest category and run it again.</li>
</ol>
<h2>How to tailor a resume to one job in 15 minutes</h2>
<ol>
<li>Paste your resume and the full job description into the checker.</li>
<li>Read the keyword section and list the terms from the posting that are missing.</li>
<li>Add a missing term only where it describes work you have really done.</li>
<li>Move the most relevant bullets to the top of each role.</li>
<li>Check that your headline or most recent job title matches the language of the posting where accurate.</li>
<li>Run the checker again and keep the version that reads best to a human.</li>
</ol>
<h2>Common ATS myths</h2>
<ul>
<li><strong>"The robot rejects most resumes."</strong> In many systems an ATS mainly collects and parses applications so recruiters can search and sort them. Rejections often come from questions the recruiter set, such as work authorization, or from a person reading the application.</li>
<li><strong>"More keywords always means a higher rank."</strong> Repeating terms unnaturally makes the resume harder to read. Use a keyword once or twice, in a bullet that shows real experience.</li>
<li><strong>"A designed template always fails."</strong> Some do and some do not. A simple layout with real text is the safer choice, and our <a href="resume-builder.html">CV Builder</a> is made for that.</li>
</ul>
<h2>More questions</h2>
<h3>Is the ATS checker free and do I need an account?</h3>
<p>It is free and there is no sign-up. The file is read in your browser.</p>
<h3>Which file types can I check?</h3>
<p>PDF, Word (.docx) and TXT files, or you can paste the text.</p>
<h3>Can I check a resume against one specific job?</h3>
<p>Yes. Add the target job title and the full job description and the keyword score is calculated against that posting.</p>
<h3>What do Excellent, Good, Fair and Needs work mean?</h3>
<p>They are the labels of our heuristic score. Treat them as a checklist for fixing obvious problems, not as the verdict of any employer's system. The weights are explained in our <a href="methodology.html">methodology</a>.</p>
<h3>Does it work like the system an employer uses?</h3>
<p>No. Real systems differ from one another, so the checker cannot promise an interview. It helps you remove common parsing and content problems.</p>
<h3>What should I read next?</h3>
<p>See <a href="article-intern-to-analyst-career-path.html">From Intern to Analyst</a> and <a href="article-best-us-companies-for-finance-internships.html">Best US Companies for Finance Internships</a>.</p>'''

CV_BLOCK = '''
<h2>How to build your resume or CV in five steps</h2>
<ol>
<li>Choose the region and format: US/CA/AU resume, UK CV or Europass.</li>
<li>Fill in your contact details and a two-to-three line summary.</li>
<li>Add your experience, starting with the most recent role, and your education, skills and languages.</li>
<li>Check the live preview and use the checker link to score the CV.</li>
<li>Click Download PDF. The button opens your browser's print dialog at the page size of the chosen format (Letter or A4). Choose "Save as PDF" as the destination.</li>
</ol>
<h2>US, UK and Europass: what changes</h2>
<ul>
<li><strong>US, Canada and Australia:</strong> a resume without a photo. Many early-career resumes fit on one page, and two pages are common with more experience.</li>
<li><strong>UK:</strong> a CV, also without a photo. Two pages are typical.</li>
<li><strong>Europass:</strong> a standard European layout that allows a photo. The photo option in this builder is available in the Europass format.</li>
</ul>
<p>Conventions vary by employer and country, so always follow the instructions in the job posting.</p>
<h2>Resume or CV: what is the difference?</h2>
<p>In the US and Canada a resume is a short summary of your work for a specific job, while a CV is a longer document used mostly in academia and research. In the UK and much of Europe the word CV is used for the document you send for most jobs.</p>
<h2>An ATS-friendly CV checklist</h2>
<ul>
<li>Use standard headings such as Experience, Education and Skills.</li>
<li>Keep dates in one format for every role.</li>
<li>Use a plain, readable font and avoid putting key text in images or icons.</li>
<li>Reuse the exact terms from the job posting where they are true for you.</li>
<li>Name the file clearly, for example FirstName-LastName-Resume.pdf.</li>
<li>Test the file in the <a href="ats-checker.html">ATS Resume Checker</a>. It detects columns and shows the order in which the text is read.</li>
</ul>
<p>Some older systems read two-column layouts in the wrong order. If a posting asks for a plain format, check the extracted text in the ATS Resume Checker before you apply.</p>
<h2>Frequently asked questions</h2>
<h3>Is the CV builder free?</h3>
<p>Yes, and you do not need an account.</p>
<h3>Where is my CV stored?</h3>
<p>In your browser on this device. If you clear the browser data, the saved CV is removed, so download a PDF copy of the version you want to keep.</p>
<h3>Will the PDF keep selectable text?</h3>
<p>The PDF is produced by your browser's print function, which normally keeps text selectable. To be sure, run the exported file through the <a href="ats-checker.html">ATS Resume Checker</a>.</p>
<h3>Can I add a photo?</h3>
<p>The photo option is intended for the Europass format. The US/CA/AU and UK formats are photo-free.</p>
<h2>Related guides</h2>
<ul>
<li><a href="ats-checker.html">ATS Resume Checker</a></li>
<li><a href="article-intern-to-analyst-career-path.html">From Intern to Analyst: A Realistic Career Path Timeline</a></li>
<li><a href="article-best-us-companies-for-finance-internships.html">Best US Companies for Finance Internships</a></li>
<li><a href="article-top-10-finance-specializations.html">Top 10 In-Demand Finance Specializations</a></li>
</ul>'''

POMO_BLOCK = '''
<h2>What is the Pomodoro technique?</h2>
<p>The Pomodoro technique is a time-management method created by Francesco Cirillo in the late 1980s. It is named after the tomato-shaped kitchen timer he used as a student (pomodoro means tomato in Italian). You work on one task in a focused block of 25 minutes, take a 5-minute break, and repeat. After four blocks, the classic method suggests a longer break of 15 to 30 minutes. This timer runs the 25-minute focus and 5-minute rest cycle, and you can take a longer break yourself after four sessions.</p>
<h2>How to use the timer in five steps</h2>
<ol>
<li>Pick one task and write it down.</li>
<li>Press Start and work only on that task until the timer ends.</li>
<li>If you think of something else, jot it on paper and return to the task.</li>
<li>When the 25 minutes end, stand up, stretch or drink water during the 5-minute rest.</li>
<li>Repeat. Use the completed sessions counter to see how many focus blocks you finished.</li>
</ol>
<h2>Ways students use it</h2>
<ul>
<li>Break a large assignment into tasks that fit into one or two sessions.</li>
<li>Finish applications in focused blocks. For example, one session for the FAFSA sections, one for a scholarship essay outline. Our <a href="article-fafsa-css-profile-scholarships-playbook.html">FAFSA and scholarships playbook</a> has a checklist you can split into sessions.</li>
<li>Study with active recall in each block, such as closing the book and writing what you remember.</li>
<li>Keep your phone out of reach during the 25 minutes.</li>
</ul>
<h2>Other session lengths</h2>
<p>Some people prefer longer blocks such as 50 minutes of work and 10 minutes of rest, or shorter blocks when a task feels hard to start. This timer is fixed at 25 and 5. If you want a different pattern, use it as a rhythm guide and track the time yourself.</p>
<h2>Frequently asked questions</h2>
<h3>Is the Pomodoro timer free?</h3>
<p>Yes, and it runs in your browser without an account.</p>
<h3>Why 25 minutes?</h3>
<p>It is the length Cirillo chose. It is long enough to make progress and short enough to feel manageable. It is a convention, not a scientific constant, so adjust your own routine if it does not fit you.</p>
<h3>Can I leave the tab in the background?</h3>
<p>Keep the tab visible when you can. Some browsers slow down timers in background tabs, which can make the countdown less precise.</p>
<h3>Does it work on a phone?</h3>
<p>Yes, the page works in a mobile browser. Keep the screen on and the tab open while you work.</p>
<h2>More free tools</h2>
<ul>
<li><a href="roi-calculator.html">College Cost &amp; ROI Calculator</a></li>
<li><a href="loan-calculator.html">Loan Payment Calculator</a></li>
<li><a href="resume-builder.html">Resume &amp; CV Builder</a></li>
<li><a href="ats-checker.html">ATS Resume Checker</a></li>
</ul>'''

TOOLS_BLOCK = '''
<h2>Which tool should you use?</h2>
<ul>
<li><strong>Planning a degree:</strong> start with the <a href="roi-calculator.html">College Cost &amp; ROI Calculator</a> to see the real price after aid and how long it takes to earn it back.</li>
<li><strong>Borrowing money:</strong> test your monthly payment and total interest in the <a href="loan-calculator.html">Loan Payment Calculator</a>.</li>
<li><strong>Applying for jobs and internships:</strong> build a clean resume in the <a href="resume-builder.html">Resume &amp; CV Builder</a>, then score it with the <a href="ats-checker.html">ATS Resume Checker</a>.</li>
<li><strong>Studying or working with focus:</strong> use the <a href="pomodoro.html">Pomodoro Timer</a> for 25-minute sessions.</li>
</ul>
<p>All tools are free, need no account and run in your browser. See how each number is produced on the <a href="methodology.html">methodology page</a>, or read our <a href="articles.html">guides</a> on college costs, loans and careers.</p>'''


def section(inner):
    return '<!--sb-content--><section class="section"><div class="wrap"><div class="art">%s</div></div></section><!--/sb-content-->' % inner


BLOCKS = {
    'loan-calculator.html': loan_block(),
    'roi-calculator.html': ROI_BLOCK,
    'ats-checker.html': ATS_BLOCK,
    'resume-builder.html': CV_BLOCK,
    'pomodoro.html': POMO_BLOCK,
    'tools.html': TOOLS_BLOCK,
}

CSS_MARK = '/* sb-css */'
SB_CSS = CSS_MARK + '''
.tbl{width:100%;border-collapse:collapse;font-size:14.5px;margin:12px 0 18px;background:#fff}
.tbl th,.tbl td{border:1px solid var(--line);padding:8px 10px;text-align:right}
.tbl th:first-child,.tbl td:first-child{text-align:left}
.tbl th{background:var(--paper2);font-weight:600}
.art ol{padding-left:22px}.art ol li,.art ul li{margin-bottom:6px}
'''

# --------------------------------------------------------------------------
# 4. Page processing
# --------------------------------------------------------------------------
HEAD_RM = [
    r'<!--sb-head-->.*?<!--/sb-head-->',
    r'<script type="application/ld\+json">.*?</script>',
    r'<meta property="og:[a-z:_]+" content="[^"]*">',
    r'<meta name="twitter:[a-z:_]+" content="[^"]*">',
    r'<meta name="robots" content="[^"]*">',
]


def first(pat, s, default=''):
    m = re.search(pat, s, flags=re.S)
    return m.group(1) if m else default


def short_title(t):
    """Drop the brand suffix when the whole title would be cut by Google (> ~62 chars)."""
    if len(t) > 62 and t.endswith(' | Wells Love') and len(t) - 13 <= 70:
        return t[:-13]
    return t


def ld(obj):
    return '<script type="application/ld+json">%s</script>' % json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def breadcrumb(items):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList',
            'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u}
                                for i, (n, u) in enumerate(items)]}


pages = sorted(glob.glob('*.html'))
info = {}  # per-page collected info for covers
# pass 1: collect info and generate covers
for f in pages:
    s = rd(f)
    slug = f[:-5]
    h1_raw = first(r'<h1[^>]*>(.*?)</h1>', s)
    h1 = html.unescape(re.sub('<[^>]+>', '', META.get(f, {}).get('h1', h1_raw)))
    tag = html.unescape(first(r'<p class="tag">([^<]*)</p>', s))
    info[f] = dict(slug=slug, h1=h1, tag=tag)

for f, i in info.items():
    if f.startswith('article-'):
        lbl = i['tag'] or 'Guide'
        acc = CAT_BY_LABEL.get(lbl, (None, BRASS))[1]
        cover(i['slug'], lbl, i['h1'], acc)
    elif f in TOOLS:
        cover(i['slug'], 'Free tool', i['h1'], (94, 156, 115))
    elif f == 'index.html':
        cover('home', 'Wells Love', 'Free tools and guides for college costs, loans and your first career steps', BRASS)
    elif f == 'tools.html':
        cover('tools', 'Free tools', i['h1'], (94, 156, 115))
    elif f == 'articles.html':
        cover('articles', 'Guides', 'Financial & Career Guides for Students', BRASS)
    elif f in CAT:
        cover(i['slug'], 'Guides', CAT[f][0], CAT[f][1])
    elif f == 'methodology.html':
        cover('methodology', 'Methodology', 'How Our Tools and Guides Work', BRASS)
cover('default', 'Wells Love', 'Free financial and career tools for students and young professionals', BRASS)


def cover_slug(f):
    if f == 'index.html':
        return 'home'
    if f in info and os.path.exists('img/cover-%s.jpg' % info[f]['slug']):
        return info[f]['slug']
    return 'default'


report = []
for f in pages:
    s = rd(f)
    i = info[f]
    meta = META.get(f, {})

    # strip previous run's markers
    s = re.sub(r'<!--sb-hero-->.*?<!--/sb-hero-->', '', s, flags=re.S)
    s = re.sub(r'<!--sb-content-->.*?<!--/sb-content-->', '', s, flags=re.S)
    old_ld = first(r'<script type="application/ld\+json">(.*?)</script>', s)
    for pat in HEAD_RM:
        s = re.sub(pat, '', s, flags=re.S)

    # title / description / h1
    cur_title = html.unescape(first(r'<title>(.*?)</title>', s))
    cur_desc = html.unescape(first(r'<meta name="description" content="([^"]*)"', s))
    title = meta.get('title') or short_title(cur_title)
    desc = meta.get('desc') or cur_desc
    s = re.sub(r'<title>.*?</title>', '<title>%s</title>' % esc(title), s, count=1, flags=re.S)
    if re.search(r'<meta name="description" content="[^"]*">', s):
        s = re.sub(r'<meta name="description" content="[^"]*">',
                   lambda m: '<meta name="description" content="%s">' % esc(desc), s, count=1)
    elif desc:
        s = s.replace('</title>', '</title><meta name="description" content="%s">' % esc(desc), 1)
    if meta.get('h1'):
        s = re.sub(r'(<h1[^>]*>).*?(</h1>)', lambda m: m.group(1) + meta['h1'] + m.group(2), s, count=1, flags=re.S)

    canonical = html.unescape(first(r'<link rel="canonical" href="([^"]*)"', s)) or (BASE + '/' + f)
    csl = cover_slug(f)
    img_url = '%s/img/cover-%s.jpg' % (BASE, csl)
    is_art = f.startswith('article-')

    # ---- head block
    h = ['<!--sb-head-->',
         '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">',
         '<meta property="og:type" content="%s">' % ('article' if is_art else 'website'),
         '<meta property="og:site_name" content="Wells Love">',
         '<meta property="og:locale" content="en_US">',
         '<meta property="og:url" content="%s">' % esc(canonical),
         '<meta property="og:title" content="%s">' % esc(title),
         '<meta property="og:description" content="%s">' % esc(desc),
         '<meta property="og:image" content="%s">' % img_url,
         '<meta property="og:image:width" content="1200">',
         '<meta property="og:image:height" content="630">',
         '<meta property="og:image:alt" content="%s">' % esc('Cover: ' + i['h1']),
         '<meta name="twitter:card" content="summary_large_image">',
         '<meta name="twitter:title" content="%s">' % esc(title),
         '<meta name="twitter:description" content="%s">' % esc(desc),
         '<meta name="twitter:image" content="%s">' % img_url]
    if 'fonts.gstatic.com' not in s:
        h.append('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')

    if f == 'index.html':
        h.append(ld({'@context': 'https://schema.org', '@graph': [
            {'@type': 'WebSite', '@id': BASE + '/#website', 'url': BASE + '/', 'name': 'Wells Love',
             'alternateName': ['wellslovehub', 'wellslovehub.com'], 'inLanguage': 'en',
             'publisher': {'@id': BASE + '/#org'}},
            {'@type': 'Organization', '@id': BASE + '/#org', 'name': 'Wells Love', 'url': BASE + '/',
             'logo': {'@type': 'ImageObject', 'url': LOGO}}]}))
    elif f in TOOLS:
        cat, nm = TOOLS[f]
        h.append(ld({'@context': 'https://schema.org', '@type': 'WebApplication', 'name': nm,
                     'url': canonical, 'description': desc, 'applicationCategory': cat,
                     'operatingSystem': 'Any', 'browserRequirements': 'Requires JavaScript',
                     'inLanguage': 'en', 'isAccessibleForFree': True,
                     'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'},
                     'publisher': {'@type': 'Organization', 'name': 'Wells Love', 'url': BASE + '/'}}))
        h.append(ld(breadcrumb([('Home', BASE + '/'), ('Tools', BASE + '/tools.html'), (nm, canonical)])))
    elif f == 'tools.html':
        h.append(ld(breadcrumb([('Home', BASE + '/'), ('Tools', canonical)])))
    elif f == 'articles.html':
        h.append(ld(breadcrumb([('Home', BASE + '/'), ('Articles', canonical)])))
    elif f in CAT:
        h.append(ld(breadcrumb([('Home', BASE + '/'), ('Articles', BASE + '/articles.html'), (CAT[f][0], canonical)])))
    elif is_art:
        try:
            old = json.loads(old_ld) if old_ld else {}
        except Exception:
            old = {}
        catf = (CAT_BY_LABEL.get(i['tag']) or (None, None))[0]
        art = {'@context': 'https://schema.org', '@type': 'Article', 'headline': i['h1'][:110],
               'description': desc, 'image': [img_url], 'inLanguage': 'en',
               'author': {'@type': 'Organization', 'name': 'wellslovehub.com', 'url': BASE + '/author.html'},
               'publisher': {'@type': 'Organization', 'name': 'Wells Love',
                             'logo': {'@type': 'ImageObject', 'url': LOGO}},
               'datePublished': old.get('datePublished', '2026-10-04'),
               'dateModified': old.get('dateModified', '2026-10-04'),
               'mainEntityOfPage': {'@type': 'WebPage', '@id': canonical}}
        h.append(ld(art))
        crumbs = [('Home', BASE + '/'), ('Articles', BASE + '/articles.html')]
        if catf:
            crumbs.append((i['tag'], BASE + '/' + catf))
        crumbs.append((i['h1'], canonical))
        h.append(ld(breadcrumb(crumbs)))
    elif f == 'methodology.html':
        h.append(ld(breadcrumb([('Home', BASE + '/'), ('Methodology', canonical)])))
    h.append('<!--/sb-head-->')
    s = s.replace('</head>', ''.join(h) + '</head>', 1)

    # ---- hero image in articles
    if is_art:
        alt = esc('Cover graphic for the guide: ' + i['h1'])
        hero = ('<!--sb-hero--><img class="hero-img" src="img/cover-%s.jpg" alt="%s" width="1200" height="630" '
                'fetchpriority="high" decoding="async"><!--/sb-hero-->' % (i['slug'], alt))
        s, n = re.subn(r'(<p class="note">By .*?</p>)', lambda m: m.group(1) + hero, s, count=1, flags=re.S)

    # ---- thumbnails on article cards
    def thumb(m):
        slug = m.group(2)[:-5]
        if not os.path.exists('img/thumb-%s.jpg' % slug):
            return m.group(0)
        return m.group(1) + '<img class="th" src="img/thumb-%s.jpg" alt="" width="640" height="336" loading="lazy" decoding="async">' % slug
    s = re.sub(r'(<a class="card" href="(article-[^"]+\.html)">)(?!<img)', thumb, s)

    # ---- content block
    if f in BLOCKS:
        s = s.replace('</main>', section(BLOCKS[f]) + '</main>', 1)

    # ---- footer link to methodology
    if 'href="methodology.html">Methodology' not in s:
        s = s.replace('<li><a href="editorial-policy.html">Editorial Policy</a></li>',
                      '<li><a href="editorial-policy.html">Editorial Policy</a></li><li><a href="methodology.html">Methodology</a></li>')
    wr(f, s)
    report.append((f, len(title), len(desc)))

# CSS
css = rd('style.css')
if CSS_MARK not in css:
    wr('style.css', css.rstrip('\n') + '\n\n' + SB_CSS)

# --------------------------------------------------------------------------
# 5. sitemap
# --------------------------------------------------------------------------
urls = []
for f in sorted(glob.glob('*.html')):
    if f == 'index.html':
        continue
    urls.append('%s/%s' % (BASE, f))
urls.insert(0, BASE + '/')
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    sm.append('<url><loc>%s</loc><lastmod>%s</lastmod></url>' % (u, TODAY))
sm.append('</urlset>')
wr('sitemap.xml', '\n'.join(sm) + '\n')

print('pages processed:', len(report))
for f, t, d in report:
    flag = '' if (t <= 66 and 110 <= d <= 165) else '  <-- check'
    print('%-62s title=%2d desc=%3d%s' % (f, t, d, flag))
