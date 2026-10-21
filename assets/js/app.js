/* =====================================================================
   Simayab — app logic (UI, navigation, player engine)
   Channel data lives in channels.js
   ===================================================================== */

/* ---------- i18n ---------- */
const T={
  en:{search:"Search channels…",all:"All",af:"Afghanistan",ir:"Iran",intl:"International",fav:"Favorites",
      live:"LIVE",loading:"Connecting to stream…",err:"This channel isn't responding",errp:"We tried every available source. The channel may be offline or restricted in your region.",
      retry:"Try again",next:"Next channel",soon:"SOON",nosrc:"No public stream available yet",nosrcp:"This broadcaster doesn't offer an open public stream (many IRIB networks are limited to viewers inside Iran). If you hold a licensed stream URL, add it in assets/js/channels.js.",
      noresult:"No channels found",nofav:"Tap the star on any channel to save it here.",
      auto:"Auto",pip:"Picture-in-picture",favt:"Favorite",share:"Copy link",copied:"Link copied",
      demo:"Demo stream — real channel URL not configured",
      channels:"channels",viewall:"View all",explore:"Explore channels",catall:"All categories",
      foot:"Simayab is a viewing interface. Each channel remains the property of its owner; only add streams you are licensed or permitted to distribute.",
      group:{af:"Afghan Channels",ir:"Iranian Channels",intl:"International Channels"},
      rd:{af:"National broadcasters, news, entertainment and culture from Afghanistan.",
          ir:"IRIB national networks, news, sports, education and culture from Iran.",
          intl:"Global news and sports channels from around the world in English, Arabic, Persian and more."},
      cat:{General:"General",News:"News",Entertainment:"Entertainment",Education:"Education",Religion:"Religion",Health:"Health",Sports:"Sports",Documentary:"Documentary",Kids:"Kids"}},
  fa:{search:"جستجوی شبکه‌ها…",all:"همه",af:"افغانستان",ir:"ایران",intl:"بین‌المللی",fav:"علاقه‌مندی‌ها",
      live:"زنده",loading:"در حال اتصال به پخش…",err:"این شبکه پاسخ نمی‌دهد",errp:"همه منابع موجود امتحان شد. ممکن است شبکه آفلاین یا در منطقهٔ شما محدود باشد.",
      retry:"تلاش دوباره",next:"شبکهٔ بعدی",soon:"به‌زودی",nosrc:"هنوز پخش عمومی برای این شبکه موجود نیست",nosrcp:"این شبکه پخش باز و عمومی ارائه نمی‌دهد (بسیاری از شبکه‌های صدا و سیما فقط برای بینندگان داخل ایران قابل دسترسی‌اند). اگر لینک مجاز پخش دارید، آن را در فایل assets/js/channels.js اضافه کنید.",
      noresult:"شبکه‌ای یافت نشد",nofav:"روی ستاره‌ی هر شبکه بزنید تا اینجا ذخیره شود.",
      auto:"خودکار",pip:"تصویر در تصویر",favt:"علاقه‌مندی",share:"کپی لینک",copied:"لینک کپی شد",
      demo:"پخش آزمایشی — لینک واقعی شبکه تنظیم نشده",
      channels:"شبکه",viewall:"دیدن همه",explore:"کاوش شبکه‌ها",catall:"همه دسته‌ها",
      foot:"سیمایاب فقط یک رابط تماشا است. مالکیت هر شبکه متعلق به صاحب آن است؛ فقط لینک‌هایی را اضافه کنید که اجازهٔ پخش آن را دارید.",
      group:{af:"شبکه‌های افغانستان",ir:"شبکه‌های ایران",intl:"شبکه‌های بین‌المللی"},
      rd:{af:"شبکه‌های ملی، خبری، سرگرمی و فرهنگی افغانستان.",
          ir:"شبکه‌های ملی صدا و سیما، خبر، ورزش، آموزش و فرهنگ ایران.",
          intl:"شبکه‌های خبری و ورزشی جهان به زبان‌های انگلیسی، عربی، فارسی و دیگر زبان‌ها."},
      cat:{General:"عمومی",News:"خبری",Entertainment:"سرگرمی",Education:"آموزشی",Religion:"مذهبی",Health:"سلامت",Sports:"ورزشی",Documentary:"مستند",Kids:"کودک"}}
};

/* ---------- State & helpers ---------- */
const REG=["af","ir","intl"];
const $=s=>document.querySelector(s);
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
let lang=store.get("lz.lang",(navigator.language||"").startsWith("fa")?"fa":"en");
let favs=new Set(store.get("lz.favs",[]));
let tab="all", cat="all", query="", cur=null, srcIdx=0, hls=null, retries=0, token=0;
let megaG=null, megaT=null;
const v=$("#v"), f=$("#f"), ov=$("#ov"), ovbox=$("#ovbox");
const t=k=>T[lang][k];
const name=c=>lang==="fa"?c.fa:c.en;
const sub=c=>lang==="fa"?c.en:c.fa;
const catName=k=>T[lang].cat[k]||k;
const hue=s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))%360;return h};
const initials=c=>{
  const w=c.en.replace(/[^A-Za-z0-9 ]/g," ").split(/\s+/).filter(Boolean);
  const num=w.find((x,i)=>i>0&&/^\d+$/.test(x));           // "IRIB TV 3" -> "I3", "Euronews" -> "E"
  if(num)return(w[0][0]+num).toUpperCase();
  return w.slice(0,2).map(x=>x[0]).join("").toUpperCase()||"TV";
};
const hasSrc=c=>c.src.length>0||CONFIG.DEMO_MODE;
// Channel logo: the channel's own icon (see logoOf in channels.js); falls back to coloured initials
function avatar(c,lg){
  const h=hue(c.id), bg=`linear-gradient(135deg,hsl(${h} 70% 48%),hsl(${(h+50)%360} 70% 28%))`, ini=initials(c), logo=logoOf(c);
  if(logo)return `<div class="av logo ${lg===true?"lg":""}" data-ini="${ini}" data-bg="${bg}"><img src="${logo}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="lzErr(this)"></div>`;
  return `<div class="av ${lg===true?"lg":""}" style="background:${bg}">${ini}</div>`;
}
window.lzErr=img=>{const p=img.parentElement;if(!p)return;p.classList.remove("logo");p.style.background=p.dataset.bg;p.textContent=p.dataset.ini};
const livePill=c=>hasSrc(c)?`<span class="live">${t("live")}</span>`:`<span class="soon">${t("soon")}</span>`;
const ico={
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
  starO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
  pip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="12" width="8" height="6" rx="1" fill="currentColor"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
const badge=(g,lg)=>g==="all"
  ?`<span class="bd plain ${lg?"lg":""}">${ico.grid}</span>`
  :`<span class="bd ${lg?"lg":""}" data-g="${g}">${g==="intl"?ico.globe:g.toUpperCase()}</span>`;
function toast(m){const e=$("#toast");e.textContent=m;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1800)}
const count=g=>g==="all"?CHANNELS.length:g==="fav"?favs.size:CHANNELS.filter(c=>c.g===g).length;

/* ---------- Filtering ---------- */
function visible(){
  const q=query.trim().toLowerCase();
  return CHANNELS.filter(c=>{
    if(tab==="fav"&&!favs.has(c.id))return false;
    if(REG.includes(tab)&&c.g!==tab)return false;
    if(REG.includes(tab)&&cat!=="all"&&c.cat!==cat)return false;
    if(q&&!(c.en+" "+c.fa+" "+c.cat).toLowerCase().includes(q))return false;
    return true;
  });
}

/* ---------- Rendering: header navigation + mega menu ---------- */
function renderNav(){
  $("#rwrap").innerHTML=["all",...REG].map(g=>`
    <button class="rn ${tab===g?"on":""} ${megaG===g?"open":""}" ${g==="all"?"":`data-g="${g}" data-menu="${g}"`} data-nav="${g}" type="button">
      ${badge(g)}<span>${g==="all"?t("all"):t(g)}</span><em>${count(g)}</em>${g==="all"?"":ico.chev}
    </button>`).join("");
  $("#favbtn").classList.toggle("on",tab==="fav");
  $("#favn").textContent=favs.size;
}
let noMegaUntil=0; // stops the menu re-opening when a re-render puts a button under a still cursor
function openMega(g){
  clearTimeout(megaT);
  if(megaG===g||Date.now()<noMegaUntil)return;
  megaG=g;
  const items=CHANNELS.filter(c=>c.g===g);
  $("#mega").innerHTML=`<div class="mg" data-g="${g}">
    <div class="mg-intro">${badge(g,true)}<h3>${T[lang].group[g]}</h3><p>${T[lang].rd[g]}</p>
      <button class="btn" data-nav="${g}" type="button">${t("viewall")} · ${items.length}</button></div>
    <div class="mg-grid">${items.map(c=>`<button class="mi" data-id="${c.id}" type="button">${avatar(c)}<span><b>${name(c)}</b><small>${sub(c)} · ${catName(c.cat)}</small></span></button>`).join("")}</div>
  </div>`;
  $("#mega").hidden=false;
  document.querySelectorAll(".rn").forEach(b=>b.classList.toggle("open",b.dataset.menu===g));
}
function closeMega(){
  clearTimeout(megaT);
  if(!megaG)return;
  megaG=null;$("#mega").hidden=true;
  document.querySelectorAll(".rn.open").forEach(b=>b.classList.remove("open"));
}

/* ---------- Rendering: side guide ---------- */
function renderTabs(){
  $("#tabs").innerHTML=["all",...REG,"fav"].map(g=>`<button class="tab ${tab===g?"on":""}" ${REG.includes(g)?`data-g="${g}"`:""} data-t="${g}" type="button">${t(g)}<em>${count(g)}</em></button>`).join("");
}
function renderList(){
  const arr=visible();
  if(!arr.length){$("#list").innerHTML=`<div class="empty">${tab==="fav"&&!query.trim()?t("nofav"):t("noresult")}</div>`;return}
  const grouped=!REG.includes(tab)||query.trim();
  let html="",last=null;
  for(const c of arr){
    if(grouped&&c.g!==last){last=c.g;html+=`<div class="lh" data-g="${c.g}">${badge(c.g)}<span>${T[lang].group[c.g]}</span></div>`}
    html+=`<button class="row ${cur&&cur.id===c.id?"on":""} ${hasSrc(c)?"":"off"}" data-id="${c.id}" type="button">
      ${avatar(c)}
      <div class="txt"><div class="nm">${name(c)}</div><div class="sb">${sub(c)} · ${catName(c.cat)}</div></div>
      <span class="fv ${favs.has(c.id)?"on":""}" data-fav="${c.id}">${favs.has(c.id)?ico.star:ico.starO}</span>
    </button>`;
  }
  $("#list").innerHTML=html;
}

/* ---------- Rendering: browse area (tiles, banners, cards) ---------- */
const card=c=>`<button class="card ${cur&&cur.id===c.id?"on":""} ${hasSrc(c)?"":"off"}" data-g="${c.g}" data-id="${c.id}" type="button">${avatar(c)}${livePill(c)}
  <div><div class="nm">${name(c)}</div><div class="sb">${sub(c)} · ${catName(c.cat)}</div></div></button>`;
function tiles(){
  return `<div class="tiles">${REG.map(g=>{
    const ch=CHANNELS.filter(c=>c.g===g);
    return `<button class="tile" data-g="${g}" data-nav="${g}" type="button">
      ${badge(g,true)}
      <div><h3>${T[lang].group[g]}</h3></div>
      <p>${T[lang].rd[g]}</p>
      <div class="foot">
        <div class="stack">${ch.slice(0,4).map(c=>avatar(c)).join("")}${ch.length>4?`<span class="more" dir="ltr">+${ch.length-4}</span>`:""}</div>
        <span class="go">${ch.length} ${t("channels")} ${ico.arrow}</span>
      </div></button>`}).join("")}</div>`;
}
function chips(g){
  const cats=[...new Set(CHANNELS.filter(c=>c.g===g).map(c=>c.cat))];
  if(cats.length<2)return"";
  return `<div class="chips">${["all",...cats].map(k=>`<button class="chip ${cat===k?"on":""}" data-cat="${k}" type="button">${k==="all"?t("catall"):catName(k)}</button>`).join("")}</div>`;
}
function shelf(g,items,o={}){
  return `<section class="shelf" data-g="${g}" id="shelf-${g}">
    <div class="banner">${badge(g,true)}
      <div class="bt"><h2>${T[lang].group[g]}</h2><p>${T[lang].rd[g]}</p></div>
      <div class="bm"><b>${items.length}</b><span>${t("channels")}</span></div>
      ${o.viewAll?`<button class="btn ghost" data-nav="${g}" type="button">${t("viewall")}</button>`:""}
    </div>
    ${o.chips?chips(g):""}
    <div class="cards">${items.map(card).join("")}</div>
  </section>`;
}
function renderBrowse(){
  const q=query.trim(), arr=visible();
  let html="";
  if(tab==="all"&&!q)html+=tiles();
  if(!arr.length)html+=`<div class="empty big">${tab==="fav"&&!q?t("nofav"):t("noresult")}</div>`;
  else if(REG.includes(tab)&&!q)html+=shelf(tab,arr,{chips:true});
  else REG.forEach(g=>{const items=arr.filter(c=>c.g===g);if(items.length)html+=shelf(g,items,{viewAll:tab==="all"&&!q})});
  $("#browse").innerHTML=html;
}

/* ---------- Rendering: now-playing bar ---------- */
function renderNow(){
  if(!cur)return;
  $("#now").innerHTML=`${avatar(cur,true)}
    <div class="meta"><h1>${name(cur)} ${livePill(cur)}</h1><small>${sub(cur)} · ${catName(cur.cat)} · ${T[lang].group[cur.g]}</small></div>
    <div class="tools">
      <select class="q" id="qual" aria-label="Quality" style="display:none"><option value="-1">${t("auto")}</option></select>
      <button class="tool ${favs.has(cur.id)?"on":""}" id="bfav" title="${t("favt")}" type="button">${favs.has(cur.id)?ico.star:ico.starO}</button>
      <button class="tool" id="bpip" title="${t("pip")}" type="button">${ico.pip}</button>
      <button class="tool" id="bshare" title="${t("share")}" type="button">${ico.link}</button>
    </div>`;
}
function renderLists(){renderNav();renderTabs();renderList();renderBrowse()}
function renderAll(){
  document.documentElement.lang=lang; document.documentElement.dir=lang==="fa"?"rtl":"ltr";
  $("#q").placeholder=t("search"); $("#foot").textContent=t("foot");
  document.querySelectorAll(".lang button").forEach(b=>b.classList.toggle("on",b.dataset.l===lang));
  closeMega();noMegaUntil=Date.now()+600;renderLists();renderNow();
}
function setTab(g,scroll){
  tab=g;cat="all";closeMega();noMegaUntil=Date.now()+600;renderLists();
  if(scroll){const el=$("#browse");el&&el.scrollIntoView({behavior:"smooth",block:"start"})}
}

/* =====================================================================
   Player engine — one <video>, one Hls instance, fast switching
   ===================================================================== */
function overlay(html){ov.classList.toggle("show",!!html);ovbox.innerHTML=html||""}
const loadingHTML=()=>`<div class="spin"></div><h3>${t("loading")}</h3>`;
function stop(){
  token++;
  if(hls){hls.destroy();hls=null}
  v.removeAttribute("src");v.load();
  f.style.display="none";f.removeAttribute("src");v.style.display="block";
  $("#qual")&&($("#qual").style.display="none");
}
// Source list for a channel: direct sources first, then proxied copies (fallback for CORS-blocked hosts).
// Hosts that needed the proxy before are remembered, so the proxied copy is tried first next time (faster start).
const pxHosts=new Set(store.get("lz.px",[]));
const hostOf=u=>{try{return new URL(u).hostname}catch{return""}};
const proxyable=u=>{const h=hostOf(u);return !!CONFIG.PROXY&&(CONFIG.PROXY_HOSTS||[]).some(d=>h===d||h.endsWith("."+d))};
function sources(c){
  const base=c.src.map(s=>typeof s==="string"?{type:"hls",url:s}:s);
  const prox=base.filter(s=>s.type==="hls"&&proxyable(s.url))
    .map(s=>({type:"hls",url:CONFIG.PROXY+encodeURIComponent(s.url),proxied:true,host:hostOf(s.url)}));
  const known=prox.filter(p=>pxHosts.has(p.host)), later=prox.filter(p=>!pxHosts.has(p.host));
  return [...known,...base,...later];
}
function resolve(c,i){
  const l=sources(c);
  if(l[i])return l[i];
  if(!l.length&&CONFIG.DEMO_MODE&&i===0)return{type:"hls",url:CONFIG.DEMO_STREAM,demo:true};
  return null;
}
function play(c,i=0){
  cur=c;srcIdx=i;retries=0;stop();
  const my=token;
  store.set("lz.last",c.id);
  if(location.hash!=="#/"+c.id)history.replaceState(null,"","#/"+c.id);
  document.title=`${name(c)} — Simayab`;
  renderNow();renderList();
  document.querySelectorAll(".card").forEach(el=>el.classList.toggle("on",el.dataset.id===c.id));
  const s=resolve(c,i);
  if(!s){ overlay(`<div class="spin" style="animation:none;border-color:#ffffff22"></div><h3>${t("nosrc")}</h3><p>${t("nosrcp")}</p>`);return}
  overlay(loadingHTML());
  if(s.type==="youtube"||s.type==="iframe"){
    v.style.display="none";f.style.display="block";
    f.src=s.type==="youtube"
      ?(s.channel?`https://www.youtube-nocookie.com/embed/live_stream?channel=${s.channel}&autoplay=1&rel=0&modestbranding=1`
                 :`https://www.youtube-nocookie.com/embed/${s.id}?autoplay=1&rel=0&modestbranding=1`)
      :s.url;
    f.onload=()=>{if(my===token)overlay("")};return;
  }
  startHls(s,my);
}
function startHls(s,my){
  const done=()=>{if(my!==token)return;if(s.proxied&&!pxHosts.has(s.host)){pxHosts.add(s.host);store.set("lz.px",[...pxHosts])}overlay("");if(s.demo)toast(t("demo"));const p=v.play();p&&p.catch(()=>{v.muted=true;v.play().catch(()=>{})})};
  // Safari / iOS: native HLS
  if(!window.Hls||!Hls.isSupported()){
    if(v.canPlayType("application/vnd.apple.mpegurl")){v.src=s.url;v.onloadeddata=done;v.onerror=()=>fail(my);return}
    if(!window.Hls){setTimeout(()=>startHls(s,my),150);return} // hls.js still loading (defer)
    return fail(my);
  }
  hls=new Hls({
    lowLatencyMode:true, enableWorker:true,
    startFragPrefetch:true, maxBufferLength:18, maxMaxBufferLength:40, backBufferLength:20,
    capLevelToPlayerSize:true, startLevel:-1, abrEwmaDefaultEstimate:3_000_000,
    manifestLoadingMaxRetry:1, manifestLoadingRetryDelay:500, levelLoadingMaxRetry:2, fragLoadingMaxRetry:3
  });
  let loaded=false;
  hls.on(Hls.Events.MANIFEST_PARSED,(_,d)=>{loaded=true;buildQuality(d.levels);done()});
  hls.on(Hls.Events.FRAG_BUFFERED,()=>{if(my===token)overlay("")});
  hls.on(Hls.Events.ERROR,(_,e)=>{
    if(my!==token||!e.fatal)return;
    if(e.type===Hls.ErrorTypes.MEDIA_ERROR&&retries++<3){hls.recoverMediaError();return}
    if(e.type===Hls.ErrorTypes.NETWORK_ERROR&&(loaded||!resolve(cur,srcIdx+1))&&retries++<2){setTimeout(()=>hls&&hls.startLoad(),600*retries);return}
    fail(my);
  });
  hls.loadSource(s.url);hls.attachMedia(v);
}
function fail(my){
  if(my!==token)return;
  const next=srcIdx+1;
  if(resolve(cur,next))return play(cur,next);        // automatic failover to backup source
  overlay(`<h3>${t("err")}</h3><p>${t("errp")}</p>
    <button class="btn" id="retry" type="button">${t("retry")}</button> <button class="btn ghost" id="nextch" type="button">${t("next")}</button>`);
}
function buildQuality(levels){
  const sel=$("#qual");if(!sel||!levels||levels.length<2)return;
  sel.innerHTML=`<option value="-1">${t("auto")}</option>`+levels.map((l,i)=>`<option value="${i}">${l.height?l.height+"p":Math.round(l.bitrate/1000)+"k"}</option>`).join("");
  sel.style.display="";sel.onchange=()=>{if(hls)hls.currentLevel=+sel.value};
}
// Warm the connection to a channel's origin when the user hovers/touches it
const warmed=new Set();
function warm(id){
  const c=CHANNELS.find(x=>x.id===id);if(!c)return;
  const s=c.src[0];const u=typeof s==="string"?s:(s&&s.url);if(!u||warmed.has(u))return;
  try{const o=new URL(u).origin;warmed.add(u);const l=document.createElement("link");l.rel="preconnect";l.href=o;l.crossOrigin="";document.head.appendChild(l)}catch{}
}

/* ---------- Watermark (Persian eight-pointed star + brand name) ---------- */
function renderWatermark(){
  const B=CONFIG.BRAND||{};
  const en=B.en||"Simayab";
  const fa="سیمایاب";   // Persian brand name (corrected: Simayab, not Simab)
  const i=Math.max(1,Math.ceil(en.length/2));
  $("#wm").innerHTML=`<svg viewBox="0 0 48 48" fill="none" stroke-linejoin="round">
      <defs><linearGradient id="wmg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ea2ff"/><stop offset="1" stop-color="#2a5bff"/></linearGradient></defs>
      <circle cx="24" cy="24" r="22" stroke="#e8b657" stroke-width="1.6"/>
      <rect x="9.5" y="9.5" width="29" height="29" rx="2" fill="url(#wmg)" stroke="#e8b657" stroke-width="1.6"/>
      <rect x="9.5" y="9.5" width="29" height="29" rx="2" transform="rotate(45 24 24)" fill="#0b2a9a" fill-opacity=".85" stroke="#e8b657" stroke-width="1.6"/>
      <circle cx="24" cy="24" r="5" fill="#e8b657"/><circle cx="24" cy="24" r="2" fill="#0b2a9a"/>
    </svg><b>${en.slice(0,i)}<i>${en.slice(i)}</i></b><span>${fa}</span>`;
}
function toggleFullscreen(){
  const p=$("#player");
  if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document);return}
  const req=p.requestFullscreen||p.webkitRequestFullscreen;
  if(req)req.call(p).catch(()=>{});
  else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();   // iPhone Safari: native video fullscreen only
}

/* =====================================================================
   Events
   ===================================================================== */
const byId=id=>CHANNELS.find(c=>c.id===id);
function go(id){
  const c=byId(id);if(!c)return;
  closeMega();play(c);
  // bring the player back into view if the user picked a channel far down the page
  const w=$("#watch"),r=w.getBoundingClientRect();
  if(r.top<-20||r.top>innerHeight*0.6)w.scrollIntoView({behavior:"smooth",block:"start"});
}
document.addEventListener("click",e=>{
  const tg=e.target;
  const fav=tg.closest("[data-fav]");
  if(fav){e.stopPropagation();toggleFav(fav.dataset.fav);return}
  const el=tg.closest("[data-id]");if(el){go(el.dataset.id);return}
  const nav=tg.closest("[data-nav]");if(nav){setTab(nav.dataset.nav,true);return}
  const tb=tg.closest("[data-t]");if(tb){setTab(tb.dataset.t,false);return}
  const ct=tg.closest("[data-cat]");if(ct){cat=ct.dataset.cat;renderList();renderBrowse();return}
  const lb=tg.closest(".lang button");if(lb){lang=lb.dataset.l;store.set("lz.lang",lang);renderAll();return}
  if(tg.closest("#favbtn"))return setTab(tab==="fav"?"all":"fav",true);
  if(tg.closest("#fsb"))return toggleFullscreen();
  if(tg.closest("#bfav"))return toggleFav(cur.id);
  if(tg.closest("#bpip")){v.requestPictureInPicture?v.requestPictureInPicture().catch(()=>{}):v.webkitSetPresentationMode&&v.webkitSetPresentationMode("picture-in-picture");return}
  if(tg.closest("#bshare")){navigator.clipboard&&navigator.clipboard.writeText(location.href).then(()=>toast(t("copied")));return}
  if(tg.closest("#retry"))return play(cur,0);
  if(tg.closest("#nextch"))return step(1);
  if(!tg.closest(".regions"))closeMega();
});
// Mega menu: opens on mouse hover or keyboard focus, closes when leaving
$("#rwrap").addEventListener("pointerover",e=>{
  if(e.pointerType!=="mouse")return;
  const b=e.target.closest(".rn");if(!b)return;
  b.dataset.menu?openMega(b.dataset.menu):closeMega();
});
$("#regions").addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"){clearTimeout(megaT);megaT=setTimeout(closeMega,220)}});
$("#regions").addEventListener("pointerenter",()=>clearTimeout(megaT));
$("#regions").addEventListener("focusin",e=>{const b=e.target.closest("[data-menu]");if(b&&e.target.matches(":focus-visible"))openMega(b.dataset.menu)});
["pointerover","touchstart"].forEach(ev=>document.addEventListener(ev,e=>{const el=e.target.closest&&e.target.closest("[data-id]");if(el)warm(el.dataset.id)},{passive:true}));
function toggleFav(id){favs.has(id)?favs.delete(id):favs.add(id);store.set("lz.favs",[...favs]);renderLists();renderNow()}
function step(d){const arr=visible().length?visible():CHANNELS;let i=arr.findIndex(c=>cur&&c.id===cur.id);go(arr[(i+d+arr.length)%arr.length].id)}
let qt;$("#q").addEventListener("input",e=>{clearTimeout(qt);qt=setTimeout(()=>{query=e.target.value;renderList();renderBrowse()},120)});
document.addEventListener("keydown",e=>{
  const typing=/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
  if(e.key==="/"&&!typing){e.preventDefault();$("#q").focus();return}
  if(e.key==="Escape"){closeMega();$("#q").blur();return}
  if(typing)return;
  if(e.key==="ArrowDown"||e.key==="PageDown"){e.preventDefault();step(1)}
  else if(e.key==="ArrowUp"||e.key==="PageUp"){e.preventDefault();step(-1)}
  else if(e.key==="m"||e.key==="M")v.muted=!v.muted;
  else if(e.key==="f"||e.key==="F")toggleFullscreen();
  else if(e.key==="p"||e.key==="P")$("#bpip")&&$("#bpip").click();
});
window.addEventListener("hashchange",()=>{const id=location.hash.replace(/^#\/?/,"").replace(/^watch\//,"").replace(/\/$/,"");if(id&&byId(id)&&(!cur||cur.id!==id))play(byId(id))});
addEventListener("online",()=>cur&&play(cur,0));
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&hls){hls.startLoad();v.paused&&v.play().catch(()=>{})}});

/* =====================================================================
   Boot
   ===================================================================== */
$("#player").addEventListener("dblclick",e=>{if(e.target===v||e.target===f)toggleFullscreen()});
renderWatermark();
renderAll();
const fromHash=location.hash.replace(/^#\/?/,"").replace(/^watch\//,"").replace(/\/$/,"");
play(byId(fromHash)||byId(store.get("lz.last",null))||byId(CONFIG.DEFAULT_CHANNEL)||CHANNELS[0]);