#!/usr/bin/env python3
"""Insert API/uploads proxy before the second `location /` in nginx default site."""
from pathlib import Path
import re

main_path = Path("/etc/nginx/sites-enabled/default")
frag_path = Path("/tmp/nginx-api-uploads.conf.fragment")
frag = frag_path.read_text(encoding="utf-8")
lines = main_path.read_text(encoding="utf-8").splitlines(keepends=True)
# Drop existing /api/ and /uploads/ location blocks (if any).
out_pre: list[str] = []
i = 0
while i < len(lines):
    line = lines[i]
    if re.match(r"^\tlocation /api/", line):
        depth = 0
        while i < len(lines):
            if "{" in lines[i]:
                depth += lines[i].count("{")
            if "}" in lines[i]:
                depth -= lines[i].count("}")
            i += 1
            if depth <= 0:
                break
        continue
    if re.match(r"^\tlocation /uploads/", line):
        depth = 0
        while i < len(lines):
            if "{" in lines[i]:
                depth += lines[i].count("{")
            if "}" in lines[i]:
                depth -= lines[i].count("}")
            i += 1
            if depth <= 0:
                break
        continue
    out_pre.append(line)
    i += 1
lines = out_pre
out: list[str] = []
loc_count = 0
inserted = False
for line in lines:
    stripped = line.lstrip()
    if (stripped.startswith("location / {") or stripped.startswith("location /{")) and not stripped.startswith(
        "location /api"
    ):
        loc_count += 1
        if loc_count == 2 and not inserted:
            out.append(frag if frag.endswith("\n") else frag + "\n")
            inserted = True
    out.append(line)
if not inserted:
    raise SystemExit("second location / block not found")
main_path.write_text("".join(out), encoding="utf-8")
print("ok")
