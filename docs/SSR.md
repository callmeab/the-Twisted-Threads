Angular Universal (SSR) — Quick Setup

This project can gain SEO benefits from server-side rendering using Angular Universal. Recommended steps:

1. Install the Universal schematic and required packages:

```bash
ng add @nguniversal/express-engine
```

2. Follow the schematic prompts to generate server app and Express server. This will add `server.ts` and `main.server.ts`.

3. Update build scripts in `package.json`:

```json
"build:ssr": "ng run the-twisted-threads:server:production",
"serve:ssr": "node dist/server/main.js"
```

4. Ensure dynamic meta updates (we added `SeoService`) run on the server by avoiding direct `window` usage. Use `isPlatformBrowser` where appropriate.

5. Generate the sitemap after building or during CI using `npm run generate:sitemap`.

Notes:
- You may need to move certain DOM-dependent calls (like document.head manipulations) behind `isPlatformBrowser` checks or use `APP_ID` and TransferState for hydration.
- Test using `curl` to verify rendered HTML contains meta tags and JSON-LD.
