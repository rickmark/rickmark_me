import json, os, time, requests, re
d = json.load(open('cdx.json'))
skip = re.compile(r'/(assets|public|content|members|author|page|tag|rss)/|\.xml$|\.txt$|\.ico$|/amp/$')
urls = sorted({r[1] for r in d[1:] if r[2]=='text/html' and not skip.search(r[1]) and r[1]!='https://blog.rickmark.me/'})
# also sitemap + homepage/page2 for index metadata
extra = ['https://blog.rickmark.me/sitemap-posts.xml','https://blog.rickmark.me/','https://blog.rickmark.me/page/2/']
os.makedirs('raw', exist_ok=True)
s = requests.Session()
def get(url, tries=5):
    for i in range(tries):
        try:
            r = s.get(url, timeout=60)
            if r.status_code == 200: return r
        except Exception as e: pass
        time.sleep(3*(i+1))
    return None
for u in urls + extra:
    slug = u.replace('https://blog.rickmark.me/','').strip('/').replace('/','_') or 'index'
    out = f'raw/{slug}.html'
    if os.path.exists(out) and os.path.getsize(out)>0: continue
    c = get(f'https://web.archive.org/cdx/search/cdx?url={u}&output=json&fl=timestamp,statuscode&filter=statuscode:200&filter=mimetype:text/(html|xml)')
    rows = c.json()[1:] if c and c.text.strip() else []
    if not rows: print('NO SNAP', u); continue
    for ts,_ in reversed(rows):   # newest first
        r = get(f'https://web.archive.org/web/{ts}id_/{u}', tries=2)
        if r and len(r.content) > 2000:
            open(out,'wb').write(r.content); print(ts, slug, len(r.content)); break
    else: print('FAIL', u)
    time.sleep(1)
