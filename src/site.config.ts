// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
// SITE_MODE=bingemind builds the public copy at bingemind.com/<slug>/.
const bingemind = process.env.SITE_MODE === 'bingemind';
export default {
  name: 'Column to Comma',            // shown in header, title, footer
  domain: 'bingemind.com/column-to-comma',   // canonical host + path, no https://. Sites live at bingemind.com/<slug>/    // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'column-to-comma', // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'column to comma separated list', // main keyword
  title: 'Column to Comma Separated List Converter (Free)', // home page <title>, under 60 characters
  description:
    'Convert a column to a comma separated list or CSV row. Paste from Excel, Sheets or SQL. Add quotes, remove duplicates, sort. Free and private.', // under 155 characters
  email: 'hello@columntocommalist.com',
  // Bingemind build (SITE_MODE=bingemind): owner is Bingemind, contact goes to the Bingemind contact section (no invented email).
  bingemind,
  contactHref: bingemind ? 'https://bingemind.com/#contact' : 'mailto:' + 'hello@columntocommalist.com',
  contactLabel: bingemind ? 'bingemind.com/#contact' : 'hello@columntocommalist.com',
  contactLead: bingemind ? 'Contact:' : 'Email:', // contact email (shown on Contact and Privacy pages)
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#0f766e',                   // brand color (hex)
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: '/og.png',                 // 1200x630 file in public/
  category: 'UtilitiesApplication',   // schema.org applicationCategory
  owner: bingemind ? 'Bingemind (Abhishek Mishra)' : 'Column to Comma',           // name used in legal pages (person or business)
};
