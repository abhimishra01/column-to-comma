# Design and SEO review: column-to-comma (Miranda, 2026-10-20)

Method: npm run build, served dist on port 4486, playwright-cli at 1280 and 390, light and dark, Lighthouse (mobile and desktop) with system Chrome.

## Scores (Lighthouse)
| Run | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 100 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

LCP 1.3 s mobile (0.3 s desktop), CLS 0, TBT 0 ms. Page weight: dist 212 KB total, one 7 KB script, one 23 KB CSS file, no web fonts, no layout shift. 100,000 lines converted (877 KB output) and the page stayed responsive.

Verdict: clearly better than the research competitors (delim.co, retool, lido). It has presets, reverse mode, dark mode, number-aware quoting, an item count and a shortcut. Visual design is calm and consistent. Must-fix count: 0 blockers; 2 should-fix before launch (rows 1 and 2).

## Findings
| # | Severity | Area | Finding | Fix |
|---|---|---|---|---|
| 1 | Should fix | Phone UX | At 390 wide the result and the Copy button sit about 1,200 px down, under the input and 9 option controls. A phone user pastes, then has to scroll past all options to see the list. The tool's main promise ("appears as you type") is not visible. | On phones, move the output panel directly under the input and put the options in a collapsed "Options" disclosure (or a sticky bottom bar with item count and Copy). Keep the presets visible. |
| 2 | Should fix | Edge case | Choose Separator "Custom" and leave the custom text empty: the output silently joins everything with no separator ("10011002100310041005"). No message. | Show a hint in the stats line ("Type your custom separator") and fall back to comma, or disable output until text is typed. |
| 3 | Nice to have | Desktop layout | The output box stretches to about 22rem+ and is mostly empty for short lists, while the options sit under the input, so the first screen at 1280x900 cuts off at "Sort". | Put the options in a compact row or panel so the whole tool fits in one 900 px screen. |
| 4 | Nice to have | States | The disabled Copy button in light mode is pale green with white text (about 2:1). This is acceptable for a disabled state, but it looks washed out next to the filled state. | Use a grey outline style when disabled, or keep the label legible. |
| 5 | Nice to have | Copy | Wide input lines are not wrapped (wrap=off), fine. The output wraps softly. A 5,000 item list appears as a solid block; there is no "download .txt" or "list view" toggle. | Optional later: "Download .txt" button. Low priority. |
| 6 | Nice to have | Consistency | OG image shows `('1001', '1002', '1003')` (quoted numbers), but the SQL IN preset leaves numbers bare, as the article says. | Change the OG sample to text values, e.g. ('AB-1', 'AB-2', 'AB-3'), so it matches the tool. |
| 7 | Nice to have | Logo | Favicon and logo mark (green tile, three lines and a comma) are clean and match the wordmark with a green comma. The 3 lines and comma are thin at 16 px. | Check the 16 px favicon in a real tab. Thicken the strokes by about 1 unit if it blurs. |
| 8 | Nice to have | Keyboard | Ctrl+Enter copy works and is shown on the button on desktop. Not announced to screen readers. The kbd hint is hidden on phones (correct). | Add `aria-keyshortcuts="Control+Enter Meta+Enter"` to the Copy button. |
| 9 | Should fix (SEO) | Internal links | The 823-word article has no internal links and no anchors to the tool. The site has only 5 URLs, so the home page carries every query alone. Related queries ("list to column", "excel column to comma", "sql in list generator", "add quotes to list") have no page. | Plan 3 to 4 sub-pages later, each a preset of the same tool (e.g. /sql-in-list-generator/, /list-to-column/, /add-quotes-to-list/) and link them from the article and the footer. Not a launch blocker. |
| 10 | Nice to have | SEO | Heading outline is clean: one H1, 10 H2, no H3. Main phrase is in title, H1, first paragraph and first H2. Title is 46 characters, description is 143. | Optional: add H3s inside "Common settings" and "Tips" for long-tail queries ("remove duplicates", "keep leading zeros"). |
| 11 | Nice to have | JSON-LD | WebApplication and FAQPage both parse. WebApplication has no `image`, and FAQPage answers match the visible FAQ (good). | Add `image` (og.png) and `datePublished`/`dateModified` to WebApplication. |
| 12 | Nice to have | Sitemap | sitemap lists 5 URLs, no `lastmod`. robots.txt points to the sitemap index. Canonical is the bare domain on every page. | Add lastmod when the site gets more pages. |
| 13 | Nice to have | SEO | `<meta name="keywords">` is ignored by Google. | Remove it (harmless). |
| 14 | Nice to have | FAQ | 8 real questions, plain answers, native `<details>` (accessible, no JS). Questions mirror people-also-ask style. | Optional: add "How do I convert a column to a list in Excel without a formula?" and "How do I add quotes to each line?" |
| 15 | Nice to have | Trust pages | About, Privacy and Terms use "Column to Comma" as the owner name and give no entity or country. Privacy mentions Google Analytics and ads while both are off. | Before AdSense: name the owner (person or business) and update the policy for ads and consent. |
| 16 | Info | Accessibility | Labels on all controls, 44 px targets, visible focus ring, skip link, aria-live stats, `prefers-color-scheme` plus saved toggle with no flash, no horizontal scroll at 390. Contrast passes in both themes (Lighthouse 100). | None. |
| 17 | Info | Writing | No em dashes found in the home page. Text is plain and short. Wording does not mention vendors or AI. | None. |

## Notes
- A preview server was already running for this project on port 4482 (another reviewer). I served a copy of dist on 4486 with a static server instead and stopped it. The 4482 server was not touched.
- Screenshots are in the scratchpad at /private/tmp/claude-501/-Users-moonwalker-Desktop-oqu/2d2a8d57-6f9b-46c3-adf5-d290559998fd/scratchpad/ctc-shots/.
