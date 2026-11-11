"""Q2M public-site crawler (stdlib only). Read-only GET requests.
Usage: python -I crawl.py <sitemap_urls.tsv> <out_dir>
"""
import csv, re, sys, json, time, urllib.request, urllib.error
from urllib.parse import urljoin, urlparse, urldefrag
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor

ROOT = "https://q2msolutions.com"
HOST = "q2msolutions.com"
UA = {"User-Agent": "Mozilla/5.0 (Q2M-audit-crawler)"}
SKIP_EXT = re.compile(r"\.(jpe?g|png|gif|webp|svg|pdf|zip|css|js|ico|woff2?|mp4|xml|docx?|xlsx?|pptx?)(\?.*)?$", re.I)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


opener = urllib.request.build_opener(NoRedirect)


class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.h1, self.h2 = [], [], []
        self.title = self.meta_desc = self.canonical = self.robots = self.og_title = ""
        self.schema_types = []
        self._tag = None
        self._buf = ""
        self.imgs = self.imgs_noalt = 0
        self.forms = 0
        self.text = []
        self._skip = 0
        self._ld = False

    def handle_starttag(self, t, a):
        a = dict(a)
        if t in ("script", "style", "noscript"):
            self._skip += 1
            self._ld = t == "script" and a.get("type") == "application/ld+json"
            self._ldbuf = ""
        if t == "a" and a.get("href"):
            self.links.append(a["href"])
        elif t == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href", "")
        elif t == "meta":
            n = (a.get("name") or a.get("property") or "").lower()
            if n == "description":
                self.meta_desc = a.get("content", "")
            elif n == "robots":
                self.robots = a.get("content", "")
            elif n == "og:title":
                self.og_title = a.get("content", "")
        elif t == "img":
            self.imgs += 1
            if not (a.get("alt") or "").strip():
                self.imgs_noalt += 1
        elif t == "form":
            self.forms += 1
        elif t in ("title", "h1", "h2"):
            self._tag, self._buf = t, ""

    def handle_endtag(self, t):
        if t in ("script", "style", "noscript"):
            self._skip = max(0, self._skip - 1)
            if self._ld:
                for m in re.findall(r'"@type"\s*:\s*"([^"]+)"', self._ldbuf):
                    self.schema_types.append(m)
                self._ld = False
        if t == self._tag:
            v = " ".join(self._buf.split())
            if t == "title":
                self.title = v
            elif t == "h1":
                self.h1.append(v)
            else:
                self.h2.append(v)
            self._tag = None

    def handle_data(self, d):
        if self._ld:
            self._ldbuf += d
        if self._tag:
            self._buf += d
        if not self._skip:
            self.text.append(d)


def fetch(url):
    """Return (status, final_url, redirect_chain, body, headers)."""
    chain, cur = [], url
    for _ in range(8):
        req = urllib.request.Request(cur, headers=UA)
        try:
            r = opener.open(req, timeout=30)
            body = r.read().decode("utf-8", "replace")
            return r.status, cur, chain, body, r.headers
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308):
                nxt = urljoin(cur, e.headers.get("Location", ""))
                chain.append(f"{e.code}:{cur}->{nxt}")
                cur = nxt
                continue
            return e.code, cur, chain, "", e.headers
        except Exception as e:
            return f"ERR:{type(e).__name__}", cur, chain, "", {}
    return "ERR:redirect-loop", cur, chain, "", {}


def norm(u):
    u, _ = urldefrag(u)
    return u


def internal(u):
    p = urlparse(u)
    return p.netloc.replace("www.", "") == HOST and p.scheme in ("http", "https")


def main(seed_file, out):
    seeds = {}
    for line in open(seed_file, encoding="utf-8"):
        if line.strip():
            u, src = (line.rstrip("\n").split("\t") + [""])[:2]
            seeds[u] = f"sitemap:{src}"
    seeds.setdefault(ROOT + "/", "root")
    found = dict(seeds)          # url -> discovery source
    inlinks = {}                 # url -> set(referrers)
    results, external = {}, {}
    queue = list(found)
    while queue:
        batch, queue = queue, []
        with ThreadPoolExecutor(8) as ex:
            fetched = list(ex.map(fetch, batch))
        for url, (st, final, chain, body, hdr) in zip(batch, fetched):
            p = P()
            ctype = hdr.get("Content-Type", "") if hdr else ""
            if body and "html" in ctype:
                try:
                    p.feed(body)
                except Exception:
                    pass
            words = len(" ".join(p.text).split())
            results[url] = dict(
                url=url, source=found[url], status=st, final_url=final,
                redirects=" | ".join(chain), title=p.title, meta_description=p.meta_desc,
                h1=" || ".join(p.h1), h1_count=len(p.h1), h2_count=len(p.h2),
                canonical=p.canonical, canonical_matches=(norm(p.canonical).rstrip("/") == norm(final).rstrip("/")) if p.canonical else "",
                robots_meta=p.robots, og_title=p.og_title, schema_types=",".join(sorted(set(p.schema_types))),
                images=p.imgs, images_missing_alt=p.imgs_noalt, forms=p.forms, words=words,
                server=hdr.get("Server", "") if hdr else "",
            )
            for h in p.links:
                if h.startswith(("mailto:", "tel:", "javascript:", "#")):
                    continue
                a = norm(urljoin(final, h))
                if internal(a):
                    a = a.replace("://www.", "://")
                    if SKIP_EXT.search(urlparse(a).path):
                        continue
                    inlinks.setdefault(a, set()).add(url)
                    if a not in found:
                        found[a] = f"link:{url}"
                        queue.append(a)
                else:
                    external.setdefault(a, set()).add(url)
        print(f"crawled {len(results)} / discovered {len(found)}", file=sys.stderr)
    for u, r in results.items():
        r["inlinks"] = len(inlinks.get(u, ()))
        r["in_sitemap"] = str(r["source"].startswith("sitemap")).lower()
    cols = list(next(iter(results.values())).keys())
    with open(f"{out}/url_inventory.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, cols)
        w.writeheader()
        w.writerows(results.values())
    with open(f"{out}/external_links.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["external_url", "linked_from_count", "example_referrer"])
        for u, s in sorted(external.items()):
            w.writerow([u, len(s), sorted(s)[0]])


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
