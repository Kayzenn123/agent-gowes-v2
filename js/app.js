/* GOWES — fungsi. Tanpa dependency. */
(function(){
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const LS_KEY = 'gowes-v1';

/* ---------- util ---------- */
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function prng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rutePath(id,w,h){
  const r=prng(hash(id));const n=5+Math.floor(r()*3);const pts=[];
  for(let i=0;i<n;i++){pts.push([ (w*0.06)+(w*0.88)*(i/(n-1)), h*0.2+r()*h*0.6 ])}
  let d=`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];const mx=(x0+x1)/2;d+=` C${mx.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`}
  return d;
}
const ICON = {
  pin:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="3.4" fill="currentColor"/><path d="M12 13.4 8.6 19h6.8Z" fill="currentColor"/></svg>',
  gunung:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 17 10 8l3.4 5.4L15.4 10 19 17Z" fill="currentColor"/></svg>',
  jalan:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 4 7 20M15 4l2 16" stroke="currentColor" stroke-width="2"/></svg>',
  jam:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5.4l3.6 2.2" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  api:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 5c-2.8 3.4-2.8 10.6 0 14 2.8-3.4 2.8-10.6 0-14Z" fill="currentColor"/></svg>',
  cek:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="m7.5 12.4 3.2 3.2 6-7" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>',
};
function fmtTgl(iso){try{return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric'}).format(new Date(iso+'T00:00:00'))}catch(e){return iso}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

/* ---------- state ---------- */
function loadState(){
  try{
    const raw=localStorage.getItem(LS_KEY);
    if(!raw) return {v:1,rides:[],gear:[]};
    const s=JSON.parse(raw);
    if(!s||s.v!==1||!Array.isArray(s.rides)) throw new Error('skema');
    return {v:1,rides:s.rides.filter(r=>r&&typeof r.km==='number'),gear:Array.isArray(s.gear)?s.gear:[]};
  }catch(e){ return {v:1,rides:[],gear:[]}; }
}
function saveState(s){ try{localStorage.setItem(LS_KEY,JSON.stringify(s))}catch(e){} }
let state=loadState();

/* ---------- pita ---------- */
(function(){
  const nama=RUTES.map(r=>r.nama.toUpperCase()).join('  •  ');
  const istilah='SKALA  •  TOLERANSI  •  REVISI  •  DIMENSI  •  POTONGAN  •  DENAH  •  UKUR DULU  •  GOWES KEMUDIAN  •  ';
  const angka='12,0 KM  •  520 M  •  1:50.000  •  ±5%  •  16 RUTE  •  12 KOTA  •  ';
  const isi=[nama,istilah,angka];
  $$('[data-pita]').forEach((el,i)=>{ el.textContent=(isi[i%3]+' ').repeat(2); });
})();

/* ---------- filter & kartu ---------- */
const grid=$('#gridRute');
function isiSelect(){
  const fk=$('#fKota'),rk=$('#rKota'),lr=$('#lRute');
  KOTAS.forEach(k=>{fk.insertAdjacentHTML('beforeend',`<option>${esc(k)}</option>`);rk.insertAdjacentHTML('beforeend',`<option>${esc(k)}</option>`)});
  RUTES.forEach(r=>{lr.insertAdjacentHTML('beforeend',`<option value="${r.id}">${esc(r.nama)}</option>`)});
}
function kartuHTML(r){
  return `<article class="petak kartu" role="listitem" tabindex="0" data-id="${r.id}" data-waktu="${r.waktu}"
    aria-label="Rute ${esc(r.nama)}, ${r.jarak} kilometer">
    <h3>${esc(r.nama)}</h3>
    <div class="kartu-meta t-s">
      <span>${ICON.pin} ${esc(r.kota)}</span>
      <span class="lvl-${r.level}">${r.level.toUpperCase()}</span>
      <span>${r.jarak} KM</span>
    </div>
    <svg class="kartu-rute-mini draw" viewBox="0 0 200 74" aria-hidden="true"><path d="${rutePath(r.id,200,74)}"/></svg>
    <p class="t-s">${esc(r.deskripsi)}</p>
  </article>`;
}
function terapkanFilter(){
  const q=$('#q').value.trim().toLowerCase(),k=$('#fKota').value,l=$('#fLevel').value,j=$('#fJalan').value,u=$('#fUrut').value;
  let list=RUTES.filter(r=>
    (!q||(r.nama+' '+r.kota+' '+r.deskripsi).toLowerCase().includes(q))&&
    (!k||r.kota===k)&&(!l||r.level===l)&&(!j||r.permukaan===j));
  const key=u.replace('-',''),desc=u.startsWith('-');
  list.sort((a,b)=>desc?b[key]-a[key]:a[key]-b[key]);
  grid.innerHTML=list.map(kartuHTML).join('');
  $('#kosongRute').hidden=list.length>0;
  if(window.GOWES_motion) window.GOWES_motion.observeDraws();
  return list;
}
function bukaDetail(id){
  const r=RUTES.find(x=>x.id===id); if(!r) return;
  const box=$('#detailRute');
  const w15=Math.round(r.jarak/15*60),w20=Math.round(r.jarak/20*60),w25=Math.round(r.jarak/25*60);
  const kal=Math.round(r.jarak*36);
  box.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:start;gap:12px">
      <h3>DENAH RUTE — ${esc(r.nama).toUpperCase()}</h3>
      <button class="t-s tombol tombol-kecil" id="btnTutupDetail">TUTUP ✕</button>
    </div>
    <svg viewBox="0 0 600 220" style="width:100%;height:auto" role="img" aria-label="Sketsa garis rute ${esc(r.nama)}">
      <path d="${rutePath(r.id,600,220)}" fill="none" stroke="var(--accent)" stroke-width="6"/>
    </svg>
    <div class="detail-grid">
      <table class="stat-tabel t-s">
        <tr><td>Kota</td><td>${esc(r.kota)}</td></tr>
        <tr><td>Jarak (estimasi)</td><td>${r.jarak} km</td></tr>
        <tr><td>Elevasi (estimasi)</td><td>${r.elevasi} m</td></tr>
        <tr><td>Level</td><td>${r.level}</td></tr>
        <tr><td>Permukaan</td><td>${r.permukaan}</td></tr>
        <tr><td>Waktu ideal</td><td>${r.waktu}</td></tr>
      </table>
      <table class="stat-tabel t-s">
        <tr><td>15 km/jam (santai)</td><td>±${w15} mnt</td></tr>
        <tr><td>20 km/jam (sedang)</td><td>±${w20} mnt</td></tr>
        <tr><td>25 km/jam (ngebut)</td><td>±${w25} mnt</td></tr>
        <tr><td>Kalori (estimasi)</td><td>±${kal} kkal</td></tr>
      </table>
    </div>
    <p class="t-s" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="t-s tombol tombol-kecil" id="btnKeLog">CATAT KE LOG →</button>
      <button class="t-s tombol tombol-kecil" id="btnSalinLink">SALIN LINK RUTE</button>
    </p>`;
  // NOTE: baris kalori di atas sengaja <tr> agar konsisten — perbaiki di bawah
  box.hidden=false;
  $('#btnTutupDetail').onclick=()=>{box.hidden=true;history.replaceState(null,'',location.pathname)};
  $('#btnKeLog').onclick=()=>{ $('#lRute').value=r.id; document.querySelector('#lembar-d').scrollIntoView({behavior:'smooth'}); };
  $('#btnSalinLink').onclick=()=>salinTeks(location.origin+location.pathname+'?rute='+r.id,'Link rute tersalin, Mas.');
  const url=new URL(location.href); url.searchParams.set('rute',r.id); history.replaceState(null,'',url);
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
  if(window.GOWES_motion) window.GOWES_motion.observeDraws();
}

/* ---------- perencana ---------- */
$('#formRencana').addEventListener('submit',e=>{
  e.preventDefault();
  const galat=$('#galatRencana'),hasil=$('#hasilRencana');
  const kota=$('#rKota').value,t=+$('#rJarak').value,s=+$('#rSpeed').value;
  if(!(t>=1&&t<=200)){galat.hidden=false;galat.textContent='TARGET TIDAK VALID — masukkan 1 sampai 200 km, Mas.';return}
  galat.hidden=true;
  const cocok=RUTES.filter(r=>r.kota===kota&&r.jarak<=t*1.25).sort((a,b)=>Math.abs(a.jarak-t)-Math.abs(b.jarak-t)).slice(0,3);
  if(!cocok.length){hasil.innerHTML=`<p class="t-s kosong petak" style="grid-column:span 12">Tidak ada rute ${esc(kota)} dalam toleransi target. Naikkan target atau pilih kota lain.</p>`;return}
  hasil.innerHTML=cocok.map((r,i)=>{
    const mnt=Math.round(r.jarak/s*60),kal=Math.round(r.jarak*36),air=(mnt/60*0.5).toFixed(1);
    return `<div class="petak kartu-hasil${i===0?' utama':''}">
      <p class="t-s kicker">${i===0?'REKOMENDASI UTAMA':'ALTERNATIF '+(i+1)}</p>
      <h3 class="t-m">${esc(r.nama)}</h3>
      <table class="stat-tabel t-s">
        <tr><td>Jarak</td><td>${r.jarak} km</td></tr>
        <tr><td>Estimasi waktu @${s} km/jam</td><td>±${mnt} mnt</td></tr>
        <tr><td>Kalori (estimasi)</td><td>±${kal} kkal</td></tr>
        <tr><td>Air minum (estimasi)</td><td>±${air} L</td></tr>
      </table></div>`;
  }).join('');
});

/* ---------- log ---------- */
function streak(rides){
  const days=[...new Set(rides.map(r=>r.tgl))].sort().reverse();
  if(!days.length) return 0;
  const today=new Date().toISOString().slice(0,10);
  const yest=new Date(Date.now()-864e5).toISOString().slice(0,10);
  let s=0,cur=(days[0]===today||days[0]===yest)?new Date(days[0]+'T00:00:00'):null;
  if(!cur) return 0;
  for(const d of days){
    const dd=new Date(d+'T00:00:00');
    if((cur-dd)/864e5===s){s++}else break;
  }
  return s;
}
function renderLog(){
  const box=$('#daftarLog'),rides=state.rides;
  box.innerHTML=rides.map((r,i)=>{
    const rute=RUTES.find(x=>x.id===r.rute);
    return `<li><span><strong>${esc(rute?rute.nama:r.rute)}</strong> · ${r.km} km · ${r.mnt} mnt · ${fmtTgl(r.tgl)}</span>
      <button class="t-s" data-hapus="${i}" aria-label="Hapus catatan ${i+1}">✕</button></li>`;
  }).join('');
  $('#kosongLog').hidden=rides.length>0;
  const total=rides.reduce((a,r)=>a+r.km,0);
  $('#odoKm').textContent=Math.round(total*10)/10;
  $('#ringkasLog').textContent=rides.length?`${rides.length} catatan · streak ${streak(rides)} hari · rata-rata ${(total/rides.length).toFixed(1)} km/gowes`:'Belum ada catatan.';
  box.querySelectorAll('[data-hapus]').forEach(b=>b.onclick=()=>{
    if(b.dataset.konfirmasi){state.rides.splice(+b.dataset.hapus,1);saveState(state);renderLog()}
    else{b.dataset.konfirmasi='1';b.textContent='YAKIN?';setTimeout(()=>{b.dataset.konfirmasi='';b.textContent='✕'},2500)}
  });
  if(window.GOWES_motion) window.GOWES_motion.scrambleEl($('#odoKm'));
}
$('#formLog').addEventListener('submit',e=>{
  e.preventDefault();
  const galat=$('#galatLog');
  const rute=$('#lRute').value,tgl=$('#lTgl').value,km=+$('#lKm').value,mnt=+$('#lMnt').value;
  if(!(km>=0.5&&km<=500)){galat.hidden=false;galat.textContent='JARAK TIDAK VALID — 0,5 sampai 500 km, Mas.';return}
  if(!(mnt>=1&&mnt<=1440)){galat.hidden=false;galat.textContent='DURASI TIDAK VALID — 1 sampai 1440 menit.';return}
  if(!tgl){galat.hidden=false;galat.textContent='TANGGAL KOSONG — isi dulu, Mas.';return}
  galat.hidden=true;
  state.rides.unshift({rute,tgl,km,mnt,ts:Date.now()});
  saveState(state);renderLog();
  $('#lKm').value='';$('#lMnt').value='';
});
function unduh(nama,konten,tipe){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([konten],{type:tipe}));a.download=nama;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
$('#btnEksporJson').onclick=()=>unduh('gowes-log.json',JSON.stringify({v:1,ekspor:new Date().toISOString(),rides:state.rides},null,2),'application/json');
$('#btnEksporCsv').onclick=()=>{
  const rows=[['tanggal','rute','jarak_km','durasi_mnt'],...state.rides.map(r=>[r.tgl,(RUTES.find(x=>x.id===r.rute)||{}).nama||r.rute,r.km,r.mnt])];
  unduh('gowes-log.csv',rows.map(r=>r.join(',')).join('\n'),'text/csv');
};
async function salinTeks(teks,pesan){
  try{await navigator.clipboard.writeText(teks);umumkan(pesan)}
  catch(e){
    const ta=document.createElement('textarea');ta.value=teks;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');umumkan(pesan)}catch(_){umumkan('GAGAL MENYALIN — blokir izin clipboard, Mas.')}
    ta.remove();
  }
}
function umumkan(pesan){
  let live=$('#ariaLive');
  if(!live){live=document.createElement('p');live.id='ariaLive';live.className='t-s';live.setAttribute('aria-live','polite');live.style.position='absolute';live.style.left='-9999px';document.body.appendChild(live)}
  live.textContent=pesan;
}
$('#btnSalinWa').onclick=()=>{
  const total=state.rides.reduce((a,r)=>a+r.km,0);
  salinTeks(`GOWESKU — ${state.rides.length} gowes, total ${total.toFixed(1)} km, streak ${streak(state.rides)} hari. Ukur dulu, gowes kemudian!`,'Ringkasan tersalin, siap tempel ke WA.');
};

/* ---------- gear ---------- */
function renderGear(){
  const box=$('#daftarGear');
  box.innerHTML=GEAR.map((g,i)=>`<li><input type="checkbox" id="g${i}" ${state.gear.includes(i)?'checked':''} aria-label="${esc(g)}"><label for="g${i}">${esc(g)}</label></li>`).join('');
  const n=state.gear.length;
  $('#gearPersen').textContent=`${n}/10`;
  const bar=$('#gearBar');bar.setAttribute('aria-valuenow',n);bar.querySelector('i').style.width=(n*10)+'%';
  box.querySelectorAll('input').forEach((c,i)=>c.onchange=()=>{
    state.gear=c.checked?[...new Set([...state.gear,i])]:state.gear.filter(x=>x!==i);
    saveState(state);renderGear();
  });
}
$('#btnResetGear').onclick=()=>{state.gear=[];saveState(state);renderGear()};

/* ---------- deep link, keyboard, easter egg ---------- */
function deepLink(){
  const p=new URLSearchParams(location.search);
  const rute=p.get('rute');
  if(rute&&RUTES.some(r=>r.id===rute)){document.querySelector('#lembar-b').scrollIntoView();bukaDetail(rute)}
  const tab=p.get('tab');
  if(tab&&['b','c','d'].includes(tab)){const el=$('#lembar-'+tab);if(el)el.scrollIntoView()}
}
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea'))return;
  const map={'1':'#lembar-a','2':'#lembar-b','3':'#lembar-c','4':'#lembar-d'};
  if(map[e.key]){const el=$(map[e.key]);if(el){el.focus({preventScroll:true});el.scrollIntoView({behavior:'smooth'})}}
});
(function(){
  let buf='';
  document.addEventListener('keydown',e=>{
    if(e.key.length!==1)return;
    buf=(buf+e.key.toLowerCase()).slice(-6);
    if(buf==='gaspol'){const s=$('#stempelRahasia');s.hidden=false;$('#btnTutupEgg').focus()}
  });
  $('#btnTutupEgg').onclick=()=>{$('#stempelRahasia').hidden=true};
})();

/* ---------- init ---------- */
isiSelect();terapkanFilter();renderLog();renderGear();
$('#formFilter').addEventListener('input',terapkanFilter);
grid.addEventListener('click',e=>{const k=e.target.closest('.kartu');if(k)bukaDetail(k.dataset.id)});
grid.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const k=e.target.closest('.kartu');if(k){e.preventDefault();bukaDetail(k.dataset.id)}}});
grid.addEventListener('mouseover',e=>{const k=e.target.closest('.kartu');if(k)document.documentElement.dataset.tema=k.dataset.waktu});
grid.addEventListener('mouseleave',()=>{document.documentElement.dataset.tema='netral'});
grid.addEventListener('focusin',e=>{const k=e.target.closest('.kartu');if(k)document.documentElement.dataset.tema=k.dataset.waktu});
grid.addEventListener('focusout',()=>{document.documentElement.dataset.tema='netral'});
deepLink();
})();
