# 🕌 Majelis Taklim — Aplikasi PWA

Aplikasi web Progressive Web App untuk Majelis Taklim. Ringan, cepat, dapat diinstall di Android maupun desktop, dan bisa digunakan **tanpa login** untuk fitur umum.

## ✨ Fitur

| Fitur | Publik | Admin |
|-------|--------|-------|
| 📖 Bacaan (Tawasul, Tahlil, Istighotsah, Yasin, Doa) | ✅ | ✅ |
| 📅 Jadwal Kegiatan | ✅ | ✅ |
| 📢 Pengumuman | ✅ | ✅ |
| 🏠 Dashboard statistik | ✅ | ✅ |
| 👥 Kelola Jamaah | ❌ | ✅ |
| ✅ Absensi Kegiatan | ❌ | ✅ |
| 💰 Iuran PKK & Kegiatan | ❌ | ✅ |
| 🎯 Spinner Giliran | ❌ | ✅ |
| 📊 Laporan & Export CSV | ❌ | ✅ |
| ⚙️ Kelola Pengumuman | ❌ | ✅ |

## 🚀 Quick Start

```bash
# 1. Pastikan Node.js 18+ dan wrangler terinstall
npm install -g wrangler

# 2. Jalankan setup otomatis
bash setup.sh
```

## 📁 Struktur

```
majelis-taklim/
├── setup.sh                    ← Script setup otomatis
├── migrations/
│   ├── 0001_init.sql           ← Schema database
│   └── 0002_seed_sample.sql    ← Data contoh
├── workers/                    ← Backend (Cloudflare Workers)
│   ├── wrangler.toml
│   ├── package.json
│   └── src/
│       ├── index.js            ← Entry point
│       ├── routes/
│       │   ├── auth.js         ← Login
│       │   ├── jamaah.js       ← Data jamaah
│       │   ├── iuran.js        ← Iuran & tunggakan
│       │   ├── spinner.js      ← Giliran & fase
│       │   ├── admin.js        ← Laporan CSV, pengumuman, ganti password
│       │   └── other.js        ← Dashboard, bacaan, jadwal, kehadiran
│       └── utils/
│           └── helpers.js      ← JWT, hash, response
└── pages/public/               ← Frontend (Cloudflare Pages)
    ├── index.html              ← Single-file PWA
    ├── manifest.json           ← PWA config
    ├── sw.js                   ← Service Worker (offline)
    ├── _headers                ← Cache & security headers
    ├── _redirects              ← SPA routing + API proxy
    └── bacaan/data.js          ← Data bacaan lengkap
```

## 🔐 Akses

**Pengguna Umum** — tidak perlu login:
- Buka URL aplikasi, langsung bisa baca dan lihat jadwal

**Admin** — login via tombol 🔑 di pojok kanan atas:
- Username: `admin` | Password: `admin123`
- ⚠️ Ganti password segera di menu ⚙️ Setting

## 📡 API Publik

```
GET /api/dashboard       → Statistik & jadwal terdekat
GET /api/bacaan          → Daftar bacaan
GET /api/bacaan/:slug    → Konten bacaan
GET /api/jadwal          → Jadwal kegiatan
GET /api/pengumuman      → Pengumuman aktif
```

## 📋 API Admin (perlu Bearer token)

```
GET/POST   /api/jamaah
GET/POST   /api/iuran
POST       /api/kehadiran
POST       /api/spinner/putar
GET        /api/laporan/iuran?periode=2025-01&format=csv
GET        /api/laporan/kehadiran?bulan=2025-01&format=csv
GET        /api/laporan/jamaah?format=csv
```

## 📖 Dokumentasi Lengkap

Lihat [docs/INSTALL.md](docs/INSTALL.md)
