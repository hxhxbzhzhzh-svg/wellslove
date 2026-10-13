(function(){var b=document.querySelector('.burger'),u=document.getElementById('mainnav');if(!b||!u)return;
function setBurger(o){b.setAttribute('aria-expanded',o);u.classList.toggle('open',o);document.body.classList.toggle('menu-open',o);}
b.addEventListener('click',function(){setBurger(b.getAttribute('aria-expanded')!=='true');});
[].forEach.call(document.querySelectorAll('.ddt'),function(t){t.addEventListener('click',function(){var li=t.parentNode,o=!li.classList.contains('open');li.classList.toggle('open',o);t.setAttribute('aria-expanded',o);});});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){setBurger(false);[].forEach.call(document.querySelectorAll('.dd.open'),function(li){li.classList.remove('open');li.querySelector('.ddt').setAttribute('aria-expanded','false');});}});
window.addEventListener('resize',function(){if(innerWidth>768)setBurger(false);});})();