import assert from 'node:assert/strict';
import { convert, splitList, resolveDelimiter, isNumber } from '../src/lib/convert.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };
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
  assert.deepEqual(r.stats, { inputItems: 5, blanksRemoved: 2, duplicatesRemoved: 1, outputItems: 2 });
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
  assert.ok(ms < 2000, 'too slow: ' + ms);
  const rev = performance.now();
  const b = convert(r.output, { mode: 'toColumn', delimiter: ',' });
  console.log('   reverse 70k took', Math.round(performance.now() - rev), 'ms');
  assert.equal(b.stats.outputItems, 70000);
});

console.log(`\n${n} tests passed`);
