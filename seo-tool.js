/* Wells Love SEO Suite v2 - runs fully in the browser */
(function(){
'use strict';
var W=window,D=document;
var SEV={crit:{l:'Critical',w:25,i:'🔴'},high:{l:'High',w:12,i:'🟠'},med:{l:'Medium',w:6,i:'🟡'},low:{l:'Low',w:2,i:'🟢'}};
var ORDER=['crit','high','med','low'];
var STOP=('the a an and or of to in on for with is are was were be by as at it this that from your you we our can will not but if so do does have has had its into than then them they their there these those which who what when how more most such also may use used using about over under between out up down off no yes all any each other some only same just very been being would could should while where why because per via vs one two get got make made new').split(' ');
function $(s,r){return (r||D).querySelector(s)}
function $$(s,r){return [].slice.call((r||D).querySelectorAll(s))}
function el(tag,cls,txt){var e=D.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function wordsOf(t){return t.match(/[\p{L}\p{N}'’-]+/gu)||[]}
var _ctx2d;
function px(text,size){try{if(_ctx2d===undefined){var c=D.createElement('canvas');_ctx2d=(c.getContext&&c.getContext('2d'))||null}if(!_ctx2d)return null;_ctx2d.font=size+'px Arial';return Math.round(_ctx2d.measureText(text).width)}catch(e){return null}}
function syll(w){w=w.toLowerCase().replace(/[^a-z]/g,'');if(!w)return 0;if(w.length<=3)return 1;w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'');var m=w.match(/[aeiouy]{1,2}/g);return m?m.length:1}
function flesch(text){var s=(text.match(/[.!?]+(\s|$)/g)||[]).length||1;var ws=wordsOf(text).filter(function(w){return /[a-z]/i.test(w)});if(ws.length<30)return null;var sy=0;ws.forEach(function(w){sy+=syll(w)});return Math.round(206.835-1.015*(ws.length/s)-84.6*(sy/ws.length))}
function ngrams(ws,n,min){var f={};for(var i=0;i+n<=ws.length;i++){var g=ws.slice(i,i+n);if(g.some(function(w){return STOP.indexOf(w)>=0||w.length<3||/^\d+$/.test(w)}))continue;var k=g.join(' ');f[k]=(f[k]||0)+1}return Object.keys(f).filter(function(k){return f[k]>=min}).sort(function(a,b){return f[b]-f[a]}).slice(0,8).map(function(k){return k+' ('+f[k]+')'})}
function scoreOf(items){var s=100;items.forEach(function(i){if(!i.pass)s-=SEV[i.sev].w});return Math.max(0,s)}
function verdict(s){return s>=90?'Excellent: only minor polish is left.':s>=75?'Good: fix the highlighted items to reach the top tier.':s>=55?'Needs work: several issues can limit visibility in search.':'Poor: fix the critical and high items first.'}

/* ---------- single page engine ---------- */
function auditDoc(doc,ctx){
  ctx=ctx||{};var items=[];
  function A(pass,sev,area,key,title,detail,fix,label){items.push({pass:pass,sev:sev,area:area,key:key,title:title,detail:detail||'',fix:fix||'',label:label||title})}
  var base=null;try{if(ctx.url)base=new URL(ctx.url)}catch(e){}
  var can=doc.querySelector('link[rel~="canonical"]');var canHref=can?(can.getAttribute('href')||'').trim():'';
  if(!base&&canHref){try{base=new URL(canHref)}catch(e){}}
  var meta=function(n){var e=doc.querySelector('meta[name="'+n+'"]');return e?(e.getAttribute('content')||'').trim():null};
  var prop=function(n){var e=doc.querySelector('meta[property="'+n+'"]');return e?(e.getAttribute('content')||'').trim():null};
  var m={url:ctx.url||canHref||'',canon:canHref};
  /* title */
  var te=doc.querySelector('title'),title=te?te.textContent.replace(/\s+/g,' ').trim():'';m.title=title;
  var tpx=title?px(title,20):null;m.titlePx=tpx;
  if(!title)A(false,'high','On-page','title-missing','Missing <title>','Search engines use the title as the main headline of a result.','<title>Primary Keyword: Clear Benefit | Brand</title>');
  else if(title.length<50||title.length>60)A(false,'med','On-page','title-len','Title length is '+title.length+' characters (target 50-60)',(title.length<50?'Too short: the headline underuses the available space.':'Too long: it will likely be truncated in results.')+(tpx?' Width about '+tpx+' px (Google shows roughly 580 px).':''),'<title>'+(title.length>60?title.slice(0,57).trim()+'...':title+' | Brand')+'</title>  <!-- rewrite to 50-60 characters -->','Title length outside 50-60 characters');
  else if(tpx&&tpx>600)A(false,'med','On-page','title-px','Title is '+tpx+' px wide and may be truncated','Wide letters make a 50-60 character title overflow the roughly 580 px limit.','','Title too wide in pixels');
  else A(true,'low','On-page','title-len','Title length is '+title.length+' characters');
  /* description */
  var desc=meta('description');m.desc=desc||'';
  if(!desc)A(false,'high','On-page','desc-missing','Missing meta description','Without it, search engines build the snippet from page text, usually less persuasively.','<meta name="description" content="150-160 characters that summarize the page and give a reason to click.">');
  else if(desc.length<150||desc.length>160)A(false,'med','On-page','desc-len','Meta description length is '+desc.length+' characters (target 150-160)',desc.length<150?'Too short: add the main benefit and a key phrase.':'Too long: the end will be cut off.','<meta name="description" content="...rewrite to 150-160 characters...">','Meta description length outside 150-160 characters');
  else A(true,'low','On-page','desc-len','Meta description length is '+desc.length+' characters');
  /* headings */
  var h1=$$('h1',doc);m.h1=h1.map(function(h){return h.textContent.replace(/\s+/g,' ').trim()});
  if(!h1.length)A(false,'high','On-page','h1-none','No H1 heading','Every page needs one H1 that states its topic.','<h1>Main topic of the page</h1>');
  else if(h1.length>1)A(false,'med','On-page','h1-multi',h1.length+' H1 headings found (use exactly one)','Extra H1s dilute the page topic. Demote the others to H2.','<h2>...</h2>','More than one H1');
  else A(true,'low','On-page','h1-multi','Exactly one H1');
  var hs=$$('h1,h2,h3,h4,h5,h6',doc),prev=0,skips=[];m.headings=[];
  hs.forEach(function(h){var l=+h.tagName[1];m.headings.push({l:l,t:h.textContent.replace(/\s+/g,' ').trim().slice(0,90)});if(prev&&l>prev+1)skips.push('H'+prev+' to H'+l);if(!prev&&l>1)skips.push('starts at H'+l);prev=l});
  if(skips.length)A(false,'med','On-page','heading-skip','Heading levels skipped ('+skips.length+')','Examples: '+skips.slice(0,4).join('; ')+'. Keep a strict hierarchy: H1, then H2, then H3.','<h2>Section</h2>\n<h3>Subsection</h3>  <!-- never jump from H2 to H4 -->','Skipped heading levels');
  else if(hs.length)A(true,'low','On-page','heading-skip','Heading hierarchy is sequential');
  /* canonical */
  if(!canHref)A(false,'high','Indexing','canon-missing','Missing canonical tag','A canonical tag tells search engines which URL is preferred and prevents duplicate-URL issues.','<link rel="canonical" href="https://example.com/this-page.html">');
  else{
    var okAbs=/^https:\/\//i.test(canHref);
    if(!okAbs)A(false,'med','Indexing','canon-abs','Canonical is not an absolute HTTPS URL','Found: '+canHref,'<link rel="canonical" href="https://example.com/this-page.html">');
    else A(true,'low','Indexing','canon-abs','Canonical tag present and absolute');
    if(ctx.url&&okAbs&&!ctx.siteMode){var norm=function(u){try{var x=new URL(u);return x.origin+x.pathname.replace(/\/index\.html$/,'/')}catch(e){return u}};if(norm(ctx.url)!==norm(canHref))A(false,'med','Indexing','canon-diff','Canonical differs from the page URL you entered','URL: '+ctx.url+' | canonical: '+canHref+'. Intended if this is a duplicate of another page; otherwise fix it.','<link rel="canonical" href="'+ctx.url+'">')}
  }
  /* robots */
  var rob=(meta('robots')||'')+','+(meta('googlebot')||'');m.noindex=/noindex/i.test(rob);
  if(m.noindex)A(false,'crit','Indexing','noindex','Page is blocked with noindex','The robots meta tag tells search engines to keep this page out of results.','<meta name="robots" content="index,follow">');
  else if(/nofollow/i.test(rob))A(false,'high','Indexing','nofollow','Robots meta contains nofollow','Links on this page will not pass signals.','<meta name="robots" content="index,follow">');
  else A(true,'low','Indexing','noindex','No noindex or nofollow directive');
  var lang=doc.documentElement.getAttribute('lang');m.lang=lang||'';
  if(!lang)A(false,'med','Indexing','lang','Missing lang attribute on <html>','The language attribute helps search engines and screen readers.','<html lang="en">');
  else A(true,'low','Indexing','lang','Language declared ('+lang+')');
  var hl=$$('link[rel="alternate"][hreflang]',doc);
  if(hl.length){var vals=hl.map(function(l){return l.getAttribute('hreflang')});var bad=vals.filter(function(v){return !/^(x-default|[a-z]{2,3}(-[A-Za-z0-9]{2,8})*)$/i.test(v)});
    if(bad.length)A(false,'high','Indexing','hreflang','Invalid hreflang values: '+bad.join(', '),'Use ISO 639-1 language codes with optional region, e.g. en-US.','<link rel="alternate" hreflang="en-US" href="https://example.com/en/">');
    else if(vals.indexOf('x-default')<0)A(false,'low','Indexing','hreflang','hreflang set has no x-default','Add a fallback for users whose language is not listed.','<link rel="alternate" hreflang="x-default" href="https://example.com/">');
    else A(true,'low','Indexing','hreflang','hreflang tags valid')}
  /* viewport, charset */
  var vp=meta('viewport');
  if(!vp)A(false,'high','Mobile','viewport','Missing viewport meta tag','Without it mobile browsers render the desktop layout shrunk down.','<meta name="viewport" content="width=device-width, initial-scale=1">');
  else if(/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(vp))A(false,'med','Mobile','viewport','Viewport blocks zooming','Disabling zoom hurts accessibility.','<meta name="viewport" content="width=device-width, initial-scale=1">');
  else A(true,'low','Mobile','viewport','Viewport configured');
  if(!doc.querySelector('meta[charset],meta[http-equiv="Content-Type" i]'))A(false,'low','Indexing','charset','Missing charset declaration','Declare UTF-8 within the first 1024 bytes of the document.','<meta charset="utf-8">');
  /* social */
  var miss=['og:title','og:description','og:image'].filter(function(k){return !prop(k)});
  if(miss.length)A(false,'med','Social','og-missing','Open Graph tags missing: '+miss.join(', '),'These control the preview in messengers and social networks.',miss.map(function(k){return '<meta property="'+k+'" content="...">'}).join('\n'),'Open Graph tags missing');
  else A(true,'low','Social','og-missing','Core Open Graph tags present');
  m.og={title:prop('og:title'),desc:prop('og:description'),image:prop('og:image')};
  if(m.og.image&&!/^https?:\/\//i.test(m.og.image))A(false,'low','Social','og-img-abs','og:image is not an absolute URL','Use a full https:// URL, ideally 1200x630.','<meta property="og:image" content="https://example.com/og-image.png">');
  if(m.og.image&&!prop('og:image:width'))A(false,'low','Social','og-img-size','og:image has no width/height tags','Declaring dimensions lets networks render the preview immediately.','<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">','og:image dimensions not declared');
  if(!meta('twitter:card'))A(false,'low','Social','twitter','Missing twitter:card','Needed for large link previews on X.','<meta name="twitter:card" content="summary_large_image">');
  else A(true,'low','Social','twitter','Twitter Card present');
  if(!doc.querySelector('link[rel~="icon"]'))A(false,'low','Social','favicon','No favicon link','Favicons appear next to results on mobile.','<link rel="icon" href="/favicon.ico" sizes="any">');
  /* structured data */
  var ld=$$('script[type="application/ld+json"]',doc),types=[],ldBad=0,ldObjs=[];
  ld.forEach(function(s){try{var j=JSON.parse(s.textContent);var arr=Array.isArray(j)?j:(j['@graph']||[j]);arr.forEach(function(o){if(o&&o['@type']){types=types.concat(o['@type']);ldObjs.push(o)}})}catch(e){ldBad++}});
  m.ldTypes=Array.from(new Set(types));m.ldCount=ld.length;
  if(ldBad)A(false,'high','Structured data','ld-invalid',ldBad+' JSON-LD block(s) contain invalid JSON','Invalid blocks are ignored, so no rich results can be earned.','<!-- validate at https://validator.schema.org/ and fix commas/quotes -->','Invalid JSON-LD');
  else if(!ld.length)A(false,'med','Structured data','ld-none','No JSON-LD structured data','Add Organization/WebSite on the homepage and Article, BreadcrumbList or WebApplication where relevant.','<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Page title","url":"https://example.com/page"}</script>','No structured data');
  else A(true,'low','Structured data','ld-none','Valid JSON-LD found: '+m.ldTypes.join(', '));
  var art=ldObjs.filter(function(o){return /^(Article|BlogPosting|NewsArticle)$/.test([].concat(o['@type'])[0])})[0];
  if(art){var req=['headline','datePublished','author','image'].filter(function(k){return !art[k]});
    if(req.length)A(false,'med','Structured data','ld-article','Article schema is missing: '+req.join(', '),'Google recommends these properties for Article rich results.','','Article schema incomplete');
    else A(true,'low','Structured data','ld-article','Article schema has the recommended properties');
    if(art.author&&[].concat(art.author)[0]&&[].concat(art.author)[0]['@type']==='Organization')A(false,'low','Structured data','ld-author','Article author is an Organization','A named Person author supports E-E-A-T signals.','"author":{"@type":"Person","name":"Author Name","url":"https://example.com/author"}','Article author is an Organization');
    if(art.dateModified&&art.datePublished&&Date.parse(art.dateModified)<Date.parse(art.datePublished))A(false,'med','Structured data','date-order','dateModified ('+String(art.dateModified).slice(0,10)+') is earlier than datePublished ('+String(art.datePublished).slice(0,10)+')','A page cannot be modified before it was published. Fix the dates.','','dateModified earlier than datePublished');
    var vis=(doc.body.textContent||'').match(/Published\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/);
    if(vis&&art.datePublished){var a=Date.parse(vis[1]+' UTC'),b=Date.parse(String(art.datePublished).slice(0,10)+'T00:00:00Z');
      if(!isNaN(a)&&!isNaN(b)&&Math.abs(a-b)>43200000)A(false,'med','Structured data','date-mismatch','Visible date ('+vis[1]+') differs from datePublished ('+String(art.datePublished).slice(0,10)+')','Keep the visible and structured dates identical, or Google may ignore both.','','Visible date differs from structured date')}}
  /* images */
  var imgs=$$('img',doc);m.imgs=imgs.length;
  if(imgs.length){
    var noAlt=imgs.filter(function(i){return i.getAttribute('alt')===null}),noDim=imgs.filter(function(i){return !(i.getAttribute('width')&&i.getAttribute('height'))});
    var legacy=imgs.filter(function(i){return /\.(png|jpe?g|gif|bmp)$/i.test((i.getAttribute('src')||'').split('?')[0])});
    var eager=imgs.slice(1).filter(function(i){return i.getAttribute('loading')!=='lazy'});
    if(noAlt.length)A(false,'med','Media','alt-missing',noAlt.length+' of '+imgs.length+' images have no alt attribute','Alt text is used for image search and accessibility (use alt="" for decorative images).','<img src="photo.webp" alt="Describe what the image shows" width="800" height="450">','Images without alt text');
    else A(true,'low','Media','alt-missing','All images have an alt attribute');
    if(noDim.length)A(false,'low','Core Web Vitals','img-dim',noDim.length+' image(s) without width and height','Missing dimensions cause layout shift (CLS).','<img src="photo.webp" alt="..." width="800" height="450">','Images without width/height');
    if(legacy.length)A(false,'low','Core Web Vitals','img-legacy',legacy.length+' image(s) use PNG/JPEG/GIF','WebP or AVIF are typically much smaller.','<picture><source srcset="photo.avif" type="image/avif"><source srcset="photo.webp" type="image/webp"><img src="photo.jpg" alt="..." width="800" height="450"></picture>','Legacy image formats');
    if(eager.length>2)A(false,'low','Core Web Vitals','img-lazy',eager.length+' below-the-fold image(s) are not lazy-loaded','Add loading="lazy" to every image except the first visible one.','<img src="photo.webp" alt="..." loading="lazy" width="800" height="450">','Images not lazy-loaded');
  }else A(true,'low','Media','alt-missing','No <img> elements to audit');
  /* security / perf */
  var mixed=$$('[src^="http://"],link[href^="http://"]',doc);
  if(mixed.length)A(false,'high','Security','mixed','Mixed content: '+mixed.length+' resource(s) loaded over http://','Browsers block or warn about insecure resources on HTTPS pages.','<!-- change http:// to https:// for: '+mixed.slice(0,3).map(function(e){return e.getAttribute('src')||e.getAttribute('href')}).join(', ')+' -->','Mixed content (http:// resources)');
  else A(true,'low','Security','mixed','No http:// resources found');
  var rb=$$('head script[src]',doc).filter(function(s){return !s.hasAttribute('async')&&!s.hasAttribute('defer')&&s.getAttribute('type')!=='module'});
  if(rb.length)A(false,'med','Core Web Vitals','render-block',rb.length+' render-blocking script(s) in <head>','Blocking scripts delay Largest Contentful Paint.','<script src="'+(rb[0].getAttribute('src')||'app.js')+'" defer></script>','Render-blocking scripts in head');
  else A(true,'low','Core Web Vitals','render-block','No render-blocking scripts in <head>');
  var fontCss=$$('link[rel="stylesheet"][href*="fonts.googleapis.com"]',doc);
  if(fontCss.length&&!$('link[rel="preconnect"][href*="fonts.gstatic.com"]',doc))A(false,'low','Core Web Vitals','font-preconnect','Google Fonts without preconnect to fonts.gstatic.com','Font files load from a second origin; preconnecting saves a round trip.','<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>','Google Fonts without gstatic preconnect');
  /* links */
  var as=$$('a[href]',doc),intl=0,ext=0,empty=0,ph=0;m.links=[];
  as.forEach(function(a){var h=(a.getAttribute('href')||'').trim();
    if(!h||h==='#'||/^javascript:/i.test(h))ph++;
    var im=a.querySelector('img[alt]');var txt=(a.textContent||'').trim()||a.getAttribute('aria-label')||(im&&im.getAttribute('alt'));
    if(!txt)empty++;
    m.links.push({href:h,text:(txt||'').replace(/\s+/g,' ').slice(0,60),rel:a.getAttribute('rel')||''});
    if(/^(mailto:|tel:)/i.test(h)||h.charAt(0)==='#')return;
    if(/^https?:\/\//i.test(h)){try{if(base&&new URL(h).host.replace(/^www\./,'')===base.host.replace(/^www\./,''))intl++;else ext++}catch(e){ext++}}else intl++});
  m.intl=intl;m.ext=ext;
  if(ph)A(false,'low','Links','link-placeholder',ph+' placeholder link(s) (href="#" or javascript:)','Crawlers cannot follow these. Use real URLs for navigation.','<a href="/real-page.html">Descriptive anchor text</a>','Placeholder links');
  if(empty)A(false,'low','Links','link-empty',empty+' link(s) without anchor text','Give every link descriptive text or an aria-label.','<a href="/page.html">Descriptive anchor text</a>','Links without anchor text');
  if(as.length>150)A(false,'low','Links','links-many',as.length+' links on one page','Very link-heavy pages dilute internal link value.','','Over 150 links on a page');
  if(!ph&&!empty&&as.length)A(true,'low','Links','link-placeholder','Links have anchor text and real targets');
  /* assets & ids for site mode */
  m.assets=[];$$('link[href]',doc).forEach(function(l){var r=(l.getAttribute('rel')||'');if(/stylesheet|icon|manifest|preload/.test(r))m.assets.push(l.getAttribute('href'))});
  $$('script[src]',doc).forEach(function(s){m.assets.push(s.getAttribute('src'))});imgs.forEach(function(i){if(i.getAttribute('src'))m.assets.push(i.getAttribute('src'))});
  m.ids=$$('[id]',doc).map(function(e){return e.id}).concat($$('a[name]',doc).map(function(e){return e.getAttribute('name')}));
  m.adsense=!!$('script[src*="adsbygoogle.js"]',doc);m.gtag=!!$('script[src*="googletagmanager.com"]',doc);
  /* content */
  var root=(doc.querySelector('main')||doc.body).cloneNode(true);
  $$('script,style,noscript,template,header,nav,footer,aside',root).forEach(function(n){n.remove()});
  var text=(root.textContent||'').replace(/\s+/g,' ').trim();m.text=text;
  var ws=text?wordsOf(text):[];m.words=ws.length;
  if(ws.length<300)A(false,'med','Content','thin','Thin content: '+ws.length+' words','Pages under about 300 words of main content rarely satisfy search intent. Add depth, examples and sources.','','Thin content (under 300 words)');
  else A(true,'low','Content','thin','Content length is '+ws.length+' words');
  var lw=ws.map(function(w){return w.toLowerCase()});
  m.uni=ngrams(lw,1,2);m.bi=ngrams(lw,2,2);m.tri=ngrams(lw,3,2);
  m.flesch=ws.length>=100?flesch(text):null;
  if(m.flesch!==null&&m.flesch<30)A(false,'low','Content','readability','Reading ease is very low (Flesch '+m.flesch+')','Shorter sentences and simpler words widen the audience (target 50+ for general web content).','','Very low reading ease');
  m.shingles=null;
  /* focus keyword */
  var fk=(ctx.focus||'').trim().toLowerCase();m.focus=fk;
  if(fk){
    var inT=title.toLowerCase().indexOf(fk)>=0,inH=m.h1.join(' ').toLowerCase().indexOf(fk)>=0,inD=(desc||'').toLowerCase().indexOf(fk)>=0;
    var first=lw.slice(0,100).join(' ').indexOf(fk)>=0,slug=/[?#]/.test(m.url)?'':(m.url||'').toLowerCase().replace(/[-_+]/g,' ').indexOf(fk.replace(/[-_]/g,' '))>=0;
    var cnt=0;if(lw.length){var pos=0,all=lw.join(' ');while((pos=all.indexOf(fk,pos))>=0){cnt++;pos+=fk.length}}
    var dens=lw.length?Math.round(cnt*fk.split(/\s+/).length/lw.length*1000)/10:0;m.kwDensity=dens;m.kwCount=cnt;
    if(!inT)A(false,'high','Focus keyword','kw-title','Focus keyword "'+fk+'" is not in the title','The title is the strongest on-page relevance signal.','','Focus keyword missing from title');else A(true,'low','Focus keyword','kw-title','Focus keyword is in the title');
    if(!inH)A(false,'med','Focus keyword','kw-h1','Focus keyword is not in the H1','','','Focus keyword missing from H1');else A(true,'low','Focus keyword','kw-h1','Focus keyword is in the H1');
    if(!inD)A(false,'low','Focus keyword','kw-desc','Focus keyword is not in the meta description','','','Focus keyword missing from description');else A(true,'low','Focus keyword','kw-desc','Focus keyword is in the meta description');
    if(!first)A(false,'low','Focus keyword','kw-first','Focus keyword is not in the first 100 words','','','Focus keyword missing from intro');else A(true,'low','Focus keyword','kw-first','Focus keyword appears in the first 100 words');
    if(m.url&&!slug)A(false,'low','Focus keyword','kw-url','Focus keyword is not in the URL','','','Focus keyword missing from URL');
    if(dens<0.3||dens>3)A(false,'low','Focus keyword','kw-density','Keyword density is '+dens+'% ('+cnt+' uses)',dens<0.3?'Mention the topic more naturally, aiming for roughly 0.5-2%.':'Possible keyword stuffing. Aim for roughly 0.5-2%.','','Keyword density out of range');else A(true,'low','Focus keyword','kw-density','Keyword density is '+dens+'%');
  }
  return {items:items,m:m,score:scoreOf(items)};
}
function auditHtml(html,ctx){var doc=new W.DOMParser().parseFromString(html,'text/html');return auditDoc(doc,ctx)}

/* ---------- robots.txt ---------- */
function parseRobots(t){var groups=[],cur=null,sm=[],lastAgent=false;String(t||'').split(/\r?\n/).forEach(function(line){line=line.replace(/#.*$/,'').trim();if(!line)return;var i=line.indexOf(':');if(i<0)return;var k=line.slice(0,i).trim().toLowerCase(),v=line.slice(i+1).trim();
  if(k==='user-agent'){if(!cur||!lastAgent){cur={agents:[],rules:[]};groups.push(cur)}cur.agents.push(v.toLowerCase());lastAgent=true}
  else{lastAgent=false;if(k==='sitemap')sm.push(v);else if((k==='disallow'||k==='allow')&&cur)cur.rules.push({t:k,p:v})}});return {groups:groups,sitemaps:sm}}
function robotsAllows(r,ua,path){ua=ua.toLowerCase();var g=r.groups.filter(function(x){return x.agents.some(function(a){return a!=='*'&&ua.indexOf(a)>=0})});if(!g.length)g=r.groups.filter(function(x){return x.agents.indexOf('*')>=0});
  var best=null,bl=-1;g.forEach(function(gr){gr.rules.forEach(function(rule){if(rule.p==='')return;var p=rule.p,end=/\$$/.test(p);if(end)p=p.slice(0,-1);var re=new RegExp('^'+p.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+(end?'$':''));
    if(re.test(path)){var len=rule.p.length;if(len>bl||(len===bl&&rule.t==='allow')){best=rule;bl=len}}})});
  return !best||best.t==='allow'}

/* ---------- site audit ---------- */
function fnv(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shingleSet(text){var w=wordsOf(text).map(function(x){return x.toLowerCase()});var set={},n=0;if(w.length<80)return null;for(var i=0;i+6<=w.length;i++){var h=fnv(w.slice(i,i+6).join(' '));if(h%3===0){set[h]=1;n++}}return n?set:null}
function jaccard(a,b){var inter=0,ka=Object.keys(a),kb=Object.keys(b).length;ka.forEach(function(k){if(b[k])inter++});var u=ka.length+kb-inter;return u?inter/u:0}
function titleTokens(t){t=t.replace(/\s*[|\u2013\u2014-]\s*[^|\u2013\u2014-]*$/,'');var o={},c=0;t.toLowerCase().split(/[^a-z0-9]+/).forEach(function(w){if(w.length>2&&STOP.indexOf(w)<0){o[w]=1;c++}});return c>=3?o:null}
function hostOf(u){try{return new URL(u).host.replace(/^www\./,'')}catch(e){return ''}}
function siteAudit(F,opt){
  opt=opt||{};var paths=Object.keys(F);
  var htmlP=paths.filter(function(p){return (F[p].isHtml||/\.html?$/i.test(p))&&F[p].text!=null}).sort();
  var docs={},DP=new W.DOMParser();
  htmlP.forEach(function(p){docs[p]=DP.parseFromString(F[p].text,'text/html')});
  var smUrls=[],hasSm=!!(F['sitemap.xml']&&F['sitemap.xml'].text),smIndex=false;
  if(hasSm){var x=DP.parseFromString(F['sitemap.xml'].text,'text/xml');smIndex=x.getElementsByTagName('sitemap').length>0;
    [].slice.call(x.getElementsByTagName('url')).forEach(function(u){var l=u.getElementsByTagName('loc')[0],d=u.getElementsByTagName('lastmod')[0];smUrls.push({loc:l?l.textContent.trim():'',lastmod:d?d.textContent.trim():''})})}
  var oc={};function bump(u){try{var o=new URL(u).origin;oc[o]=(oc[o]||0)+1}catch(e){}}
  htmlP.forEach(function(p){var c=docs[p].querySelector('link[rel~="canonical"]');if(c)bump(c.getAttribute('href')||'')});smUrls.forEach(function(u){bump(u.loc)});
  var origin=opt.origin||Object.keys(oc).sort(function(a,b){return oc[b]-oc[a]})[0]||'https://example.com';
  var host=hostOf(origin);
  function pageUrl(p){return origin+'/'+(p==='index.html'?'':p.replace(/(^|\/)index\.html$/,'$1'))}
  function urlToPath(u){var x;try{x=new URL(u)}catch(e){return null}if(x.host.replace(/^www\./,'')!==host)return null;var p;try{p=decodeURIComponent(x.pathname)}catch(e){p=x.pathname}p=p.replace(/^\//,'');if(p===''||/\/$/.test(p))p+='index.html';return p}
  function resolve(href,from){var u;try{u=new URL(href,pageUrl(from))}catch(e){return {bad:true}}
    if(!/^https?:$/.test(u.protocol))return {skip:true};if(u.host.replace(/^www\./,'')!==host)return {external:true};
    var p;try{p=decodeURIComponent(u.pathname)}catch(e){p=u.pathname}p=p.replace(/^\//,'');if(p===''||/\/$/.test(p))p+='index.html';
    var hit=F[p]?p:(F[p+'.html']?p+'.html':null);return {path:hit,want:p,hash:u.hash.replace(/^#/,'')}}
  var robotsTxt=F['robots.txt']&&F['robots.txt'].text,robots=robotsTxt!=null?parseRobots(robotsTxt):null;
  /* per-page audits */
  var pages=[],P={};
  htmlP.forEach(function(p){var r=auditDoc(docs[p],{url:pageUrl(p),siteMode:true});var o={path:p,url:pageUrl(p),res:r,m:r.m,score:r.score,items:r.items,inl:0,depth:-1,issues:{crit:0,high:0,med:0,low:0}};
    r.items.forEach(function(i){if(!i.pass)o.issues[i.sev]++});pages.push(o);P[p]=o});
  /* link graph */
  var inl={},broken=[],brokenAnchor=[],missingAsset=[],indexLinks=[],edges={},redirLinks=[],uncrawled=0;
  var NONHTML=/\.(pdf|jpe?g|png|gif|webp|avif|svg|ico|css|js|mjs|json|xml|txt|zip|gz|rar|mp3|mp4|webm|woff2?|ttf|otf|eot|docx?|xlsx?|pptx?)$/i;
  htmlP.forEach(function(p){edges[p]={};var m=P[p].m;var ids={};m.ids.forEach(function(i){ids[i]=1});
    m.links.forEach(function(l){var h=l.href;if(!h||/^(mailto:|tel:|javascript:)/i.test(h))return;
      if(h.charAt(0)==='#'){if(h.length>1&&!ids[decodeURIComponent(h.slice(1))])brokenAnchor.push(p+'  ->  '+h);return}
      var r=resolve(h,p);if(r.skip||r.external||r.bad)return;
      if(/(^|\/)index\.html([?#]|$)/.test(h)&&P['index.html'])indexLinks.push(p);
      if(opt.crawl&&r.path&&F[r.path]&&F[r.path].redirectTo){redirLinks.push(p+'  ->  '+h+'  (HTTP '+F[r.path].status+' to /'+F[r.path].redirectTo+')');var rt=r.path,g=0;while(F[rt]&&F[rt].redirectTo&&g++<6)rt=F[rt].redirectTo;r.path=F[rt]?rt:null;if(!r.path)return}
      if(opt.crawl&&r.path&&F[r.path]&&F[r.path].status>=400){broken.push(p+'  ->  '+h+'  (HTTP '+F[r.path].status+')');return}
      if(!r.path){if(opt.crawl){if(!NONHTML.test(r.want))uncrawled++;return}broken.push(p+'  ->  '+h);return}
      if(r.path!==p&&P[r.path]){edges[p][r.path]=1;(inl[r.path]=inl[r.path]||{})[p]=1;
        if(r.hash){var tids=P[r.path].m.ids;if(tids.indexOf(r.hash)<0&&tids.indexOf(decodeURIComponent(r.hash))<0)brokenAnchor.push(p+'  ->  '+h)}}});
    if(!opt.crawl)P[p].m.assets.forEach(function(a){var r=resolve(a,p);if(r.skip||r.external||r.bad)return;if(!r.path)missingAsset.push(p+'  ->  '+a)})});
  pages.forEach(function(o){o.inl=Object.keys(inl[o.path]||{}).length});
  /* depth */
  if(P['index.html']){var q=['index.html'];P['index.html'].depth=0;while(q.length){var c=q.shift();Object.keys(edges[c]).forEach(function(n){if(P[n].depth<0){P[n].depth=P[c].depth+1;q.push(n)}})}}
  var indexable=pages.filter(function(o){return !o.m.noindex});
  var S=[];function add(pass,sev,area,key,title,detail,list,fix){S.push({pass:pass,sev:sev,area:area,key:key,title:title,detail:detail||'',list:list||null,fix:fix||'',site:true})}
  function uniq(a){return Array.from(new Set(a))}
  /* indexing files */
  if(robots==null)add(false,'med','Crawl files','robots-missing','robots.txt not found','Without it crawlers rely on defaults and cannot discover your sitemap.',null,'User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml');
  else{var star=robots.groups.filter(function(g){return g.agents.indexOf('*')>=0});var blockAll=star.some(function(g){return g.rules.some(function(r){return r.t==='disallow'&&r.p==='/'})});
    if(blockAll)add(false,'crit','Crawl files','robots-block','robots.txt blocks the entire site','"Disallow: /" under User-agent: * stops crawling of every page.',null,'User-agent: *\nAllow: /');
    else add(true,'low','Crawl files','robots-block','robots.txt does not block the site');
    if(!robots.sitemaps.length)add(false,'low','Crawl files','robots-sm','robots.txt has no Sitemap directive','',null,'Sitemap: '+origin+'/sitemap.xml');
    var blocked=indexable.filter(function(o){return !robotsAllows(robots,'Googlebot','/'+(o.path==='index.html'?'':o.path))}).map(function(o){return o.path});
    if(blocked.length)add(false,'high','Crawl files','robots-pages',blocked.length+' page(s) are disallowed by robots.txt','Blocked pages cannot be crawled, so noindex or canonical tags on them are never seen.',blocked)}
  if(!hasSm)add(false,'high','Crawl files','sm-missing','sitemap.xml not found','A sitemap helps search engines discover and re-crawl pages.',null,'Use the sitemap generator below.');
  else{
    if(smIndex)add(false,'low','Crawl files','sm-index','sitemap.xml is a sitemap index','Only the index was inspected; check each child sitemap separately.');
    var inSm={},smBad=[],smHost=[],smNoFile=[];
    smUrls.forEach(function(u){var pth=urlToPath(u.loc);if(pth===null){smHost.push(u.loc);return}var hit=F[pth]?pth:(F[pth+'.html']?pth+'.html':null);if(!hit){if(!opt.crawl)smNoFile.push(u.loc)}else if(opt.crawl&&F[hit].status>=400)smNoFile.push(u.loc);else inSm[hit]=u});
    if(smHost.length)add(false,'high','Crawl files','sm-host',smHost.length+' sitemap URL(s) use a different host than the canonicals','Sitemap host should match the canonical host ('+origin+').',smHost);
    if(smNoFile.length)add(false,'high','Crawl files','sm-nofile',smNoFile.length+' sitemap URL(s) have no matching file','These would return 404.',smNoFile);
    var notIn=indexable.filter(function(o){return !inSm[o.path]}).map(function(o){return o.path});
    if(notIn.length)add(false,'med','Crawl files','sm-missing-pages',notIn.length+' indexable page(s) are missing from sitemap.xml','',notIn);
    var niSm=pages.filter(function(o){return o.m.noindex&&inSm[o.path]}).map(function(o){return o.path});
    if(niSm.length)add(false,'med','Crawl files','sm-noindex',niSm.length+' noindex page(s) are listed in sitemap.xml','Sitemaps should contain only indexable canonical URLs.',niSm);
    var cm=smUrls.filter(function(u){var pth=urlToPath(u.loc);var hit=pth&&(F[pth]?pth:F[pth+'.html']?pth+'.html':null);if(!hit||!P[hit])return false;var c=P[hit].m.canon;return c&&c!==u.loc&&c.replace(/index\.html$/,'')!==u.loc}).map(function(u){return u.loc});
    if(cm.length)add(false,'med','Crawl files','sm-canon',cm.length+' sitemap URL(s) differ from the page canonical','',cm);
    var lm=uniq(smUrls.map(function(u){return u.lastmod}).filter(Boolean));
    if(smUrls.length>5&&lm.length===1)add(false,'med','Crawl files','sm-lastmod','Every sitemap URL has the same lastmod ('+lm[0]+')','Identical dates teach Google to ignore lastmod. Use each page\'s real modification date.');
    else if(smUrls.length&&lm.length===0)add(false,'low','Crawl files','sm-lastmod','Sitemap has no lastmod values');
    if(!notIn.length&&!smNoFile.length&&!smHost.length&&!niSm.length)add(true,'low','Crawl files','sm-ok','sitemap.xml matches the indexable pages ('+smUrls.length+' URLs)')}
  /* canonicals */
  var cHost=[],cOther=[],cMissingTarget=[];
  pages.forEach(function(o){var c=o.m.canon;if(!c)return;if(hostOf(c)!==host){cHost.push(o.path+'  ->  '+c);return}var t=urlToPath(c);var hit=t&&(F[t]?t:F[t+'.html']?t+'.html':null);if(!hit)cMissingTarget.push(o.path+'  ->  '+c);else if(hit!==o.path)cOther.push(o.path+'  ->  '+hit)});
  if(cHost.length)add(false,'high','Indexing','canon-host',cHost.length+' canonical(s) point to another host','Expected '+origin+'.',cHost);
  if(cMissingTarget.length)add(false,'high','Indexing','canon-404',cMissingTarget.length+' canonical(s) point to a missing file','',cMissingTarget);
  if(cOther.length)add(false,'med','Indexing','canon-other',cOther.length+' page(s) canonicalize to a different page','Intended for duplicates only; these pages will usually not rank.',cOther);
  if(!cHost.length&&!cMissingTarget.length&&!cOther.length)add(true,'low','Indexing','canon-ok','All canonicals are self-referencing on the correct host');
  /* links */
  if(broken.length)add(false,'high','Links','broken',broken.length+' broken internal link(s)','The target file does not exist.',broken);else add(true,'low','Links','broken','No broken internal links');
  if(brokenAnchor.length)add(false,'low','Links','broken-anchor',brokenAnchor.length+' link(s) to missing #anchors','',brokenAnchor);
  if(missingAsset.length)add(false,'high','Links','missing-asset',missingAsset.length+' missing local asset reference(s)','CSS, JS, image or icon files referenced but absent.',missingAsset);
  var orphans=indexable.filter(function(o){return o.inl===0&&o.path!=='index.html'}).map(function(o){return o.path});
  if(orphans.length)add(false,'high','Links','orphans',orphans.length+' orphan page(s) with no internal links','Crawlers rarely find pages nothing links to.',orphans);else add(true,'low','Links','orphans','No orphan pages');
  var weak=indexable.filter(function(o){return o.inl>0&&o.inl<3&&o.path!=='index.html'}).map(function(o){return o.path+' ('+o.inl+' inlinks)'});
  if(weak.length)add(false,'low','Links','weak-inlinks',weak.length+' page(s) have fewer than 3 internal links','Add contextual links from related pages.',weak);
  var deep=pages.filter(function(o){return o.depth>3}).map(function(o){return o.path+' (depth '+o.depth+')'});
  if(deep.length)add(false,'low','Links','deep',deep.length+' page(s) are deeper than 3 clicks from the homepage','',deep);
  var unreach=pages.filter(function(o){return o.depth<0&&o.path!=='index.html'}).length;
  var ix=uniq(indexLinks);
  if(ix.length)add(false,'med','Indexing','index-links',ix.length+' page(s) link to index.html instead of /','This creates a duplicate homepage URL. Link to "/" and redirect /index.html to /.',ix);
  /* duplicates */
  function dupGroup(keyf,sev,key,label){var g={};indexable.forEach(function(o){var k=keyf(o);if(k)(g[k]=g[k]||[]).push(o.path)});var d=Object.keys(g).filter(function(k){return g[k].length>1});
    if(d.length)add(false,sev,'Content',key,d.length+' duplicate '+label+' group(s)','',d.map(function(k){return '"'+k.slice(0,70)+'"  in  '+g[k].join(', ')}));else add(true,'low','Content',key,'No duplicate '+label+'s')}
  dupGroup(function(o){return (o.m.title||'').toLowerCase()},'high','dup-title','title');
  dupGroup(function(o){return (o.m.desc||'').toLowerCase()},'med','dup-desc','meta description');
  dupGroup(function(o){return (o.m.h1[0]||'').toLowerCase()},'med','dup-h1','H1');
  /* near duplicates / cannibalization */
  var sh=[];indexable.slice(0,400).forEach(function(o){var s=shingleSet(o.m.text);if(s)sh.push({p:o.path,s:s,t:titleTokens(o.m.title||'')})});
  var near=[],near2=[],can=[];
  for(var i=0;i<sh.length;i++)for(var j=i+1;j<sh.length;j++){var jc=jaccard(sh[i].s,sh[j].s);if(jc>=0.8)near.push(sh[i].p+' <-> '+sh[j].p+'  ('+Math.round(jc*100)+'% identical)');else if(jc>=0.5)near2.push(sh[i].p+' <-> '+sh[j].p+'  ('+Math.round(jc*100)+'% similar)');
    if(sh[i].t&&sh[j].t&&(P[sh[i].p].m.title||'').toLowerCase()!==(P[sh[j].p].m.title||'').toLowerCase()){var a=sh[i].t,b=sh[j].t,it=0,ac=Object.keys(a);ac.forEach(function(k){if(b[k])it++});var un=ac.length+Object.keys(b).length-it;if(un&&it/un>=0.6)can.push(sh[i].p+' <-> '+sh[j].p+'  (titles overlap '+Math.round(it/un*100)+'%)')}}
  if(near.length)add(false,'high','Content','near-dup',near.length+' near-duplicate page pair(s)','Substantially identical text. Merge, rewrite or canonicalize.',near);
  if(near2.length)add(false,'low','Content','near-sim',near2.length+' page pair(s) share over half of their text','',near2);
  if(can.length)add(false,'med','Content','cannibal',can.length+' possible keyword cannibalization pair(s)','Pages with near-identical title keywords compete for the same queries.',can);
  if(!near.length&&!can.length)add(true,'low','Content','near-dup','No near-duplicate or cannibalizing pages found');
  /* analytics / ads / ads.txt */
  var g=pages.filter(function(o){return o.m.gtag}).length;
  if(g>0&&g<pages.length)add(false,'high','Tracking','gtag-partial','Analytics tag is on '+g+' of '+pages.length+' pages','Pages without it send no data to Google Analytics.',pages.filter(function(o){return !o.m.gtag}).map(function(o){return o.path}),'<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>');
  else if(g===0)add(false,'low','Tracking','gtag-none','No Google tag found on any page');else add(true,'low','Tracking','gtag-partial','Analytics tag is on every page');
  var ads=pages.some(function(o){return o.m.adsense});
  if(ads&&!F['ads.txt'])add(false,'med','Tracking','ads-txt','AdSense script found but ads.txt is missing','Without ads.txt, ad serving can be limited.',null,'google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0');
  else if(ads&&F['ads.txt'].text!=null&&!/^[^,\s]+,\s*pub-\d+,\s*(DIRECT|RESELLER)/mi.test(F['ads.txt'].text))add(false,'med','Tracking','ads-txt','ads.txt has no valid seller line');
  if(opt.crawl){
    var errs=paths.filter(function(k){return F[k].status>=400||F[k].status===0&&F[k].error}).map(function(k){return pageUrl(k)+' (HTTP '+(F[k].status||'fetch failed')+')'});
    if(errs.length)add(false,errs.some(function(e){return /HTTP 5/.test(e)})?'crit':'high','Crawl','http-errors',errs.length+' crawled URL(s) return errors','These URLs were discovered through links or the sitemap but do not return 200.',errs);
    else add(true,'low','Crawl','http-errors','Every crawled URL returned 200');
    if(redirLinks.length)add(false,'med','Links','redir-links',redirLinks.length+' internal link(s) point to URLs that redirect','Link straight to the final URL to save a hop.',redirLinks);
    var chainsL=paths.filter(function(k){return F[k].hops>1}).map(function(k){return pageUrl(k)+' ('+F[k].hops+' hops)'});
    if(chainsL.length)add(false,'med','Crawl','chains',chainsL.length+' URL(s) use redirect chains','',chainsL);
    var slowL=paths.filter(function(k){return F[k].ttfb>1800}).map(function(k){return pageUrl(k)+' ('+F[k].ttfb+' ms)'});
    if(slowL.length)add(false,'med','Performance','slow-ttfb',slowL.length+' page(s) respond slower than 1.8 s','Measured from the proxy location. Aim for under 800 ms.',slowL);
    var bigL=paths.filter(function(k){return F[k].size>500000}).map(function(k){return pageUrl(k)+' ('+Math.round(F[k].size/1024)+' KB)'});
    if(bigL.length)add(false,'low','Performance','big-html',bigL.length+' page(s) have HTML over 500 KB','',bigL);
    if(uncrawled)add(false,'low','Crawl','uncrawled',uncrawled+' internal link target(s) were not crawled','The page limit was reached. Raise it to audit every page.');
    (opt.liveItems||[]).forEach(function(i){S.push(i)});
  }
  /* aggregate per-page issues */
  var agg={};pages.forEach(function(o){o.items.forEach(function(i){if(i.pass)return;var a=agg[i.key]=agg[i.key]||{sev:i.sev,label:i.label,area:i.area,pages:[],fix:i.fix,key:i.key};if(ORDER.indexOf(i.sev)<ORDER.indexOf(a.sev))a.sev=i.sev;a.pages.push(o.path+(o.items.indexOf(i)>=0&&i.title!==i.label?'  ('+i.title+')':''))})});
  var aggItems=Object.keys(agg).map(function(k){var a=agg[k];return {pass:false,sev:a.sev,area:a.area,key:'agg-'+k,title:a.label+': '+a.pages.length+' of '+pages.length+' pages',detail:'',list:a.pages,fix:a.fix,site:true}});
  aggItems.sort(function(a,b){return ORDER.indexOf(a.sev)-ORDER.indexOf(b.sev)||b.list.length-a.list.length});
  var avg=pages.length?Math.round(pages.reduce(function(s,o){return s+o.score},0)/pages.length):0;
  var pen=0;S.forEach(function(i){if(!i.pass)pen+={crit:15,high:8,med:4,low:1}[i.sev]});
  var score=pages.length?Math.round(avg*0.6+Math.max(0,100-pen)*0.4):0;
  var tot={crit:0,high:0,med:0,low:0};S.concat(aggItems).forEach(function(i){if(!i.pass)tot[i.sev]++});
  function sitemapXml(){var today=new Date().toISOString().slice(0,10);var rows=indexable.filter(function(o){var c=o.m.canon;return !c||c===o.url||c===o.url.replace(/\/$/,'')}).sort(function(a,b){return (a.path==='index.html'?-1:b.path==='index.html'?1:a.path<b.path?-1:1)});
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+rows.map(function(o){var d=F[o.path].date;var lm=d&&!isNaN(d)?d.toISOString().slice(0,10):today;return '  <url><loc>'+o.url.replace(/&/g,'&amp;')+'</loc><lastmod>'+lm+'</lastmod></url>'}).join('\n')+'\n</urlset>\n'}
  return {score:score,avg:avg,origin:origin,pages:pages,siteItems:S,aggItems:aggItems,totals:tot,sitemapXml:sitemapXml,
    extraStats:(function(){if(!opt.crawl)return [];var t=paths.map(function(k){return F[k].ttfb}).filter(function(v){return v>0});return t.length?[['Avg TTFB (ms)',Math.round(t.reduce(function(a,b){return a+b},0)/t.length)],['Slowest TTFB (ms)',Math.max.apply(null,t)]]:[]})(),
    stats:{pages:pages.length,words:pages.reduce(function(s,o){return s+o.m.words},0),broken:broken.length,orphans:orphans.length,unreachable:unreach,files:paths.length,sitemapUrls:smUrls.length}}
}

/* ---------- ZIP reader (no dependencies) ---------- */
var TEXT_EXT=/\.(html?|xml|txt|webmanifest|json|css)$/i;
function stripRoot(map){var keys=Object.keys(map);if(!keys.length)return map;var f=keys[0].split('/')[0];if(!keys.every(function(k){return k.indexOf('/')>0&&k.split('/')[0]===f}))return map;var o={};keys.forEach(function(k){o[k.slice(f.length+1)]=map[k]});return o}
async function inflateRaw(u8){var ds=new W.DecompressionStream('deflate-raw');var st=new W.Blob([u8]).stream().pipeThrough(ds);return new Uint8Array(await new W.Response(st).arrayBuffer())}
async function readZip(buf){
  if(typeof W.DecompressionStream==='undefined')throw new Error('This browser cannot unzip files. Use the "Choose folder" button instead, or a current Chrome, Edge, Firefox or Safari 16.4+.');
  var u8=new Uint8Array(buf),dv=new DataView(buf),eocd=-1;
  for(var i=u8.length-22;i>=Math.max(0,u8.length-65557);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}
  if(eocd<0)throw new Error('Not a valid ZIP archive.');
  var n=dv.getUint16(eocd+10,true),off=dv.getUint32(eocd+16,true);
  if(n===0xFFFF||off===0xFFFFFFFF)throw new Error('ZIP64 archives are not supported.');
  var td=new TextDecoder('utf-8'),out={};
  for(var e=0;e<n;e++){
    if(dv.getUint32(off,true)!==0x02014b50)throw new Error('Corrupted ZIP directory.');
    var method=dv.getUint16(off+10,true),t=dv.getUint16(off+12,true),d=dv.getUint16(off+14,true),cs=dv.getUint32(off+20,true),us=dv.getUint32(off+24,true),nl=dv.getUint16(off+28,true),el2=dv.getUint16(off+30,true),cl=dv.getUint16(off+32,true),lo=dv.getUint32(off+42,true);
    var name=td.decode(u8.subarray(off+46,off+46+nl));off+=46+nl+el2+cl;
    if(/\/$/.test(name)||/(^|\/)(__MACOSX|\.git|node_modules)\//.test(name)||/(^|\/)\.DS_Store$/.test(name))continue;
    var date=new Date(Date.UTC(((d>>9)&127)+1980,((d>>5)&15)-1,d&31,(t>>11)&31,(t>>5)&63,(t&31)*2));
    var rec={size:us,date:date,text:null};
    if(TEXT_EXT.test(name)&&us<5e6){var ln=dv.getUint16(lo+26,true),le=dv.getUint16(lo+28,true),start=lo+30+ln+le,raw=u8.subarray(start,start+cs);
      var data=method===0?raw:method===8?await inflateRaw(raw):null;if(data)rec.text=td.decode(data)}
    out[name]=rec}
  return stripRoot(out)}
async function readFileList(list){
  list=[].slice.call(list);
  if(list.length===1&&/\.zip$/i.test(list[0].name))return readZip(await list[0].arrayBuffer());
  var out={};
  for(var i=0;i<list.length;i++){var f=list[i],name=(f.webkitRelativePath||f.name).replace(/\\/g,'/');if(/(^|\/)(\.git|node_modules|__MACOSX)\//.test(name))continue;
    out[name]={size:f.size,date:f.lastModified?new Date(f.lastModified):null,text:TEXT_EXT.test(name)&&f.size<5e6?await f.text():null}}
  return stripRoot(out)}

/* ---------- rendering ---------- */
function itemEl(i){
  var d=el('div','seo-item '+(i.pass?'pass':i.sev));
  var h=el('div','h');h.appendChild(el('span','',i.pass?'🟢':SEV[i.sev].i));
  h.appendChild(el('span','tag2',i.pass?'Passed':SEV[i.sev].l));h.appendChild(el('span','tag2',i.area));h.appendChild(el('span','',i.title));d.appendChild(h);
  if(i.detail)d.appendChild(el('p','',i.detail));
  if(i.list&&i.list.length){var ul=el('ul','seo-list');i.list.slice(0,12).forEach(function(x){ul.appendChild(el('li','',x))});if(i.list.length>12)ul.appendChild(el('li','','... and '+(i.list.length-12)+' more'));d.appendChild(ul)}
  if(i.fix)d.appendChild(el('pre','',i.fix));
  return d}
function reportText(head,items){var f=items.filter(function(i){return !i.pass});return [head,''].concat(f.map(function(i){return '['+SEV[i.sev].l.toUpperCase()+'] '+i.title+(i.detail?' - '+i.detail:'')+(i.list?'\n    '+i.list.slice(0,20).join('\n    '):'')+(i.fix?'\n    Fix: '+i.fix.replace(/\n/g,'\n    '):'')}),['','Passed: '+items.filter(function(i){return i.pass}).length+' checks']).join('\n')}
function box(summary,node,open){var d=el('details');if(open)d.open=true;d.appendChild(el('summary','',summary));d.appendChild(node);return d}
function table(cols,rows,cls){var t=el('table','seo-table '+(cls||''));var th=el('thead'),tr=el('tr');cols.forEach(function(c){tr.appendChild(el('th','',c))});th.appendChild(tr);t.appendChild(th);var tb=el('tbody');rows.forEach(function(r){var row=el('tr');r.forEach(function(c){var td=el('td');if(c&&c.nodeType)td.appendChild(c);else td.textContent=c==null?'':c;row.appendChild(td)});tb.appendChild(row)});t.appendChild(tb);var w=el('div','seo-scroll');w.appendChild(t);return w}
function download(name,text,mime){var b=new W.Blob([text],{type:mime||'text/plain'});var a=D.createElement('a');a.href=W.URL.createObjectURL(b);a.download=name;D.body.appendChild(a);a.click();setTimeout(function(){a.remove();W.URL.revokeObjectURL(a.href)},500)}
function copyBtn(label,getText){var b=el('button','btn o',label);b.type='button';b.style.marginTop='0';b.addEventListener('click',function(){var t=getText();var done=function(){b.textContent='Copied';setTimeout(function(){b.textContent=label},1500)};if(W.navigator.clipboard)W.navigator.clipboard.writeText(t).then(done);else{var ta=el('textarea');ta.value=t;D.body.appendChild(ta);ta.select();D.execCommand('copy');ta.remove();done()}});return b}
function actBtn(label,fn){var b=el('button','btn o',label);b.type='button';b.style.marginTop='0';b.addEventListener('click',fn);return b}
function serpEl(o){var s=el('div','seo-serp');var t=o.title||'(no title)';var tp=px(t,20);if(tp&&tp>580){while(t.length>10&&px(t+'…',20)>580)t=t.slice(0,-1);t=t.trim()+'…'}else if(!tp&&t.length>60)t=t.slice(0,58).trim()+'…';
  var d=o.desc||'(no meta description: the search engine will generate a snippet)';if(d.length>160)d=d.slice(0,158).trim()+'…';
  s.appendChild(el('div','u',o.url||'https://example.com/page'));s.appendChild(el('div','t',t));s.appendChild(el('div','d',d));return s}
function renderReport(root,o){
  root.textContent='';root.style.display='block';
  var top=el('div','seo-top'),sc=el('div','seo-score');sc.appendChild(el('b','',String(o.score)));sc.appendChild(el('span','',o.scoreLabel||'HEALTH SCORE / 100'));top.appendChild(sc);
  var sum=el('div','seo-sum'),chips=el('div','seo-chips');var cnt={crit:0,high:0,med:0,low:0},passed=0;o.items.forEach(function(i){if(i.pass)passed++;else cnt[i.sev]++});
  ORDER.forEach(function(k){chips.appendChild(el('span','seo-chip',SEV[k].i+' '+SEV[k].l+': '+cnt[k]))});chips.appendChild(el('span','seo-chip','🟢 Passed: '+passed));sum.appendChild(chips);
  sum.appendChild(el('div','',o.verdict||verdict(o.score)));var acts=el('div','acts');acts.style.margin='14px 0 0';acts.appendChild(copyBtn('Copy report',function(){return reportText(o.head||'SEO AUDIT - score '+o.score,o.items)}));(o.buttons||[]).forEach(function(b){acts.appendChild(b)});sum.appendChild(acts);top.appendChild(sum);root.appendChild(top);
  if(o.serp)root.appendChild(serpEl(o.serp));
  if(o.stats){var st=el('div','seo-stats');o.stats.forEach(function(p){var s=el('div','seo-stat',p[0]);s.insertBefore(el('b','',String(p[1])),s.firstChild);st.appendChild(s)});root.appendChild(st)}
  (o.extras||[]).forEach(function(n){root.appendChild(n)});
  var fails=o.items.filter(function(i){return !i.pass}),ok=o.items.filter(function(i){return i.pass});
  if(fails.length){root.appendChild(el('div','seo-grp','Issues to fix ('+fails.length+')'));ORDER.forEach(function(k){fails.filter(function(i){return i.sev===k}).forEach(function(i){root.appendChild(itemEl(i))})})}else root.appendChild(el('div','seo-grp','No issues found'));
  if(ok.length){var dd=el('details');dd.appendChild(el('summary','','Passed checks ('+ok.length+')'));ok.forEach(function(i){dd.appendChild(itemEl(i))});root.appendChild(dd)}
  try{root.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}

/* ---------- Page audit tab ---------- */
var SAMPLE='<!DOCTYPE html><html><head><title>Home</title><script src="https://example.com/app.js"></script><link rel="stylesheet" href="http://example.com/style.css"><script type="application/ld+json">{"@type":"Organization",}</script></head><body><h1>Welcome</h1><h1>Our shop</h1><h3>Products</h3><img src="banner.png"><a href="#">Click</a><p>We sell things.</p></body></html>';
function pageExtras(m){var ex=[];
  var ol=el('div','seo-outline');m.headings.forEach(function(h){var r=el('div','',''.padStart(0)+'H'+h.l+'  '+h.t);r.style.paddingLeft=((h.l-1)*18)+'px';ol.appendChild(r)});ex.push(box('Heading outline ('+m.headings.length+')',ol));
  var tm=el('div');[['1-word terms',m.uni],['2-word phrases',m.bi],['3-word phrases',m.tri]].forEach(function(p){tm.appendChild(el('p','seo-help',p[0]+': '+(p[1].length?p[1].join(', '):'none repeated')))});ex.push(box('Top terms and phrases',tm));
  if(m.links.length)ex.push(box('Links ('+m.links.length+')',table(['Anchor text','Href','Rel'],m.links.slice(0,80).map(function(l){return [l.text||'(empty)',l.href,l.rel]}))));
  return ex}
function runPage(){var html=$('#pgHtml').value.trim();if(html.length<20){$('#pgHtml').focus();return}
  var url=$('#pgUrl').value.trim(),r=auditHtml(html,{url:url,focus:$('#pgFocus').value});var m=r.m;
  renderReport($('#pgOut'),{score:r.score,items:r.items,head:'SEO AUDIT - score '+r.score+'/100'+(m.url?'\nURL: '+m.url:''),serp:{title:m.title,desc:m.desc,url:m.url},
    stats:[['Words',m.words],['Headings',m.headings.length],['Images',m.imgs],['Internal links',m.intl],['External links',m.ext],['JSON-LD blocks',m.ldCount],['Title width (px)',m.titlePx||'n/a'],['Reading ease',m.flesch==null?'n/a':m.flesch]].concat(m.focus?[['Keyword density',(m.kwDensity||0)+'%']]:[]),
    extras:pageExtras(m),buttons:[actBtn('Download JSON',function(){download('seo-page-audit.json',JSON.stringify({score:r.score,url:m.url,title:m.title,description:m.desc,issues:r.items.filter(function(i){return !i.pass}).map(function(i){return {severity:i.sev,area:i.area,title:i.title,detail:i.detail,fix:i.fix}})},null,2),'application/json')})]})}

/* ---------- Site audit tab ---------- */
var siteData=null;
function csvCell(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function renderSite(res,rootSel){
  siteData=res;var root=$(rootSel||'#stOut');
  var all=res.siteItems.concat(res.aggItems);
  var sorted=all.filter(function(i){return !i.pass}).sort(function(a,b){return ORDER.indexOf(a.sev)-ORDER.indexOf(b.sev)}).concat(all.filter(function(i){return i.pass}));
  var rows=res.pages.slice();var sortKey='score',asc=true;
  var tableHost=el('div');
  function build(){tableHost.textContent='';var cols=[['path','Page'],['score','Score'],['titleLen','Title'],['descLen','Desc'],['words','Words'],['inl','Inlinks'],['depth','Depth'],['iss','Issues']];
    var t=el('table','seo-table'),th=el('thead'),tr=el('tr');
    cols.forEach(function(c){var h=el('th','sortable',c[1]+(sortKey===c[0]?(asc?' ▲':' ▼'):''));h.addEventListener('click',function(){if(sortKey===c[0])asc=!asc;else{sortKey=c[0];asc=true}build()});tr.appendChild(h)});th.appendChild(tr);t.appendChild(th);
    var val=function(o,k){return k==='path'?o.path:k==='score'?o.score:k==='titleLen'?(o.m.title||'').length:k==='descLen'?(o.m.desc||'').length:k==='words'?o.m.words:k==='inl'?o.inl:k==='depth'?o.depth:o.issues.crit*1000+o.issues.high*100+o.issues.med*10+o.issues.low};
    rows.sort(function(a,b){var x=val(a,sortKey),y=val(b,sortKey);return (x<y?-1:x>y?1:0)*(asc?1:-1)});
    var tb=el('tbody');rows.forEach(function(o){var r=el('tr','clickable');[o.path,o.score,(o.m.title||'').length,(o.m.desc||'').length,o.m.words,o.inl,o.depth<0?'-':o.depth,o.issues.crit+'/'+o.issues.high+'/'+o.issues.med+'/'+o.issues.low].forEach(function(c,ci){var td=el('td','',String(c));if(ci===1)td.className='sc '+(o.score>=90?'g':o.score>=70?'y':'r');r.appendChild(td)});
      var open=null;r.addEventListener('click',function(){if(open){open.remove();open=null;return}open=el('tr');var td=el('td');td.colSpan=8;o.items.filter(function(i){return !i.pass}).sort(function(a,b){return ORDER.indexOf(a.sev)-ORDER.indexOf(b.sev)}).forEach(function(i){td.appendChild(itemEl(i))});if(!td.childNodes.length)td.textContent='No issues on this page.';open.appendChild(td);r.parentNode.insertBefore(open,r.nextSibling)});tb.appendChild(r)});
    t.appendChild(tb);var w=el('div','seo-scroll');w.appendChild(t);tableHost.appendChild(w);tableHost.appendChild(el('p','seo-help','Issues column = critical / high / medium / low. Click a row to see that page\'s problems and fixes.'))}
  build();
  var btns=[actBtn('Download HTML report',function(){download('seo-report-'+(res.origin.replace(/^https?:\/\//,'').replace(/[^a-z0-9.-]/gi,'-'))+'.html',buildHtmlReport(res),'text/html')}),
    actBtn('Email summary',function(){var txt=reportText('SITE SEO AUDIT - '+res.origin+' - score '+res.score+'/100 ('+res.stats.pages+' pages)',res.siteItems.concat(res.aggItems));W.location.href='mailto:?subject='+encodeURIComponent('SEO report: '+res.origin+' ('+res.score+'/100)')+'&body='+encodeURIComponent(txt.slice(0,1700)+(txt.length>1700?'\n\n... (full report: use Download HTML report)':''))}),
    actBtn('Download sitemap.xml',function(){download('sitemap.xml',res.sitemapXml(),'application/xml')}),
    actBtn('Download CSV',function(){var h=['page','url','score','title','title_len','description_len','h1','words','inlinks','depth','critical','high','medium','low'];var lines=[h.join(',')].concat(res.pages.map(function(o){return [o.path,o.url,o.score,o.m.title,(o.m.title||'').length,(o.m.desc||'').length,o.m.h1[0]||'',o.m.words,o.inl,o.depth,o.issues.crit,o.issues.high,o.issues.med,o.issues.low].map(csvCell).join(',')}));download('seo-site-audit.csv',lines.join('\n'),'text/csv')}),
    actBtn('Download JSON',function(){download('seo-site-audit.json',JSON.stringify({score:res.score,origin:res.origin,stats:res.stats,findings:sorted.filter(function(i){return !i.pass}).map(function(i){return {severity:i.sev,area:i.area,title:i.title,detail:i.detail,list:i.list,fix:i.fix}})},null,2),'application/json')})];
  var s=res.stats;
  renderReport(root,{score:res.score,items:sorted,scoreLabel:'SITE SCORE / 100',head:'SITE SEO AUDIT - '+res.origin+' - score '+res.score+'/100 ('+s.pages+' pages)',
    stats:[['Pages',s.pages],['Avg page score',res.avg],['Total words',s.words],['Broken links',s.broken],['Orphan pages',s.orphans],['Sitemap URLs',s.sitemapUrls],[res.crawl?'URLs fetched':'Files in archive',s.files]].concat(res.extraStats||[]),
    extras:[box('All pages ('+res.pages.length+')',tableHost,true)],buttons:btns})}
async function runSite(fileList){
  var st=$('#stStatus');st.textContent='Reading files...';
  try{var files=await readFileList(fileList);var n=Object.keys(files).filter(function(p){return /\.html?$/i.test(p)}).length;if(!n){st.textContent='No .html files found in the selection.';return}
    st.textContent='Auditing '+n+' pages...';await new Promise(function(r){setTimeout(r,30)});
    var res=siteAudit(files,{origin:($('#stOrigin').value||'').trim().replace(/\/$/,'')});st.textContent='Done: '+n+' pages from '+Object.keys(files).length+' files.';renderSite(res)}
  catch(e){st.textContent='Error: '+(e&&e.message||e)}}

/* ---------- PageSpeed Insights tab ---------- */
function clean(s){return String(s||'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')}
function rate(v,g,p){return v<=g?'good':v<=p?'ni':'poor'}
function psiParse(j){
  var lh=j.lighthouseResult||{},au=lh.audits||{},cats=lh.categories||{};var out={scores:{},metrics:[],field:[],items:[]};
  ['performance','accessibility','best-practices','seo'].forEach(function(k){if(cats[k]&&cats[k].score!=null)out.scores[k]=Math.round(cats[k].score*100)});
  var M=[['first-contentful-paint','First Contentful Paint',1800,3000,'ms'],['largest-contentful-paint','Largest Contentful Paint (LCP)',2500,4000,'ms'],['total-blocking-time','Total Blocking Time (INP proxy)',200,600,'ms'],['cumulative-layout-shift','Cumulative Layout Shift (CLS)',0.1,0.25,''],['speed-index','Speed Index',3400,5800,'ms'],['server-response-time','Server response time (TTFB)',800,1800,'ms']];
  M.forEach(function(m){var a=au[m[0]];if(a&&a.numericValue!=null)out.metrics.push([m[1],a.displayValue||String(Math.round(a.numericValue)),rate(a.numericValue,m[2],m[3])])});
  var fm=(j.loadingExperience&&j.loadingExperience.metrics)||{};
  [['LARGEST_CONTENTFUL_PAINT_MS','LCP (real users, p75)',function(v){return (v/1000).toFixed(2)+' s'}],['INTERACTION_TO_NEXT_PAINT','INP (real users, p75)',function(v){return v+' ms'}],['CUMULATIVE_LAYOUT_SHIFT_SCORE','CLS (real users, p75)',function(v){return (v/100).toFixed(2)}],['FIRST_CONTENTFUL_PAINT_MS','FCP (real users, p75)',function(v){return (v/1000).toFixed(2)+' s'}]].forEach(function(f){var x=fm[f[0]];if(x)out.field.push([f[1],f[2](x.percentile),{FAST:'good',AVERAGE:'ni',SLOW:'poor'}[x.category]||'ni'])});
  Object.keys(au).forEach(function(id){var a=au[id];if(!a.details||a.details.type!=='opportunity'||a.score==null||a.score>=0.9)return;var ms=a.details.overallSavingsMs||0;out.items.push({pass:false,sev:ms>1000?'high':ms>300?'med':'low',area:'Performance',key:'psi-'+id,title:a.title+(a.displayValue?' ('+a.displayValue+')':''),detail:clean(a.description).slice(0,260),fix:''})});
  if(cats.seo)(cats.seo.auditRefs||[]).forEach(function(r){var a=au[r.id];if(a&&a.score===0&&a.scoreDisplayMode==='binary')out.items.push({pass:false,sev:r.weight>=3?'high':'med',area:'SEO (Lighthouse)',key:'psi-seo-'+r.id,title:a.title,detail:clean(a.description).slice(0,220),fix:''})});
  ['accessibility','best-practices'].forEach(function(c){if(!cats[c])return;var f=(cats[c].auditRefs||[]).filter(function(r){var a=au[r.id];return a&&a.score===0&&a.scoreDisplayMode==='binary'});if(f.length)out.items.push({pass:false,sev:'low',area:c==='accessibility'?'Accessibility':'Best practices',key:'psi-'+c,title:f.length+' failing '+c+' audit(s)',detail:'',list:f.map(function(r){return au[r.id].title}),fix:''})});
  out.items.sort(function(a,b){return ORDER.indexOf(a.sev)-ORDER.indexOf(b.sev)});
  if(!out.items.length)out.items.push({pass:true,sev:'low',area:'Performance',key:'psi-ok',title:'No major Lighthouse opportunities found',detail:'',fix:''});
  return out}
function metricsTable(rows){var t=table(['Metric','Value','Rating'],rows.map(function(r){var b=el('span','rate '+r[2],{good:'Good',ni:'Needs improvement',poor:'Poor'}[r[2]]);return [r[0],r[1],b]}));return t}
async function runPsi(){
  var url=$('#spUrl').value.trim(),st=$('#spStatus');if(!/^https?:\/\//i.test(url)){st.textContent='Enter a full URL starting with https://';return}
  st.textContent='Running Lighthouse on Google servers (15-40 seconds)...';var key=$('#spKey').value.trim();
  var q='https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url='+encodeURIComponent(url)+'&strategy='+$('#spStrategy').value+['performance','seo','accessibility','best-practices'].map(function(c){return '&category='+c}).join('')+(key?'&key='+encodeURIComponent(key):'');
  try{var r=await W.fetch(q);var j=await r.json();
    if(!r.ok){var msg=(j.error&&j.error.message)||('HTTP '+r.status);st.textContent=r.status===429||/quota/i.test(msg)?'Google rate limit reached. Add a free PageSpeed API key below, or try again in a minute.':'Error: '+msg;return}
    var p=psiParse(j);st.textContent='Done.';var tiles=el('div','seo-stats');
    [['performance','Performance'],['seo','SEO'],['accessibility','Accessibility'],['best-practices','Best practices']].forEach(function(c){if(p.scores[c[0]]==null)return;var s=p.scores[c[0]];var t=el('div','seo-stat '+(s>=90?'okc':s>=50?'midc':'badc'),c[1]);t.insertBefore(el('b','',String(s)),t.firstChild);tiles.appendChild(t)});
    var ex=[tiles,box('Lab metrics (Lighthouse, '+$('#spStrategy').value+')',metricsTable(p.metrics),true)];
    if(p.field.length)ex.push(box('Field data: real Chrome users (CrUX, last 28 days)',metricsTable(p.field),true));else ex.push(el('p','seo-help','No field data: this URL does not have enough real-user traffic in the Chrome UX Report yet.'));
    renderReport($('#spOut'),{score:p.scores.performance==null?0:p.scores.performance,scoreLabel:'PERFORMANCE / 100',verdict:'Lighthouse lab result for '+((j.lighthouseResult&&j.lighthouseResult.finalDisplayedUrl)||url),items:p.items,head:'PAGESPEED - '+url+' ('+$('#spStrategy').value+')',extras:ex})}
  catch(e){st.textContent='Network error: '+(e&&e.message||e)+'. Check the URL is public and reachable.'}}

/* ---------- Live URL tab (Cloudflare Worker proxy) ---------- */
function liveItems(d){
  var items=[];function A(pass,sev,area,key,title,detail,fix){items.push({pass:pass,sev:sev,area:area,key:key,title:title,detail:detail||'',fix:fix||''})}
  var h=d.headers||{},fu=null;try{fu=new URL(d.finalUrl)}catch(e){}
  var hops=(d.chain||[]).length-1;
  if(d.status>=500)A(false,'crit','HTTP','status','Server error '+d.status,'The page cannot be indexed while it returns 5xx.');
  else if(d.status>=400)A(false,'crit','HTTP','status','Page returns '+d.status,'Error pages are dropped from the index.');
  else if(d.status===200)A(true,'low','HTTP','status','Final status 200 OK');else A(false,'med','HTTP','status','Unexpected final status '+d.status);
  if(hops>=2)A(false,'med','HTTP','chain','Redirect chain of '+hops+' hops','Each hop adds latency and loses crawl budget. Redirect straight to the final URL.',d.chain.map(function(c){return c.status+' '+c.url}).join('\n'));
  else if(hops===1&&(d.chain[0].status===302||d.chain[0].status===307))A(false,'med','HTTP','redirect-type','Temporary redirect ('+d.chain[0].status+') used','Use 301 or 308 for permanent moves so signals consolidate.');
  else A(true,'low','HTTP','chain',hops?'Single redirect hop':'No redirects');
  if(fu&&fu.protocol!=='https:')A(false,'high','Security','https','Final URL is not HTTPS','Serve the site over HTTPS and redirect HTTP to it.');else A(true,'low','Security','https','Final URL uses HTTPS');
  if(fu&&fu.protocol==='https:'){if(h['strict-transport-security'])A(true,'low','Security','hsts','HSTS enabled');else A(false,'high','Security','hsts','Missing Strict-Transport-Security (HSTS)','Forces browsers to use HTTPS.','add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;')}
  if(!h['content-security-policy'])A(false,'med','Security','csp','Missing Content-Security-Policy','Mitigates XSS. Start with Content-Security-Policy-Report-Only.','add_header Content-Security-Policy-Report-Only "default-src \'self\'" always;');else A(true,'low','Security','csp','Content-Security-Policy present');
  if(!h['x-frame-options']&&!/frame-ancestors/i.test(h['content-security-policy']||''))A(false,'med','Security','xfo','Missing clickjacking protection','Send X-Frame-Options or CSP frame-ancestors.','add_header X-Frame-Options "SAMEORIGIN" always;');else A(true,'low','Security','xfo','Clickjacking protection present');
  if(!h['x-content-type-options'])A(false,'low','Security','xcto','Missing X-Content-Type-Options','','add_header X-Content-Type-Options "nosniff" always;');
  if(!h['referrer-policy'])A(false,'low','Security','refpol','Missing Referrer-Policy','','add_header Referrer-Policy "strict-origin-when-cross-origin" always;');
  if(/noindex/i.test(h['x-robots-tag']||''))A(false,'crit','Indexing','xrobots','X-Robots-Tag header contains noindex','The server blocks indexing regardless of the HTML.',h['x-robots-tag']);else A(true,'low','Indexing','xrobots','No noindex in X-Robots-Tag');
  if(!h['cache-control']&&!h['etag']&&!h['last-modified'])A(false,'low','Performance','cache','No caching headers','Add Cache-Control so repeat visits are fast.','add_header Cache-Control "public, max-age=3600";');
  var ttfb=d.timings&&d.timings.ttfbMs;
  if(ttfb!=null){if(ttfb>1800)A(false,'high','Performance','ttfb','Slow server response: '+ttfb+' ms','Measured from the proxy location. Aim for under 800 ms.');else if(ttfb>800)A(false,'med','Performance','ttfb','Server response '+ttfb+' ms (target under 800 ms)','Measured from the proxy location.');else A(true,'low','Performance','ttfb','Server response '+ttfb+' ms')}
  /* robots.txt */
  var rb=d.robots;
  if(!rb||rb.status!==200)A(false,'med','Crawl files','robots','robots.txt not reachable (status '+(rb?rb.status:'n/a')+')','','User-agent: *\nAllow: /\nSitemap: '+(fu?fu.origin:'')+'/sitemap.xml');
  else{var pr=parseRobots(rb.text);var path=fu?fu.pathname+fu.search:'/';
    if(!robotsAllows(pr,'Googlebot',path))A(false,'crit','Crawl files','robots-block','robots.txt blocks Googlebot from this URL','Remove the matching Disallow rule.');else A(true,'low','Crawl files','robots-block','robots.txt allows Googlebot on this URL');
    if(!pr.sitemaps.length)A(false,'low','Crawl files','robots-sm','robots.txt has no Sitemap directive')}
  /* sitemap */
  var sm=d.sitemap;
  if(!sm||sm.status!==200)A(false,'high','Crawl files','sitemap','Sitemap not reachable ('+(sm?sm.url+' status '+sm.status:'n/a')+')');
  else{var x=new W.DOMParser().parseFromString(sm.text,'text/xml');var locs=[].slice.call(x.getElementsByTagName('loc')).map(function(l){return l.textContent.trim()});
    var lms=Array.from(new Set([].slice.call(x.getElementsByTagName('lastmod')).map(function(l){return l.textContent.trim()})));
    var nrm=function(u){return u.replace(/\/index\.html$/,'/').replace(/\/$/,'')};
    A(true,'low','Crawl files','sitemap','Sitemap found with '+locs.length+' URL(s)');
    if(fu&&locs.length&&!x.getElementsByTagName('sitemap').length&&locs.map(nrm).indexOf(nrm(d.finalUrl))<0)A(false,'med','Crawl files','sm-incl','This URL is not listed in the sitemap','Add every indexable canonical URL to the sitemap.');
    if(locs.length>5&&lms.length===1)A(false,'med','Crawl files','sm-lastmod','Every sitemap URL has the same lastmod ('+lms[0]+')','Use real modification dates.')}
  return items}
async function runLive(){
  var wk=$('#lvWorker').value.trim(),url=$('#lvUrl').value.trim(),st=$('#lvStatus');
  if(!/^https:\/\//i.test(wk)){st.textContent='Enter your Worker URL (see setup steps below).';return}
  if(!/^https?:\/\//i.test(url)){st.textContent='Enter a full URL starting with https://';return}
  st.textContent='Fetching through your Worker...';
  try{var r=await W.fetch(wk+(wk.indexOf('?')<0?'?':'&')+'url='+encodeURIComponent(url));var d=await r.json();
    if(!d.ok){st.textContent='Error: '+(d.error||('HTTP '+r.status));return}
    var li=liveItems(d),page=null;
    if(d.html){page=auditHtml(d.html,{url:d.finalUrl});li=li.concat(page.items)}
    var ex=[];ex.push(box('Redirect chain ('+(d.chain.length-1)+' redirect'+(d.chain.length===2?'':'s')+')',table(['Status','URL','Location'],d.chain.map(function(c){return [c.status,c.url,c.location||'']})),true));
    var hrows=Object.keys(d.headers||{}).sort().map(function(k){return [k,String(d.headers[k]).slice(0,160)]});ex.push(box('Response headers ('+hrows.length+')',table(['Header','Value'],hrows)));
    if(d.robots&&d.robots.text)ex.push(box('robots.txt',el('pre','',d.robots.text.slice(0,3000))));
    var m=page&&page.m;var score=scoreOf(li);st.textContent='Done.';
    renderReport($('#lvOut'),{score:score,items:li,head:'LIVE URL AUDIT - '+d.finalUrl+' - score '+score+'/100',serp:m?{title:m.title,desc:m.desc,url:d.finalUrl}:null,
      stats:[['Status',d.status],['Redirects',d.chain.length-1],['TTFB (ms)',d.timings&&d.timings.ttfbMs!=null?d.timings.ttfbMs:'n/a'],['HTML size (KB)',Math.round((d.bytes||0)/1024)]].concat(m?[['Words',m.words],['Headings',m.headings.length]]:[]),extras:ex.concat(m?pageExtras(m):[])})}
  catch(e){st.textContent='Could not reach the Worker: '+(e&&e.message||e)}}

/* ---------- standalone HTML report ---------- */
function hesc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function buildHtmlReport(res){
  var all=res.siteItems.concat(res.aggItems),fails=all.filter(function(i){return !i.pass}),ok=all.filter(function(i){return i.pass});
  var col={crit:'#8A3B2E',high:'#C0602B',med:'#B8932E',low:'#2E5339'};
  var h='<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>SEO report - '+hesc(res.origin)+'</title><style>body{font:15px/1.55 system-ui,Arial,sans-serif;color:#1d2433;max-width:960px;margin:0 auto;padding:28px 18px}h1{margin:0 0 4px}.sc{display:inline-block;background:#1d2433;color:#fff;border-radius:6px;padding:14px 22px;font-size:40px;font-weight:700;margin:12px 0}.chip{display:inline-block;border:1px solid #ccc;border-radius:20px;padding:3px 12px;margin:0 6px 6px 0;font-size:13px;font-weight:600}.it{border:1px solid #ddd;border-left-width:5px;border-radius:4px;padding:10px 14px;margin:10px 0;page-break-inside:avoid}.it p{margin:4px 0;color:#555}pre{background:#f5f4ef;border:1px solid #ddd;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font-size:12.5px}ul{font:12.5px/1.6 monospace;color:#555;word-break:break-all}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #ddd;padding:5px 8px;text-align:left}th{background:#f5f4ef}.sm{color:#666;font-size:13px}@media print{.noprint{display:none}}</style></head><body>';
  h+='<h1>SEO audit report</h1><div class="sm">'+hesc(res.origin)+' &middot; '+hesc(new Date().toISOString().slice(0,10))+' &middot; '+res.stats.pages+' pages analyzed</div><div class="sc">'+res.score+' / 100</div><div>';
  ORDER.forEach(function(k){h+='<span class="chip" style="border-color:'+col[k]+'">'+SEV[k].i+' '+SEV[k].l+': '+res.totals[k]+'</span>'});h+='<span class="chip">Passed: '+ok.length+'</span></div>';
  h+='<p class="sm">Average page score '+res.avg+' &middot; '+res.stats.words+' words &middot; '+res.stats.broken+' broken links &middot; '+res.stats.orphans+' orphan pages</p><h2>Issues to fix ('+fails.length+')</h2>';
  ORDER.forEach(function(k){fails.filter(function(i){return i.sev===k}).forEach(function(i){h+='<div class="it" style="border-left-color:'+col[k]+'"><b>'+SEV[k].i+' '+SEV[k].l+' &middot; '+hesc(i.area)+'</b><br><b>'+hesc(i.title)+'</b>'+(i.detail?'<p>'+hesc(i.detail)+'</p>':'');
    if(i.list&&i.list.length){h+='<ul>'+i.list.slice(0,25).map(function(x){return '<li>'+hesc(x)+'</li>'}).join('')+(i.list.length>25?'<li>... and '+(i.list.length-25)+' more</li>':'')+'</ul>'}
    if(i.fix)h+='<pre>'+hesc(i.fix)+'</pre>';h+='</div>'})});
  h+='<h2>Passed checks ('+ok.length+')</h2><ul>'+ok.map(function(i){return '<li>'+hesc(i.title)+'</li>'}).join('')+'</ul>';
  h+='<h2>Pages</h2><table><tr><th>Page</th><th>Score</th><th>Title</th><th>Desc</th><th>Words</th><th>Inlinks</th><th>Issues (C/H/M/L)</th></tr>'+res.pages.slice().sort(function(a,b){return a.score-b.score}).map(function(o){return '<tr><td>'+hesc(o.path)+'</td><td>'+o.score+'</td><td>'+(o.m.title||'').length+'</td><td>'+(o.m.desc||'').length+'</td><td>'+o.m.words+'</td><td>'+o.inl+'</td><td>'+o.issues.crit+'/'+o.issues.high+'/'+o.issues.med+'/'+o.issues.low+'</td></tr>'}).join('')+'</table><p class="sm">Generated by the Wells Love SEO Audit Suite.</p></body></html>';
  return h}

/* ---------- Scan Website tab (live crawl through the Worker) ---------- */
var NONHTML_URL=/\.(pdf|jpe?g|png|gif|webp|avif|svg|ico|css|js|mjs|json|xml|txt|zip|gz|rar|mp3|mp4|webm|woff2?|ttf|otf|eot|docx?|xlsx?|pptx?)$/i;
function keyOf(u){var x=new URL(u),p;try{p=decodeURIComponent(x.pathname)}catch(e){p=x.pathname}p=p.replace(/^\//,'');if(p===''||/\/$/.test(p))p+='index.html';return p}
async function crawlSite(startUrl,o,prog){
  var wk=o.worker,max=o.max;
  var get=async function(u,lite){var r=await W.fetch(wk+(wk.indexOf('?')<0?'?':'&')+'url='+encodeURIComponent(u)+(lite?'&lite=1':''));return r.json()};
  var first=await get(startUrl,false);if(!first.ok)throw new Error(first.error||'Worker error');
  var fin=new URL(first.finalUrl),origin=fin.origin,host=fin.host.replace(/^www\./,'');
  var F={},seen={},queue=[],crawled=0,skipped=0;
  function same(x){return x.host.replace(/^www\./,'')===host&&/^https?:$/.test(x.protocol)}
  function enqueue(u){var x;try{x=new URL(u)}catch(e){return}x.hash='';if(!same(x))return;if(x.search){skipped++;return}if(NONHTML_URL.test(x.pathname))return;var k=keyOf(x.href);if(seen[k])return;seen[k]=1;queue.push(x.href)}
  function record(d,u){
    var key=keyOf(u);
    if(!d.ok){F[key]={text:null,status:0,error:d.error||'fetch failed',size:0,date:null};return}
    var fx;try{fx=new URL(d.finalUrl)}catch(e){return}var fkey=keyOf(d.finalUrl),hops=d.chain.length-1;
    if(!same(fx)){F[key]={text:null,status:d.chain[0].status,size:0,date:null,hops:hops};return}
    if(fkey!==key){F[key]={text:null,status:d.chain[0].status,redirectTo:fkey,hops:hops,size:0,date:null};if(F[fkey]&&F[fkey].text!=null)return;seen[fkey]=1}
    var h=d.headers||{},isHtml=/html/i.test(h['content-type']||''),lm=h['last-modified']?new Date(h['last-modified']):null;
    F[fkey]={text:(d.status===200&&isHtml)?d.html:null,isHtml:isHtml,status:d.status,size:d.bytes||0,date:lm&&!isNaN(lm)?lm:null,ttfb:d.timings&&d.timings.ttfbMs,hops:fkey===key?hops:0,url:d.finalUrl};
    if(F[fkey].text){var doc=new W.DOMParser().parseFromString(d.html,'text/html');$$('a[href]',doc).forEach(function(a){var h2=(a.getAttribute('href')||'').trim();if(!h2||/^(mailto:|tel:|javascript:|#)/i.test(h2))return;try{enqueue(new URL(h2,d.finalUrl).href)}catch(e){}})}}
  async function visit(u){var d;try{d=await get(u,true)}catch(e){d={ok:false,error:String(e&&e.message||e)}}record(d,u)}
  async function pool(){await new Promise(function(resolve){var running=0;function next(){while(running<4&&queue.length&&crawled+running<max&&!o.cancelled()){var u=queue.shift();running++;visit(u).then(function(){running--;crawled++;prog(crawled,max,queue.length+running);next()})}
    if(running===0&&(!queue.length||crawled>=max||o.cancelled()))resolve()}next()})}
  seen[keyOf(first.finalUrl)]=1;record(first,first.finalUrl);crawled=1;
  enqueue(origin+'/');enqueue(startUrl);prog(crawled,max,queue.length);await pool();
  /* robots / sitemap from the first response */
  if(first.robots&&first.robots.status===200)F['robots.txt']={text:first.robots.text,size:first.robots.text.length,date:null};
  var smText=null;
  if(first.sitemap&&first.sitemap.status===200&&first.sitemap.text){smText=first.sitemap.text;
    var sx=new W.DOMParser().parseFromString(smText,'text/xml'),kids=[].slice.call(sx.getElementsByTagName('sitemap')).map(function(s){var l=s.getElementsByTagName('loc')[0];return l?l.textContent.trim():''}).filter(Boolean).slice(0,6);
    if(kids.length){var rows=[];for(var i=0;i<kids.length;i++){try{var c=await get(kids[i],true);if(c.ok&&c.html){var cx=new W.DOMParser().parseFromString(c.html,'text/xml');[].slice.call(cx.getElementsByTagName('url')).forEach(function(u){var l=u.getElementsByTagName('loc')[0],m=u.getElementsByTagName('lastmod')[0];if(l)rows.push('<url><loc>'+l.textContent.trim()+'</loc>'+(m?'<lastmod>'+m.textContent.trim()+'</lastmod>':'')+'</url>')})}}catch(e){}}smText='<urlset>'+rows.join('')+'</urlset>'}
    F['sitemap.xml']={text:smText,size:smText.length,date:null};
    if(crawled<max&&!o.cancelled()){var sx2=new W.DOMParser().parseFromString(smText,'text/xml');[].slice.call(sx2.getElementsByTagName('loc')).forEach(function(l){enqueue(l.textContent.trim())});await pool()}}
  var ads=Object.keys(F).some(function(k){return F[k].text&&F[k].text.indexOf('adsbygoogle.js')>=0});
  if(ads){try{var a=await get(origin+'/ads.txt',true);if(a.ok&&a.status===200&&a.html)F['ads.txt']={text:a.html,size:a.html.length,date:null}}catch(e){}}
  var skip={'robots-block':1,'robots-sm':1,'robots':1,'sitemap':1,'sm-incl':1,'sm-lastmod':1};
  var li=liveItems(first).filter(function(i){return !skip[i.key]}).map(function(i){i.site=true;i.list=null;return i});
  return {files:F,opt:{origin:origin,crawl:true,liveItems:li},meta:{crawled:crawled,skipped:skipped,truncated:queue.length>0}}}
var scCancel=false;
async function runScan(){
  var url=$('#scUrl').value.trim(),wk=getWorker(),st=$('#scStatus'),bar=$('#scBar');
  if(!/^https?:\/\//i.test(url)){st.textContent='Enter the full site address, for example https://example.com';return}
  if(!/^https:\/\//i.test(wk)){st.textContent='Scanning is temporarily unavailable: the crawler proxy is not configured.';return}
  scCancel=false;$('#scRun').disabled=true;$('#scStop').hidden=false;$('#scOut').style.display='none';bar.parentNode.hidden=false;bar.style.width='2%';st.textContent='Starting crawl...';
  try{
    var c=await crawlSite(url,{worker:wk,max:+$('#scMax').value,cancelled:function(){return scCancel}},function(n,max,left){bar.style.width=Math.max(3,Math.round(n/max*100))+'%';st.textContent='Crawled '+n+' of up to '+max+' pages ('+left+' queued)...'});
    st.textContent='Analyzing '+Object.keys(c.files).length+' URLs...';await new Promise(function(r){setTimeout(r,30)});
    var res=siteAudit(c.files,c.opt);res.crawl=true;
    st.textContent='Done: '+res.stats.pages+' pages analyzed'+(c.meta.truncated?' (page limit reached; raise it to scan everything)':'')+(c.meta.skipped?'. '+c.meta.skipped+' URL(s) with query strings were skipped.':'')+(scCancel?' Scan was stopped early.':'');
    renderSite(res,'#scOut')}
  catch(e){st.textContent='Error: '+(e&&e.message||e)}
  finally{$('#scRun').disabled=false;$('#scStop').hidden=true;bar.parentNode.hidden=true}}

/* ---------- generators ---------- */
function prune(o){if(Array.isArray(o)){var a=o.map(prune).filter(function(x){return x!==undefined});return a.length?a:undefined}if(o&&typeof o==='object'){var r={},n=0;Object.keys(o).forEach(function(k){var v=prune(o[k]);if(v!==undefined){r[k]=v;n++}});return (n&&!(n===1&&r['@type']))?r:undefined}if(o===''||o==null)return undefined;return o}
var JL={
  Article:{f:[['headline','Headline'],['description','Description'],['url','Page URL'],['image','Image URL'],['author','Author name'],['authorUrl','Author URL'],['publisher','Publisher name'],['logo','Publisher logo URL'],['datePublished','Date published (YYYY-MM-DD)'],['dateModified','Date modified (YYYY-MM-DD)']],
    b:function(v){return {'@context':'https://schema.org','@type':'Article',headline:v.headline,description:v.description,image:v.image,datePublished:v.datePublished,dateModified:v.dateModified||v.datePublished,author:{'@type':'Person',name:v.author,url:v.authorUrl},publisher:{'@type':'Organization',name:v.publisher,logo:{'@type':'ImageObject',url:v.logo}},mainEntityOfPage:{'@type':'WebPage','@id':v.url}}}},
  FAQPage:{f:[['faq','Questions and answers. Format: Q: question (new line) A: answer. Separate pairs with a blank line.','a']],
    b:function(v){var qs=String(v.faq||'').split(/^\s*Q:\s*/m).slice(1).map(function(blk){var p=blk.split(/^\s*A:\s*/m);return {'@type':'Question',name:(p[0]||'').trim(),acceptedAnswer:{'@type':'Answer',text:(p[1]||'').trim()}}});return {'@context':'https://schema.org','@type':'FAQPage',mainEntity:qs}}},
  BreadcrumbList:{f:[['crumbs','One crumb per line: Name | URL','a']],
    b:function(v){var rows=String(v.crumbs||'').split(/\n/).map(function(l){return l.split('|').map(function(s){return s.trim()})}).filter(function(p){return p[0]});return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:rows.map(function(p,i){return {'@type':'ListItem',position:i+1,name:p[0],item:p[1]}})}}},
  Organization:{f:[['name','Name'],['url','Website URL'],['logo','Logo URL'],['email','Contact email'],['sameAs','Profile URLs (comma separated)']],
    b:function(v){return {'@context':'https://schema.org','@type':'Organization',name:v.name,url:v.url,logo:v.logo,email:v.email,sameAs:String(v.sameAs||'').split(',').map(function(s){return s.trim()}).filter(Boolean)}}},
  WebApplication:{f:[['name','App name'],['url','Page URL'],['description','Description'],['category','Category (e.g. BusinessApplication)'],['price','Price (0 for free)']],
    b:function(v){return {'@context':'https://schema.org','@type':'WebApplication',name:v.name,url:v.url,description:v.description,applicationCategory:v.category||'BusinessApplication',operatingSystem:'Any',offers:{'@type':'Offer',price:v.price===''||v.price==null?'0':v.price,priceCurrency:'USD'}}}}
};
function initJsonLd(){
  var sel=$('#jlType'),host=$('#jlFields'),out=$('#jlOut');if(!sel)return;
  Object.keys(JL).forEach(function(k){var o=el('option','',k);o.value=k;sel.appendChild(o)});
  function gen(){var def=JL[sel.value],v={};$$('[data-f]',host).forEach(function(i){v[i.getAttribute('data-f')]=i.value.trim()});var obj=prune(def.b(v))||{'@context':'https://schema.org'};out.value='<script type="application/ld+json">\n'+JSON.stringify(obj,null,2)+'\n<\/script>'}
  function draw(){host.textContent='';JL[sel.value].f.forEach(function(f){var w=el('div','f');var l=el('label','',f[1]);var i=f[2]==='a'?el('textarea'):el('input');if(f[2]==='a')i.rows=5;else i.type='text';i.setAttribute('data-f',f[0]);i.addEventListener('input',gen);l.appendChild(i);w.appendChild(l);host.appendChild(w)});gen()}
  sel.addEventListener('change',draw);$('#jlCopy').addEventListener('click',function(){W.navigator.clipboard&&W.navigator.clipboard.writeText(out.value)});draw()}
function initRobots(){
  var out=$('#rbOut');if(!out)return;
  function gen(){var L=['User-agent: *'];var dis=$('#rbPaths').value.split(/\n/).map(function(s){return s.trim()}).filter(Boolean);if(!dis.length)L.push('Allow: /');else dis.forEach(function(p){L.push('Disallow: '+p)});
    if($('#rbAI').checked)['GPTBot','ClaudeBot','CCBot','Google-Extended','PerplexityBot','Bytespider'].forEach(function(b){L.push('','User-agent: '+b,'Disallow: /')});
    var sm=$('#rbSitemap').value.trim();if(sm)L.push('','Sitemap: '+sm);out.value=L.join('\n')+'\n'}
  ['#rbPaths','#rbAI','#rbSitemap'].forEach(function(s){$(s).addEventListener('input',gen);$(s).addEventListener('change',gen)});$('#rbCopy').addEventListener('click',function(){W.navigator.clipboard&&W.navigator.clipboard.writeText(out.value)});gen()}
function initSerp(){
  var o=$('#sgOut');if(!o)return;
  function gen(){o.textContent='';var t=$('#sgTitle').value,d=$('#sgDesc').value,u=$('#sgUrl').value,im=$('#sgImg').value.trim();
    var tp=px(t,20),dp=px(d,14);var meter=el('div','seo-help','Title: '+t.length+' characters'+(tp?', '+tp+' px of about 580 px':'')+(tp&&tp>580?' (will be cut off)':'')+'. Description: '+d.length+' characters'+(dp?', '+dp+' px of about 920 px (2 lines)':'')+'.');o.appendChild(meter);
    var bar=el('div','seo-bar'),fill=el('div','');fill.style.width=Math.min(100,Math.round(((tp||t.length*9.5)/580)*100))+'%';fill.className=(tp||t.length*9.5)>580?'over':'ok';bar.appendChild(fill);o.appendChild(bar);
    o.appendChild(serpEl({title:t,desc:d,url:u}));
    var card=el('div','og-card');if(im){var img=el('img');img.alt='Open Graph preview image';img.src=im;img.loading='lazy';img.width=1200;img.height=630;card.appendChild(img)}var meta=el('div','og-meta');meta.appendChild(el('div','og-host',(function(){try{return new URL(u).host.toUpperCase()}catch(e){return 'EXAMPLE.COM'}})()));meta.appendChild(el('div','og-title',t||'Title'));meta.appendChild(el('div','og-desc',d.slice(0,110)));card.appendChild(meta);o.appendChild(el('div','seo-grp','Social share card'));o.appendChild(card)}
  ['#sgTitle','#sgDesc','#sgUrl','#sgImg'].forEach(function(s){$(s).addEventListener('input',gen)});gen()}

/* ---------- wiring ---------- */
function init(){
  if(!$('#tab-page'))return;
  $$('.wl-tab').forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-tab');$$('.wl-tab').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});$$('.wl-panel').forEach(function(p){p.hidden=p.id!=='tab-'+id});try{W.history.replaceState(null,'','#'+id)}catch(e){}})});
  var h=(W.location.hash||'').slice(1).replace(/^tab-/,'');if(h&&$('#tab-'+h)){var tb=$('.wl-tab[data-tab="'+h+'"]');if(tb)tb.click()}
  W.addEventListener('hashchange',function(){var hh=(W.location.hash||'').slice(1).replace(/^tab-/,'');var t2=hh&&$('.wl-tab[data-tab="'+hh+'"]');if(t2)t2.click()});
  $('#pgRun').addEventListener('click',runPage);
  $('#pgSample').addEventListener('click',function(){$('#pgHtml').value=SAMPLE;$('#pgUrl').value='';runPage()});
  $('#pgClear').addEventListener('click',function(){$('#pgHtml').value='';$('#pgUrl').value='';$('#pgFocus').value='';$('#pgOut').style.display='none'});
  $('#pgFile').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new W.FileReader();r.onload=function(){$('#pgHtml').value=String(r.result);runPage()};r.readAsText(f)});
  var drop=$('#stDrop');
  $('#stZip').addEventListener('change',function(e){if(e.target.files.length)runSite(e.target.files)});
  $('#stDir').addEventListener('change',function(e){if(e.target.files.length)runSite(e.target.files)});
  ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over')})});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over')})});
  drop.addEventListener('drop',function(e){if(e.dataTransfer&&e.dataTransfer.files.length)runSite(e.dataTransfer.files)});
  $('#spRun').addEventListener('click',runPsi);
  initJsonLd();initRobots();initSerp();
  $$('.gn-pick').forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-g');$$('.gn-pick').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});$$('.gn-panel').forEach(function(p){p.hidden=p.id!=='gn-'+id})})})}
W.WLSeo={crawlSite:crawlSite,buildHtmlReport:buildHtmlReport,auditHtml:auditHtml,auditDoc:auditDoc,siteAudit:siteAudit,readZip:readZip,readFileList:readFileList,parseRobots:parseRobots,robotsAllows:robotsAllows,liveItems:liveItems,psiParse:psiParse,JL:JL,prune:prune};
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init);else init();
})();
