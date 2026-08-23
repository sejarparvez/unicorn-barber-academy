# logo assets — intentionally duplicated

The same two images exist in two places **on purpose**:

| File | Consumed by | Why |
|------|-------------|-----|
| `public/logo.png`, `public/banner.png` | `<img>`/og tags via absolute URL (`${SITE_URL}/logo.png`) | Open-Graph (`__root.tsx` og:image) and JSON-LD (`about.tsx` Organization logo) need stable, un-hashed URLs that crawlers can fetch |
| `src/assets/logo/logo.png` (imported) | `header/`, `footer/`, `site/auth.tsx` via bundler import | Bundler imports get content hashing + build-time existence checks for in-page UI |

If you replace the brand assets, update **both** locations and keep the
hashes identical. Do not "clean up" one side without migrating its consumers.
