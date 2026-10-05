import glob, os, re, sys, time, json, hashlib, urllib.parse, warnings
import requests
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning
from markdownify import MarkdownConverter
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

# Usage (from the repo root, with raw/*.html fetched by fetch.py): python tools/convert.py .
OUT = sys.argv[1]
POSTS = os.path.join(OUT, '_posts'); IMGS = os.path.join(OUT, 'assets', 'images')
os.makedirs(POSTS, exist_ok=True); os.makedirs(IMGS, exist_ok=True)
SKIP = {'index', 'page_2', 'sitemap-posts.xml',
        'how-to-bypass-t-mobile-sim-block-steal-all-their-money-and-leave-no-trace'}  # older duplicate of -2
RENAME = {  # ghost slug -> new slug (old slug kept as redirect)
    'untitled': 'qualcomm-baseband-research',
    'untitled-2': 'google-from-the-citadel-to-the-dauntless',
    'untitled-3': 'ubiquiti-unifi-security-and-boot-chain-analysis',
    'how-to-bypass-t-mobile-sim-block-steal-all-their-money-and-leave-no-trace-2':
        'how-to-bypass-t-mobile-sim-block-steal-all-their-money-and-leave-no-trace',
}
sess = requests.Session(); failures = []

def fetch(url):
    cands = [url]
    if 'web.archive.org' not in url:
        cands.append(f'https://web.archive.org/web/2026id_/{url}')
    for u in cands:
        for _ in range(2):
            try:
                r = sess.get(u, timeout=60)
                if r.status_code == 200 and r.content and not r.headers.get('content-type','').startswith('text/html'):
                    return r.content
            except Exception: pass
            time.sleep(2)
    return None

def localize(url, slug):
    if not url or 'youtube.com' in url: return url
    url = re.sub(r'/content/images/size/w\d+/', '/content/images/', url)
    name = urllib.parse.unquote(urllib.parse.urlparse(url).path.rsplit('/', 1)[-1]).replace('+', '-').replace(' ', '-')
    if 'paper-attachments' in url or 'dropbox' in url:
        name = hashlib.sha1(url.encode()).hexdigest()[:10] + '-' + name
    d = os.path.join(IMGS, slug); os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name)
    if not os.path.exists(p):
        data = fetch(url)
        if not data:
            failures.append((slug, url)); return url
        open(p, 'wb').write(data)
    return f'/assets/images/{slug}/{name}'

class Conv(MarkdownConverter):
    def convert_figure(self, el, text, *a, **k):
        return '\n\n' + text.strip() + '\n\n'
    def convert_figcaption(self, el, text, *a, **k):
        return '\n*' + text.strip() + '*\n'

def code_lang(el):
    c = el.find('code') if el.name == 'pre' else None
    for k in (c.get('class', []) if c else []):
        if k.startswith('language-'): return k[9:]
    return ''

def clean_desc(d):
    d = re.sub(r'\s+', ' ', d.replace('\u200b', '')).strip()
    if d and d[-1] not in '.!?…"”':
        d = d.rstrip(' ,;:-') + '…'
    return d

posts = []
for f in sorted(glob.glob('raw/*.html')):
    slug = os.path.basename(f)[:-5]
    if slug in SKIP: continue
    s = BeautifulSoup(open(f, 'rb').read(), 'lxml')
    meta = lambda p: (s.find('meta', property=p) or {}).get('content')
    title = meta('og:title'); date = meta('article:published_time')
    desc = meta('og:description') or ''
    tags = [m['content'] for m in s.find_all('meta', property='article:tag')]
    image = meta('og:image')
    c = s.select_one('.gh-content')
    newslug = RENAME.get(slug, slug)
    # drop a leading h1 that just repeats the title
    first = next((e for e in c.children if getattr(e, 'name', None)), None)
    norm = lambda t: re.sub(r'\W+', '', t or '').lower()
    if first is not None and first.name in ('h1', 'h2') and norm(first.get_text()) == norm(title):
        first.decompose()
    for img in c.find_all('img'):
        img['src'] = localize(img.get('src'), newslug)
        for a in ('srcset', 'sizes', 'loading', 'width', 'height'): img.attrs.pop(a, None)
    for t in c.find_all('table'):
        rows = t.find_all('tr')
        if rows and all(len(r.find_all(['td', 'th'])) == 1 for r in rows):
            pre = s.new_tag('pre'); code = s.new_tag('code')
            code.string = '\n'.join(r.get_text().replace('\u00a0', ' ').rstrip() for r in rows)
            pre.append(code); t.replace_with(pre)
    for a in c.find_all('a', href=True):
        if 'paper.dropbox.com/?q=' in a['href']:
            a.unwrap(); continue
        h = a['href']
        h = re.sub(r'([?&])ref=blog\.rickmark\.me(&|(?=#)|$)', lambda m: m.group(1) if m.group(2) == '&' else '', h)
        h = re.sub(r'[?&](?=#|$)', '', h)
        h = re.sub(r'^https?://web\.archive\.org/web/\d+[a-z_]*/', '', h)
        m = re.match(r'^https?://blog\.rickmark\.me(/.*)$', h)
        if m:
            path = m.group(1)
            for old, new in RENAME.items(): path = path.replace(f'/{old}/', f'/{new}/')
            h = '/blog' + path if not path.startswith('/content/') else path
        a['href'] = h
    md = Conv(heading_style='ATX', bullets='-', code_language_callback=code_lang,
              strip=['span']).convert_soup(c)
    md = md.replace('​', '').replace(' ', ' ')
    md = re.sub(r'(\S)\*\*Resolution:\*\*', r'\1\n\n**Resolution:**', md)
    md = re.sub(r'[ \t]+\n', '\n', md); md = re.sub(r'\n{3,}', '\n\n', md).strip() + '\n'
    img_local = localize(image, newslug) if image else None
    redirects = []
    if slug != newslug: redirects.append(f'/blog/{slug}/')
    if newslug.startswith('how-to-bypass-t-mobile'): redirects = [f'/blog/{slug}/']
    fm = {'title': title, 'date': date.replace('T', ' ').replace('.000Z', ' +0000'),
          'description': clean_desc(desc)}
    lines = ['---'] + [f'{k}: {json.dumps(v, ensure_ascii=False)}' for k, v in fm.items()]
    if tags: lines.append('tags: ' + json.dumps(tags))
    if img_local: lines.append(f'image: {json.dumps(img_local)}')
    if redirects: lines.append('redirect_from:\n' + '\n'.join(f'  - {r}' for r in redirects))
    lines += ['render_with_liquid: false', '---', '']
    out = os.path.join(POSTS, f'{date[:10]}-{newslug}.md')
    open(out, 'w').write('\n'.join(lines) + md)
    posts.append(out)
print(len(posts), 'posts'); print('FAILED IMAGES:'); [print(' ', x) for x in failures]
