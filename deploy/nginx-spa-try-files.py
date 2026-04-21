#!/usr/bin/env python3
"""Replace nginx try_files =404 with SPA fallback to /index.html."""
from pathlib import Path

p = Path("/etc/nginx/sites-enabled/default")
old = "try_files $uri $uri/ =404;"
new = "try_files $uri $uri/ /index.html;"
t = p.read_text(encoding="utf-8")
if old not in t:
    raise SystemExit("expected try_files line not found")
p.write_text(t.replace(old, new), encoding="utf-8")
print("ok")
