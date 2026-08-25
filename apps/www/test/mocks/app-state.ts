/*
 * vitest mock for $app/state (docs-nav-filter spec): the components
 * under test only read page.url.pathname — a static URL stands in.
 */
export const page = {
  url: new URL('http://localhost/docs.html'),
};
