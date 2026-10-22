# rickmark.me

Personal site and blog of Rick Mark-Penwell, built with Jekyll and deployed to GitHub Pages at
[rickmark.me](https://rickmark.me). The previous Rails resume site is preserved at the `v1` tag.

## Run locally

```bash
bundle install
bundle exec jekyll serve
```

## Writing a post

Add `_posts/YYYY-MM-DD-slug.md` with front matter (`title`, `date`, `description`, optional `tags` and `image`).
Posts are served at `/blog/<slug>/`.

## Search and AI discovery

`jekyll-sitemap` generates `/sitemap.xml` on every build. It lists canonical HTTPS pages;
redirects, the 404 page, and the AI guide are excluded. `/robots.txt` advertises it and
permits all crawlers, including search and AI crawlers. This also permits training
crawlers; search access and training access are separate policies.

The SEO plugin generates canonical links, descriptions, social metadata and BlogPosting
structured data. The templates add author profiles and article breadcrumbs. Keep post
descriptions accurate and concise. Set `last_modified_at` only when the article actually
changes substantively; do not use the build date as its modification date.

`/llms.txt` is a supplemental AI reading guide, generated from the published post list.
It links to the same static HTML available to readers, preserves research caveats, and
does not guarantee indexing or AI citations. No JavaScript is needed to read the site.

Validate before deploying (also enforced by the deployment workflow):

```bash
JEKYLL_ENV=production bundle exec jekyll build
python3 tools/check_seo.py
```

After deployment, verify ownership of `rickmark.me` in Google Search Console (a Domain
property uses Google's supplied DNS TXT record). In **Sitemaps**, submit
`https://rickmark.me/sitemap.xml`. Use URL Inspection for the homepage and a sample post,
and monitor Page indexing. Submission requires the verified property's owner access;
the repository changes do not submit it automatically. Check that any CDN or firewall
also allows legitimate crawlers.

References: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features),
and the [llms.txt proposal](https://llmstxt.org/).

## Imported posts

The posts from 2020–2025 came from the old Ghost blog at blog.rickmark.me, recovered from the Wayback Machine.
`tools/fetch.py` downloads the newest archived copy of each post and `tools/convert.py` turns them into Markdown,
saving images under `assets/images/<slug>/`. Old Ghost URLs keep working: `blog.rickmark.me/<slug>/` should
redirect to `rickmark.me/blog/<slug>/`, and renamed posts carry `redirect_from` entries.
Root-level aliases also preserve `rickmark.me/<slug>/` if a host redirect preserves the original path.
These Jekyll redirects use HTML refresh and canonical links; HTTP status redirects must be configured at the host.
Imported posts set
`render_with_liquid: false` so code samples are never read as Liquid.

### Legacy subdomain hosting

On October 22, 2026, public checks found that Namecheap URL forwarding sends
`http://blog.rickmark.me/checkra1n-and-the-t2/` to the correct canonical article (302),
but the HTTPS connection to `blog.rickmark.me` times out. Repository aliases cannot
fix this TLS/hosting failure. The subdomain needs an HTTPS-capable redirect host with
a valid certificate for `blog.rickmark.me`, serving permanent redirects from `/` to
`https://rickmark.me/blog/` and from `/<path>` to `https://rickmark.me/blog/<path>`.
Preserve query strings. Do not blindly change the DNS to GitHub Pages: the destination
must first be configured to accept the subdomain and serve its certificate.

### Wrangler static site and legacy redirects

The root `wrangler.jsonc` configures `workers/site/src.js` to serve the generated `_site` directory using Cloudflare Workers Static Assets.
Wrangler runs the production Jekyll build and SEO checks before dev or deployment.
Requests on `blog.rickmark.me` receive
301 responses to the canonical `/blog/` paths, preserving query strings and avoiding
a duplicate `/blog` prefix. Jekyll's aliases then resolve renamed posts and external articles.
The Worker source and dependencies are excluded from Jekyll output. The existing GitHub
Pages workflow remains available; deploying this Worker with its routes moves
serving of the main site to Cloudflare once DNS is activated.

```bash
npm ci
npm test
npm run check
npm run dev
```

Run these commands from the repository root. Cloudflare Workers Builds should use
the repository root directory and `npx wrangler deploy` as its deploy command; the
checked-in config supplies the build command (no `npx` before Ruby’s `bundle`).

To connect the account and deploy:

```bash
npx wrangler login
npx wrangler whoami
npm run deploy
```

Deployment requires an active `rickmark.me` zone in the selected Cloudflare account.
The Worker routes `rickmark.me/*` and `blog.rickmark.me/*` run on the existing proxied
DNS records. Keep those records proxied (orange cloud) and Cloudflare's edge certificates
active. Routes preserve existing DNS records and avoid the Custom Domain conflict
(error 100117) caused by trying to create records for an already configured hostname.
The Worker serves `ASSETS` directly for the main site; it does not fetch the DNS origin.
If the account has multiple accounts, set the intended `account_id`
in `wrangler.jsonc` after inspecting `wrangler whoami`.

After DNS activation and certificate issuance, verify the HTTPS screenshot URLs return
301 responses with the correct Location headers. Run the Jekyll SEO checks to verify
their final local destinations. See [Cloudflare Worker routes](https://developers.cloudflare.com/workers/configuration/routing/routes/).

## Deployment

`.github/workflows/pages.yml` builds and deploys on every push to `master`. In the repository's
Settings → Pages, set **Source** to **GitHub Actions** and the custom domain to `rickmark.me`.
