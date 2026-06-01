# Performance Budget

## Build budgets
Configured in `angular.json` for production builds:

- `initial` bundle: warning at `1.5MB`, error at `2MB`
- `allScript`: warning at `1.2MB`, error at `1.5MB`
- `anyComponentStyle`: warning at `15kB`, error at `30kB`

## Monitoring commands

- `npm run build` — production build with AOT, optimization, and Angular service worker enabled.
- Use browser Lighthouse or CLI tools against the deployed `dist/` output to monitor FCP, LCP, TBT, and PWA readiness.

## PWA assets
- `public/manifest.webmanifest`
- Angular service worker configuration in `ngsw-config.json`
- Preconnect and preload hints in `src/index.html`
