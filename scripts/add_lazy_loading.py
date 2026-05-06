"""Add loading/decoding/width/height to Cloudinary <img> tags across HTML files.

Rules:
- Skip data: URIs (already inline, tiny).
- Skip if loading= attribute already present.
- Hero image (class containing 'hero-background-image') gets eager + fetchpriority high.
- All others get loading="lazy" decoding="async".
- Width/height inferred from Cloudinary 'w_NNN,h_NNN' transform when present.
- For known classes without URL dims, fall back to sensible intrinsic sizes.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "haltea-frontend"

CLASS_FALLBACK = {
    "partner-logo": (200, 100),
    "alexandre-photo": (600, 600),
    "team-member-image": (300, 300),
    "pawel-logo-image": (200, 200),
    "realisation-photo": (600, 400),
}

CLOUDINARY = "https://res.cloudinary.com"
DIM_RE = re.compile(r"/upload/[^/]*?w_(\d+)[^/]*?h_(\d+)")
CLASS_RE = re.compile(r'class="([^"]+)"')
SRC_RE = re.compile(r'src="([^"]+)"')


def update_img(line: str) -> str:
    if "<img " not in line or 'src="data:' in line or "loading=" in line:
        return line
    src_m = SRC_RE.search(line)
    if not src_m or CLOUDINARY not in src_m.group(1):
        return line
    src = src_m.group(1)
    cls_m = CLASS_RE.search(line)
    classes = cls_m.group(1).split() if cls_m else []

    is_hero = "hero-background-image" in classes
    loading_attrs = (
        ' loading="eager" fetchpriority="high" decoding="async"'
        if is_hero
        else ' loading="lazy" decoding="async"'
    )

    width = height = None
    dim_m = DIM_RE.search(src)
    if dim_m:
        width, height = dim_m.group(1), dim_m.group(2)
    else:
        for klass, (w, h) in CLASS_FALLBACK.items():
            if klass in classes:
                width, height = str(w), str(h)
                break
    dim_attrs = f' width="{width}" height="{height}"' if width and height else ""

    return line.replace("<img ", f"<img{loading_attrs}{dim_attrs} ", 1)


def main() -> None:
    changed = 0
    for html in sorted(ROOT.glob("*.html")):
        text = html.read_text(encoding="utf-8")
        new_lines = [update_img(ln) for ln in text.splitlines(keepends=True)]
        new_text = "".join(new_lines)
        if new_text != text:
            html.write_text(new_text, encoding="utf-8")
            print(f"updated {html.name}")
            changed += 1
    print(f"{changed} files changed")


if __name__ == "__main__":
    main()
