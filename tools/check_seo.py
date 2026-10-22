"""Check the generated site's crawlability using only the Python standard library."""

import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree


class Page(HTMLParser):
    def __init__(self, content):
        super().__init__()
        self.canonicals = []
        self.meta = {}
        self.h1_count = 0
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property"))] = attrs.get("content", "")
        if tag == "h1":
            self.h1_count += 1


root = Path("_site")
origin = "https://rickmark.me"
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
tree = ElementTree.parse(root / "sitemap.xml")
urls = [node.text for node in tree.findall("s:url/s:loc", ns)]
assert urls and len(urls) == len(set(urls)), "Empty or duplicate sitemap URLs"
guide = (root / "llms.txt").read_text()
assert "{{" not in guide and "{%" not in guide, "Unrendered AI guide"
for url in urls:
    assert url.startswith(origin + "/"), f"Wrong sitemap origin: {url}"
    path = urlsplit(url).path
    assert path not in ("/404.html", "/llms.txt", "/robots.txt"), path
    target = root / path.lstrip("/")
    if path.endswith("/"):
        target /= "index.html"
    content = target.read_text()
    page = Page(content)
    assert page.canonicals == [url], f"Canonical mismatch: {url}"
    assert page.meta.get("description"), f"Missing description: {url}"
    assert "noindex" not in page.meta.get("robots", ""), url
    assert "http-equiv=\"refresh\"" not in content.lower(), f"Redirect in sitemap: {url}"
    assert page.h1_count >= 1, f"Missing main heading: {url}"
    schemas = [json.loads(value) for value in re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', content, re.S
    )]
    assert schemas, f"Missing structured data: {url}"
    if path.startswith("/blog/") and path != "/blog/":
        assert any(s.get("@type") == "BlogPosting" for s in schemas), url
        assert f"]({url})" in guide, f"Article missing from AI guide: {url}"

for path in ("/", "/about/", "/blog/", "/products/"):
    assert origin + path in urls, f"Missing primary page: {path}"
assert "noindex" in Page((root / "404.html").read_text()).meta["robots"]
assert f"Sitemap: {origin}/sitemap.xml" in (root / "robots.txt").read_text()
ElementTree.parse(root / "blog/feed.xml")
redirects = json.loads((root / "redirects.json").read_text())
legacy = {
    "plugnpwn-connect-to-jailbreak": "plugnpwn-connect-to-jailbreak",
    "work-in-progress-using-apple-internal-builds-for-rootkits": "work-in-progress-using-apple-internal-builds-for-rootkits",
    "untitled-2": "google-from-the-citadel-to-the-dauntless",
    "untitled": "qualcomm-baseband-research",
    "checkra1n-and-the-t2": "checkra1n-and-the-t2",
    "ace-controller-secrets": "ace-controller-secrets",
    "wip-icloud-keychain-poisoning": "wip-icloud-keychain-poisoning",
    "abusing-efi-variables-and-the-amt": "abusing-efi-variables-and-the-amt",
}
for old, canonical in legacy.items():
    expected = f"{origin}/blog/{canonical}/"
    assert redirects[f"/{old}/"] == expected, old
    assert expected in urls, canonical
    if old != canonical:
        assert redirects[f"/blog/{old}/"] == expected, old
external_slug = "reality-capture-revopoint-miraco-metrox-workflow"
external_url = f"https://luminx.media/blogs/{external_slug}"
for path in (f"/{external_slug}/", f"/blog/{external_slug}/"):
    destination = redirects[path]
    if destination.startswith(origin + "/"):
        destination = redirects[urlsplit(destination).path]
    assert destination == external_url, path
for path, destination in redirects.items():
    target = root / path.lstrip("/")
    if path.endswith("/"):
        target /= "index.html"
    assert Page(target.read_text()).canonicals == [destination], path
    assert origin + path not in urls, f"Redirect in sitemap: {path}"
print(f"Legacy redirect checks passed: {len(redirects)} aliases, including screenshot paths.")
print(f"SEO checks passed: {len(urls)} canonical pages, sitemap, structured data, AI guide and feed.")
