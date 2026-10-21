# Simayab — Live TV Platform

Static web platform for watching Afghan, Iranian and international news channels.
No build step, no dependencies.

## Project structure
```
simayab/
├── index.html              # page markup
├── vercel.json             # Vercel config
├── api/hls.js              # Vercel Edge relay (automatic fallback for streams blocked in browsers)
├── dev_server.py           # local server for PyCharm
├── tools/check_streams.py  # tests every stream and reports which are alive
└── assets/
    ├── css/style.css
    ├── js/channels.js      # CHANNELS list: streams, logos  <-- edit here
    ├── js/app.js           # player engine, menu, UI
    ├── logos/              # optional: your own logo files
    └── favicon.svg
```

## Run locally in PyCharm
Right-click `dev_server.py` -> Run, then open http://localhost:8000
(opening index.html directly from disk will not work; use the server).

## Streams
`assets/js/channels.js` lists every channel. Source types:
- `"https://…/index.m3u8"` — HLS stream (fastest)
- `YT("UC…")` — a channel's official YouTube **live** stream (embedded)
- `[a, b, c]` — several sources; Simayab switches to the next automatically if one fails
- nothing — channel shows as "Soon" with an explanation

Rules: only `https://` streams work on an https site; streams must allow browser playback (CORS).
Streams expire or get geo-blocked over time, so check regularly:

```
python tools/check_streams.py
```
Run it from the country where your viewers are. It prints OK/FAIL and CORS status per stream.

## Watermark / platform name
The platform name (Simayab / سیماب) is shown in the bottom-left corner of the player, also in fullscreen,
with a Persian eight-pointed-star mark. It is set in one place: `BRAND` in `assets/js/channels.js`
(also the header text and `<title>` in `index.html`).
Fullscreen uses our own button (top-right of the player, key `F`, or double-click) so the watermark stays visible.

## Sports channels
Sports channels are in the Afghanistan, Iran and International groups (use the "Sports" filter inside a group).
Only free-to-air / official free feeds are included. Paid channels (beIN Sports, ESPN, Fox Sports, S Sport…)
are not included because their only public links are unauthorised re-streams.

## Logos
By default each channel's own site icon is loaded from its domain (`siteDomain` in channels.js).
For sharper official logos, put PNG/SVG files in `assets/logos/` and register them:
```js
const LOGOS = { "tolonews": "assets/logos/tolonews.png" };
```
If a logo cannot load, a coloured monogram is shown instead.

## Iranian channels (IRIB via Telewebion) and the fallback relay
IRIB TV 1–5, IRINN, Nasim, Namayesh, Ofogh, Varzesh, Quran, Salamat… use Telewebion's streams (two addresses per
channel, tried in turn). These hosts may refuse playback from other websites (CORS) or from outside Iran. When a
direct address fails, Simayab automatically retries through its own relay:
- on Vercel: `api/hls.js` (Edge Function, nothing to configure)
- locally in PyCharm: `dev_server.py` has the same relay built in
The relay only serves sites listed in `PROXY_HOSTS` (`assets/js/channels.js`) and `ALLOWED` (`api/hls.js`) — keep both
lists the same. A host that needed the relay is remembered in the visitor's browser, so the next start is faster.
Relayed video uses your Vercel bandwidth, so it is only a fallback. Streams that need an Iranian IP address cannot be
fixed by a relay hosted outside Iran (Sahar TV and some others are marked "[IR]" in public lists and are not included).
Channels with no public stream at all (1TV, Noor TV, Zhwandoon, Kabul News, RTA Sport) show as "Soon".
Only add streams you are permitted to distribute.

## Deploy to Vercel
Git: push to GitHub -> vercel.com -> Add New Project -> import -> Framework "Other", no build command -> Deploy.
CLI: `npm i -g vercel`, then `vercel --prod` inside this folder.

## Keyboard shortcuts
`/` search · `↑/↓` change channel · `F` fullscreen · `M` mute · `P` picture-in-picture
