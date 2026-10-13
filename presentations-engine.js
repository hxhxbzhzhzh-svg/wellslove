/* Wells Love — presentation template engine.
   Generates thousands of template backgrounds (topic x style x colour scheme) on <canvas>
   and builds real, editable .pptx files in the browser (PptxGenJS). No server, no uploads. */
(function (root) {
  'use strict';
  var W = 1920, H = 1080, IN_W = 13.333, IN_H = 7.5, PX = W / IN_W; // px per inch (144)

  /* ---------- data ---------- */
  var TOPICS = [
    ['business', 'Business', 215, 'chart', 'Business Strategy Overview', ['Market Overview', 'Strategy & Goals', 'Operations Plan', 'Financial Outlook', 'Next Steps'], 'company reports, strategy decks, board meetings and quarterly reviews'],
    ['marketing', 'Marketing', 338, 'target', 'Marketing Plan & Campaign Results', ['Audience & Personas', 'Brand Positioning', 'Channel Mix', 'Campaign Metrics', 'Budget & Timeline'], 'campaign plans, brand pitches, social media reports and go-to-market decks'],
    ['finance', 'Finance & Economics', 152, 'chart', 'Financial Analysis & Forecast', ['Key Figures', 'Revenue & Costs', 'Risk Assessment', 'Investment Case', 'Forecast'], 'investor updates, budgets, economics lectures and financial analysis'],
    ['startup', 'Startup & Pitch', 22, 'target', 'Startup Pitch Deck', ['Problem', 'Solution', 'Market Size', 'Business Model', 'The Ask'], 'investor pitches, demo days, product launches and founder updates'],
    ['psychology', 'Psychology', 280, 'mind', 'Introduction to Psychology', ['Core Concepts', 'Research Methods', 'Case Study', 'Findings', 'Applications'], 'lectures, thesis defences, therapy workshops and research summaries'],
    ['education', 'Education & School', 42, 'book', 'Lesson Plan & Learning Goals', ['Learning Objectives', 'Key Ideas', 'Activities', 'Assessment', 'Homework'], 'lessons, lectures, school projects, training courses and teacher workshops'],
    ['engineering', 'Engineering', 205, 'gear', 'Engineering Project Review', ['Requirements', 'System Design', 'Prototype & Testing', 'Results', 'Roadmap'], 'technical reviews, design proposals, lab reports and capstone projects'],
    ['it', 'IT & Software', 192, 'circuit', 'Software Architecture & Roadmap', ['Architecture', 'Tech Stack', 'Development Process', 'Release Plan', 'Team & Support'], 'product demos, architecture reviews, sprint reports and developer talks'],
    ['ai-data', 'AI & Data Science', 262, 'circuit', 'AI & Data Science Project', ['Problem Statement', 'Data & Features', 'Model Approach', 'Evaluation', 'Deployment'], 'machine-learning projects, analytics reports and research presentations'],
    ['cybersecurity', 'Cybersecurity', 140, 'circuit', 'Cybersecurity Briefing', ['Threat Landscape', 'Vulnerabilities', 'Controls', 'Incident Response', 'Recommendations'], 'security awareness training, audits, incident reports and risk briefings'],
    ['medicine', 'Medicine & Health', 176, 'pulse', 'Clinical Case Presentation', ['Patient Overview', 'Diagnosis', 'Treatment', 'Outcomes', 'Discussion'], 'case reports, medical lectures, health education and clinical research'],
    ['biology', 'Biology & Life Science', 112, 'molecule', 'Biology Research Overview', ['Hypothesis', 'Methods', 'Observations', 'Analysis', 'Conclusions'], 'lab results, biology lessons, ecology projects and science fairs'],
    ['chemistry', 'Chemistry', 298, 'molecule', 'Chemistry Lab Report', ['Objective', 'Materials', 'Procedure', 'Results', 'Safety Notes'], 'lab reports, chemistry lessons, industry research and safety training'],
    ['physics', 'Physics & Space', 232, 'atom', 'Physics Concepts Explained', ['Fundamental Laws', 'Experiment', 'Equations', 'Measurements', 'Implications'], 'physics lectures, astronomy talks, experiments and research seminars'],
    ['mathematics', 'Mathematics', 255, 'glyphs', 'Mathematics: Theory & Proofs', ['Definitions', 'Theorem', 'Proof Outline', 'Examples', 'Exercises'], 'maths lessons, proofs, statistics courses and conference talks'],
    ['design', 'Design & UX', 330, 'brush', 'Design Process & Case Study', ['Research', 'Concepts', 'Visual Language', 'Prototype', 'Outcome'], 'portfolio reviews, UX case studies, brand guidelines and client presentations'],
    ['fine-arts', 'Fine Arts', 14, 'brush', 'Art Movements & Techniques', ['Context', 'Style & Technique', 'Key Works', 'Influence', 'Gallery Notes'], 'art history, exhibitions, studio critiques and portfolio talks'],
    ['history', 'History', 30, 'columns', 'History: Eras & Turning Points', ['Background', 'Timeline', 'Key Figures', 'Consequences', 'Legacy'], 'history lessons, museum talks, essays and documentary outlines'],
    ['politics', 'Politics & Society', 6, 'columns', 'Political Systems & Public Policy', ['Context', 'Institutions', 'Policy Options', 'Public Opinion', 'Outlook'], 'political science classes, policy briefs, debates and civic projects'],
    ['law', 'Law & Legal', 46, 'columns', 'Legal Case Analysis', ['Facts of the Case', 'Legal Issues', 'Rules & Precedent', 'Analysis', 'Conclusion'], 'case briefs, moot court, compliance training and law lectures'],
    ['aviation', 'Aviation', 204, 'plane', 'Aviation Operations Briefing', ['Flight Planning', 'Aircraft Systems', 'Weather & Navigation', 'Safety Procedures', 'Debrief'], 'pilot training, airline briefings, aerospace engineering and airport operations'],
    ['tourism', 'Travel & Tourism', 186, 'plane', 'Travel Itinerary & Destination Guide', ['Destination Highlights', 'Itinerary', 'Accommodation', 'Budget', 'Travel Tips'], 'destination guides, tour proposals, hospitality training and trip plans'],
    ['construction', 'Construction', 36, 'skyline', 'Construction Project Plan', ['Site Overview', 'Schedule', 'Materials & Costs', 'Safety', 'Progress Report'], 'project updates, tenders, site safety training and civil engineering'],
    ['architecture', 'Architecture & Interior', 222, 'skyline', 'Architecture Concept Presentation', ['Concept', 'Site Analysis', 'Floor Plans', 'Materials', 'Renderings'], 'design concepts, studio reviews, interior proposals and urban planning'],
    ['geography', 'Geography', 126, 'globe', 'Geography: Regions & Landscapes', ['Location & Map', 'Climate', 'Population', 'Economy', 'Key Features'], 'geography lessons, regional studies, GIS projects and country profiles'],
    ['environment', 'Environment & Energy', 98, 'leaf', 'Sustainability & Climate Action', ['Current State', 'Impact', 'Solutions', 'Targets', 'Action Plan'], 'sustainability reports, climate lessons, renewable energy and ESG updates'],
    ['agriculture', 'Agriculture & Food', 78, 'leaf', 'Agriculture & Food Systems', ['Crops & Soil', 'Production', 'Supply Chain', 'Technology', 'Outlook'], 'farm reports, agronomy lectures, food science and supply-chain talks'],
    ['sports', 'Sports & Fitness', 8, 'target', 'Sports Performance & Training Plan', ['Season Overview', 'Training Plan', 'Performance Data', 'Nutrition', 'Goals'], 'coaching, team analysis, fitness programmes and sports science talks'],
    ['music', 'Music & Performing Arts', 292, 'wave', 'Music: Theory & Performance', ['Theory', 'Repertoire', 'Technique', 'History', 'Performance Plan'], 'music lessons, recitals, concert programmes and theatre projects'],
    ['literature', 'Literature & Languages', 18, 'book', 'Literature: Themes & Analysis', ['Author & Context', 'Plot & Structure', 'Themes', 'Style', 'Critical Reception'], 'book reports, essays, language classes and literary analysis']
  ].map(function (a) { return { id: a[0], name: a[1], hue: a[2], motif: a[3], title: a[4], terms: a[5], uses: a[6] }; });

  var VARIANTS = [
    { o: 0, d: 0, s: 62 }, { o: 0, d: 1, s: 58 }, { o: -28, d: 0, s: 66 }, { o: 28, d: 1, s: 60 }, { o: 150, d: 0, s: 55 },
    { o: 180, d: 1, s: 58 }, { o: -70, d: 0, s: 60 }, { o: 70, d: 1, s: 64 }, { o: 120, d: 0, s: 50 }, { o: -120, d: 1, s: 55 }
  ];
  var HUES = [['Red', 345, 15], ['Orange', 15, 45], ['Gold', 45, 70], ['Green', 70, 160], ['Teal', 160, 200], ['Blue', 200, 250], ['Purple', 250, 310], ['Pink', 310, 345]];
  function hueName(h) { h = (h + 360) % 360; for (var i = 0; i < HUES.length; i++) { var a = HUES[i]; if (a[1] > a[2] ? (h >= a[1] || h < a[2]) : (h >= a[1] && h < a[2])) return a[0]; } return 'Red'; }

  var FONTS = ['Calibri', 'Arial', 'Georgia', 'Trebuchet MS', 'Cambria', 'Verdana', 'Century Gothic', 'Palatino Linotype', 'Tahoma'];
  var PAIRS = [['Georgia', 'Calibri'], ['Trebuchet MS', 'Calibri'], ['Cambria', 'Calibri'], ['Century Gothic', 'Arial'], ['Palatino Linotype', 'Verdana'], ['Verdana', 'Georgia'], ['Arial', 'Calibri'], ['Tahoma', 'Georgia']];

  /* ---------- colour + random helpers ---------- */
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { var v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return ('0' + Math.round(v * 255).toString(16)).slice(-2); };
    return '#' + f(0) + f(8) + f(4);
  }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function palette(topic, v) {
    var V = VARIANTS[v], h = (topic.hue + V.o + 360) % 360, s = V.s;
    if (!V.d) return { dark: false, hue: h, bg: hsl(h, 32, 97), bg2: hsl(h, 38, 90), card: '#ffffff', primary: hsl(h, s, 30), side: hsl(h, s, 22), accent: hsl(h + 35, 85, 42), ink: hsl(h, 45, 13), muted: hsl(h, 15, 36) };
    return { dark: true, hue: h, bg: hsl(h, 50, 9), bg2: hsl(h, 46, 19), card: hsl(h, 40, 17), primary: hsl(h, s, 60), side: hsl(h, s, 27), accent: hsl(h + 40, 88, 62), ink: hsl(h, 30, 97), muted: hsl(h, 22, 76) };
  }

  /* ---------- motifs (line-art drawn in a -1..1 box) ---------- */
  var MOTIF = {
    chart: function (c) { var hs = [.4, .8, .6, 1.2, 1.6]; for (var i = 0; i < 5; i++) c.strokeRect(-.85 + i * .36, .85 - hs[i], .24, hs[i]); c.beginPath(); c.moveTo(-.85, .15); c.lineTo(-.4, -.15); c.lineTo(0, .05); c.lineTo(.45, -.55); c.lineTo(.85, -.85); c.stroke(); c.beginPath(); c.moveTo(.6, -.85); c.lineTo(.85, -.85); c.lineTo(.85, -.6); c.stroke(); },
    mind: function (c) { c.beginPath(); c.arc(0, 0, .9, 0, 6.3); c.stroke(); var P = [[-.5, -.4], [0, -.6], [.5, -.3], [.6, .25], [.1, .55], [-.45, .35], [0, 0]]; c.beginPath(); P.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(0, 0); P.forEach(function (p) { c.moveTo(0, 0); c.lineTo(p[0], p[1]); }); c.stroke(); P.forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], .08, 0, 6.3); c.stroke(); }); },
    gear: function (c) { c.beginPath(); for (var k = 0; k < 10; k++) { var a = k / 10 * 6.2832, b = (k + .5) / 10 * 6.2832; c.lineTo(Math.cos(a - .12) * .72, Math.sin(a - .12) * .72); c.lineTo(Math.cos(a - .07) * .95, Math.sin(a - .07) * .95); c.lineTo(Math.cos(a + .17) * .95, Math.sin(a + .17) * .95); c.lineTo(Math.cos(a + .22) * .72, Math.sin(a + .22) * .72); } c.closePath(); c.stroke(); c.beginPath(); c.arc(0, 0, .3, 0, 6.3); c.stroke(); },
    circuit: function (c) { c.strokeRect(-.3, -.3, .6, .6); for (var i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * .3, -.3); c.lineTo(i * .3, -.55); c.moveTo(i * .3, .3); c.lineTo(i * .3, .55); c.moveTo(-.3, i * .3); c.lineTo(-.55, i * .3); c.moveTo(.3, i * .3); c.lineTo(.55, i * .3); c.stroke(); } c.beginPath(); c.moveTo(-.55, -.3); c.lineTo(-.75, -.5); c.lineTo(-.95, -.5); c.moveTo(.55, .3); c.lineTo(.75, .5); c.lineTo(.95, .5); c.moveTo(0, -.55); c.lineTo(0, -.8); c.lineTo(.4, -.95); c.moveTo(0, .55); c.lineTo(0, .8); c.lineTo(-.4, .95); c.stroke(); [[-.95, -.5], [.95, .5], [.4, -.95], [-.4, .95]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], .06, 0, 6.3); c.stroke(); }); },
    pulse: function (c) { c.beginPath(); var P = [[-.3, -.9], [.3, -.9], [.3, -.3], [.9, -.3], [.9, .3], [.3, .3], [.3, .9], [-.3, .9], [-.3, .3], [-.9, .3], [-.9, -.3], [-.3, -.3]]; P.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(-.95, 0); c.lineTo(-.5, 0); c.lineTo(-.35, -.35); c.lineTo(-.1, .5); c.lineTo(.1, -.55); c.lineTo(.3, .15); c.lineTo(.42, 0); c.lineTo(.95, 0); c.stroke(); },
    molecule: function (c) { c.beginPath(); for (var k = 0; k < 6; k++) { var a = k / 6 * 6.2832 + .52; c.lineTo(Math.cos(a) * .42, Math.sin(a) * .42); } c.closePath(); c.stroke(); [[.5, -.8], [-.9, .1], [.55, .85]].forEach(function (p, i) { var a = [-.52, 3.14, 1.57 + .5][i]; c.beginPath(); c.moveTo(Math.cos(a) * .42, Math.sin(a) * .42); c.lineTo(p[0], p[1]); c.stroke(); c.beginPath(); c.arc(p[0], p[1], .13, 0, 6.3); c.stroke(); }); },
    atom: function (c) { for (var i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, 0, .95, .35, i * 1.0472, 0, 6.3); c.stroke(); } c.beginPath(); c.arc(0, 0, .1, 0, 6.3); c.stroke(); },
    glyphs: function (c) { c.save(); c.fillStyle = c.strokeStyle; c.font = 'bold .62px Georgia,serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('∑', -.45, -.45); c.fillText('π', .5, -.4); c.fillText('∫', -.5, .5); c.fillText('√', .5, .5); c.restore(); },
    brush: function (c) { c.save(); c.lineCap = 'round'; c.lineWidth = .17; c.beginPath(); c.moveTo(-.85, .5); c.bezierCurveTo(-.4, -.3, .2, .9, .85, -.2); c.stroke(); c.lineWidth = .1; c.beginPath(); c.moveTo(-.8, -.5); c.bezierCurveTo(-.3, -.9, .3, -.1, .8, -.7); c.stroke(); c.lineWidth = .06; c.beginPath(); c.moveTo(-.6, .85); c.bezierCurveTo(-.2, .5, .3, 1.1, .7, .6); c.stroke(); c.restore(); },
    columns: function (c) { c.beginPath(); c.moveTo(-.95, -.5); c.lineTo(0, -.95); c.lineTo(.95, -.5); c.closePath(); c.stroke(); c.strokeRect(-.95, .75, 1.9, .14); for (var i = 0; i < 4; i++) c.strokeRect(-.78 + i * .44, -.38, .2, 1.1); },
    plane: function (c) { c.beginPath(); c.moveTo(-.9, -.1); c.lineTo(.9, -.8); c.lineTo(.3, .8); c.lineTo(0, .2); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(0, .2); c.lineTo(.9, -.8); c.stroke(); c.setLineDash([.06, .1]); c.beginPath(); c.moveTo(-.95, .75); c.bezierCurveTo(-.6, .2, -.4, .5, -.1, .1); c.stroke(); c.setLineDash([]); },
    skyline: function (c) { [[-.95, .15, .3, .75], [-.6, -.35, .3, 1.25], [-.25, -.85, .32, 1.75], [.12, -.1, .3, 1.0], [.47, .3, .3, .6]].forEach(function (b) { c.strokeRect(b[0], b[1], b[2], b[3]); }); for (var i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-.18, -.65 + i * .3); c.lineTo(.0, -.65 + i * .3); c.stroke(); } c.beginPath(); c.moveTo(-.98, .9); c.lineTo(.98, .9); c.stroke(); },
    globe: function (c) { c.beginPath(); c.arc(0, 0, .9, 0, 6.3); c.stroke(); c.beginPath(); c.ellipse(0, 0, .4, .9, 0, 0, 6.3); c.stroke(); c.beginPath(); c.ellipse(0, 0, .9, .32, 0, 0, 6.3); c.stroke(); c.beginPath(); c.moveTo(0, -.9); c.lineTo(0, .9); c.moveTo(-.9, 0); c.lineTo(.9, 0); c.stroke(); },
    leaf: function (c) { c.beginPath(); c.moveTo(-.8, .8); c.bezierCurveTo(-1, -.3, .2, -.95, .88, -.88); c.bezierCurveTo(.95, -.1, .3, .85, -.8, .8); c.stroke(); c.beginPath(); c.moveTo(-.8, .8); c.lineTo(.5, -.5); c.moveTo(-.2, .2); c.lineTo(-.15, -.35); c.moveTo(.1, -.1); c.lineTo(.55, .1); c.stroke(); },
    book: function (c) { c.beginPath(); c.moveTo(0, -.5); c.lineTo(-.95, -.7); c.lineTo(-.95, .6); c.lineTo(0, .85); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(0, -.5); c.lineTo(.95, -.7); c.lineTo(.95, .6); c.lineTo(0, .85); c.closePath(); c.stroke(); for (var i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-.75, -.35 + i * .25); c.lineTo(-.2, -.25 + i * .25); c.moveTo(.75, -.35 + i * .25); c.lineTo(.2, -.25 + i * .25); c.stroke(); } },
    wave: function (c) { for (var k = 0; k < 3; k++) { c.beginPath(); for (var i = 0; i <= 40; i++) { var x = -.95 + i / 40 * 1.9; c.lineTo(x, (k - 1) * .45 + Math.sin(i / 40 * 6.28 * (1 + k * .5) + k) * .22); } c.stroke(); } },
    target: function (c) { [.9, .6, .3].forEach(function (r) { c.beginPath(); c.arc(0, 0, r, 0, 6.3); c.stroke(); }); c.beginPath(); c.moveTo(0, 0); c.lineTo(.9, -.9); c.moveTo(.55, -.9); c.lineTo(.9, -.9); c.lineTo(.9, -.55); c.stroke(); }
  };
  function drawMotif(ctx, name, cx, cy, size, color, alpha, lw) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(size / 2, size / 2);
    ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = (lw || 3) / (size / 2); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    (MOTIF[name] || MOTIF.chart)(ctx); ctx.restore();
  }

  /* ---------- background styles ---------- */
  function lin(ctx, x0, y0, x1, y1, a, b) { var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function base(ctx, t) { ctx.fillStyle = lin(ctx, 0, 0, W, H, t.c.bg, t.c.bg2); ctx.fillRect(0, 0, W, H); }
  function flat(ctx, t) { ctx.fillStyle = t.c.bg; ctx.fillRect(0, 0, W, H); }
  function poly(ctx, pts, fill) { ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
  function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = fill; ctx.fill(); }
  function hex(ctx, x, y, r) { ctx.beginPath(); for (var k = 0; k < 6; k++) { var a = k / 6 * 6.2832 + .5236; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); }

  var STYLES = [
    { name: 'Soft Bokeh', ins: { title: [.9, .9], content: [.9, .9] }, draw: function (ctx, t, m) {
      base(ctx, t); var r = t.r, c = t.c, n = m === 'title' ? 9 : 4;
      for (var i = 0; i < n; i++) { var x = m === 'title' ? W * (.45 + r() * .65) : W * (.7 + r() * .4), y = H * (r() * 1.1 - .05), rad = 90 + r() * (m === 'title' ? 260 : 150); circle(ctx, x, y, rad, rgba(i % 2 ? c.accent : c.primary, .08 + r() * .14)); }
      drawMotif(ctx, t.motif, W - 250, H - 230, m === 'title' ? 330 : 150, c.primary, .22, 4); } },
    { name: 'Side Band', ins: { title: [3.9, .9], content: [1.8, .9] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c, bw = m === 'title' ? 470 : 200; ctx.fillStyle = lin(ctx, 0, 0, 0, H, c.side, c.primary); ctx.fillRect(0, 0, bw, H);
      ctx.fillStyle = c.accent; ctx.fillRect(bw, 0, 14, H); drawMotif(ctx, t.motif, bw / 2, m === 'title' ? H / 2 : 190, m === 'title' ? 300 : 110, '#ffffff', .5, 4); } },
    { name: 'Corner Triangles', ins: { title: [.9, .9], content: [.9, .9] }, draw: function (ctx, t, m) {
      base(ctx, t); var c = t.c, k = m === 'title' ? 1 : .5;
      poly(ctx, [[W, 0], [W - 780 * k, 0], [W, 620 * k]], rgba(c.primary, .95)); poly(ctx, [[W, 0], [W - 480 * k, 0], [W, 380 * k]], rgba(c.accent, .9));
      poly(ctx, [[0, H], [560 * k, H], [0, H - 420 * k]], rgba(c.primary, .85)); poly(ctx, [[0, H], [300 * k, H], [0, H - 220 * k]], rgba(c.accent, .8));
      if (m === 'title') drawMotif(ctx, t.motif, W - 250, 200, 200, '#ffffff', .5, 4); } },
    { name: 'Grid Glow', ins: { title: [.9, .9], content: [.9, .9] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c, g = ctx.createRadialGradient(W * .85, H * .1, 20, W * .85, H * .1, m === 'title' ? 1000 : 600); g.addColorStop(0, rgba(c.accent, .45)); g.addColorStop(.5, rgba(c.primary, .2)); g.addColorStop(1, rgba(c.primary, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = rgba(c.primary, c.dark ? .22 : .16); ctx.lineWidth = 2; for (var x = 0; x <= W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (var y = 0; y <= H; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      if (m === 'title') drawMotif(ctx, t.motif, W - 300, H - 260, 300, c.accent, .7, 4); } },
    { name: 'Layered Waves', ins: { title: [.9, .9], content: [.9, .9] }, draw: function (ctx, t, m) {
      base(ctx, t); var c = t.c, hh = m === 'title' ? 210 : 120, cols = [rgba(c.primary, .25), rgba(c.accent, .45), rgba(c.primary, .9)];
      for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(0, H); for (var x = 0; x <= W; x += 20) ctx.lineTo(x, H - hh * (.35 + k * .22) - Math.sin(x / (240 + k * 90) + k * 1.7) * hh * .18); ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = cols[k]; ctx.fill(); }
      if (m === 'title') drawMotif(ctx, t.motif, W - 230, 210, 230, c.primary, .35, 4); } },
    { name: 'Diagonal Split', ins: { title: [.9, 5.3], content: [.9, 1.3] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c;
      if (m === 'title') { poly(ctx, [[1210, 0], [W, 0], [W, H], [900, H]], lin(ctx, 1000, 0, W, H, c.side, c.primary)); poly(ctx, [[1170, 0], [1210, 0], [900, H], [860, H]], c.accent); drawMotif(ctx, t.motif, 1560, H / 2, 420, '#ffffff', .5, 5); }
      else { poly(ctx, [[W - 120, 0], [W, 0], [W, H], [W - 220, H]], lin(ctx, W - 200, 0, W, H, c.side, c.primary)); poly(ctx, [[W - 140, 0], [W - 120, 0], [W - 220, H], [W - 240, H]], c.accent); } } },
    { name: 'Halftone Dots', ins: { title: [.9, .9], content: [.9, .9] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c, mx = m === 'title' ? 1250 : 700;
      for (var y = 30; y < H; y += 46) for (var x = W - 30; x > 0; x -= 46) { var d = Math.hypot(W - x, y); if (d > mx) continue; var r = Math.max(1, 15 * (1 - d / mx)); circle(ctx, x, y, r, rgba(((x + y) / 46 | 0) % 7 === 0 ? c.accent : c.primary, .75)); }
      if (m === 'title') drawMotif(ctx, t.motif, 330, H - 130, 150, c.primary, .3, 3); } },
    { name: 'Elegant Frame', ins: { title: [1.3, 1.3], content: [1.2, 1.2, .3] }, draw: function (ctx, t, m) {
      base(ctx, t); var c = t.c; ctx.strokeStyle = c.primary; ctx.lineWidth = 6; ctx.strokeRect(60, 60, W - 120, H - 120); ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.strokeRect(86, 86, W - 172, H - 172);
      [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]].forEach(function (p) { ctx.fillStyle = c.accent; ctx.fillRect(p[0] - 14, p[1] - 14, 28, 28); });
      if (m === 'title') drawMotif(ctx, t.motif, W / 2, 190, 150, c.primary, .55, 4); } },
    { name: 'Organic Blobs', ins: { title: [.9, .9], content: [.9, .9] }, draw: function (ctx, t, m) {
      base(ctx, t); var c = t.c, r = t.r, n = m === 'title' ? 5 : 3;
      for (var i = 0; i < n; i++) { var cx = W * (.72 + r() * .33), cy = i % 2 ? H * (.8 + r() * .25) : H * (r() * .3 - .05), R = (m === 'title' ? 260 : 170) + r() * 180; ctx.beginPath(); for (var a = 0; a <= 24; a++) { var ang = a / 24 * 6.2832, rr = R * (.78 + .22 * Math.sin(ang * 3 + i) + .1 * Math.cos(ang * 2 + i * 2)); ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr); } ctx.closePath(); ctx.fillStyle = rgba(i % 2 ? c.accent : c.primary, .22 + r() * .25); ctx.fill(); }
      if (m === 'title') drawMotif(ctx, t.motif, W - 240, 230, 220, c.primary, .6, 4); } },
    { name: 'Top & Bottom Bars', ins: { title: [.9, .9], content: [.9, .9] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c, th = m === 'title' ? 110 : 40; ctx.fillStyle = lin(ctx, 0, 0, W, 0, c.side, c.primary); ctx.fillRect(0, 0, W, th); ctx.fillRect(0, H - th * .7, W, th * .7);
      ctx.fillStyle = c.accent; ctx.fillRect(0, th, W * .22, 12); ctx.fillRect(W * .78, H - th * .7 - 12, W * .22, 12);
      if (m === 'title') drawMotif(ctx, t.motif, W - 220, H - 290, 250, c.primary, .3, 4); } },
    { name: 'Hex Mesh', ins: { title: [.9, 1.5], content: [.9, 1.5] }, draw: function (ctx, t, m) {
      base(ctx, t); var c = t.c, R = 62, lim = m === 'title' ? 900 : 400;
      for (var row = 0; row < 14; row++) for (var col = 0; col < 14; col++) { var x = W - 20 - col * R * 1.74 + (row % 2) * R * .87, y = 20 + row * R * 1.5, d = Math.hypot(W - x, y); if (d > lim) continue; var k = 1 - d / lim; hex(ctx, x, y, R - 5); if ((row * 7 + col * 3) % 5 === 0) { ctx.fillStyle = rgba(c.accent, .15 + k * .5); ctx.fill(); } ctx.strokeStyle = rgba(c.primary, .15 + k * .55); ctx.lineWidth = 3; ctx.stroke(); } } },
    { name: 'Orbit Rings', ins: { title: [.9, 3.2], content: [.9, 1.2] }, draw: function (ctx, t, m) {
      base(ctx, t); var c = t.c, n = m === 'title' ? 9 : 5; for (var i = 1; i <= n; i++) { ctx.beginPath(); ctx.arc(W, H, i * (m === 'title' ? 140 : 90), 0, 6.2832); ctx.strokeStyle = rgba(i % 3 === 0 ? c.accent : c.primary, .55 - i * .04); ctx.lineWidth = i % 3 === 0 ? 8 : 3; ctx.stroke(); }
      circle(ctx, W - 300, H - 300, 22, c.accent); if (m === 'title') drawMotif(ctx, t.motif, W - 170, H - 170, 190, c.primary, .6, 4); } },
    { name: 'Blueprint Grid', ins: { title: [1.9, 1.9], content: [1.9, 1.9, .15] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c; for (var x = 0; x <= W; x += 24) { ctx.strokeStyle = rgba(c.primary, x % 120 === 0 ? .28 : .1); ctx.lineWidth = x % 120 === 0 ? 2 : 1; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (var y = 0; y <= H; y += 24) { ctx.strokeStyle = rgba(c.primary, y % 120 === 0 ? .28 : .1); ctx.lineWidth = y % 120 === 0 ? 2 : 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = c.bg; ctx.fillRect(200, 60, W - 400, H - 120); ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.strokeRect(200, 60, W - 400, H - 120); ctx.fillStyle = c.accent; ctx.fillRect(188, 48, 24, 24); ctx.fillRect(W - 212, H - 72, 24, 24); if (m === 'title') drawMotif(ctx, t.motif, W - 420, H - 250, 190, c.primary, .4, 4); } },
    { name: 'Mosaic Tiles', ins: { title: [.9, 1.4], content: [.9, 1.2] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c, r = t.r, S = 70, cols = m === 'title' ? 8 : 4;
      for (var i = 0; i < cols; i++) for (var j = 0; j < 16; j++) { var p = Math.max(0, 1 - i / cols) * r(); if (p < .18) continue; ctx.fillStyle = rgba(r() > .72 ? c.accent : c.primary, Math.min(.95, p + .1)); ctx.fillRect(W - (i + 1) * S, j * S, S - 6, S - 6); }
      if (m === 'title') drawMotif(ctx, t.motif, 220, H - 140, 150, c.primary, .3, 3); } },
    { name: 'Right Panel', ins: { title: [.9, 5.9], content: [.9, 1.5] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c, pw = m === 'title' ? 740 : 130; ctx.fillStyle = lin(ctx, W - pw, 0, W, H, c.primary, c.side); ctx.fillRect(W - pw, 0, pw, H); ctx.fillStyle = c.accent; ctx.fillRect(W - pw - 12, 0, 12, H);
      if (m === 'title') { circle(ctx, W - 160, 150, 260, rgba('#ffffff', .07)); circle(ctx, W - 560, H - 120, 200, rgba('#ffffff', .06)); drawMotif(ctx, t.motif, W - pw / 2, H / 2, 400, '#ffffff', .55, 5); } else drawMotif(ctx, t.motif, W - pw / 2, 140, 70, '#ffffff', .6, 3); } },
    { name: 'Clean Accent', ins: { title: [1.4, 1.4], content: [1.2, 1.2] }, draw: function (ctx, t, m) {
      flat(ctx, t); var c = t.c; ctx.fillStyle = c.accent; ctx.fillRect(0, 0, 36, H); ctx.fillStyle = c.primary; ctx.fillRect(36, 0, 12, H);
      circle(ctx, W - 120, 120, m === 'title' ? 70 : 34, c.accent); circle(ctx, W - 230, 120, m === 'title' ? 40 : 18, c.primary);
      if (m === 'title') drawMotif(ctx, t.motif, W - 330, H - 230, 280, c.primary, .22, 4); else drawMotif(ctx, t.motif, W - 120, H - 100, 80, c.primary, .3, 3); } }
  ];

  /* ---------- layouts ---------- */
  var LAYOUTS = {
    'Soft Bokeh': ['left', 'card', 'center', 'hero'], 'Side Band': ['left'], 'Corner Triangles': ['left', 'center', 'card'], 'Grid Glow': ['left', 'card', 'center', 'hero'],
    'Layered Waves': ['left', 'center', 'card'], 'Diagonal Split': ['left'], 'Halftone Dots': ['left', 'card', 'center'], 'Elegant Frame': ['center', 'card', 'left'],
    'Organic Blobs': ['left', 'card', 'center', 'hero'], 'Top & Bottom Bars': ['left', 'card', 'center', 'hero'], 'Hex Mesh': ['left', 'card', 'hero'], 'Orbit Rings': ['left'],
    'Blueprint Grid': ['left', 'center', 'card'], 'Mosaic Tiles': ['left', 'card'], 'Right Panel': ['left'], 'Clean Accent': ['left', 'center', 'card', 'hero']
  };
  var LAYOUT_LABEL = { left: 'text left', card: 'title card', center: 'centred', hero: 'hero panel' };

  /* ---------- templates ---------- */
  var COUNT = TOPICS.length * STYLES.length * VARIANTS.length;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function make(ti, si, vi) {
    var tp = TOPICS[ti], st = STYLES[si], c = palette(tp, vi), hn = hueName(c.hue), lay = LAYOUTS[st.name];
    return { id: tp.id + '-s' + pad(si + 1) + '-v' + pad(vi + 1), ti: ti, si: si, vi: vi, topic: tp, style: st, c: c, hueName: hn, tone: c.dark ? 'Dark' : 'Light', layout: lay[(vi * 3 + ti) % lay.length], name: tp.name + ' · ' + st.name + ' · ' + hn + ' ' + (c.dark ? 'Dark' : 'Light') };
  }
  /* default order: topics vary fastest so neighbours differ */
  function byIndex(i) { var ti = i % TOPICS.length, rest = (i / TOPICS.length) | 0, si = rest % STYLES.length, vi = (rest / STYLES.length) | 0; return make(ti, si, (vi + si) % VARIANTS.length); }
  function all() { var a = []; for (var i = 0; i < COUNT; i++) a.push(byIndex(i)); return a; }
  function parseId(id) { var m = /^([a-z-]+)-s(\d\d)-v(\d\d)$/.exec(id || ''); if (!m) return null; var ti = TOPICS.findIndex(function (t) { return t.id === m[1]; }), si = +m[2] - 1, vi = +m[3] - 1; if (ti < 0 || si < 0 || si >= STYLES.length || vi < 0 || vi >= VARIANTS.length) return null; return make(ti, si, vi); }

  function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function card(ctx, x, y, w, h, r, fill, shadow) { ctx.save(); if (shadow) { ctx.shadowColor = 'rgba(10,20,40,.22)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 12; } rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  /* illustrated "photo" panel: gradient, big topic icon, floating UI chips */
  function heroPanel(ctx, t) {
    var c = t.c, pw = 640, ph = 860, x = W - pw - 110, y = 110;
    card(ctx, x, y, pw, ph, 44, lin(ctx, x, y, x + pw, y + ph, c.primary, c.side), true);
    ctx.save(); rr(ctx, x, y, pw, ph, 44); ctx.clip();
    for (var i = 0; i < 5; i++) circle(ctx, x + pw * .72, y + ph * .28, 90 + i * 105, rgba('#ffffff', .055));
    poly(ctx, [[x + pw * .05, y], [x + pw * .4, y], [x - 40, y + ph * .75], [x - 40, y + ph * .4]], rgba('#ffffff', .07));
    circle(ctx, x + pw * .12, y + ph * .86, 170, rgba(c.accent, .9)); circle(ctx, x + pw * .93, y + ph * .62, 70, rgba(c.accent, .6));
    drawMotif(ctx, t.motif, x + pw * .52, y + ph * .4, 400, '#ffffff', .95, 8);
    ctx.restore();
    card(ctx, x - 110, y + ph * .66, 310, 150, 26, c.card, true); var bx = x - 80;
    [.45, .75, .55, 1].forEach(function (k, i) { ctx.fillStyle = i % 2 ? c.accent : c.primary; rr(ctx, bx + i * 42, y + ph * .66 + 120 - 90 * k, 28, 90 * k, 8); ctx.fill(); });
    ctx.fillStyle = rgba(c.muted, .5); rr(ctx, x + 105, y + ph * .66 + 34, 70, 14, 7); ctx.fill(); rr(ctx, x + 105, y + ph * .66 + 62, 50, 14, 7); ctx.fill();
    card(ctx, x + pw - 220, y - 36, 250, 92, 22, c.card, true); circle(ctx, x + pw - 170, y + 10, 24, c.accent); ctx.fillStyle = rgba(c.muted, .55); rr(ctx, x + pw - 130, y - 4, 110, 14, 7); ctx.fill(); rr(ctx, x + pw - 130, y + 22, 76, 14, 7); ctx.fill();
  }
  function layoutOf(tpl) { return tpl.layout; }
  function drawBackground(ctx, tpl, mode) {
    var seed = (tpl.ti * 7919 + tpl.si * 104729 + tpl.vi * 1299709) | 0, t = { c: tpl.c, r: rng(seed + (mode === 'title' ? 1 : 2)), motif: tpl.topic.motif };
    ctx.save(); ctx.globalAlpha = 1; ctx.setLineDash([]);
    tpl.style.draw(ctx, t, mode); if (mode === 'title' && tpl.layout === 'hero') heroPanel(ctx, t);
    ctx.restore();
  }

  /* ---------- slide specs (inches) ---------- */
  function defaults(tpl) { var pr = PAIRS[(tpl.si + tpl.vi + tpl.ti) % PAIRS.length], t = tpl.topic; return { title: t.title, subtitle: 'Edit this subtitle — add your key message', presenter: 'Your Name · Organisation · ' + new Date().getFullYear(), head: pr[0], body: pr[1] }; }
  var SLIDE_NAMES = ['Title', 'Agenda', 'Section', 'Content + image', 'Two columns', 'Key numbers', 'Timeline', 'Steps', 'Chart', 'Team', 'Quote', 'Thank you'];
  function slides(tpl, o) {
    var c = tpl.c, t = tpl.topic, lay = tpl.layout, T = tpl.style.ins.title.slice(), C = tpl.style.ins.content, out = [], dy = C[2] || 0;
    if (lay === 'hero') T[1] = Math.max(T[1], 5.7);
    function txt(x, y, w, h, text, size, o2) { var r = { k: 'text', x: x, y: y, w: w, h: h, text: text, size: size, color: c.ink, font: o.body, align: 'left', valign: 'top' }; for (var k in o2) r[k] = o2[k]; return r; }
    function rect(x, y, w, h, color, o2) { var r = { k: 'rect', x: x, y: y, w: w, h: h, color: color }; for (var k in o2) r[k] = o2[k]; return r; }
    function crd(x, y, w, h, o2) { var r = { k: 'rrect', x: x, y: y, w: w, h: h, color: c.card, radius: .22, shadow: true }; for (var k in o2) r[k] = o2[k]; return r; }
    function dot(x, y, d, color, o2) { var r = { k: 'ellipse', x: x, y: y, w: d, h: d, color: color }; for (var k in o2) r[k] = o2[k]; return r; }
    function head(L, w, title) { return [txt(L, .26, w, .3, t.name.toUpperCase(), 12, { bold: true, color: c.accent, spacing: 3 }), txt(L, .6, w, .85, title, 34, { bold: true, font: o.head })]; }
    var L = T[0], w = IN_W - T[0] - T[1], cL = C[0], cw = IN_W - C[0] - C[1], i, x;
    /* 1 title */
    var tl = (o.title || '').length, ts = tl > 60 ? 34 : tl > 38 ? 40 : 48, it = [];
    if (lay === 'card') {
      var bx = L - .4, bw = w + .8; it.push(crd(bx, 1.35, bw, 4.7, { radius: .3 })); it.push(rect(bx + .5, 1.95, 1.2, .09, c.accent));
      it.push(txt(bx + .5, 2.2, bw - 1, 1.9, o.title, ts, { bold: true, font: o.head })); it.push(txt(bx + .5, 4.2, bw - 1, .9, o.subtitle, 20, { color: c.muted })); it.push(txt(bx + .5, 5.3, bw - 1, .4, o.presenter, 15, { color: c.primary, bold: true }));
    } else if (lay === 'center') {
      it.push(rect(IN_W / 2 - .65, 1.9, 1.3, .09, c.accent)); it.push(txt(L, 2.2, w, 2.0, String(o.title).toUpperCase(), Math.min(ts, 42), { bold: true, font: o.head, align: 'center', spacing: 3 }));
      it.push(txt(L, 4.4, w, .9, o.subtitle, 22, { color: c.muted, align: 'center' })); it.push(txt(L, 5.7, w, .5, o.presenter, 16, { color: c.primary, bold: true, align: 'center' }));
    } else {
      it.push(rect(L, 2.1, 1.3, .09, c.accent)); it.push(txt(L, 2.35, w, 2.0, o.title, lay === 'hero' ? Math.min(ts, 42) : ts, { bold: true, font: o.head })); it.push(txt(L, 4.5, w, 1.0, o.subtitle, 22, { color: c.muted })); it.push(txt(L, 5.85, w, .5, o.presenter, 16, { color: c.primary, bold: true }));
    }
    out.push({ mode: 'title', items: it });
    /* 2 agenda */
    it = head(cL, cw, 'Agenda');
    t.terms.forEach(function (term, i) { var y = 1.7 + i * .98; it.push(crd(cL, y, cw, .78, { radius: .16 })); it.push(dot(cL + .18, y + .1, .58, c.accent)); it.push(txt(cL + .18, y + .1, .58, .58, pad(i + 1), 16, { bold: true, color: '#ffffff', align: 'center', valign: 'middle', font: o.head })); it.push(txt(cL + 1.1, y, cw - 1.3, .78, term, 22, { valign: 'middle' })); });
    out.push({ mode: 'content', items: it });
    /* 3 section */
    out.push({ mode: 'title', items: [txt(L, 1.4, w, 2.0, '01', 110, { bold: true, color: c.accent, font: o.head }), rect(L, 3.7, 1.3, .09, c.primary), txt(L, 3.95, w, 1.2, t.terms[0], 44, { bold: true, font: o.head }), txt(L, 5.2, w, .8, 'Section introduction — one sentence about this part', 20, { color: c.muted })] });
    /* 4 content + image */
    var tw = cw * .54; it = head(cL, cw, t.terms[1]); it.push(rect(cL, 1.5, 1.0, .07, c.accent));
    it.push(txt(cL, 1.85, tw, 4.8, ['First key point — replace this text', 'Second key point with a fact or example', 'Third key point: keep bullets short', 'Fourth key point — add or delete lines'], 22, { bullets: true }));
    it.push({ k: 'rrect', x: cL + cw * .6, y: 1.85, w: cw * .4, h: 4.4, color: c.primary, alpha: .16, radius: .3 }); it.push(txt(cL + cw * .6, 1.85, cw * .4, 4.4, 'Drop your image here', 16, { color: c.muted, align: 'center', valign: 'middle' }));
    out.push({ mode: 'content', items: it });
    /* 5 two columns */
    var colw = (cw - .5) / 2; it = head(cL, cw, t.terms[2]);
    for (i = 0; i < 2; i++) { x = cL + i * (colw + .5); it.push(crd(x, 1.8, colw, 4.5)); it.push(rect(x + .35, 2.15, .8, .07, i ? c.accent : c.primary)); it.push(txt(x + .35, 2.35, colw - .7, .6, i ? 'Right heading' : 'Left heading', 22, { bold: true, color: c.primary, font: o.head })); it.push(txt(x + .35, 3.1, colw - .7, 3, ['Point one — add detail', 'Point two — add detail', 'Point three — add detail'], 18, { bullets: true })); }
    out.push({ mode: 'content', items: it });
    /* 6 numbers */
    var nw = (cw - 1.0) / 3, nums = ['85%', '2.4x', '120+'], labs = ['Key metric', 'Growth', 'Total']; it = head(cL, cw, t.terms[3]);
    for (i = 0; i < 3; i++) { x = cL + i * (nw + .5); it.push(rect(x, 2.0, nw, .08, i === 1 ? c.accent : c.primary)); it.push(txt(x, 2.3, nw, 1.3, nums[i], 60, { bold: true, color: i === 1 ? c.accent : c.primary, font: o.head })); it.push(txt(x, 3.7, nw, .6, labs[i], 22, { bold: true })); it.push(txt(x, 4.3, nw, 1.2, 'Short description of this number and why it matters.', 16, { color: c.muted })); }
    out.push({ mode: 'content', items: it });
    /* 7 timeline */
    var yrs = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']; it = head(cL, cw, 'Timeline'); var tw4 = cw / 4;
    it.push(rect(cL + .3, 3.18, cw - .6, .06, c.primary, { alpha: .45 }));
    for (i = 0; i < 4; i++) { x = cL + i * tw4; it.push(txt(x, 2.0, tw4 - .2, .5, yrs[i], 20, { bold: true, color: c.primary, font: o.head })); it.push(dot(x, 2.9, .65, i % 2 ? c.accent : c.primary)); it.push(txt(x, 2.9, .65, .65, String(i + 1), 18, { bold: true, color: '#ffffff', align: 'center', valign: 'middle' })); it.push(txt(x, 3.85, tw4 - .3, .5, t.terms[i], 18, { bold: true })); it.push(txt(x, 4.45, tw4 - .3, 1.6, 'Describe this milestone in one or two short lines.', 15, { color: c.muted })); }
    out.push({ mode: 'content', items: it });
    /* 8 steps */
    var sw = (cw - 1.0) / 3; it = head(cL, cw, 'How it works');
    for (i = 0; i < 3; i++) { x = cL + i * (sw + .5); it.push(crd(x, 1.9, sw, 4.2)); it.push(dot(x + .35, 2.2, .75, i === 1 ? c.accent : c.primary)); it.push(txt(x + .35, 2.2, .75, .75, String(i + 1), 24, { bold: true, color: '#ffffff', align: 'center', valign: 'middle', font: o.head })); it.push(txt(x + .35, 3.2, sw - .7, .6, t.terms[i + 1], 21, { bold: true, font: o.head })); it.push(txt(x + .35, 3.95, sw - .7, 1.9, 'Explain this step in two or three lines. Keep it simple and specific.', 16, { color: c.muted })); }
    out.push({ mode: 'content', items: it });
    /* 9 chart */
    var cwid = cw * .6; it = head(cL, cw, t.terms[4]);
    it.push(crd(cL, 1.75, cwid, 4.7)); it.push({ k: 'chart', x: cL + .25, y: 1.95, w: cwid - .5, h: 4.3, labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'], values: [32, 48, 41, 66, 82], color: c.primary, accent: c.accent, ink: c.ink, muted: c.muted });
    it.push(txt(cL + cwid + .4, 1.9, cw - cwid - .4, .6, 'Key insight', 22, { bold: true, color: c.primary, font: o.head })); it.push(txt(cL + cwid + .4, 2.6, cw - cwid - .4, 3.8, ['Right-click the chart in PowerPoint and choose Edit Data', 'Replace the sample numbers with yours', 'Summarise what the chart shows'], 17, { bullets: true }));
    out.push({ mode: 'content', items: it });
    /* 10 team */
    var tm = (cw - 1.0) / 3, names = ['Anna Smith', 'David Lee', 'Maria Garcia'], roles = ['Role / title', 'Role / title', 'Role / title'], ini = ['AS', 'DL', 'MG']; it = head(cL, cw, 'Our team');
    for (i = 0; i < 3; i++) { x = cL + i * (tm + .5); it.push(crd(x, 1.95, tm, 4.1)); it.push(dot(x + tm / 2 - .6, 2.3, 1.2, i === 1 ? c.accent : c.primary)); it.push(txt(x + tm / 2 - .6, 2.3, 1.2, 1.2, ini[i], 26, { bold: true, color: '#ffffff', align: 'center', valign: 'middle', font: o.head })); it.push(txt(x + .2, 3.75, tm - .4, .5, names[i], 21, { bold: true, align: 'center', font: o.head })); it.push(txt(x + .2, 4.25, tm - .4, .4, roles[i], 15, { color: c.primary, bold: true, align: 'center' })); it.push(txt(x + .3, 4.8, tm - .6, 1.0, 'One short sentence about this person.', 14, { color: c.muted, align: 'center' })); }
    out.push({ mode: 'content', items: it });
    /* 11 quote */
    out.push({ mode: 'title', items: [txt(L, .9, 2, 1.8, '“', 140, { bold: true, color: c.accent, font: 'Georgia' }), txt(L, 2.55, w, 2.6, 'A short, memorable quote or key takeaway goes here.', 34, { italic: true, font: o.head }), txt(L, 5.5, w, .5, '— Author or source', 18, { color: c.muted })] });
    /* 12 thank you */
    var ce = lay === 'center';
    out.push({ mode: 'title', items: [rect(ce ? IN_W / 2 - .65 : L, 2.2, 1.3, .09, c.accent), txt(L, 2.45, w, 1.4, 'Thank you', 60, { bold: true, font: o.head, align: ce ? 'center' : 'left' }), txt(L, 4.0, w, .7, 'Questions & discussion', 24, { color: c.muted, align: ce ? 'center' : 'left' }), txt(L, 5.3, w, .5, 'name@example.com  ·  www.example.com', 18, { color: c.primary, bold: true, align: ce ? 'center' : 'left' })] });
    out.forEach(function (sl) { if (sl.mode === 'content' && dy) sl.items.forEach(function (q) { q.y += dy; }); });
    return out;
  }

  /* ---------- canvas rendering of a slide ---------- */
  function wrap(ctx, text, maxW) {
    var lines = [], paras = String(text).split('\n');
    paras.forEach(function (p) { var words = p.split(/\s+/), line = ''; words.forEach(function (wd) { var test = line ? line + ' ' + wd : wd; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = wd; } else line = test; }); lines.push(line); });
    return lines;
  }
  function renderSlide(canvas, tpl, o, index, scale) {
    scale = scale || 1; canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
    var ctx = canvas.getContext('2d'); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    var sl = slides(tpl, o)[index]; drawBackground(ctx, tpl, sl.mode);
    sl.items.forEach(function (it) {
      var X = it.x * PX, Y = it.y * PX, Wd = it.w * PX, Ht = it.h * PX;
      if (it.k === 'rect') { ctx.globalAlpha = it.alpha == null ? 1 : it.alpha; ctx.fillStyle = it.color; ctx.fillRect(X, Y, Wd, Ht); ctx.globalAlpha = 1; return; }
      if (it.k === 'rrect') { ctx.save(); ctx.globalAlpha = it.alpha == null ? 1 : it.alpha; card(ctx, X, Y, Wd, Ht, it.radius * PX, it.color, it.shadow && it.alpha == null); ctx.restore(); return; }
      if (it.k === 'ellipse') { ctx.beginPath(); ctx.ellipse(X + Wd / 2, Y + Ht / 2, Wd / 2, Ht / 2, 0, 0, 6.2832); ctx.fillStyle = it.color; ctx.fill(); return; }
      if (it.k === 'chart') {
        var mx = Math.max.apply(null, it.values) * 1.15, n = it.values.length, bw = Wd / n * .52, base = Y + Ht - 46;
        ctx.strokeStyle = rgba(it.muted, .25); ctx.lineWidth = 2; for (var g = 0; g < 4; g++) { var gy = base - (base - Y) * g / 3.3; ctx.beginPath(); ctx.moveTo(X, gy); ctx.lineTo(X + Wd, gy); ctx.stroke(); }
        it.values.forEach(function (v, k) { var bh = (base - Y) * v / mx, bx2 = X + Wd / n * k + (Wd / n - bw) / 2; ctx.fillStyle = k === n - 1 ? it.accent : it.color; rr(ctx, bx2, base - bh, bw, bh, 8); ctx.fill(); ctx.fillStyle = it.muted; ctx.font = '26px Arial,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(it.labels[k], bx2 + bw / 2, base + 10); ctx.fillStyle = it.ink; ctx.textBaseline = 'bottom'; ctx.fillText(v, bx2 + bw / 2, base - bh - 6); });
        return;
      }
      var px = it.size * 2; ctx.font = (it.italic ? 'italic ' : '') + (it.bold ? 'bold ' : '') + px + 'px "' + it.font + '", Arial, sans-serif'; ctx.fillStyle = it.color; ctx.textBaseline = 'top'; ctx.textAlign = it.align;
      if ('letterSpacing' in ctx) ctx.letterSpacing = it.spacing ? it.spacing * 2 + 'px' : '0px';
      var list = Array.isArray(it.text) ? it.text : [it.text], ind = it.bullets ? .38 * PX : 0, lh = px * 1.22, lines = [];
      list.forEach(function (s) { wrap(ctx, s, Wd - ind).forEach(function (ln, k) { lines.push({ s: ln, b: it.bullets && k === 0 }); }); if (it.bullets) lines.push({ gap: true }); });
      var total = lines.reduce(function (a, l) { return a + (l.gap ? px * .45 : lh); }, 0), y = Y, tx = it.align === 'center' ? X + Wd / 2 : X + ind;
      if (it.valign === 'middle') y += (Ht - total) / 2;
      lines.forEach(function (l) { if (l.gap) { y += px * .45; return; } if (l.b) { ctx.save(); ctx.fillStyle = tpl.c.accent; ctx.beginPath(); ctx.arc(X + px * .2, y + px * .52, px * .13, 0, 6.3); ctx.fill(); ctx.restore(); } ctx.fillText(l.s, tx, y); y += lh; });
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    });
  }

  /* ---------- pptx export ---------- */
  function bgData(tpl, mode) { var cv = document.createElement('canvas'); cv.width = W; cv.height = H; drawBackground(cv.getContext('2d'), tpl, mode); return cv.toDataURL('image/jpeg', .9); }
  function safeName(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'template'; }
  function hx(c) { return c.slice(1); }
  function buildPptx(tpl, o) {
    var P = new root.PptxGenJS(); P.layout = 'LAYOUT_WIDE'; P.title = o.title; P.author = o.presenter; P.company = 'Wells Love Templates';
    var d1 = bgData(tpl, 'title').replace(/^data:/, ''), d2 = bgData(tpl, 'content').replace(/^data:/, '');
    P.defineSlideMaster({ title: 'TITLE_BACKGROUND', background: { data: d1, path: 'title-bg.jpg' } });
    P.defineSlideMaster({ title: 'CONTENT_BACKGROUND', background: { data: d2, path: 'content-bg.jpg' } });
    var shadow = function () { return { type: 'outer', color: '0A1428', opacity: .2, blur: 12, offset: 4, angle: 90 }; };
    slides(tpl, o).forEach(function (sl) {
      var s = P.addSlide({ masterName: sl.mode === 'title' ? 'TITLE_BACKGROUND' : 'CONTENT_BACKGROUND' });
      sl.items.forEach(function (it) {
        var fill = { color: hx(it.color || '#000000'), transparency: it.alpha == null ? 0 : Math.round((1 - it.alpha) * 100) };
        if (it.k === 'rect') { s.addShape(P.ShapeType.rect, { x: it.x, y: it.y, w: it.w, h: it.h, fill: fill, line: { type: 'none' } }); return; }
        if (it.k === 'rrect') { var op = { x: it.x, y: it.y, w: it.w, h: it.h, rectRadius: it.radius, fill: fill, line: { type: 'none' } }; if (it.shadow && it.alpha == null) op.shadow = shadow(); s.addShape(P.ShapeType.roundRect, op); return; }
        if (it.k === 'ellipse') { s.addShape(P.ShapeType.ellipse, { x: it.x, y: it.y, w: it.w, h: it.h, fill: fill, line: { type: 'none' } }); return; }
        if (it.k === 'chart') { s.addChart(P.ChartType.bar, [{ name: 'Series 1', labels: it.labels, values: it.values }], { x: it.x, y: it.y, w: it.w, h: it.h, barDir: 'col', chartColors: [hx(it.color)], barGapWidthPct: 60, showLegend: false, showValue: true, dataLabelColor: hx(it.ink), dataLabelFontSize: 12, catAxisLabelColor: hx(it.muted), valAxisLabelColor: hx(it.muted), catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, valGridLine: { color: hx(it.muted), size: .25, style: 'solid' }, catGridLine: { style: 'none' }, valAxisLineShow: false, catAxisLineShow: false }); return; }
        var b = { x: it.x, y: it.y, w: it.w, h: it.h, fontFace: it.font, fontSize: it.size, color: hx(it.color), bold: !!it.bold, italic: !!it.italic, align: it.align, valign: it.valign, margin: 0, fit: 'shrink' };
        if (it.spacing) b.charSpacing = it.spacing;
        if (Array.isArray(it.text)) s.addText(it.text.map(function (tx) { return { text: tx, options: { bullet: it.bullets ? { indent: 24 } : false, breakLine: true, paraSpaceAfter: 10 } }; }), b);
        else s.addText(it.text, b);
      });
    });
    return P;
  }
  function downloadPptx(tpl, o) { return buildPptx(tpl, o).writeFile({ fileName: safeName(tpl.name) + '-' + tpl.id + '.pptx' }); }
  function downloadPng(tpl, mode) { var cv = document.createElement('canvas'); cv.width = W; cv.height = H; drawBackground(cv.getContext('2d'), tpl, mode); return new Promise(function (res) { cv.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = safeName(tpl.name) + '-' + tpl.id + '-background.png'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); res(); }, 300); }, 'image/png'); }); }

  root.WLPres = { TOPICS: TOPICS, STYLES: STYLES, VARIANTS: VARIANTS, HUES: HUES, FONTS: FONTS, SLIDE_NAMES: SLIDE_NAMES, LAYOUT_LABEL: LAYOUT_LABEL, COUNT: COUNT, byIndex: byIndex, all: all, parseId: parseId, defaults: defaults, slides: slides, renderSlide: renderSlide, buildPptx: buildPptx, downloadPptx: downloadPptx, downloadPng: downloadPng };
})(typeof window !== 'undefined' ? window : globalThis);
