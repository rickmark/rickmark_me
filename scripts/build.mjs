import { readFile, readdir, mkdir, writeFile, rm, cp } from 'node:fs/promises';
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
function seo(page) {
  const title = `${page.title || site.title} | ${site.title}`;
  const description = page.description || site.description;
  const url = absolute(page.url);
  const article = page.layout === 'post';
  const schema = {
    '@context':'https://schema.org', '@type': article ? 'BlogPosting' : 'WebPage',
    headline: page.title || site.title, description, url,
    author: { '@type':'Person', name:site.author.name, url:site.author.url },
    ...(article ? { datePublished:page.date, dateModified:iso(page.last_modified_at || page.date), mainEntityOfPage: {'@type':'WebPage', '@id':url} } : {}),
    ...(page.image ? {image:absolute(page.image)} : {}),
  };
  return `<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="author" content="${escape(site.author.name)}">
<link rel="canonical" href="${escape(url)}">
<meta property="og:title" content="${escape(page.title || site.title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${escape(url)}">
<meta property="og:site_name" content="${escape(site.title)}">
<meta property="og:locale" content="${escape(site.lang)}">
<meta property="og:type" content="${article ? 'article' : 'website'}">
<meta name="twitter:card" content="${page.image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${escape(page.title || site.title)}">
<meta name="twitter:description" content="${escape(description)}">
${page.image ? `<meta property="og:image" content="${escape(absolute(page.image))}">` : ''}
${article ? `<meta property="article:published_time" content="${page.date}">` : ''}
<script type="application/ld+json">${json(schema)}</script>`;
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
  const context = {site, page, seo:seo(page)};
  let content = page.render_with_liquid === false ? page.body : await liquid.parseAndRender(page.body, context);
  if (page.file.endsWith('.md')) content = md.render(content);
  page.content = content;
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
for (const [file, url] of Object.entries({'index.html':'/', 'about.md':'/about/', 'products.html':'/products/', 'blog/index.html':'/blog/', '404.md':'/404.html', 'robots.txt':'/robots.txt', 'llms.txt':'/llms.txt'})) {
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
await emit('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable.map(p => `<url><loc>${escape(absolute(p.url))}</loc>${p.last_modified_at || p.date ? `<lastmod>${iso(p.last_modified_at || p.date)}</lastmod>` : ''}</url>`).join('')}</urlset>`);
await emit('/blog/feed.xml', `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escape(site.title)}</title><id>${site.url}/blog/</id><link href="${site.url}/blog/feed.xml" rel="self"/><link href="${site.url}/blog/"/><updated>${site.posts[0].date}</updated><author><name>${escape(site.author.name)}</name><uri>${site.author.url}</uri></author>${site.posts.slice(0,100).map(p => `<entry><title>${escape(p.title)}</title><id>${absolute(p.url)}</id><link href="${absolute(p.url)}"/><published>${p.date}</published><updated>${iso(p.last_modified_at || p.date)}</updated><summary>${escape(p.description)}</summary><content type="html">${escape(p.content)}</content></entry>`).join('')}</feed>`);
console.log(`Built ${indexable.length} canonical pages and ${Object.keys(redirects).length} redirects to ${output} using Node ${process.version}.`);
