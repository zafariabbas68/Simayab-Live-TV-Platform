/* =====================================================================
   Simayab — channel data
   ---------------------------------------------------------------------
   Each channel:  C(id, englishName, persianName, group, category, siteDomain, sources)

   group     "af" Afghanistan · "ir" Iran · "intl" International
   siteDomain  used to load the channel's own icon automatically. Leave "" for none.
               To use an exact logo file instead, put it in assets/logos/ and add it to LOGOS below.
   sources   - "https://…/index.m3u8"            HLS stream (best, fastest)
             - YT("UC…")                          official YouTube LIVE channel (embedded)
             - {type:"iframe", url:"https://…"}   any official embed page
             - [a, b, c]                          several sources: Simayab tries the next one
                                                  automatically if one fails (failover)
             - omit / []                          no public stream known → card is shown as "Soon"

   Only https:// streams can play on an https website (browsers block http:// as mixed content).
   Stream sources below come from publicly listed free-to-air feeds (iptv-org public lists) and
   the broadcasters' own CDNs. Streams change/expire and some are geo-restricted: run
   `python tools/check_streams.py` regularly to see which ones are alive.
   ===================================================================== */
const CONFIG = {
  // Watermark shown in the bottom-left corner of the player (also in fullscreen).
  // Platform name (English / Persian). Change these two to rename the platform.
  BRAND: { en: "Simayab", fa: "سیماب" },
  // Built-in proxy (api/hls.js on Vercel, or dev_server.py locally). Used automatically ONLY as a fallback when a
  // stream is blocked for browsers (CORS / referrer). PROXY_HOSTS = sites it is allowed to relay (keep in sync with api/hls.js).
  PROXY: "/api/hls?u=",
  PROXY_HOSTS: ["telewebion.net","telewebion.ir","presstv.co.uk","presstv.ir","alalam.ir","iranpress.com","snn.ir"],
  DEMO_MODE: false,                         // true = channels without a link play a test video
  DEMO_STREAM: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  DEFAULT_CHANNEL: "aljazeera-en",
};

// Optional exact logos:  "channel-id": "assets/logos/file.png"
const LOGOS = {
  // "tolonews": "assets/logos/tolonews.png",
};

const YT = channel => ({ type: "youtube", channel });
const C = (id, en, fa, g, cat, site = "", src = []) => ({ id, en, fa, g, cat, site, src: [].concat(src) });
const logoOf = c => LOGOS[c.id] || (c.site ? `https://www.google.com/s2/favicons?domain=${c.site}&sz=128` : "");

/* Order inside each group: channels with a stream first, "Soon" channels last. */
const CHANNELS = [
  /* ---------------- Afghanistan ---------------- */
  C("tolonews","TOLOnews","طلوع‌نیوز","af","News","tolonews.com","https://tgn.bozztv.com/eshgtv-dvrfl05/gin-tolonews/index.m3u8"),
  C("tolo-tv","Tolo TV","طلوع","af","General","tolotv.af","https://tgn.bozztv.com/eshgtv-dvrfl05/gin-tolohd/tracks-v1a1/mono.m3u8"),
  C("lemar-tv","Lemar TV","لمر","af","General","lemartv.af","https://tgn.bozztv.com/eshgtv-dvrfl05/gin-lemar/index.m3u8"),
  C("rta","RTA National","ملی افغانستان","af","General","rta.af","https://rta-tv.akamaized.net/live/SD/RTA-1/RTA/RTA-1.m3u8"),
  C("shamshad-tv","Shamshad TV","شمشاد","af","News","shamshadtv.af","https://5a1178b42cc03.streamlock.net/shamshadtelevision/shamshadtelevision/playlist.m3u8"),
  C("ariana-news","Ariana News","آریانا نیوز","af","News","ariananews.af",YT("UC4DTRR-Dm_35Qt3IdxxzFDw")),
  C("ariana-tv","Ariana TV","آریانا تلویزیون","af","General","arianatelevision.com",YT("UCc9Ccwe0jPM6ucedh5toLiw")),
  C("ayna-tv","Ayna TV","آینه","af","General","aynatv.af",YT("UCLHhNuTWS2Qo0wCxT9pA9lg")),
  C("amc","AMC","ای‌ام‌سی","af","General","","https://amchls.wns.live/hls/stream.m3u8"),
  C("dunya-naw","Dunya Naw TV","دنیای نو","af","General","","https://dunyanhls.wns.live/hls/stream.m3u8"),
  C("eslah-tv","Eslah TV","اصلاح","af","General","","https://eslahtvhls.wns.live/hls/stream.m3u8"),
  C("bahar-tv","Bahar TV","بهار","af","General","","https://59d39900ebfb8.streamlock.net/bahartv/bahartv/playlist.m3u8"),
  C("tamadon-tv","Tamadon TV","تمدن","af","General","","https://hls.tamadon.live/hls/stream.m3u8"),
  C("kayhan-tv","Kayhan TV","کیهان","af","General","","https://playout395.livestreamingcdn.com/live/Stream1/playlist.m3u8"),
  C("iman-tv","Iman TV","ایمان","af","Religion","","https://live.relentlessinnovations.net:1936/imantv/imantv/playlist.m3u8"),
  // no public stream found yet
  C("rta-sport","RTA Sport","ملی ورزش","af","Sports","rta.af"),
  C("1tv","1TV","یک تلویزیون","af","News","1tv.af"),
  C("noor-tv","Noor TV","نور","af","General","noortv.af"),
  C("zhwandoon","Zhwandoon","ژوندون","af","Entertainment","zhwandoon.af"),
  C("kabul-news","Kabul News","کابل نیوز","af","News","kabulnews.af"),

  /* ---------------- Iran ---------------- */
  // IRIB networks come from Telewebion (primary edge host + backup). Some may only play from inside Iran;
  // in that case Simayab tries its built-in proxy automatically (see CONFIG.PROXY and README).
  C("irib-tv-1","IRIB TV 1","شبکه یک","ir","General","irib.ir",[
    "https://live-aburayhan1109.telewebion.net/ek/tv1/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/tv1/live/playlist.m3u8"]),
  C("irib-tv-2","IRIB TV 2","شبکه دو","ir","General","irib.ir",[
    "https://live-aburayhan1108.telewebion.net/ek/tv2/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/tv2/live/playlist.m3u8"]),
  C("irib-tv-3","IRIB TV 3","شبکه سه","ir","General","irib.ir",[
    "https://live-aburayhan1113.telewebion.net/ek/tv3/live/108050p/index.m3u8",
    "https://ncdn.telewebion.ir/tv3/live/playlist.m3u8"]),
  C("irib-tv-4","IRIB TV 4","شبکه چهار","ir","General","irib.ir",[
    "https://live-aburayhan1113.telewebion.net/ek/tv4/live/576p/index.m3u8",
    "https://ncdn.telewebion.ir/tv4/live/playlist.m3u8"]),
  C("irib-tv-5","IRIB TV 5 (Tehran)","شبکه پنج تهران","ir","General","irib.ir",[
    "https://live-aburayhan1110.telewebion.net/ek/tehran/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/tehran/live/playlist.m3u8"]),
  C("irinn","IRINN News","شبکه خبر","ir","News","irinn.ir",[
    "https://live-aburayhan1111.telewebion.net/ek/irinn2/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/irinn/live/playlist.m3u8"]),
  C("nasim","Nasim","نسیم","ir","Entertainment","irib.ir",[
    "https://live-aburayhan1105.telewebion.net/ek/nasim/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/nasim/live/playlist.m3u8"]),
  C("namayesh","Namayesh","نمایش","ir","Entertainment","irib.ir",[
    "https://live-aburayhan1111.telewebion.net/ek/namayesh/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/namayesh/live/playlist.m3u8"]),
  C("ofogh","Ofogh","افق","ir","General","irib.ir",[
    "https://live-aburayhan1111.telewebion.net/ek/ofogh/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/ofogh/live/playlist.m3u8"]),
  C("tamasha","Tamasha","تماشا","ir","Entertainment","irib.ir",[
    "https://live-aburayhan1103.telewebion.net/ek/hdtest/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/hdtest/live/playlist.m3u8"]),
  C("mostanad","Mostanad","مستند","ir","Documentary","irib.ir",[
    "https://live-aburayhan1110.telewebion.net/ek/mostanad/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/mostanad/live/playlist.m3u8"]),
  C("omid","Omid","امید","ir","General","irib.ir",[
    "https://live-aburayhan1101.telewebion.net/ek/omid/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/omid/live/playlist.m3u8"]),
  C("pooya-nahal","Pooya & Nahal","پویا و نهال","ir","Kids","irib.ir",[
    "https://live-aburayhan1109.telewebion.net/ek/pooya/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/pooya/live/playlist.m3u8"]),
  C("amoozesh","Amoozesh","آموزش","ir","Education","irib.ir",[
    "https://live-aburayhan1104.telewebion.net/ek/amouzesh/live/576p/index.m3u8",
    "https://ncdn.telewebion.ir/amouzesh/live/playlist.m3u8"]),
  C("quran","Quran TV","قرآن","ir","Religion","irib.ir",[
    "https://live-aburayhan1101.telewebion.net/ek/quran/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/quran/live/playlist.m3u8"]),
  C("salamat","Salamat","سلامت","ir","Health","irib.ir",[
    "https://live-aburayhan1110.telewebion.net/ek/salamat/live/576p/index.m3u8",
    "https://ncdn.telewebion.ir/salamat/live/playlist.m3u8"]),
  C("varzesh","Varzesh","ورزش","ir","Sports","irib.ir",[
    "https://live-aburayhan1104.telewebion.net/ek/varzesh/live/108050p/index.m3u8",
    "https://ncdn.telewebion.ir/varzesh/live/playlist.m3u8"]),
  C("tw-sport-1","Telewebion Sport 1","تلوبیون ورزش ۱","ir","Sports","telewebion.com",[
    "https://live-aburayhan1105.telewebion.net/ek/sport1/live/108050p/index.m3u8",
    "https://ncdn.telewebion.ir/sport1/live/playlist.m3u8"]),
  C("tw-sport-2","Telewebion Sport 2","تلوبیون ورزش ۲","ir","Sports","telewebion.com",[
    "https://live-aburayhan1112.telewebion.net/ek/sport2/live/108050p/index.m3u8",
    "https://ncdn.telewebion.ir/sport2/live/playlist.m3u8"]),
  C("tw-sport-3","Telewebion Sport 3","تلوبیون ورزش ۳","ir","Sports","telewebion.com",[
    "https://live-aburayhan1113.telewebion.net/ek/sport3/live/108050p/index.m3u8",
    "https://ncdn.telewebion.ir/sport3/live/playlist.m3u8"]),
  C("golkhane","Golkhane","گلخانه","ir","Entertainment","irib.ir",[
    "https://live-aburayhan1107.telewebion.net/na/golkhane/live/720p/index.m3u8",
    "https://ncdn.telewebion.ir/golkhane/live/playlist.m3u8"]),
  C("roya","Roya TV","شبکه رویا","ir","General","irib.ir",[
    "https://live-aburayhan1108.telewebion.net/na/iribu/live/720p/index.m3u8",
    "https://ncdn.telewebion.ir/iribu/live/playlist.m3u8"]),
  C("irib-uhd","IRIB UHD","شبکه فراتر (UHD)","ir","General","irib.ir",[
    "https://live-aburayhan1106.telewebion.net/ek/faratar/live/2160p/index.m3u8",
    "https://ncdn.telewebion.ir/faratar/live/playlist.m3u8"]),
  C("irinn2","IRINN 2","شبکه خبر ۲","ir","News","irinn.ir",[
    "https://live-aburayhan1111.telewebion.net/ek/irinn2/live/1080p/index.m3u8",
    "https://ncdn.telewebion.ir/irinn2/live/playlist.m3u8"]),
  // International services of IRIB / Press TV group
  C("press-tv","Press TV","پرس تی‌وی","ir","News","presstv.ir",[
    "https://live.presstv.co.uk/hls/presstv.m3u8",
    "https://live.presstv.ir/hls/presstv.m3u8"]),
  C("press-tv-fr","Press TV French","پرس تی‌وی فرانسوی","ir","News","presstv.ir","https://live4.presstv.ir/live/smil:presstvfr.smil/playlist.m3u8"),
  C("hispan-tv","HispanTV","هیسپان تی‌وی","ir","News","hispantv.com",[
    "https://live.presstv.co.uk/hls/hispantv.m3u8",
    "https://cdnlive.presstv.ir/live/smil:live.smil/playlist.m3u8"]),
  C("al-alam","Al Alam","العالم","ir","News","alalam.ir",[
    "https://live2.alalam.ir/live/Alalam/index.m3u8",
    "https://live2.alalam.ir/alalam.m3u8"]),
  C("al-kawthar","Al-Kawthar TV","الکوثر","ir","Religion","alkawthartv.com",[
    "https://live-aburayhan1106.telewebion.net/ek/kawthar/live/576p/index.m3u8",
    "https://ncdn.telewebion.ir/kawthar/live/playlist.m3u8"]),
  C("palestine-tv","Palestine TV","فلسطین","ir","News","irib.ir",[
    "https://live-aburayhan1106.telewebion.net/na/palestine/live/720p/index.m3u8",
    "https://ncdn.telewebion.ir/palestine/live/playlist.m3u8"]),
  C("iran-press","Iran Press","ایران پرس","ir","News","iranpress.com","https://ip2stream.iranpress.com/hls/ip2.m3u8"),
  C("snn","SNN TV","شبکه خبر دانشجو","ir","News","snn.ir","https://live2.snn.ir/hls/snn2_hd720/index.m3u8"),
  C("ifilm-fa","iFilm Persian","آی‌فیلم فارسی","ir","Entertainment","ifilmtv.ir",[
    "https://live.presstv.co.uk/hls/ifilmfa_4_482/index.m3u8",
    "https://live.presstv.ir/hls/ifilmfa.m3u8"]),
  C("ifilm-en","iFilm English","آی‌فیلم انگلیسی","ir","Entertainment","ifilmtv.ir",[
    "https://live.presstv.co.uk/hls/ifilmen_4_482/index.m3u8",
    "https://live.presstv.ir/hls/ifilmen.m3u8"]),
  C("ifilm-ar","iFilm Arabic","آی‌فیلم عربی","ir","Entertainment","ifilmtv.ir",[
    "https://live.presstv.co.uk/hls/ifilmar_4_482/index.m3u8",
    "https://live.presstv.ir/hls/ifilmar.m3u8"]),

  /* ---------------- International ---------------- */
  C("aljazeera-en","Al Jazeera English","الجزیره انگلیسی","intl","News","aljazeera.com",[
    "https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8",
    "https://live-hls-apps-aje-v3-fa.getaj.net/AJE/index.m3u8",
    "https://live-hls-web-aje-fa.thehlive.com/AJE/index.m3u8"]),
  C("aljazeera-ar","Al Jazeera Arabic","الجزیره عربی","intl","News","aljazeera.net",[
    "https://live-hls-apps-aja-fa.getaj.net/AJA/index.m3u8",
    "https://live-hls-apps-aja-v3-fa.getaj.net/AJA/index.m3u8",
    "https://live-hls-web-aja-fa.thehlive.com/AJA/index.m3u8"]),
  C("aljazeera-mubasher","Al Jazeera Mubasher","الجزیره مباشر","intl","News","aljazeera.net",[
    "https://live-hls-apps-ajm-fa.getaj.net/AJM/index.m3u8",
    "https://live-hls-apps-ajm-v3-fa.getaj.net/AJM/index.m3u8",
    "https://live-hls-web-ajm-fa.thehlive.com/AJM/index.m3u8"]),
  C("france24","France 24 English","فرانس ۲۴","intl","News","france24.com",[
    "https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8",
    "https://live.france24.com/hls/live/2037218/F24_EN_HI_HLS/master_5000.m3u8",
    "https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_2300.m3u8"]),
  C("france24-ar","France 24 Arabic","فرانس ۲۴ عربی","intl","News","france24.com",[
    "https://live.france24.com/hls/live/2037222-b/F24_AR_HI_HLS/master_5000.m3u8",
    "https://live.france24.com/hls/live/2037222/F24_AR_HI_HLS/master_5000.m3u8"]),
  C("dw","DW News","دویچه وله","intl","News","dw.com",[
    "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8",
    "https://amg01644-amg01644c1-amgplt0343.playout.now3.amagi.tv/ts-eu-w1-n2/playlist/amg01644-amg01644c1-amgplt0343/playlist.m3u8"]),
  C("dw-ar","DW Arabic","دویچه وله عربی","intl","News","dw.com","https://dwamdstream103.akamaized.net/hls/live/2015526/dwstream103/master.m3u8"),
  C("euronews","Euronews","یورونیوز","intl","News","euronews.com","https://cdn-euronews.akamaized.net/live/eds/euronews-en/25002/index.m3u8"),
  C("sky-news","Sky News","اسکای نیوز","intl","News","news.sky.com",YT("UCoMdktPbSTixAyNGwb-UYkQ")),
  C("sky-news-ar","Sky News Arabia","اسکای نیوز عربیه","intl","News","skynewsarabia.com","https://live-stream.skynewsarabia.com/c-horizontal-channel/horizontal-stream/index.m3u8"),
  C("trt-world","TRT World","تی‌آر‌تی ورلد","intl","News","trtworld.com","https://tv-trtworld.medya.trt.com.tr/master.m3u8"),
  C("alarabiya","Al Arabiya","العربیه","intl","News","alarabiya.net",[
    "https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8",
    "https://live.alarabiya.net/alarabiapublish/alarabiya.smil/alarabiapublish/alarabiya_1080p/chunks.m3u8"]),
  C("nhk-world","NHK World-Japan","ان‌اچ‌کی ورلد","intl","News","nhk.or.jp",[
    "https://masterpl.hls.nhkworld.jp/hls/w/live/smarttv.m3u8",
    "https://media-tyo.hls.nhkworld.jp/hls/w/live/master.m3u8",
    "https://media-osa.hls.nhkworld.jp/hls/w/live/master.m3u8"]),
  C("cgtn","CGTN","سی‌جی‌تی‌ان","intl","News","cgtn.com",[
    "https://english-livebkali.cgtn.com/live/encgtn.m3u8",
    "https://amg00405-rakutentv-cgtn-rakuten-i9tar.amagi.tv/master.m3u8"]),
  C("iran-intl","Iran International","ایران اینترنشنال","intl","News","iranintl.com",[
    "https://hlspackager.akamaized.net/live/DB/IRAN_INTERNATIONAL/HLS/IRAN_INTERNATIONAL.m3u8",
    "https://live.livetvstream.co.uk/LS-63503-4/index.m3u8"]),
  C("alhurra","Alhurra","الحرة","intl","News","alhurra.com","https://mbn-ingest-worldsafe.akamaized.net/hls/live/2038900/MBN_Alhurra_Worldsafe_HLS/master.m3u8"),

  /* ---- International sports (official or free-to-air feeds only; paid channels like beIN/ESPN are not included) ---- */
  C("redbull-tv","Red Bull TV","رد بول تی‌وی","intl","Sports","redbull.com",[
    "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_3360.m3u8"]),
  C("real-madrid-tv","Real Madrid TV","رئال مادرید تی‌وی","intl","Sports","realmadrid.com",[
    "https://rmtv.akamaized.net/hls/live/2043154/rmtv-en-web/bitrate_3.m3u8",
    "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8"]),
  C("trt-spor","TRT Spor","تی‌آر‌تی اسپور","intl","Sports","trtspor.com.tr","https://tv-trtspor1.medya.trt.com.tr/master.m3u8"),
  C("trt-spor-yildiz","TRT Spor Yildiz","تی‌آر‌تی اسپور ییلدیز","intl","Sports","trtspor.com.tr","https://tv-trtspor2.medya.trt.com.tr/master.m3u8"),
  C("a-spor","A Spor","ای اسپور","intl","Sports","aspor.com.tr","https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8"),
  C("teledeporte","Teledeporte (RTVE)","تله‌دپورته","intl","Sports","rtve.es",[
    "https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8",
    "https://rtve01p.origin.c21livecloud.com/live-origin/tdp-hls/bitrate_1.m3u8"]),
  C("esport3","Esport3","اسپورت ۳","intl","Sports","ccma.cat",[
    "https://directes-tv-int.3catdirectes.cat/live-content/esport3-hls/master.m3u8",
    "https://directes-tv-cat.3catdirectes.cat/live-content/esport3-hls/master.m3u8"]),
  C("sharjah-sports","Sharjah Sports","شارجه اسپورتس","intl","Sports","smc.gov.ae","https://svs.itworkscdn.net/smc4sportslive/smc4tv.smil/playlist.m3u8"),
  C("trace-sport","Trace Sport Stars","ترِیس اسپورت","intl","Sports","traceplus.com","https://channels.trace.plus/Traceprod/TRACE_SPORT_STARS_sd/index.m3u8"),
  C("ht-spor","HT Spor","اچ‌تی اسپور","intl","Sports","htspor.com","https://ciner.daioncdn.net/ht-spor/ht-spor.m3u8?app=web"),
  C("bein-xtra","beIN SPORTS XTRA","بی‌این اسپورت اکسترا","intl","Sports","beinsports.com","https://bein-xtra-bein.amagi.tv/playlist.m3u8"),
  C("fuel-tv","FUEL TV","فیول تی‌وی","intl","Sports","fuel.tv","https://amg01074-fueltv-fueltvemeaen-rakuten-b6j62.amagi.tv/hls/amagi_hls_data_rakutenAA-fueltvemeaen/CDN/master.m3u8"),
];
