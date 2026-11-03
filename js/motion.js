/* GOWES — gerak: parallax 5 lapis + zoom-out akhir, 3 marquee + skew velocity,
   scramble/decode, hover-tema (di app.js), draw-on, mode ringan, gerak-mati. */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.documentElement;
let gerakAktif=!reduced;

/* ---------- mode ringan otomatis ---------- */
function cekRingan(){
  const ringan=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4||
    (navigator.connection&&navigator.connection.saveData);
  if(ringan)root.classList.add('mode-ringan');
  return ringan;
}
let fpsRendah=false;
(function pantauFps(){
  if(reduced)return;
  let frames=0;const t0=performance.now();
  (function loop(){frames++;if(performance.now()-t0<2000)requestAnimationFrame(loop);
    else{if(frames/2<40&&!fpsRendah){fpsRendah=true;root.classList.add('mode-ringan')}}})();
})();

/* ---------- parallax + zoom-out + skew marquee ---------- */
const lapis=[...document.querySelectorAll('.lapis[data-depth]')];
const mini=$('#miniIsi'),finalSec=$('#lembar-e');
const pitaIsi=[...document.querySelectorAll('.pita-isi')];
let lastY=scrollY,ticking=false,vel=0;
function onScroll(){
  const y=scrollY;vel=y-lastY;lastY=y;
  if(!gerakAktif||reduced){ticking=false;return}
  if(!root.classList.contains('mode-ringan')){
    for(const l of lapis){const d=+l.dataset.depth;l.style.transform=`translate3d(0,${(-y*d).toFixed(1)}px,0)`}
  }
  // zoom-out di akhir: mini sheet 1.28 -> 1 saat section E dilewati
  if(mini&&finalSec){
    const r=finalSec.getBoundingClientRect();
    const p=Math.min(Math.max((innerHeight*0.9-r.top)/(r.height+innerHeight*0.4),0),1);
    mini.style.transform=`scale(${(1.28-0.28*p).toFixed(3)})`;
  }
  // skew velocity di pita
  const skew=Math.max(-14,Math.min(14,vel*0.9));
  for(const p of pitaIsi)p.style.transform=`skewX(${-skew}deg)`;
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
onScroll();

/* ---------- scramble/decode ---------- */
const GLIF='█▓▒░<>/\\|01';
function scrambleEl(el){
  if(!el||reduced||!gerakAktif||root.classList.contains('mode-ringan'))return;
  const asli=el.dataset.asli||el.textContent;el.dataset.asli=asli;
  let frame=0;const total=Math.max(10,asli.length*2);
  cancelAnimationFrame(el._raf);
  (function step(){
    frame++;
    el.textContent=[...asli].map((c,i)=>{
      if(c===' '||c==='\n')return c;
      return i/total*asli.length<frame?c:GLIF[Math.floor(Math.random()*GLIF.length)];
    }).join('');
    if(frame<total)el._raf=requestAnimationFrame(step);else el.textContent=asli;
  })();
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){scrambleEl(e.target);io.unobserve(e.target)}
}),{threshold:.4});
document.querySelectorAll('[data-scramble]').forEach(el=>io.observe(el));

/* ---------- draw-on untuk kartu rute ---------- */
const ioDraw=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('drawn');ioDraw.unobserve(e.target)}
}),{threshold:.3});
function observeDraws(){
  if(reduced){document.querySelectorAll('.draw').forEach(d=>d.classList.add('drawn'));return}
  document.querySelectorAll('.draw:not(.drawn)').forEach(d=>ioDraw.observe(d));
}
observeDraws();

/* ---------- reveal lembar ---------- */
const ioRev=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('tampil');ioRev.unobserve(e.target)}
}),{threshold:.12});
document.querySelectorAll('.lembar').forEach(s=>{s.classList.add('reveal');ioRev.observe(s)});

/* ---------- tombol jeda & gerak ---------- */
const btnJeda=$('#btnJeda'),btnGerak=$('#btnGerak'),pita=document.querySelector('.pita');
btnJeda.addEventListener('click',()=>{
  const jeda=pita.classList.toggle('jeda');
  btnJeda.setAttribute('aria-pressed',jeda);btnJeda.textContent=jeda?'JALAN':'JEDA';
});
function setGerak(ya){
  gerakAktif=ya;root.classList.toggle('gerak-mati',!ya);
  btnGerak.setAttribute('aria-pressed',ya);btnGerak.textContent=ya?'GERAK: YA':'GERAK: MATI';
  if(!ya){lapis.forEach(l=>l.style.transform='');if(mini)mini.style.transform=''}
}
btnGerak.addEventListener('click',()=>setGerak(!gerakAktif));
if(reduced)setGerak(false);

window.GOWES_motion={observeDraws,scrambleEl};
cekRingan();
})();
