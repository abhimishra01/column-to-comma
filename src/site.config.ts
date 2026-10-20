// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
export default {
  name: 'Column to Comma',            // shown in header, title, footer
  domain: 'columntocommalist.com',    // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'column-to-comma', // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'column to comma separated list', // main keyword
  title: 'Column to Comma Separated List Converter (Free)', // home page <title>, under 60 characters
  description:
    'Paste a column from Excel, Sheets or SQL and get a comma separated list at once. Add quotes, remove duplicates, sort. Free, private, no sign-up.', // under 155 characters
  email: 'hello@columntocommalist.com', // contact email (shown on Contact and Privacy pages)
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#0f766e',                   // brand color (hex)
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: '/og.png',                 // 1200x630 file in public/
  category: 'UtilitiesApplication',   // schema.org applicationCategory
  owner: 'Column to Comma',           // name used in legal pages (person or business)
};
