# Majelis Taklim Frontend

Sistem Manajemen Majelis Taklim — frontend modern berbasis React + Vite.

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- TanStack Query (data fetching & caching)
- React Router v7
- Axios + JWT interceptors
- PWA (vite-plugin-pwa)
- Dark Mode

## Instalasi

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```env
VITE_API_URL=https://majelis-taklim-api.mohammadbasuki31.workers.dev/api
```

## Build Production

```bash
npm run build
# Output: dist/
```

## Deploy Cloudflare Pages

### Via Wrangler CLI
```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name majelis-taklim-frontend
```

### Via Dashboard
1. Buka https://pages.cloudflare.com
2. Upload folder dist/
3. Set env var: VITE_API_URL

### Via Git
- Build command: npm run build
- Output dir: dist
- Env: VITE_API_URL

## Halaman Publik

| URL | Halaman |
|-----|---------|
| / | Dashboard: statistik, jadwal, pengumuman |
| /bacaan | Bacaan: Tawassul, Tahlil, Yasin, Istighatsah, Doa (Tab Arab/Latin/Terjemah) |
| /jadwal | Jadwal kegiatan |
| /pengumuman | Pengumuman aktif |

## Halaman Admin

| URL | Halaman |
|-----|---------|
| /admin/login | Login JWT |
| /admin | Dashboard admin |
| /admin/jamaah | CRUD Jamaah + search + pagination |
| /admin/iuran | CRUD Iuran + filter periode/jamaah |
| /admin/jenis-iuran | CRUD Jenis Iuran |
| /admin/kehadiran | Catat kehadiran + filter bulan |
| /admin/pengumuman | CRUD Pengumuman + prioritas |
| /admin/jadwal | CRUD Jadwal kegiatan |
| /admin/spinner | Roda putar animasi + fase + riwayat |

## Akun Admin Default

```
Username: admin
Password: admin123
```
