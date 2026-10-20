# Column to Comma

A free browser tool that turns a pasted column (Excel, Sheets, SQL results) into a delimited list, and back. The text never leaves the browser. Live site: columntocommalist.com. Built with Astro (static) and Tailwind 4.

## What it does

- Separators: comma, comma and space, semicolon, pipe, new line, tab, space, or custom text.
- Quotes: none, single, double, backtick, or double with JSON escaping. Optional parentheses, brackets or braces around the list.
- Trim spaces, remove blank lines, remove duplicates (with ignore case), sort (A to Z, Z to A, numbers).
- Quick settings: comma list, SQL IN list, JSON array, CSV row.
- List to column mode, with auto-detect of the separator.
- Item counts, notes for odd input, Copy button with Ctrl+Enter (Cmd+Enter on a Mac).

## Where the logic lives

- `src/lib/convert.js`: all conversion rules. Pure functions with no DOM, so node can test them.
- `src/components/Tool.astro`: the page markup and the event wiring only.
- `src/site.config.ts`: name, domain, description, email, brand color.
- `src/components/Article.astro` and `src/data/faq.ts`: the text under the tool. The FAQ also becomes FAQ schema.

## Commands

```
npm install
npm run dev       # work on the site
npm test          # unit tests for convert.js (node:test, no extra packages)
npm run build     # make dist/
npm run preview   # check the build
npm run deploy    # runs the tests, builds, then uploads to Cloudflare Pages
```

## GitHub Pages copy

Until the domain is live, the site is also served at https://abhimishra01.github.io/column-to-comma/. The workflow `.github/workflows/pages.yml` builds it on every push to `main` with `PAGES_BASE=/column-to-comma/` and `PAGES_SITE=https://abhimishra01.github.io`. All links go through `withBase()` in `src/lib/url.ts`. The canonical URL always points to the real domain.

To test it locally:

```
PAGES_BASE=/column-to-comma/ npx astro build --outDir dist-pages
```

Then serve `dist-pages` so it appears under `/column-to-comma/`. Delete `dist-pages` afterwards.

## Go live

1. Buy the domain, then rebuild. `domain` in `src/site.config.ts` feeds the canonical URL, sitemap and robots.txt.
2. Add the domain to Cloudflare and run `npx wrangler login` once, in your own browser.
3. `npm run deploy`. Add the custom domain in Cloudflare Pages and redirect `www` to the bare domain.
4. `public/_headers` sets `noindex` on the `*.pages.dev` address only.
5. Add the site to Google Search Console and Bing Webmaster Tools, and submit `sitemap-index.xml`.
6. Google Analytics (`ga4`) and AdSense (`adsense`) in the config stay off while empty. Before ads, name the site owner on the legal pages and set up Google's consent message.

The About, Terms and Privacy pages are starting text, not legal advice. The "Last updated" date on Privacy and Terms is a fixed date in the page file. Change it when you edit the text.
