// Simayab stream relay — Vercel Edge Function.
// Used by the player ONLY as a fallback when a stream host blocks direct browser playback (CORS).
// It relays HLS playlists + segments and rewrites playlist URLs so every request stays on this relay.
// Security: only hosts listed in ALLOWED can be relayed (this is NOT an open proxy).
export const config = { runtime: 'edge' };

// Keep in sync with CONFIG.PROXY_HOSTS in assets/js/channels.js
const ALLOWED = ['telewebion.net', 'telewebion.ir', 'presstv.co.uk', 'presstv.ir', 'alalam.ir', 'iranpress.com', 'snn.ir'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-expose-headers': '*' };

const allowed = (host) => ALLOWED.some((d) => host === d || host.endsWith('.' + d));

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const self = new URL(req.url);
  const target = self.searchParams.get('u');
  let url;
  try { url = new URL(target); } catch { return new Response('bad url', { status: 400, headers: CORS }); }
  if (url.protocol !== 'https:' || !allowed(url.hostname)) {
    return new Response('host not allowed', { status: 403, headers: CORS });
  }

  const range = req.headers.get('range');
  let up;
  try {
    up = await fetch(url.href, { headers: { 'user-agent': UA, ...(range ? { range } : {}) }, redirect: 'follow' });
  } catch {
    return new Response('upstream unreachable', { status: 502, headers: CORS });
  }
  if (!up.ok && up.status !== 206) return new Response('upstream ' + up.status, { status: up.status, headers: CORS });

  const type = up.headers.get('content-type') || '';
  const isPlaylist = /mpegurl/i.test(type) || /\.m3u8(\?|$)/i.test(url.pathname + url.search);
  if (isPlaylist) {
    const text = await up.text();
    const finalUrl = up.url || url.href;
    const wrap = (u) => `${self.origin}${self.pathname}?u=${encodeURIComponent(new URL(u, finalUrl).href)}`;
    const out = text
      .split(/\r?\n/)
      .map((line) => {
        if (!line.trim()) return line;
        if (line.startsWith('#')) return line.replace(/URI="([^"]+)"/g, (_, u) => `URI="${wrap(u)}"`);
        return wrap(line.trim());
      })
      .join('\n');
    return new Response(out, {
      status: 200,
      headers: { ...CORS, 'content-type': 'application/vnd.apple.mpegurl', 'cache-control': 'public, max-age=2, s-maxage=2' },
    });
  }

  // media segment / key: stream straight through
  const h = { ...CORS, 'content-type': type || 'video/mp2t', 'cache-control': 'public, max-age=30, s-maxage=30' };
  for (const k of ['content-length', 'content-range', 'accept-ranges']) { const v = up.headers.get(k); if (v) h[k] = v; }
  return new Response(up.body, { status: up.status, headers: h });
}
