// Links that work at the site root and under a base path (GitHub Pages serves the site at /column-to-comma/).
const root = import.meta.env.BASE_URL.replace(/\/$/, '');

// withBase('/about/') gives '/about/' on the domain and '/column-to-comma/about/' on GitHub Pages.
export const withBase = (path = '/') => `${root}/${path.replace(/^\//, '')}`;

// Page path without the base, for the canonical URL: '/column-to-comma/about/' gives '/about/'.
export const withoutBase = (pathname: string) => (root && pathname.startsWith(root) ? pathname.slice(root.length) || '/' : pathname);
