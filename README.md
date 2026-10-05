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

## Imported posts

The posts from 2020–2025 came from the old Ghost blog at blog.rickmark.me, recovered from the Wayback Machine.
`tools/fetch.py` downloads the newest archived copy of each post and `tools/convert.py` turns them into Markdown,
saving images under `assets/images/<slug>/`. Old Ghost URLs keep working: `blog.rickmark.me/<slug>/` should
redirect to `rickmark.me/blog/<slug>/`, and renamed posts carry `redirect_from` entries. Imported posts set
`render_with_liquid: false` so code samples are never read as Liquid.

## Deployment

`.github/workflows/pages.yml` builds and deploys on every push to `master`. In the repository's
Settings → Pages, set **Source** to **GitHub Actions** and the custom domain to `rickmark.me`.
