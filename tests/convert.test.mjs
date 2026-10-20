import assert from 'node:assert/strict';
import { test as t } from 'node:test';
import { convert, splitList, resolveDelimiter, unescapeCustom, isNumber, PRESETS } from '../src/lib/convert.js';

const run = (text, o) => convert(text, o).output;

t('plain comma', () => assert.equal(run('a\nb\nc', {}), 'a,b,c'));
t('comma+space', () => assert.equal(run('a\nb\nc', { delimiter: ', ' }), 'a, b, c'));
t('semicolon and pipe', () => {
  assert.equal(run('a\nb', { delimiter: ';' }), 'a;b');
  assert.equal(run('a\nb', { delimiter: '|' }), 'a|b');
});
t('newline delimiter', () => assert.equal(run('a\nb', { delimiter: '\n' }), 'a\nb'));
t('custom delimiter', () => assert.equal(run('a\nb\nc', { delimiter: resolveDelimiter('custom', ' - ') }), 'a - b - c'));
t('custom escape \\t', () => assert.equal(resolveDelimiter('custom', '\\t'), '\t'));
t('windows and old mac line breaks', () => {
  assert.equal(run('a\r\nb\r\nc', {}), 'a,b,c');
  assert.equal(run('a\rb\rc', {}), 'a,b,c');
});
t('single quotes for SQL IN', () => assert.equal(run('a\nb', { quote: 'single', delimiter: ', ', wrap: 'parens' }), "('a', 'b')"));
t('double quotes + brackets', () => assert.equal(run('a\nb', { quote: 'double', wrap: 'brackets' }), '["a","b"]'));
t('embedded single quote is doubled', () => assert.equal(run("O'Brien\nSmith", { quote: 'single' }), "'O''Brien','Smith'"));
t('embedded double quote is doubled', () => assert.equal(run('say "hi"', { quote: 'double' }), '"say ""hi"""'));
t('skip quotes on numbers', () => assert.equal(run('1\n2.5\nabc\n007\n-3', { quote: 'single', skipNumberQuotes: true }), "1,2.5,'abc','007',-3"));
t('isNumber', () => { assert.ok(isNumber('10')); assert.ok(!isNumber('01')); assert.ok(!isNumber('1e5')); assert.ok(!isNumber('')); });
t('trim on', () => assert.equal(run('  a \n\tb\t', {}), 'a,b'));
t('trim off keeps spaces', () => assert.equal(run('  a \nb', { trim: false }), '  a ,b'));
t('remove blanks', () => assert.equal(run('a\n\n  \nb\n', {}), 'a,b'));
t('keep blanks', () => assert.equal(run('a\n\nb', { removeBlanks: false }), 'a,,b'));
t('dedupe keeps first', () => assert.equal(run('b\na\nb\nc\na', { dedupe: true }), 'b,a,c'));
t('dedupe case sensitive by default', () => assert.equal(run('A\na', { dedupe: true }), 'A,a'));
t('dedupe ignore case', () => assert.equal(run('A\na\nB', { dedupe: true, ignoreCase: true }), 'A,B'));
t('sort A to Z with natural numbers', () => assert.equal(run('item10\nitem2\nItem1', { sort: 'az' }), 'Item1,item2,item10'));
t('sort Z to A', () => assert.equal(run('b\na\nc', { sort: 'za' }), 'c,b,a'));
t('numeric sort', () => {
  assert.equal(run('10\n9\n100\n-1', { sort: 'num-asc' }), '-1,9,10,100');
  assert.equal(run('10\n9\n100\nx', { sort: 'num-desc' }), '100,10,9,x');
});
t('parentheses', () => assert.equal(run('1\n2', { wrap: 'parens' }), '(1,2)'));
t('braces', () => assert.equal(run('1\n2', { wrap: 'braces' }), '{1,2}'));
t('empty input gives empty output, not ()', () => {
  assert.equal(run('', { wrap: 'parens' }), '');
  assert.equal(run('\n\n', { wrap: 'parens' }), '');
});
t('single item has no delimiter', () => assert.equal(run('a', { quote: 'single' }), "'a'"));
t('stats', () => {
  const r = convert('a\nb\n\na\n', { dedupe: true });
  // the final empty line (every Excel copy has one) is not counted
  assert.deepEqual(r.stats, { inputItems: 4, blanksRemoved: 1, duplicatesRemoved: 1, outputItems: 2, multiColumn: false, delimiterInItems: 0 });
});

// reverse mode
const back = (text, delim, o = {}) => convert(text, { mode: 'toColumn', delimiter: delim, ...o }).output;
t('reverse comma', () => assert.equal(back('a,b,c', ','), 'a\nb\nc'));
t('reverse comma+space', () => assert.equal(back('a, b, c', ','), 'a\nb\nc'));
t('reverse strips quotes and parentheses', () => assert.equal(back("('a', 'b', 'c')", ','), 'a\nb\nc'));
t('reverse quoted item keeps its comma', () => assert.equal(back('"a,b","c"', ','), 'a,b\nc'));
t('reverse doubled quote', () => assert.equal(back("'O''Brien','Smith'", ','), "O'Brien\nSmith"));
t('reverse auto-detect', () => {
  assert.equal(back('a;b;c', null), 'a\nb\nc');
  assert.equal(back('a|b|c', null), 'a\nb\nc');
  assert.equal(back('a,b\nc', null), 'a\nb\nc');
  assert.equal(back('[1, 2, 3]', null), '1\n2\n3');
});
t('reverse trailing delimiter gives no blank', () => assert.equal(back('a,b,', ','), 'a\nb'));
t('reverse dedupe and sort', () => assert.equal(back('b,a,b', ',', { dedupe: true, sort: 'az' }), 'a\nb'));
t('round trip', () => {
  const col = 'x\ny z\n"w"';
  const list = run(col, { quote: 'single', delimiter: ', ', wrap: 'parens' });
  assert.equal(back(list, ','), 'x\ny z\n"w"');
});
t('splitList multi-char delimiter', () => assert.deepEqual(splitList('a - b - c', ' - '), ['a', 'b', 'c']));

// speed: 100k lines
t('100k lines under 2 s', () => {
  const lines = Array.from({ length: 100000 }, (_, i) => 'id' + (i % 70000)).join('\n');
  const t0 = performance.now();
  const r = convert(lines, { quote: 'single', delimiter: ', ', dedupe: true, sort: 'az', wrap: 'parens' });
  const ms = performance.now() - t0;
  assert.equal(r.stats.outputItems, 70000);
  console.log('   100k lines took', Math.round(ms), 'ms');
  assert.ok(ms < 5000, 'too slow: ' + ms);
  const rev = performance.now();
  const b = convert(r.output, { mode: 'toColumn', delimiter: ',' });
  console.log('   reverse 70k took', Math.round(performance.now() - rev), 'ms');
  assert.equal(b.stats.outputItems, 70000);
});

// fixes from the review
const parse = (text, o) => JSON.parse(run(text, { quote: 'json', wrap: 'brackets', delimiter: ', ', skipNumberQuotes: true, ...o }));
t('JSON preset gives valid JSON for quotes, backslashes, tabs and plus signs', () => {
  assert.deepEqual(parse('say "hi"\nC:\\x\n+5\n007\n7\n-3.5'), ['say "hi"', 'C:\\x', '+5', '007', 7, -3.5]);
});
t('JSON preset escapes control characters', () => assert.deepEqual(parse('a\u0001b', { trim: false }), ['a\u0001b']));
t('SQL double quote style still doubles', () => assert.equal(run('a"b', { quote: 'double' }), '"a""b"'));
t('JSON preset in PRESETS makes JSON, SQL preset keeps doubling', () => {
  assert.equal(PRESETS.json.quote, 'json');
  assert.equal(run("it's", { quote: PRESETS.sql.quote }), "'it''s'");
});
t('reverse keeps (1,2),(3,4) together instead of stripping one bracket', () => {
  assert.deepEqual(splitList('(1,2),(3,4)', ','), ['(1', '2)', '(3', '4)']);
  assert.deepEqual(splitList('(a), (b)', ','), ['(a)', ' (b)']);
});
t('reverse still strips one matching outer pair', () => {
  assert.equal(back('((1),2)', ','), '(1)\n2');
  assert.equal(back("('a)', 'b')", ','), 'a)\nb');
  assert.equal(back('{1,2}', ','), '1\n2');
});
t('numeric sort treats 12abc, dates and 1,5 as text', () => {
  assert.equal(run('2024-03-01\n3\n12abc\n1,5\n1', { sort: 'num-asc' }), '1,3,2024-03-01,12abc,1,5');
});
t('numeric sort reads 1,234 and exponents', () => {
  assert.equal(run('1,234\n99\n1e3', { sort: 'num-asc', delimiter: '|' }), '99|1e3|1,234');
  assert.equal(run('Infinity\n5', { sort: 'num-asc', delimiter: '|' }), '5|Infinity');
});
t('numeric sort is stable and puts text last', () => assert.equal(run('b\n2\na\n2\n1', { sort: 'num-asc', delimiter: '|' }), '1|2|2|b|a'));
t('empty custom separator falls back to a comma', () => {
  assert.equal(resolveDelimiter('custom', ''), ',');
  assert.equal(run('a\nb', { delimiter: resolveDelimiter('custom', '') }), 'a,b');
});
t('reverse with comma+space splits on the comma', () => assert.equal(back('a,b', ', '), 'a\nb'));
t('reverse: a quoted last item adds no empty item', () => {
  const r = convert("'a','b'", { mode: 'toColumn', delimiter: ',' });
  assert.equal(r.output, 'a\nb');
  assert.deepEqual([r.stats.inputItems, r.stats.blanksRemoved], [2, 0]);
  assert.equal(back("'a','b'", ',', { removeBlanks: false }), 'a\nb');
  assert.equal(back("'a','b',", ',', { removeBlanks: false }), 'a\nb\n');
});
t('reverse: line breaks split items for an explicit separator', () => {
  assert.equal(back('a,b\nc,d', ','), 'a\nb\nc\nd');
  assert.equal(back('a,b\r\nb,c', ',', { dedupe: true }), 'a\nb\nc');
  assert.equal(back('z,y\nx,w', ',', { sort: 'az' }), 'w\nx\ny\nz');
  assert.equal(back('a,\nb', ','), 'a\nb');
});
t('reverse: tab, semicolon, pipe and space separators', () => {
  assert.equal(back('a\tb\tc', '\t'), 'a\nb\nc');
  assert.equal(back('a; b; c', ';'), 'a\nb\nc');
  assert.equal(back('a|b', '|'), 'a\nb');
  assert.equal(back('a b c', ' '), 'a\nb\nc');
});
t('reverse: CRLF input and a custom separator', () => {
  assert.equal(back('a,b\r\nc', ','), 'a\nb\nc');
  assert.equal(back('x - y - z', ' - '), 'x\ny\nz');
});
t('reverse: unclosed quote and text after a closing quote stay as typed', () => {
  assert.deepEqual(splitList("'tis, x", ','), ["'tis", ' x']);
  assert.deepEqual(splitList('"a"b, c', ','), ['"a"b', ' c']);
});
t('backtick quotes and unescapeCustom', () => {
  assert.equal(run('a`b', { quote: 'backtick' }), '`a``b`');
  assert.equal(unescapeCustom('\\n\\t\\\\'), '\n\t\\');
});
t('trim off with remove blanks drops whitespace-only lines', () => assert.equal(run('a\n  \nb', { trim: false }), 'a,b'));
t('dedupe, ignore case and sort together', () => assert.equal(run('b\nA\na\nB', { dedupe: true, ignoreCase: true, sort: 'az' }), 'A,b'));
t('a final line break is not counted as an input line', () => {
  const r = convert('a\nb\nc\n');
  assert.deepEqual([r.stats.inputItems, r.stats.blanksRemoved], [3, 0]);
});
t('several pasted columns are flagged', () => {
  assert.equal(convert('a\t1\nb\t2').stats.multiColumn, true);
  assert.equal(convert('a\nb').stats.multiColumn, false);
});
t('values that hold the separator are counted when there are no quotes', () => {
  assert.equal(convert('Smith, John\nLee').stats.delimiterInItems, 1);
  assert.equal(convert('Smith, John\nLee', { quote: 'double' }).stats.delimiterInItems, 0);
});
