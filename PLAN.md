# BannerWave Old Work — Preview System

Internal + client-facing preview for archived HTML5 banners. Stack: **Astro** on **Vercel**. Banners ship as **static files** in the repo (`public/banners/...`) with a **JSON index** (no database).

---

## Goals

1. **Public homepage** (`/`) — Dark UI aligned with [bannerwave.com](https://bannerwave.com); explains this is a work preview; CTA back to the main site for accidental visitors.
2. **Admin** — `/admin` grid and `/admin/[id]` detail require login. **Username:** `BannerWave` (env). **Password:** bcrypt hash in env. Session: signed HTTP-only cookie (short TTL, e.g. 7 days).
3. **Public banner preview** (`/p/[id]/`) — Minimal chrome; **iframe** pointing at `/banners/<id>/index.html`. No login.
4. **Public login page** (`/admin/login`) — Public (form only); successful login redirects to `/admin`.

---

## On-disk layout (canonical)

```
public/banners/<banner-id>/
  index.html          # entry for iframe (relative asset paths OK)
  ...assets...        # js, css, images, etc.
  fallback.jpg        # optional; grid preview uses JPG at true aspect ratio
```

- **`banner-id`:** Slug (guessable URLs are acceptable).
- **Missing `fallback.jpg`:** Grid shows a **dimension placeholder** until added.

---

## Index data (`src/data/banners.json`)

Single source of truth. Example shape per entry:

| Field | Purpose |
|--------|--------|
| `id` | Slug; matches folder under `public/banners/` |
| `name` | Display name |
| `width`, `height` | Numbers (px) |
| `keywords` | `string[]` free-form (merge in suggested keywords after review) |
| `suggestedKeywords` | optional; filled by import/audit scripts |
| `status` | `pending` \| `ready` \| `broken` |
| `source` | optional: `desktop` \| `animere` \| … |
| `notes` | optional internal string |

**Checklist workflow:** JSON is canonical. Regenerate `docs/banner-inventory.md` from JSON + disk via `npm run inventory:md` (to be added when audit script lands).

---

## Auth & env (Vercel)

Set in Vercel project settings (and local `.env`):

```env
PREVIEW_ADMIN_USER=BannerWave
PREVIEW_ADMIN_PASSWORD_HASH=<bcrypt hash>
PREVIEW_SESSION_SECRET=<long random string>
```

Generate password hash:

```bash
node scripts/hash-password.mjs "your-plain-password"
```

---

## Routes

| Path | Access |
|------|--------|
| `/` | Public — marketing / redirect |
| `/admin/login` | Public — login form |
| `/admin` | Auth — grid |
| `/admin/[id]` | Auth — detail, copy link, open |
| `/p/[id]/` | Public — iframe-only style preview |
| `/api/auth/login` | POST — form or JSON |
| `/api/auth/logout` | POST — clear session |
| `/banners/...` | Static files |

---

## Sourcing banners

1. **Primary:** Copy from local folders (e.g. Desktop `Banners`) into `public/banners/<id>/` using an import script (one-at-a-time QA).
2. **Animere / Banner-Portal:** Repo at `C:\Projects\Bannerwave\BW_Banner_Builder\Banner-Portal-Nextjs` — metadata in Postgres, builds on **S3**. Local Electron output also lands under `BW_Banner_Builder\electron-local-banners\` (paths and project folders **change often**; do not add that tree to the static audit — **search/copy from `…/<banner>/build/`** when importing).

**Audit phase (planned):** Script scans sources → **`docs/banner-inventory.md`** with suggested ids, dimensions, fallback detection, **suggested keywords** (from paths, HTML title/meta, light text heuristics). Import one-by-one; set `status` to `ready` after manual verify.

---

## Tech notes

- **Adapter:** `@astrojs/vercel` with `output: 'server'` so middleware + cookies work on deploy.
- **Password:** `bcryptjs` compare against `PREVIEW_ADMIN_PASSWORD_HASH`.
- **Session:** `jose` HS256 JWT in cookie `preview_session`.
- **File size:** Not tracked in this preview system.
- **VIDEO / STATIC:** Not in v1 unless we add a thin HTML wrapper; HTML5 iframe path is the default.

---

## Implementation checklist

- [x] Clone repo; Astro minimal + Vercel adapter (`output: 'server'`)
- [x] `PLAN.md` (this file)
- [x] `.env.example` + `scripts/hash-password.mjs`
- [x] Middleware: protect `/admin` except `/admin/login`
- [x] Login / logout API + JWT session cookie (`jose` + `bcryptjs`)
- [x] Homepage (brand-aligned), admin login, admin grid, admin detail, public `/p/[id]`
- [x] `src/data/banners.json` + types; sample unit `public/banners/sample-300x250/`
- [x] Audit script: `npm run audit:banners` → `docs/banner-inventory.md` (default: `Desktop\Banners`)
- [ ] Suggested keywords column / heuristics (optional pass on inventory)
- [ ] Import script: `import-banner` CLI → copy into repo + JSON row
- [ ] `npm run inventory:md` — regenerate checklist MD from JSON
- [ ] Animere/S3 import path (per separate instructions)
- [ ] Optional: Tailwind or richer admin UI polish
- [ ] Deploy to Vercel; set env vars

---

## Repo

Remote: `https://github.com/Panguino/bannerwave_old_work_preview_system`
