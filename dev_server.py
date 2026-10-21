"""Local development server for Simayab.

Run from PyCharm (right-click -> Run 'dev_server') or: python dev_server.py
Then open http://localhost:8000
"""
import http.server
import socketserver
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

PORT = 8000
ROOT = Path(__file__).resolve().parent


ALLOWED = ["telewebion.net", "telewebion.ir", "presstv.co.uk", "presstv.ir", "alalam.ir", "iranpress.com", "snn.ir"]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        # same fallback relay as api/hls.js (Vercel), for local testing
        if self.path.startswith("/api/hls"):
            return self.relay()
        return super().do_GET()

    def relay(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        target = (q.get("u") or [""])[0]
        u = urllib.parse.urlparse(target)
        host = u.hostname or ""
        if u.scheme != "https" or not any(host == d or host.endswith("." + d) for d in ALLOWED):
            self.send_error(403, "host not allowed")
            return
        try:
            req = urllib.request.Request(target, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=15) as r:
                body, ctype, final = r.read(), r.headers.get("Content-Type", ""), r.geturl()
        except Exception as e:  # noqa: BLE001
            self.send_error(502, str(e)[:80])
            return
        if "mpegurl" in ctype.lower() or ".m3u8" in u.path:
            def wrap(x):
                return "/api/hls?u=" + urllib.parse.quote(urllib.parse.urljoin(final, x), safe="")
            out = []
            for line in body.decode("utf-8", "ignore").splitlines():
                if not line.strip():
                    out.append(line)
                elif line.startswith("#"):
                    import re
                    out.append(re.sub(r'URI="([^"]+)"', lambda m: 'URI="' + wrap(m.group(1)) + '"', line))
                else:
                    out.append(wrap(line.strip()))
            body, ctype = "\n".join(out).encode(), "application/vnd.apple.mpegurl"
        self.send_response(200)
        self.send_header("Content-Type", ctype or "video/mp2t")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # always fresh while developing
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"Simayab running at {url}  (Ctrl+C to stop)")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
