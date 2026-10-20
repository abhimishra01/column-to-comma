# Fix summary: column-to-comma (Scott, 2026-10-20)

## Fixed
Logic (`src/lib/convert.js`, 22 new tests, 61 total, all pass):
- JSON array preset now gives valid JSON: new quote style `json` escapes `"`, `\`, tabs and control characters, and does not leave `+5` bare. SQL and CSV still double the quote.
- List to column: outer brackets are stripped only for one matching pair, so `(1,2),(3,4)` is no longer damaged.
- List to column: a quoted last item no longer adds an empty item (`'a','b'` was 3 items).
- List to column: line breaks now split items for every separator, so dedupe, sort and counts are right for lists wrapped over several lines.
- List to column: "Comma + space" now splits on the comma.
- Number sort is strict: `12abc`, dates, `1,5` and `Infinity` are text and go last; `1,234` and `1e3` are numbers.
- Empty Custom separator falls back to a comma, with a note under the output.
- Counts ignore the final line break of an Excel or Sheets copy.
- New notes under the output: several pasted columns (tabs), and values that contain the separator when no quotes are on.

UI:
- Phone: output sits right under the input; the options are in a closed "Options" section (always open on wide screens). Customers must 1, design should 1.
- "Reset options" button. Quick buttons are off in List to column mode (they no longer flip the direction).
- Paste message on touch devices says to press and hold, then tap Paste; Cmd or Ctrl chosen by platform.
- Header no longer collides at 360 px (smaller name, Contact link hidden under 420 px, it stays in the footer). Header uses `site.name`.
- Output and input labels follow the mode ("Your list", "Your column"). Safari shows no Auto-detect in Column to list mode. Counts are no longer a live region (only the Copied message is announced). One copy timer. `aria-keyshortcuts` on Copy. "Working..." shows for very large pastes.
- One table drives save, restore and reset of options. `lastForwardDelim` replaced by a per-mode value. Presets live in `convert.js` and are tested.
- Text: article uses the exact labels, mentions Cmd+Enter, shorter Tips and privacy paragraphs; FAQ notes JSON escaping.

Template items: README rewritten for this tool; US spelling (color, personalized); fixed "Last updated" (October 20, 2026) on Privacy and Terms; Privacy no longer claims a consent banner or uploads; no absolute paths in scripts (only `deploy.mjs`, local); `scripts/new-tool.sh` removed; `screenshots/` and `.playwright-cli/` ignored and untracked; deploy runs `npm test` first; the home page has no duplicate legal link block (header and footer only), so nothing to delete there; unused manifest and two icons removed; `<meta keywords>`, `keywords` and `tagline` config removed.
Tailwind: `source(none)` plus `@source "../"` added. CSS before 23,374 bytes, after 23,485 bytes (the scan was already small; the new UI classes add a little). JS 7,071 to 9,009 bytes (more features).

GitHub Pages: `base` from `PAGES_BASE`, `site` from `PAGES_SITE`; every link, icon and og:image goes through `withBase()` (`src/lib/url.ts`); canonical is always `https://columntocommalist.com/...`; `.github/workflows/pages.yml` added (checkout@v4, setup-node@v4 Node 22, npm ci, npm test, build, upload-pages-artifact@v3, deploy-pages@v4). Checked locally with `PAGES_BASE=/column-to-comma/` build served under `/column-to-comma/`: home, about, contact, privacy, terms, icons and the tool all load (all 200), canonical stays on the real domain. `dist-pages` deleted. Branch is `main`. Not pushed.

## Rejected, with reasons
- Customers 5 (Comma + space as default): plain comma is what the keyword and most users expect; the note about values containing the separator covers the problem.
- Customers 7 (output breaks mid-value on narrow screens): a one-line list has no break points; horizontal scroll is worse for 100k items.
- Customers 9 / design 5 (Download .txt, chunk size): feature creep for a single-purpose tool.
- Customers 10 / design 3 (options above the fold on desktop): the phone layout was the real problem; desktop is fine.
- Maintainer 12 (quote-aware line split of Excel cells with line breaks): rare, adds parser risk.
- Minimalism: keep Tab, Space, backtick and braces (cheap, now tested). Keep wrangler (template decision).
- Design 4 (disabled Copy contrast), design 7 (16 px favicon check), design 12 (sitemap lastmod): not worth a change now.
- Readability 8/10 partly: preset typing is now plain, value lists added to the doc comment.

## Status
- `npm test`: 61 pass, 0 fail (100k lines about 100 ms). `npm run build`: OK, 6 pages.
- Lighthouse (mobile and desktop): 100 / 100 / 100 / 100.
- Screenshots (1280 and 390, light and dark) in `screenshots/` (ignored by git), checked by eye.

## Left for the owner
- Regenerate `public/og.png` so the sample shows text values, not quoted numbers (design 6).
- Before AdSense: name the owner on the legal pages and turn on Google's consent message.
- Real-Safari check of the Options section on iPhone.

## Phase 2 SEO pages (not built)
1. /sql-in-list-generator/
2. /list-to-column/
3. /add-quotes-to-list/
4. /excel-column-to-comma-separated-list/
5. /google-sheets-column-to-comma/
6. /comma-separated-list-to-rows/
7. /remove-duplicates-from-list/
8. /sort-list-alphabetically/
9. /newline-to-comma/
10. /comma-to-newline/
11. /space-to-comma/
12. /semicolon-separated-list/
13. /pipe-delimited-list/
14. /json-array-from-list/
15. /csv-row-from-column/
16. /add-single-quotes-to-list/
17. /add-double-quotes-to-list/
18. /python-list-from-column/
19. /email-list-for-bcc/
20. /keep-leading-zeros-in-list/

## Gap fix (2026-10-20)
Done:
- Status line under the output: "5 items from 7 lines. 1 blank removed, 0 duplicates removed." (must 1).
- Options saved in the browser (already there); now shows "Settings saved on this device." once, ever (must 2).
- 10 pre-rendered landing pages from `src/data/pages.js`, one template `src/pages/[slug].astro`, each with its own title, H1, intro, preset settings, a worked example converted at build time, 3 sections, 3 FAQs and FAQ schema. Linked from the home page ("Popular conversions") and from each other: sql-in-list-generator, list-to-column, excel-column-to-comma-separated-list, google-sheets-column-to-comma, add-single-quotes-to-list, remove-duplicates-from-list, newline-to-comma, json-array-from-column, sort-list-alphabetically, column-to-html-list (must 3).
- Phone: Copy sits in a sticky bottom bar; the inline Copy hides below 1024px; page gets bottom room (must 4). Also fixed the Paste/Upload/Example/Clear row that overflowed at 390px.
- Upload .txt/.csv and Download .txt (should 5).
- "Use only the first column" for Excel paste with tabs, with a note when rows were cut (should 6).
- Before/after each item and before/after the list (should 7). Letter case: upper, lower, Title Case (should 8).
- Tests: 71 pass (new: case, affixes, first column, presets, landing page data and expected examples). Lighthouse (Chrome) 100/100/100/100 on home and a landing page, mobile and desktop.
Skipped:
- 9 wrap at N characters, 10 share link with options, 11 copy-from-Excel animation: nice-to-have, not single-purpose core; share link also clashes with the preset pages.
- Landing pages 11 to 20 of the Phase 2 list: capped at 10 by the brief.
Note: title length is capped at 44 characters in a test so "Title | Column to Comma" stays under 60.
