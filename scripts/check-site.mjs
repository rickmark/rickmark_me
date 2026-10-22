import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { parse } from 'yaml';

const site = parse(await readFile('site.yml', 'utf8'));
const baseline = JSON.parse(await readFile('scripts/fixtures/migration.json', 'utf8'));
const filename = pathname => `_site${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`;
const read = pathname => readFile(filename(pathname), 'utf8');
const xml = async pathname => {
  const content = await read(pathname);
  assert.equal(XMLValidator.validate(content), true, `Invalid XML: ${pathname}`);
  return new XMLParser().parse(content);
};
const sitemap = await xml('/sitemap.xml');
const urls = sitemap.urlset.url.map(entry => entry.loc);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
assert(urls.length >= baseline.urls.length);
for (const url of baseline.urls) assert(urls.includes(url), `Lost canonical URL: ${url}`);
const guide = await read('/llms.txt');
assert(!guide.includes('{{') && !guide.includes('{%'), 'Unrendered AI guide');
for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, site.url);
  const pathname = parsed.pathname;
  assert(!['/404.html', '/robots.txt', '/llms.txt'].includes(pathname));
  const content = await read(pathname);
  const $ = load(content);
  assert.deepEqual($('link[rel="canonical"]').map((_,el) => $(el).attr('href')).get(), [url]);
  assert($('meta[name="description"]').attr('content'), `Missing description: ${url}`);
  assert(!$('meta[name="robots"]').attr('content')?.includes('noindex'), url);
  assert.equal($('meta[http-equiv="refresh"]').length, 0);
  assert($('h1').length > 0, `Missing heading: ${url}`);
  const schemas = $('script[type="application/ld+json"]').map((_,el) => JSON.parse($(el).text())).get();
  assert(schemas.length > 0);
  assert.equal($('script[src*="googletagmanager.com/gtag/js"]').length, 1, `Analytics: ${url}`);
  assert(content.includes(`gtag('config', '${site.google_analytics}')`));
  if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
    assert(schemas.some(s => s['@type'] === 'BlogPosting'), url);
    assert(guide.includes(`](${url})`), url);
    assert($('.post-meta time').text().trim(), `Missing article date: ${url}`);
  }
  for (const image of $('img').toArray()) {
    const src = $(image).attr('src');
    if (src?.startsWith('/')) await access(`_site${new URL(src, site.url).pathname}`);
  }
}
assert(load(await read('/404.html'))('meta[name="robots"]').attr('content').includes('noindex'));
assert((await read('/robots.txt')).includes(`Sitemap: ${site.url}/sitemap.xml`));
const feed = await xml('/blog/feed.xml');
assert.equal(feed.feed.entry.length, Math.min(100, urls.filter(url => new URL(url).pathname.startsWith('/blog/') && new URL(url).pathname !== '/blog/').length));
for (const entry of feed.feed.entry) assert(urls.includes(entry.id), `Invalid feed URL: ${entry.id}`);
const redirects = JSON.parse(await read('/redirects.json'));
for (const [from,to] of Object.entries(baseline.redirects)) assert.equal(redirects[from], to, `Lost redirect: ${from}`);
for (const [from,to] of Object.entries(redirects)) {
  const $ = load(await read(from));
  assert.equal($('link[rel="canonical"]').attr('href'), to);
  assert($('meta[http-equiv="refresh"]').attr('content').includes(to));
  assert(!urls.includes(site.url + from), `Redirect in sitemap: ${from}`);
  const visited = new Set([from]);
  let target = to;
  while (new URL(target).origin === site.url) {
    const next = new URL(target).pathname;
    assert(!visited.has(next), `Redirect cycle: ${from}`);
    visited.add(next);
    if (!redirects[next]) { assert(urls.includes(target), `Broken redirect: ${from}`); break; }
    target = redirects[next];
  }
}
for (const [url, article] of Object.entries(baseline.articles)) {
  const $ = load(await read(url));
  const code = $('pre').map((_,el) => createHash('sha256').update($(el).text()).digest('hex')).get();
  assert.deepEqual(code, article.code, `Changed code samples: ${url}`);
  const ids = new Set($('[id]').map((_,el) => $(el).attr('id')).get());
  for (const id of article.headings) assert(ids.has(id), `Lost heading anchor: ${url}#${id}`);
}
for (const file of ['Gemfile', 'package.json', 'site.yml', 'scripts/build.mjs', 'workers/site/src.js', 'tmp/rickmark-shots/lumiere-host.png']) {
  await assert.rejects(access(`_site/${file}`), `Build source exposed: ${file}`);
}
console.log(`Validated ${urls.length} pages, ${Object.keys(redirects).length} redirects, SEO, feed, analytics, images, code samples and legacy anchors.`);
