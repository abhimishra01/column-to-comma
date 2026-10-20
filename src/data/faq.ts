// FAQ items. Rendered on the home page AND output as FAQPage JSON-LD.
export const faq = [
  { q: 'How do I convert a column to a comma separated list?', a: 'Copy the column from Excel, Google Sheets or your database tool. Paste it into the left box on this page. The comma separated list appears on the right. Press Copy to put it on your clipboard.' },
  { q: 'How do I make a list for a SQL IN clause?', a: 'Paste your column and click SQL IN list. The tool puts single quotes around text, leaves numbers bare, and wraps the list in parentheses. Tick Remove duplicates if the column repeats values. Oracle allows at most 1,000 items in one IN list.' },
  { q: 'Can I turn a comma separated list back into rows?', a: 'Yes. Choose List to column at the top of the tool. Paste the list and you get one value per line. Quotes and brackets are removed, and a quoted value that holds a comma stays whole.' },
  { q: 'How does it handle apostrophes such as O\'Brien?', a: 'With single quotes on, the tool doubles the apostrophe, so O\'Brien becomes \'O\'\'Brien\'. That is the standard way to escape a quote in SQL. The same rule applies to double quotes.' },
  { q: 'How do I keep leading zeros like 007?', a: 'Tick Do not quote numbers. Values such as 42 and 3.5 stay bare. A value with a leading zero is not treated as a number, so it keeps its quotes and its zeros.' },
  { q: 'Is there a limit on how many rows I can paste?', a: 'There is no set limit. A list of 100,000 rows converts in well under a second on a normal laptop. Very large pastes depend on your device and browser memory.' },
  { q: 'Is my data uploaded or saved?', a: 'No. The conversion runs in your browser. Your text is never sent to a server. Only your option choices, such as the separator, are saved on your own device.' },
  { q: 'Can I use a separator other than a comma?', a: 'Yes. Pick semicolon, pipe, new line, tab or space, or choose Custom and type your own, such as " - ". Use \\t for a tab and \\n for a new line.' },
];
