#!/usr/bin/env python3
"""Check every HLS stream listed in assets/js/channels.js.

Run from PyCharm (right-click -> Run) or:  python tools/check_streams.py

For each stream it reports:
  OK       playlist downloaded and looks like HLS (#EXTM3U)
  FAIL     unreachable, blocked, expired or not an HLS playlist
  CORS     'yes' if the server allows playback from a web page (needed by Simayab),
           'NO' if browsers will block it even though the stream itself works
It then lists which channels have at least one working source.

YouTube sources are not checked here (they depend on whether the channel is live right now).
Run this from the same country/network your visitors will use: some streams are geo-restricted.
"""
import concurrent.futures as cf
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEXT = (ROOT / "assets" / "js" / "channels.js").read_text(encoding="utf-8")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"

# collect (channel_id, url) pairs: a URL belongs to the closest preceding C("id", ...)
pairs, current = [], None
for line in TEXT.splitlines():
    m = re.search(r'\bC\("([^"]+)"', line)
    if m:
        current = m.group(1)
    if current:
        for url in re.findall(r'"(https://[^"]+\.m3u8[^"]*)"', line):
            pairs.append((current, url))


def check(pair):
    cid, url = pair
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Origin": "https://simayab.example", "Referer": "https://simayab.example/"})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            head = r.read(4096).decode("utf-8", "ignore")
            cors = r.headers.get("Access-Control-Allow-Origin")
            ok = head.lstrip().startswith("#EXTM3U")
            return cid, url, ok, bool(cors), "" if ok else "not an HLS playlist"
    except Exception as e:  # noqa: BLE001
        return cid, url, False, False, str(e)[:60]


def main():
    print(f"Checking {len(pairs)} streams…\n")
    with cf.ThreadPoolExecutor(max_workers=12) as ex:
        results = list(ex.map(check, pairs))
    alive = {}
    for cid, url, ok, cors, err in results:
        status = "OK  " if ok else "FAIL"
        print(f"{status} CORS:{'yes' if cors else 'NO '}  {cid:<20} {url[:80]} {err}")
        if ok and cors:
            alive.setdefault(cid, 0)
            alive[cid] += 1
    ids = list(dict.fromkeys(c for c, _ in pairs))
    print("\n--- Summary ---")
    print("Working (OK + CORS):", ", ".join(i for i in ids if i in alive) or "none")
    print("No working source :", ", ".join(i for i in ids if i not in alive) or "none")


if __name__ == "__main__":
    main()
