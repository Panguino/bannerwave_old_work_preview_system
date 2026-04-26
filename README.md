# bannerwave_old_work_preview_system

Static **HTML5 banner** previews for BannerWave, powered by [Astro](https://astro.build/) and deployed on **Vercel**.

See **[PLAN.md](./PLAN.md)** for architecture, folder layout, and roadmap.

## Local setup

```bash
npm install
cp .env.example .env
```

Generate a bcrypt password hash and fill `.env`:

```bash
npm run hash-password -- "your-secret-password"
```

Set `PREVIEW_ADMIN_PASSWORD_HASH` to the printed hash, `PREVIEW_SESSION_SECRET` to a long random string (32+ characters), and `PREVIEW_ADMIN_USER` to `BannerWave` (or your chosen username).

```bash
npm run dev
```

- **Home:** [http://localhost:4321/](http://localhost:4321/)
- **Admin login:** [http://localhost:4321/admin/login](http://localhost:4321/admin/login)
- **Public previews:** [FedEx](http://localhost:4321/p/fedex/) · [Apple Watch](http://localhost:4321/p/apple-watch/)

## Audit local sources

Point at your local banners folder (defaults to `C:\Users\brad\Desktop\Banners`):

```bash
npm run audit:banners
```

Writes **`docs/banner-inventory.md`**: every directory with an `index.html`, suggested import slug, inferred size, JPG count, heuristic fallback file guess, asset counts, and folder size.

```bash
node scripts/audit-banners.mjs "D:\other\banners" "./docs/custom-inventory.md"
```

## Banners in the repo

Each banner lives under `public/banners/<id>/` with `index.html` (and assets). Optional `fallback.jpg` for grid thumbnails; set `"hasFallback": true` in `src/data/banners.json` when that file exists.

## Build

```bash
npm run build
```

## Vercel

Connect the GitHub repo, set the same environment variables as `.env.example`, and deploy. Use Node 20+.
