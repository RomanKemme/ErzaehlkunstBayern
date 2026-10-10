#!/usr/bin/env python3
"""Lokaler Testserver, der sich wie Netlify verhält:
- liefert den Ordner site/ aus
- setzt die Header aus netlify.toml (inkl. Content-Security-Policy)
- wertet site/_redirects aus (301 inkl. * und :platzhalter)
- zeigt 404.html bei unbekannten Adressen (Status 404)
- beantwortet POST / mit 200 (simuliert Netlify Forms), außer mit --form-fail

Start:  python tests/serve.py [port] [--form-fail]
"""
import http.server
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
PORT = int(next((a for a in sys.argv[1:] if a.isdigit()), 8765))
FORM_FAIL = "--form-fail" in sys.argv

conf = tomllib.loads((ROOT / "netlify.toml").read_text(encoding="utf-8"))
HEADER_RULES = [(h["for"], h["values"]) for h in conf.get("headers", [])]

REDIRECTS = []
for line in (SITE / "_redirects").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    src, dst, *rest = line.split()
    REDIRECTS.append((src, dst, int(rest[0]) if rest else 301))


def match_glob(pattern, path):
    rx = "^" + re.escape(pattern).replace(r"\*", ".*") + "$"
    return re.match(rx, path) is not None


def find_redirect(path):
    for src, dst, code in REDIRECTS:
        rx = "^" + re.sub(r":([a-z]+)", r"(?P<\1>[^/]+)", re.escape(src).replace(r"\*", "(?P<splat>.*)").replace(r"\:", ":")) + "$"
        m = re.match(rx, path)
        if m:
            out = dst
            for k, v in m.groupdict().items():
                out = out.replace(":" + k, v or "")
            return out, code
    return None


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(SITE), **kw)

    def log_message(self, *a):
        pass

    def end_headers(self):
        path = self.path.split("?")[0]
        for pattern, values in HEADER_RULES:
            if match_glob(pattern, path):
                for k, v in values.items():
                    self.send_header(k, v)
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        target = SITE / path.lstrip("/")
        if path != "/" and not target.exists():
            r = find_redirect(path)
            if r:
                self.send_response(r[1])
                self.send_header("Location", r[0])
                self.end_headers()
                return
            body = (SITE / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        self.rfile.read(length)
        self.send_response(500 if FORM_FAIL else 200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"ok")


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
