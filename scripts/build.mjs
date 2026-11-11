import { readFile, readdir, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { Liquid } from 'liquidjs';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import hljs from 'highlight.js';

const output = '_site';
const site = parse(await readFile('site.yml', 'utf8'));
const absolute = value => new URL(String(value), site.url).href;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const iso = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString();
};
const md = new MarkdownIt({ html: true, linkify: true, typographer: true, highlight(code, language) {
  const highlighted = language && hljs.getLanguage(language)
    ? hljs.highlight(code, { language }).value : escape(code);
  return `<pre class="highlight"><code class="hljs">${highlighted}</code></pre>`;
}}).use(anchor, { slugify: text => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') });
// Imported articles use Markdown h1 for sections; the page band already renders the
// title as the page's only h1, so demote every heading one level when a body has an h1.
md.core.ruler.push('demote_headings', state => {
  if (!state.tokens.some(t => t.type === 'heading_open' && t.tag === 'h1')) return;
  for (const token of state.tokens) {
    if (token.type === 'heading_open' || token.type === 'heading_close') {
      token.tag = `h${Math.min(6, Number(token.tag.slice(1)) + 1)}`;
    }
  }
});
// Intrinsic image size, read from PNG, GIF, JPEG and WebP headers, to prevent layout shift.
function imageSize(file) {
  let data;
  try { data = readFileSync(file); } catch { return null; }
  if (data.readUInt32BE(0) === 0x89504e47) return [data.readUInt32BE(16), data.readUInt32BE(20)];
  if (data.toString('ascii', 0, 3) === 'GIF') return [data.readUInt16LE(6), data.readUInt16LE(8)];
  if (data.toString('ascii', 8, 12) === 'WEBP' && data.toString('ascii', 12, 16) === 'VP8X') {
    return [1 + data.readUIntLE(24, 3), 1 + data.readUIntLE(27, 3)];
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    for (let i = 2; i + 9 < data.length;) {
      const marker = data[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return [data.readUInt16BE(i + 7), data.readUInt16BE(i + 5)];
      }
      i += 2 + data.readUInt16BE(i + 2);
    }
  }
  return null;
}
const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const src = token.attrGet('src') || '';
  if (src.startsWith('/assets/')) {
    const size = imageSize(src.slice(1));
    if (size) { token.attrSet('width', String(size[0])); token.attrSet('height', String(size[1])); }
  }
  token.attrSet('loading', 'lazy');
  token.attrSet('decoding', 'async');
  return defaultImage(tokens, idx, options, env, self);
};
const liquid = new Liquid({ root: '_includes', jekyllInclude: true, strictFilters: true, timezoneOffset: 0 });
liquid.registerFilter('relative_url', value => value);
liquid.registerFilter('absolute_url', absolute);
liquid.registerFilter('jsonify', json);
liquid.registerFilter('date_to_xmlschema', iso);
site.time = new Date();
site.production = !process.argv.includes('--development');
site.data = {};
for (const file of await readdir('_data')) {
  if (file.endsWith('.yml')) site.data[path.basename(file, '.yml')] = parse(await readFile(`_data/${file}`, 'utf8'));
}
async function source(file) {
  const text = await readFile(file, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error(`Missing front matter: ${file}`);
  return { ...parse(match[1]), body: text.slice(match[0].length), file };
}
site.posts = await Promise.all((await readdir('_posts')).filter(f => f.endsWith('.md')).map(async file => {
  const post = await source(`_posts/${file}`);
  const slug = file.slice(11, -3);
  return { ...post, layout: 'post', url: post.permalink || `/blog/${slug}/`, date: iso(post.date), tags: post.tags || [] };
}));
site.posts.sort((a,b) => b.date.localeCompare(a.date) || b.file.localeCompare(a.file));
for (const [i, post] of site.posts.entries()) {
  post.previous = site.posts[i+1];
  post.next = site.posts[i-1];
}
site.post_years = [];
for (const post of site.posts) {
  const year = post.date.slice(0,4);
  let group = site.post_years.find(g => g.name === year);
  if (!group) site.post_years.push(group = { name: year, items: [] });
  group.items.push(post);
}
// Search snippets are cut near 160 characters; prefer a whole sentence, else whole words.
function snippet(text, limit = 160) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
  let out = '';
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > limit) break;
    out += sentence;
  }
  if (out.trim().length >= 70) return out.trim();
  return clean.slice(0, limit - 1).replace(/\s+\S*$/, '').replace(/[,;:\s]+$/, '') + '…';
}
const draftTag = 'working draft';
const person = {
  '@type': 'Person', '@id': absolute('/about/#person'), name: site.author.name,
  alternateName: site.author.alternate_names, url: site.author.url,
  image: absolute(site.author.image), jobTitle: site.author.job_title,
  description: site.description, knowsAbout: site.author.knows_about, sameAs: site.social.links,
};
const website = {
  '@type': 'WebSite', '@id': absolute('/#website'), url: absolute('/'), name: site.title,
  alternateName: site.author.name, description: site.description, inLanguage: 'en-US',
  publisher: {'@id': person['@id']}, author: {'@id': person['@id']},
};
const itemList = posts => ({
  '@type': 'ItemList', numberOfItems: posts.length,
  itemListElement: posts.map((post, i) => ({'@type':'ListItem', position: i + 1, url: absolute(post.url), name: post.title})),
});
function firstImage(html) {
  const match = String(html ?? '').match(/<img[^>]+src="(\/assets\/[^"]+)"[^>]*?(?:alt="([^"]*)")?/);
  return match && { src: match[1], alt: match[2] };
}
function seo(page) {
  const name = page.title || site.title;
  const title = page.seo_title || `${name} | ${site.title}`;
  const description = page.description || site.description;
  const metaDescription = snippet(description);
  const url = absolute(page.url);
  const article = page.layout === 'post';
  const draft = article && page.tags.includes(draftTag);
  const inline = article && !page.image && firstImage(page.content);
  const image = page.image || inline?.src || site.author.image;
  const imageAlt = page.image_alt || inline?.alt || (image === site.author.image ? `Portrait of ${site.author.name}` : name);
  const large = image !== site.author.image;
  const size = imageSize(image.replace(/^\//, ''));
  const modified = page.last_modified_at || page.date;
  const node = {
    '@type': 'WebPage', '@id': `${url}#webpage`, url, name, description, inLanguage: 'en-US',
    isPartOf: {'@id': website['@id']}, primaryImageOfPage: {'@type':'ImageObject', url: absolute(image)},
  };
  const graph = [website, person, node];
  if (article) {
    const words = String(page.content ?? '').replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    graph.push({
      '@type': draft ? 'ScholarlyArticle' : 'BlogPosting', '@id': `${url}#article`,
      headline: name.length > 110 ? snippet(name, 110) : name, name, description, url,
      datePublished: page.date, dateModified: iso(modified),
      ...(draft ? { dateCreated: page.date, creativeWorkStatus: 'Draft' } : {}),
      author: {'@id': person['@id']}, publisher: {'@id': person['@id']},
      mainEntityOfPage: {'@id': node['@id']}, isPartOf: {'@id': website['@id']},
      image: absolute(image), inLanguage: 'en-US', wordCount: words, isAccessibleForFree: true,
      ...(page.tags.length ? { keywords: page.tags.join(', '), articleSection: page.tags.find(t => t !== draftTag) || page.tags[0] } : {}),
    });
  } else if (page.url === '/about/') {
    node['@type'] = 'ProfilePage';
    node.mainEntity = {'@id': person['@id']};
  } else if (page.url === '/blog/' || page.url === '/research/') {
    node['@type'] = 'CollectionPage';
    node.mainEntity = itemList(page.url === '/research/' ? site.posts.filter(p => p.tags.includes(draftTag)) : site.posts);
  } else if (page.url === '/') {
    node.about = {'@id': person['@id']};
  }
  const meta = (key, value, attr = 'property') => value ? `<meta ${attr}="${key}" content="${escape(value)}">` : '';
  return [
    `<title>${escape(title)}</title>`,
    meta('description', metaDescription, 'name'),
    meta('author', site.author.name, 'name'),
    `<link rel="canonical" href="${escape(url)}">`,
    meta('og:title', name), meta('og:description', description), meta('og:url', url),
    meta('og:site_name', site.title), meta('og:locale', site.lang),
    meta('og:type', article ? 'article' : page.url === '/about/' ? 'profile' : 'website'),
    meta('og:image', absolute(image)), meta('og:image:alt', imageAlt),
    size ? meta('og:image:width', String(size[0])) + meta('og:image:height', String(size[1])) : '',
    meta('twitter:card', large ? 'summary_large_image' : 'summary', 'name'),
    meta('twitter:title', name, 'name'), meta('twitter:description', metaDescription, 'name'),
    meta('twitter:image', absolute(image), 'name'), meta('twitter:image:alt', imageAlt, 'name'),
    article ? meta('article:published_time', page.date) + meta('article:modified_time', iso(modified)) + meta('article:author', site.author.url) + page.tags.map(tag => meta('article:tag', tag)).join('') : '',
    `<script type="application/ld+json">${json({'@context':'https://schema.org', '@graph': graph})}</script>`,
  ].filter(Boolean).join('\n');
}
const written = new Set();
async function emit(url, content) {
  const file = path.join(output, url.replace(/^\//, ''), url.endsWith('/') ? 'index.html' : '');
  if (!path.resolve(file).startsWith(path.resolve(output) + path.sep)) throw new Error(`Unsafe output: ${url}`);
  if (written.has(file)) throw new Error(`Duplicate output: ${url}`);
  written.add(file);
  await mkdir(path.dirname(file), {recursive:true});
  await writeFile(file, content);
}
async function render(page) {
  const context = {site, page};
  let content = page.render_with_liquid === false ? page.body : await liquid.parseAndRender(page.body, context);
  page.markdown = content;
  if (page.file.endsWith('.md')) content = md.render(content);
  page.content = content;
  context.seo = seo(page);
  let layout = page.layout;
  const seen = new Set();
  while (layout) {
    if (seen.has(layout)) throw new Error(`Layout cycle: ${layout}`);
    seen.add(layout);
    const filename = `_layouts/${layout}.html`;
    const text = await readFile(filename, 'utf8');
    const template = text.startsWith('---\n') ? await source(filename) : {body:text};
    content = await liquid.parseAndRender(template.body, {...context, content});
    layout = template.layout;
  }
  return content;
}
await rm(output, {recursive:true, force:true});
await mkdir(output);
await cp('assets', `${output}/assets`, {recursive:true});
const lightSyntax = await readFile('node_modules/highlight.js/styles/github.css', 'utf8');
const darkSyntax = await readFile('node_modules/highlight.js/styles/github-dark.css', 'utf8');
await writeFile(`${output}/assets/syntax.css`, `${lightSyntax}\n@media (prefers-color-scheme: dark) {\n${darkSyntax}\n}\n.prose pre code.hljs { background: transparent; padding: 0; }\n`);
await cp('CNAME', `${output}/CNAME`);
await writeFile(`${output}/.nojekyll`, '');
const pages = [...site.posts];
for (const [file, url] of Object.entries({'index.html':'/', 'about.md':'/about/', 'products.html':'/products/', 'blog/index.html':'/blog/', 'research/index.html':'/research/', '404.md':'/404.html', 'robots.txt':'/robots.txt', 'llms.txt':'/llms.txt'})) {
  const page = await source(file);
  pages.push({...page, url:page.permalink || url});
}
for (const file of await readdir('redirects')) {
  const page = await source(`redirects/${file}`);
  pages.push({...page, url:page.permalink});
}
const redirects = {};
for (const page of pages) {
  if (page.redirect_to) redirects[page.url] = absolute(page.redirect_to);
  else await emit(page.url, await render(page));
  for (const alias of page.redirect_from || []) {
    if (redirects[alias]) throw new Error(`Duplicate alias: ${alias}`);
    redirects[alias] = absolute(page.url);
  }
}
for (const [from,to] of Object.entries(redirects)) {
  await emit(from, `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Redirecting</title><link rel="canonical" href="${escape(to)}"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0; url=${escape(to)}"></head><body><p>This page moved to <a href="${escape(to)}">${escape(to)}</a>.</p></body></html>`);
}
await emit('/redirects.json', JSON.stringify(redirects, null, 2));
const indexable = pages.filter(p => p.sitemap !== false && !p.redirect_to);
// Listing pages change whenever a post they list does.
const newest = posts => posts.map(p => iso(p.last_modified_at || p.date)).sort().at(-1);
const listingDates = {'/': newest(site.posts), '/blog/': newest(site.posts), '/research/': newest(site.posts.filter(p => p.tags.includes(draftTag)))};
for (const page of indexable) if (!page.date && !page.last_modified_at && listingDates[page.url]) page.last_modified_at = listingDates[page.url];
await emit('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable.map(p => `<url><loc>${escape(absolute(p.url))}</loc>${p.last_modified_at || p.date ? `<lastmod>${iso(p.last_modified_at || p.date)}</lastmod>` : ''}</url>`).join('')}</urlset>`);
await emit('/blog/feed.xml', `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escape(site.title)}</title><id>${site.url}/blog/</id><link href="${site.url}/blog/feed.xml" rel="self"/><link href="${site.url}/blog/"/><updated>${site.posts[0].date}</updated><author><name>${escape(site.author.name)}</name><uri>${site.author.url}</uri></author>${site.posts.slice(0,100).map(p => `<entry><title>${escape(p.title)}</title><id>${absolute(p.url)}</id><link href="${absolute(p.url)}"/><published>${p.date}</published><updated>${iso(p.last_modified_at || p.date)}</updated><summary>${escape(p.description)}</summary><content type="html">${escape(p.content)}</content></entry>`).join('')}</feed>`);
const fullText = page => `# ${page.title}\n\nURL: ${absolute(page.url)}\n${page.date ? `Published: ${page.date.slice(0, 10)}\n` : ''}${page.last_modified_at ? `Updated: ${iso(page.last_modified_at).slice(0, 10)}\n` : ''}${page.tags?.length ? `Tags: ${page.tags.join(', ')}\n` : ''}Author: ${site.author.name}\nSummary: ${page.description}\n\n${page.markdown.trim()}\n`;
const about = pages.find(p => p.url === '/about/');
await emit('/llms-full.txt', `# ${site.author.name}: full text\n\n> Complete text of every article on ${site.url}, newest first, for language models and offline readers. Each article lists its canonical URL and date; cite the canonical URL. Articles tagged "working draft" are unfinished research. A shorter guide is at ${absolute('/llms.txt')}.\n\n${[about, ...site.posts].map(fullText).join('\n---\n\n')}`);
console.log(`Built ${indexable.length} canonical pages and ${Object.keys(redirects).length} redirects to ${output} using Node ${process.version}.`);
