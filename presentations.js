/* Wells Love — presentation templates page (UI). Needs presentations-engine.js */
(function () {
  'use strict';
  var P = window.WLPres, $ = function (s, r) { return (r || document).querySelector(s); };
  var grid = $('#pgrid'), more = $('#pmore'), countEl = $('#pcount'), modal = $('#pmodal');
  var BATCH = 48, state = { topic: document.body.getAttribute('data-topic') || '', style: '', tone: '', hue: '', q: '' };
  var data = P.all(), list = [], shown = 0, cur = null, curOpts = null, curSlide = 0, lastFocus = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- filters ---------- */
  function fill(sel, items, all) { sel.innerHTML = '<option value="">' + all + '</option>' + items.map(function (i) { return '<option value="' + esc(i[0]) + '">' + esc(i[1]) + '</option>'; }).join(''); }
  fill($('#fstyle'), P.STYLES.map(function (s, i) { return [String(i), s.name]; }), 'All backgrounds');
  fill($('#fhue'), P.HUES.map(function (h) { return [h[0], h[0]]; }), 'Any colour');
  var chips = $('#pchips');
  chips.innerHTML = '<button type="button" data-t="" class="chip">All topics</button>' + P.TOPICS.map(function (t) { return '<button type="button" class="chip" data-t="' + t.id + '">' + esc(t.name) + '</button>'; }).join('');
  function syncUI() {
    [].forEach.call(chips.children, function (b) { b.classList.toggle('on', b.getAttribute('data-t') === state.topic); b.setAttribute('aria-pressed', b.getAttribute('data-t') === state.topic); });
    $('#fstyle').value = state.style; $('#ftone').value = state.tone; $('#fhue').value = state.hue; $('#fq').value = state.q;
  }
  function apply() {
    var q = state.q.trim().toLowerCase();
    list = data.filter(function (t) {
      return (!state.topic || t.topic.id === state.topic) && (state.style === '' || String(t.si) === state.style) && (!state.tone || t.tone === state.tone) && (!state.hue || t.hueName === state.hue) && (!q || t.name.toLowerCase().indexOf(q) > -1 || t.topic.uses.indexOf(q) > -1);
    });
    grid.innerHTML = ''; shown = 0; countEl.textContent = list.length.toLocaleString('en-US') + ' template' + (list.length === 1 ? '' : 's');
    $('#pempty').hidden = list.length > 0; syncUI(); loadMore();
  }
  chips.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; state.topic = b.getAttribute('data-t'); apply(); });
  $('#fstyle').onchange = function () { state.style = this.value; apply(); };
  $('#ftone').onchange = function () { state.tone = this.value; apply(); };
  $('#fhue').onchange = function () { state.hue = this.value; apply(); };
  var qt; $('#fq').oninput = function () { var v = this.value; clearTimeout(qt); qt = setTimeout(function () { state.q = v; apply(); }, 200); };
  $('#freset').onclick = function () { state = { topic: document.body.getAttribute('data-topic') || '', style: '', tone: '', hue: '', q: '' }; apply(); };

  /* ---------- grid ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); paint(e.target); } }); }, { rootMargin: '300px' }) : null;
  function paint(cv) { var t = P.parseId(cv.getAttribute('data-id')); P.renderSlide(cv, t, P.defaults(t), 0, .25); }
  function loadMore() {
    var end = Math.min(list.length, shown + BATCH), html = '';
    for (var i = shown; i < end; i++) { var t = list[i]; html += '<article class="tcard"><a href="#t=' + t.id + '" data-id="' + t.id + '" aria-label="Open ' + esc(t.name) + '"><canvas data-id="' + t.id + '" width="480" height="270"></canvas></a><div class="tmeta"><h3>' + esc(t.name) + '</h3><span>' + esc(t.topic.name) + ' · PPTX · 16:9</span></div></article>'; }
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    while (tmp.firstChild) { var n = tmp.firstChild; grid.appendChild(n); var cv = n.querySelector('canvas'); if (io) io.observe(cv); else paint(cv); }
    shown = end; more.hidden = shown >= list.length;
    more.textContent = 'Show more templates (' + (list.length - shown).toLocaleString('en-US') + ' left)';
  }
  more.onclick = loadMore;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !more.hidden) loadMore(); }, { rootMargin: '600px' }).observe($('#psentinel'));
  grid.addEventListener('click', function (e) { var a = e.target.closest('a[data-id]'); if (!a) return; e.preventDefault(); open(a.getAttribute('data-id'), a); });

  /* ---------- modal ---------- */
  var main = $('#pbig'), strip = $('#pstrip'), f = { title: $('#otitle'), subtitle: $('#osub'), presenter: $('#opres'), head: $('#ohead'), body: $('#obody') };
  P.FONTS.forEach(function (n) { ['head', 'body'].forEach(function (k) { var o = document.createElement('option'); o.value = o.textContent = n; f[k].appendChild(o); }); });
  strip.innerHTML = P.SLIDE_NAMES.map(function (n, i) { return '<button type="button" data-i="' + i + '" title="' + n + '"><canvas width="192" height="108"></canvas></button>'; }).join('');
  function opts() { return { title: f.title.value || ' ', subtitle: f.subtitle.value, presenter: f.presenter.value, head: f.head.value, body: f.body.value }; }
  function renderAll() {
    curOpts = opts(); P.renderSlide(main, cur, curOpts, curSlide, .5);
    [].forEach.call(strip.children, function (b, i) { b.classList.toggle('on', i === curSlide); P.renderSlide(b.firstChild, cur, curOpts, i, .1); });
    $('#pslidename').textContent = 'Slide ' + (curSlide + 1) + ' of ' + P.SLIDE_NAMES.length + ' — ' + P.SLIDE_NAMES[curSlide];
  }
  var rt; function soon() { clearTimeout(rt); rt = setTimeout(renderAll, 120); }
  Object.keys(f).forEach(function (k) { f[k].addEventListener('input', soon); f[k].addEventListener('change', soon); });
  strip.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; curSlide = +b.getAttribute('data-i'); renderAll(); });
  function open(id, from) {
    var t = P.parseId(id); if (!t) return; cur = t; curSlide = 0; lastFocus = from || document.activeElement;
    var d = P.defaults(t); f.title.value = d.title; f.subtitle.value = d.subtitle; f.presenter.value = d.presenter; f.head.value = d.head; f.body.value = d.body;
    $('#pmtitle').textContent = t.name; $('#pmsub').textContent = t.topic.name + ' template · ' + t.style.name + ' design · ' + P.LAYOUT_LABEL[t.layout] + ' title · ' + t.hueName + ' ' + t.tone.toLowerCase() + ' colours';
    $('#pstatus').textContent = ''; modal.hidden = false; document.body.classList.add('mopen'); renderAll();
    if (location.hash !== '#t=' + id) history.replaceState(null, '', '#t=' + id);
    $('#pclose').focus();
  }
  function close() { modal.hidden = true; document.body.classList.remove('mopen'); if (location.hash) history.replaceState(null, '', location.pathname + location.search); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $('#pclose').onclick = close; modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return; if (e.key === 'Escape') close();
    if (e.key === 'Tab') { var fs = modal.querySelectorAll('button,input,select,a[href]'), a = fs[0], z = fs[fs.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  window.addEventListener('hashchange', function () { var m = /^#t=(.+)$/.exec(location.hash); if (m) open(m[1]); else if (!modal.hidden) close(); });

  function loadLib() { return window.PptxGenJS ? Promise.resolve() : new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'pptxgen.bundle.js'; s.onload = res; s.onerror = function () { rej(new Error('Could not load the PowerPoint builder.')); }; document.head.appendChild(s); }); }
  function status(m) { $('#pstatus').textContent = m; }
  $('#pdl').onclick = function () {
    var btn = this; btn.disabled = true; status('Building your PowerPoint file…');
    loadLib().then(function () { return P.downloadPptx(cur, opts()); }).then(function () { status('Done — check your downloads folder. Open the file in PowerPoint, Keynote or upload it to Google Slides.'); }).catch(function (e) { status('Sorry, the file could not be created: ' + e.message); }).then(function () { btn.disabled = false; });
  };
  $('#ppng').onclick = function () { P.downloadPng(cur, 'title').then(function () { status('Title background saved as PNG (1920×1080).'); }); };
  $('#ppng2').onclick = function () { P.downloadPng(cur, 'content').then(function () { status('Content background saved as PNG (1920×1080).'); }); };
  $('#pcopy').onclick = function () { var u = location.origin + location.pathname + '#t=' + cur.id; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { status('Link copied.'); }, function () { status(u); }); };

  apply();
  var m0 = /^#t=(.+)$/.exec(location.hash); if (m0) open(m0[1]);
})();
