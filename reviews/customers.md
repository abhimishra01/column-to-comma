# Mock-customer test: Column to comma list

Tester: Shuri. Method: five simulated US personas used the built page (`npm run build`, served from `dist/` on port 4487) in a real browser (playwright-cli) at the viewport each persona uses. These are simulated people, not real user data. Note: `astro preview` refused to start on 4487 because another preview of this project was already running on 4482, so I served the same `dist/` folder with a plain static server. The tool behaves the same.

## Persona stories

### 1. Emily Chen, data analyst, New York (expert, laptop 1440x900)
Task: paste 9 IDs from Excel into a SQL IN list.
She pasted the IDs, clicked "SQL IN list", and got `(10482, 10483, 10483, 10517, 10520, 10531, 10544, 'A-77')` at once. She ticked "Remove duplicates" and the count line said "1 duplicate removed". She tried leading zeros (`00123` stays quoted), `1e5`, `-7`, `3.14` and `O'Brien` (becomes `'O''Brien'`). All correct. Ctrl+Enter copied, and the button said "Copied".
- Click on Google over the others? Yes, if it loads fast. The one-click SQL IN preset is what she wants.
- Under 30 seconds? Yes, about 10.
- Confused by: mixed lists. A column with numbers and one text ID gives `(10482, 'A-77')`. This is valid for most databases but she paused. The "Do not quote numbers" checkbox is below the fold and she did not see why numbers were bare.
- Missing to bookmark: it remembers her settings (it does), plus a way to turn off the number rule for one run without hunting for the checkbox. A "split into chunks of 1000" option, because Oracle limits IN lists to 1000 items.
- Trust: high. The stats line (9 in, 8 out, 1 blank removed) lets her check the result.
- Come back? Yes, daily.

### 2. Jake Miller, backend engineer, Austin (expert, desktop 1440x900)
Task: 100,000 log lines, dedupe, sort, JSON array.
He pasted 100k lines (about 120 ms to settle), picked "JSON array", ticked dedupe and sorted Z to A. Result: 80,000 items, 1.1 MB, no freeze. The list showed `["user_79999", "user_79998", ...]`. He tested a value with a double quote and a backslash. I did not capture the output of that run, so I cannot confirm JSON escaping. He should check it himself.
- Click over others? Yes. The "JSON array" preset beats most sites.
- Under 30 seconds? Yes.
- Confused by: the 100k result is one huge unbroken block in the box, so he cannot tell it is done except from the stats line. The sort and options are far below the first screen on a 900px tall window.
- Missing: a "Download .txt" button for big results, and a "newline between items" option inside the list (a list with one item per line plus commas).
- Trust: high on speed. He would want to know the JSON output escapes quotes (not stated on the page).
- Come back? Yes, but he already has a script for this. He would use it on someone else's laptop.

### 3. Megan Lee, product manager, Denver (intermediate, iPhone 390x844)
Task: a short list of names pasted from a spec into one line.
She typed into the box, and nothing visible happened. The result sits about 760 px below the input, and she must scroll past 8 settings (separator, quotes, sort, 5 checkboxes) to see it. When she found the output, her settings from an earlier visit (double quotes, brackets, semicolons) were still on. She did not know why her list was wrapped in `["..."]`. There is no "Reset options" button. She tapped "Comma list" to fix it, which worked.
- Click over others? Maybe. She cares that it works on her phone.
- Under 30 seconds? No, about 60, mostly scrolling and confusion about the saved settings.
- Confused by: result out of sight, remembered settings with no reset, the output text breaking mid-word (`ca rol@y.org`).
- Missing: a sticky result or Copy button on phones, a Reset button.
- Trust: medium. She could not see what it did at first.
- Come back? Maybe.

### 4. Maria Lopez, email marketer, Phoenix (beginner, Android 360x740)
Task: turn three email addresses into one line for the BCC field.
At 360 px wide the logo text "Column to Comma," runs into the "About" link in the header. She tapped "Paste" and the page said "Your browser blocked the paste button. Press Ctrl+V in the box instead." She has no Ctrl key on a phone. She pasted by long-press instead and the result came out as `maria@acme.com,bob@x.com,carol@y.org`. The Copy button is 1200 px down the page, after the options. For her BCC field she wants a semicolon or comma plus space. She found "Semicolon" in the dropdown on her second try.
- Click over others? Yes if it is the first result. The page title matches what she types.
- Under 30 seconds? No, about 50.
- Confused by: the Paste button error telling a phone user to press Ctrl+V, a header clash, too many options for her task, no "Emails" shortcut.
- Missing: a "Comma + space" or "Semicolon" quick button, a Copy button she can reach without scrolling.
- Trust: medium to high. The result looks right.
- Come back? Probably, if it is on her home screen.

### 5. Dave Parsons, small business owner, Ohio (beginner, laptop 1280x720)
Task: a Word list of customer names ("Smith, John") into one line, and back.
He pasted Windows line endings (CRLF) and a trailing blank line, and it worked: `Smith, John,Doe, Jane,Lee, Amy`. He was puzzled: names already contain commas, so the one-line result is ambiguous. No tip warns about this and "Comma + space" is not the default. He pasted a two-column Excel selection (tab between columns). The tool treated each row as one item (`a\t1,b\t2`) with no warning. He tried "List to column" with `x - y - z` and nothing happened, because auto-detect does not split on " - ". Switching modes also works only if he finds the pill at the top. Clicking a "Quick" preset while in List to column mode quietly switches back to Column to list.
- Click over others? Maybe. The page looks clean and trustworthy.
- Under 30 seconds? Yes for the simple case.
- Confused by: values that contain commas, the two-column paste, the quick buttons changing direction.
- Missing: a plain tip near the tool for values that contain commas ("use quotes or semicolon"), and a notice when pasted rows contain tabs.
- Trust: high. "Your text never leaves your browser" helps.
- Come back? Yes, if it works the same way each time.

## Ranked change list

Counts are out of 5 personas.

### Must
1. **Phone layout: show the result and Copy without a long scroll.** On a phone the output starts about 760 px below the input. Add a sticky Copy bar, or move the options below the output, or collapse the options behind "More options". Asked by 3 of 5 (Megan, Maria, plus Jake on short desktop windows).
2. **Fix the Paste button message on phones.** "Press Ctrl+V" is wrong on touch devices. Say "Long-press the box and tap Paste". Asked by 1 of 5 directly (Maria), and it hits every phone user.
3. **Header collision at 360 px.** The site name overlaps the "About" link. Shorten the name or hide a link on small screens. Asked by 1 of 5 (Maria). It is visible on every small Android phone.
4. **Add a visible "Reset options" button.** Settings persist between visits with no reset, so a returning user sees an odd result and does not know why. Asked by 2 of 5 (Megan, Maria).

### Should
5. **Add a "Comma + space" quick button, or make it the default.** Plain comma gives `Smith, John,Doe, Jane` which reads badly. Asked by 3 of 5 (Maria, Dave, Megan).
6. **Warn when values contain commas or tabs.** One short line under the output ("Some values contain commas. Choose Quotes or Semicolon.") and a tab notice for multi-column Excel pastes. Asked by 2 of 5 (Dave, Emily on mixed numeric and text values).
7. **Stop the output breaking words mid-value on narrow screens** (`ca rol@y.org`). Use horizontal scroll or break only at separators. Asked by 2 of 5 (Megan, Maria).
8. **Quick buttons must not switch the direction.** In List to column mode a preset silently flips back to Column to list. Asked by 1 of 5 (Dave).
9. **Download .txt and a chunk-size option for very large results** (for example, groups of 1000 for SQL IN limits). Asked by 2 of 5 (Jake, Emily).
10. **Move the key options (Separator, Quotes) above the fold on desktop at 720 to 900 px tall**, or make the input and output shorter so options show without scrolling. Asked by 2 of 5 (Jake, Dave).

### Nice
11. State on the page that JSON output escapes quotes and backslashes (verify first; I did not confirm the output). 1 of 5.
12. "Emails" quick button for BCC lists (semicolon plus space). 1 of 5.
13. Reverse mode: strip surrounding parentheses or brackets, and split on " - " in auto-detect. 1 of 5.
14. Show why numbers stay unquoted in the SQL preset (small hint next to the preset). 1 of 5.

## What worked
- Speed with 100,000 lines (about 120 ms to settle, 1.1 MB output).
- Correct handling of CRLF, trailing blank lines, leading zeros, apostrophes and duplicates.
- The stats line gives every persona a way to check the result.
- Ctrl+Enter (and the Cmd+Enter label on Mac) copies at once.
- "Your text never leaves your browser" builds trust.
