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

const QUOTES = { none: '', single: "'", double: '"', backtick: '`' };
const WRAPS = { none: ['', ''], parens: ['(', ')'], brackets: ['[', ']'], braces: ['{', '}'] };

export function unescapeCustom(s) {
  return s.replace(/\\(n|t|r|\\)/g, (_, c) => ({ n: '\n', t: '\t', r: '\r', '\\': '\\' }[c]));
}

// name: key of DELIMITERS, 'custom' or 'auto'. Returns the delimiter text, or null for auto.
export function resolveDelimiter(name, custom = '') {
  if (name === 'auto') return null;
  if (name === 'custom') return unescapeCustom(custom);
  return DELIMITERS[name] ?? ',';
}

const NUMBER = /^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?$/;
export const isNumber = (s) => NUMBER.test(s);

// Split a pasted column into lines. Handles \n, \r\n and a lone \r (old Mac Excel).
export function splitLines(text) {
  return text.split(/\r\n|\n|\r/);
}

// Split a delimited list into items. Quoted items may contain the delimiter.
// delim === null means auto: comma, semicolon, pipe, tab or line break.
export function splitList(text, delim) {
  const auto = delim === null;
  const isAt = (i) => {
    if (auto) {
      const c = text[i];
      return c === ',' || c === ';' || c === '|' || c === '\t' || c === '\n' || c === '\r' ? 1 : 0;
    }
    return delim && text.startsWith(delim, i) ? delim.length : 0;
  };
  if (!auto && !delim) return splitLines(text);
  let s = text.trim();
  const a = s[0], b = s[s.length - 1];
  if (s.length > 1 && ((a === '(' && b === ')') || (a === '[' && b === ']') || (a === '{' && b === '}'))) {
    s = s.slice(1, -1);
  }
  text = s;
  const items = [];
  let cur = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if ((c === "'" || c === '"' || c === '`') && cur.trim() === '') {
      // quoted item: read to the closing quote; a doubled quote is one literal quote
      let j = i + 1, val = '';
      let closed = false;
      while (j < text.length) {
        if (text[j] === c) {
          if (text[j + 1] === c) { val += c; j += 2; continue; }
          closed = true; j++; break;
        }
        val += text[j++];
      }
      if (closed) {
        // skip spaces up to the next delimiter
        let k = j;
        while (k < text.length && (text[k] === ' ') && !isAt(k)) k++;
        if (k >= text.length || isAt(k)) {
          items.push(val);
          i = k;
          cur = '';
          const n = isAt(i);
          if (n) { i += n; if (i >= text.length) items.push(''); }
          continue;
        }
      }
    }
    const n = isAt(i);
    if (n) {
      // collapse runs of line breaks in auto mode, so "a,\nb" gives a and b
      items.push(cur);
      cur = '';
      i += n;
      if (auto) {
        while (i < text.length && (text[i] === '\n' || text[i] === '\r') ) i++;
      }
      continue;
    }
    cur += c;
    i++;
  }
  items.push(cur);
  return items;
}

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function sortItems(items, how) {
  if (how === 'az') return items.sort((x, y) => collator.compare(x, y) || (x < y ? -1 : x > y ? 1 : 0));
  if (how === 'za') return items.sort((x, y) => collator.compare(y, x) || (x < y ? 1 : x > y ? -1 : 0));
  if (how === 'num-asc' || how === 'num-desc') {
    const dir = how === 'num-asc' ? 1 : -1;
    const keyed = items.map((v, i) => {
      const n = parseFloat(v.trim().replace(/,/g, ''));
      return { v, i, n: Number.isNaN(n) ? null : n };
    });
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
 * opts: mode 'toList' | 'toColumn', delimiter (string or null for auto), quote, skipNumberQuotes,
 *       trim, removeBlanks, dedupe, ignoreCase, sort, wrap
 * Returns { output, stats: { inputItems, blanksRemoved, duplicatesRemoved, outputItems } }
 */
export function convert(text, opts = {}) {
  const o = {
    mode: 'toList', delimiter: ',', quote: 'none', skipNumberQuotes: false,
    trim: true, removeBlanks: true, dedupe: false, ignoreCase: false, sort: 'none', wrap: 'none',
    ...opts,
  };
  const stats = { inputItems: 0, blanksRemoved: 0, duplicatesRemoved: 0, outputItems: 0 };
  if (!text) return { output: '', stats };

  let items = o.mode === 'toColumn' ? splitList(text, o.delimiter) : splitLines(text);
  stats.inputItems = items.length;

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
  if (q) {
    const re = new RegExp(q.replace(/[`'"]/g, '\\$&'), 'g');
    items = items.map((s) => (o.skipNumberQuotes && isNumber(s) ? s : q + s.replace(re, q + q) + q));
  }
  const [open, close] = WRAPS[o.wrap] ?? WRAPS.none;
  const delim = o.delimiter ?? ',';
  return { output: open + items.join(delim) + close, stats };
}
