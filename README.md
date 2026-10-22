# rickmark.me

Rick Mark-Penwell's personal site and blog. A Node-based static generator renders
Markdown with markdown-it and Liquid templates with LiquidJS into `_site`.
Ruby, Jekyll and Python are not required to build, validate or deploy the site.

## Local development

Use Node 24 (see `.node-version`):

```sh
npm ci
npm test
npm run dev
```

`npm run build` produces the production site and validates it. `npm run dev` runs
Wrangler locally, building the same production output before serving it. For output
without Google Analytics, run `npm run build:dev` and serve `_site` with a static server.
`npm run check` performs a Wrangler deployment dry run without publishing anything.

## Content and templates

- `site.yml`: site URL, author, profiles and GA4 measurement ID.
- `_posts/YYYY-MM-DD-slug.md`: articles with YAML front matter (`title`, `date`,
  `description`, optional `tags`, `image`, `last_modified_at`, `redirect_from`).
- `_includes` and `_layouts`: Liquid components and page layouts.
- `_data`: YAML product and link directories.
- `scripts/build.mjs`: build inputs, Markdown rendering, metadata and generated indexes.

Posts retain `/blog/<slug>/` URLs. Imported articles set `render_with_liquid: false`
so code samples remain literal. Templates use the familiar Liquid include syntax;
Liquid is rendered by JavaScript, not Jekyll. To add a standalone page, register its
source and URL in the build script's page list. Assets are copied only from `assets/`;
source files, dependencies, scratch files and design documents are not published.

## SEO, AI discovery and legacy URLs

Every build generates canonical links, social metadata, BlogPosting structured data,
a sitemap at `/sitemap.xml`, an Atom feed at `/blog/feed.xml`, and `/llms.txt` from the
published article list. `robots.txt` permits search and AI crawlers and advertises
the sitemap. Allowing all crawlers also allows training crawlers. `llms.txt` is a
supplemental reading guide, not a guarantee of indexing or AI citations.

Set `last_modified_at` only when an article changes substantively. Submit
`https://rickmark.me/sitemap.xml` in the verified Google Search Console property.
The build does not submit to Search Console automatically.

`redirect_from` creates HTML refresh pages with canonical links and an entry in
`redirects.json`. `redirect_to` supports externally moved articles. Both the old root
paths and `/blog/` aliases are preserved, including `untitled`, `untitled-2` and
`untitled-3`. The Cloudflare Worker issues HTTP 301 redirects from the old blog
subdomain to the main site's `/blog/` paths, preserving queries. It then serves the
same `_site` content through its static assets binding.

`npm test` builds and validates canonical URLs, redirects, sitemap exclusions,
structured data, feed XML, analytics, images, original article code samples and
legacy heading anchors, then tests Worker behavior. The migration fixture under
`scripts/fixtures` captures the pre-migration URL, redirect, code and anchor contract.
When intentionally changing an existing code sample or removing an old anchor, review
and update its fixture too. New posts do not require updating the fixture.

## Cloudflare deployment

The root `wrangler.jsonc` serves `_site` with the `ASSETS` binding and runs
`npm run build` before deployment. Cloudflare Workers Builds settings:

- Repository root: `/`
- Deploy command: `npx wrangler deploy`
- Build command: leave empty (Wrangler runs the checked-in build command)

```sh
npx wrangler login
npx wrangler whoami
npm run deploy
```

The configured account is Love Wins Media, Inc. Routes `rickmark.me/*` and
`blog.rickmark.me/*` use the existing Cloudflare-proxied DNS records. Keep both records
proxied and edge certificates active. Routes avoid Custom Domain error 100117 when
records already exist. The main site is served from uploaded static assets, without
fetching the DNS origin. After deployment, verify the homepage, sitemap and old HTTPS
blog URLs. See [Cloudflare Worker routes](https://developers.cloudflare.com/workers/configuration/routing/routes/).

The GitHub Pages workflow also builds with Node and publishes `_site` on pushes to
`master`; `.nojekyll` prevents further processing. `CNAME` preserves the custom domain.

## Historical import tools

The old Ghost articles were recovered from the Wayback Machine. `tools/fetch.py` and
`tools/convert.py` are optional historical Python import utilities, not part of the
build or deployment. The previous Rails resume site remains at the `v1` tag.
