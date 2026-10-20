// Core logic for Column to Comma. Pure functions, no DOM, so node can test them.

export const DELIMITERS = {
  comma: ',',
  'comma-space': ', ',
  semicolon: ';',
  pipe: '|',
  newline: '\n',
  tab: '\t',
  space: ' ',
};

// 'json' is a double quote with JSON escaping (backslash); the others double the quote, the SQL and CSV way.
const QUOTES = { none: '', single: "'", double: '"', backtick: '`', json: '"' };
const WRAPS = { none: ['', ''], parens: ['(', ')'], brackets: ['[', ']'], braces: ['{', '}'] };

export function unescapeCustom(s) {
  return s.replace(/\\(n|t|r|\\)/g, (_, c) => ({ n: '\n', t: '\t', r: '\r', '\\': '\\' }[c]));
}

// Quick settings used by the buttons above the tool. Keys match the option names in convert().
export const PRESETS = {
  comma: { delimiter: 'comma', quote: 'none', wrap: 'none', skipNumberQuotes: false },
  sql: { delimiter: 'comma-space', quote: 'single', wrap: 'parens', skipNumberQuotes: true },
  json: { delimiter: 'comma-space', quote: 'json', wrap: 'brackets', skipNumberQuotes: true },
  csv: { delimiter: 'comma', quote: 'double', wrap: 'none', skipNumberQuotes: false },
};

// name: key of DELIMITERS, 'custom' or 'auto'. Returns the delimiter text, or null for auto.
// An empty custom text falls back to a comma, so the output never loses its separators.
export function resolveDelimiter(name, custom = '') {
  if (name === 'auto') return null;
  if (name === 'custom') return unescapeCustom(custom) || ',';
  return DELIMITERS[name] ?? ',';
}

// Bare numbers for "Do not quote numbers". Leading zeros (007) stay quoted.
const NUMBER = /^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?$/;
export const isNumber = (s) => NUMBER.test(s);
// A bare JSON number: no plus sign, no leading zeros.
const JSON_NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

// Number sort accepts plain numbers and 1,234 style thousands. 12abc, 1,5, dates and Infinity are text.
const SORT_NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
const THOUSANDS = /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;
function sortNumber(v) {
  const t = v.trim();
  if (THOUSANDS.test(t)) return parseFloat(t.replace(/,/g, ''));
  return SORT_NUMBER.test(t) ? parseFloat(t) : null;
}

const jsonEscape = (s) =>
  s.replace(/[\\"\u0000-\u001f]/g, (c) =>
    ({ '\\': '\\\\', '"': '\\"', '\n': '\\n', '\r': '\\r', '\t': '\\t' }[c] ?? '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')));

// Split a pasted column into lines. Handles \n, \r\n and a lone \r (old Mac Excel).
export function splitLines(text) {
  return text.split(/\r\n|\n|\r/);
}

const CLOSERS = { '(': ')', '[': ']', '{': '}' };

// True when the first and last characters are one matching pair, such as ( ... ).
// "(1,2),(3,4)" is not one pair: the first bracket closes before the end.
function isOuterPair(s) {
  const open = s[0];
  const close = CLOSERS[open];
  if (!close || s.length < 2 || s[s.length - 1] !== close) return false;
  let depth = 0;
  let quote = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === quote) quote = ''; continue; }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return i === s.length - 1;
  }
  return false;
}

// Split a delimited list into items. Quoted items may contain the delimiter.
// delim === null means auto: comma, semicolon, pipe, tab or line break.
// A line break also ends an item for every delimiter, so a list wrapped over several lines works.
export function splitList(text, delim) {
  const auto = delim === null;
  if (!auto && !delim) return splitLines(text);
  // Length of the separator that starts at position i, or 0 when there is none.
  const delimLengthAt = (i) => {
    const c = text[i];
    if (c === '\n' || c === '\r') return 1;
    if (auto) return c === ',' || c === ';' || c === '|' || c === '\t' ? 1 : 0;
    return text.startsWith(delim, i) ? delim.length : 0;
  };
  const skipLineBreaks = (i) => {
    while (i < text.length && (text[i] === '\n' || text[i] === '\r')) i++;
    return i;
  };
  let body = text.trim();
  if (isOuterPair(body)) body = body.slice(1, -1);
  text = body;
  const items = [];
  let cur = '';
  let endedOnQuote = false; // the text ended right after a closed quoted item: no empty item follows
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    endedOnQuote = false;
    if ((c === "'" || c === '"' || c === '`') && cur.trim() === '') {
      // quoted item: read to the closing quote; a doubled quote is one literal quote
      let pos = i + 1, val = '';
      let closed = false;
      while (pos < text.length) {
        if (text[pos] === c) {
          if (text[pos + 1] === c) { val += c; pos += 2; continue; }
          closed = true; pos++; break;
        }
        val += text[pos++];
      }
      if (closed) {
        // skip spaces up to the next separator
        let k = pos;
        while (k < text.length && text[k] === ' ' && !delimLengthAt(k)) k++;
        if (k >= text.length || delimLengthAt(k)) {
          items.push(val);
          cur = '';
          i = k;
          const len = delimLengthAt(i);
          if (len) i = skipLineBreaks(i + len);
          else endedOnQuote = true;
          continue;
        }
      }
    }
    const len = delimLengthAt(i);
    if (len) {
      // line breaks right after a separator collapse, so "a,\nb" gives a and b
      items.push(cur);
      cur = '';
      i = skipLineBreaks(i + len);
      continue;
    }
    cur += c;
    i++;
  }
  if (!endedOnQuote) items.push(cur);
  return items;
}

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function sortItems(items, how) {
  if (how === 'az') return items.sort((x, y) => collator.compare(x, y) || (x < y ? -1 : x > y ? 1 : 0));
  if (how === 'za') return items.sort((x, y) => collator.compare(y, x) || (x < y ? 1 : x > y ? -1 : 0));
  if (how === 'num-asc' || how === 'num-desc') {
    const dir = how === 'num-asc' ? 1 : -1;
    const keyed = items.map((v, i) => ({ v, i, n: sortNumber(v) }));
    keyed.sort((p, q) => {
      if (p.n === null && q.n === null) return p.i - q.i;
      if (p.n === null) return 1;
      if (q.n === null) return -1;
      return (p.n - q.n) * dir || p.i - q.i;
    });
    return keyed.map((k) => k.v);
  }
  return items;
}

/**
 * Convert text.
 * opts:
 *   mode            'toList' (column to list) | 'toColumn' (list to column)
 *   delimiter       separator text; null means auto-detect (toColumn only)
 *   quote           none | single | double | backtick | json (double quotes, JSON escaping)
 *   skipNumberQuotes  leave bare numbers unquoted
 *   trim, removeBlanks, dedupe, ignoreCase  booleans
 *   sort            none | az | za | num-asc | num-desc
 *   wrap            none | parens | brackets | braces
 * Returns { output, stats }. stats: inputItems, blanksRemoved, duplicatesRemoved, outputItems,
 *   multiColumn (most lines hold a tab: several columns were pasted),
 *   delimiterInItems (items that contain the separator but have no quotes around them).
 */
export function convert(text, opts = {}) {
  const o = {
    mode: 'toList', delimiter: ',', quote: 'none', skipNumberQuotes: false,
    trim: true, removeBlanks: true, dedupe: false, ignoreCase: false, sort: 'none', wrap: 'none',
    ...opts,
  };
  const stats = { inputItems: 0, blanksRemoved: 0, duplicatesRemoved: 0, outputItems: 0, multiColumn: false, delimiterInItems: 0 };
  if (!text) return { output: '', stats };

  // In reverse mode ", " splits like ",": trimming removes the space.
  const splitOn = o.delimiter === ', ' ? ',' : o.delimiter;
  let items = o.mode === 'toColumn' ? splitList(text, splitOn) : splitLines(text);
  // Excel and Sheets end every copy with a line break. That is not a line the user typed.
  if (o.mode === 'toList' && items.length > 1 && items[items.length - 1] === '') items.pop();
  stats.inputItems = items.length;
  if (o.mode === 'toList') {
    const filled = items.filter((s) => s.trim() !== '');
    stats.multiColumn = filled.length > 1 && filled.filter((s) => s.includes('\t')).length > filled.length / 2;
  }

  if (o.trim) {
    for (let i = 0; i < items.length; i++) items[i] = items[i].trim();
  }
  if (o.removeBlanks) {
    const before = items.length;
    items = items.filter((s) => (o.trim ? s : s.trim()) !== '');
    stats.blanksRemoved = before - items.length;
  }
  if (o.dedupe) {
    const seen = new Set();
    const before = items.length;
    const out = [];
    for (const s of items) {
      const k = o.ignoreCase ? s.toLowerCase() : s;
      if (!seen.has(k)) { seen.add(k); out.push(s); }
    }
    items = out;
    stats.duplicatesRemoved = before - items.length;
  }
  items = sortItems(items, o.sort);
  stats.outputItems = items.length;
  if (items.length === 0) return { output: '', stats };

  if (o.mode === 'toColumn') return { output: items.join('\n'), stats };

  const q = QUOTES[o.quote] ?? '';
  const delim = o.delimiter ?? ',';
  if (!q && delim.trim() && delim !== '\n') stats.delimiterInItems = items.filter((s) => s.includes(delim.trim())).length;
  if (q) {
    const isJson = o.quote === 'json';
    const bare = isJson ? (s) => JSON_NUMBER.test(s) : isNumber;
    const escape = isJson ? jsonEscape : (s) => s.replaceAll(q, q + q);
    items = items.map((s) => (o.skipNumberQuotes && bare(s) ? s : q + escape(s) + q));
  }
  const [open, close] = WRAPS[o.wrap] ?? WRAPS.none;
  return { output: open + items.join(delim) + close, stats };
}
