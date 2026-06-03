# 📖 Dokumentasi Instalasi & Deployment
## Aplikasi Majelis Taklim

---

## Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Struktur Folder](#struktur-folder)
3. [Setup Awal](#setup-awal)
4. [Database D1](#database-d1)
5. [Deploy Workers (Backend)](#deploy-workers)
6. [Deploy Pages (Frontend)](#deploy-pages)
7. [Konfigurasi Domain](#konfigurasi-domain)
8. [Environment Variables & Secrets](#environment-variables--secrets)
9. [Update Aplikasi](#update-aplikasi)
10. [Akun Demo & Default](#akun-demo--default)
11. [Troubleshooting](#troubleshooting)
12. [Struktur API](#struktur-api)

---

## Prasyarat

| Tool | Versi Minimum | Cara Install |
|------|--------------|-------------|
| Node.js | 18+ | https://nodejs.org |
| Wrangler CLI | 3.x | `npm install -g wrangler` |
| Akun Cloudflare | Free tier cukup | https://cloudflare.com |
| Git | any | https://git-scm.com |

---

## Struktur Folder

```
majelis-taklim/
├── migrations/
│   └── 0001_init.sql          ← SQL schema + seed data
│
├── workers/                   ← Cloudflare Workers (Backend API)
│   ├── wrangler.toml          ← Konfigurasi Worker
│   ├── package.json
│   └── src/
│       ├── index.js           ← Entry point
│       ├── utils/
│       │   └── helpers.js     ← JWT, response, audit log
│       └── routes/
│           ├── auth.js        ← Login, register
│           ├── jamaah.js      ← CRUD jamaah
│           ├── iuran.js       ← Iuran & rekap
│           ├── spinner.js     ← Giliran & fase
│           └── other.js       ← Dashboard, bacaan, jadwal, kehadiran, pengumuman
│
├── pages/
│   └── public/                ← Cloudflare Pages (Frontend)
│       ├── index.html         ← Aplikasi utama (single file PWA)
│       ├── manifest.json      ← PWA manifest
│       ├── sw.js              ← Service Worker
│       ├── _headers           ← HTTP headers
│       ├── _redirects         ← SPA routing + API proxy
│       ├── icons/             ← Icon PWA (72,96,128,192,512 px)
│       ├── bacaan/
│       │   └── data.js        ← Data bacaan offline
│       └── screenshots/       ← Screenshot untuk install prompt
│
└── docs/
    └── INSTALL.md             ← File ini
```

---

## Setup Awal

### 1. Clone & Install

```bash
git clone https://github.com/USERNAME/majelis-taklim.git
cd majelis-taklim/workers
npm install
```

### 2. Login ke Cloudflare

```bash
wrangler login
# Browser akan terbuka → izinkan akses
```

---

## Database D1

### Langkah 1: Buat database

```bash
cd workers
npm run db:create
# Output: database_id = "xxxx-yyyy-zzzz"
```

### Langkah 2: Salin database_id ke wrangler.toml

Buka `workers/wrangler.toml`, ganti:
```toml
database_id = "ISI_SETELAH_d1_create"
```
Dengan nilai dari output langkah 1.

### Langkah 3: Jalankan migration

```bash
# Production
npm run db:migrate

# Development/local
npm run db:migrate:dev
```

Migration akan membuat semua tabel dan mengisi data contoh (5 jamaah, 3 jenis iuran, 6 bacaan).

---

## Deploy Workers

### Development (local)

```bash
cd workers
npm run dev
# API tersedia di: http://localhost:8787/api
```

### Production

```bash
# Set secrets dulu (WAJIB)
wrangler secret put JWT_SECRET
# Masukkan: string random panjang, contoh: "mt-2024-super-secret-xyz-abc-123"

wrangler secret put ADMIN_KEY
# Masukkan: kunci untuk registrasi admin, contoh: "majelis-admin-2024"

# Deploy
npm run deploy
# Output: https://majelis-taklim-api.SUBDOMAIN.workers.dev
```

---

## Deploy Pages

### Cara 1: Via Dashboard (Paling Mudah)

1. Buka https://dash.cloudflare.com
2. Masuk ke **Pages** → **Create a project**
3. Pilih **Upload assets** (tanpa Git jika tidak punya repo)
4. Upload seluruh isi folder `pages/public/`
5. Set **Production branch**: `main`
6. Klik **Deploy**

### Cara 2: Via Wrangler CLI

```bash
# Install wrangler di root project
npm install -g wrangler

# Deploy Pages
wrangler pages deploy pages/public --project-name=majelis-taklim
# Output: https://majelis-taklim.pages.dev
```

### Cara 3: Via Git (Continuous Deployment)

1. Push project ke GitHub/GitLab
2. Di Cloudflare Pages → Connect to Git
3. Set **Build command**: (kosong, tidak ada build)
4. Set **Build output directory**: `pages/public`
5. Simpan → auto-deploy setiap push

---

## Konfigurasi Domain

### Update `pages/public/_redirects`

Setelah dapat URL Worker, edit file `_redirects`:

```
/api/*  https://majelis-taklim-api.SUBDOMAIN_KAMU.workers.dev/api/:splat  200
/*      /index.html  200
```

Ganti `SUBDOMAIN_KAMU` dengan subdomain Workers Anda.

### Update API_BASE di index.html (jika perlu)

Di `pages/public/index.html`, cari baris:
```javascript
const API_BASE = window.location.origin + '/api';
```

Karena `_redirects` sudah mem-proxy `/api/*`, baris ini tidak perlu diubah.
Jika ingin hard-code:
```javascript
const API_BASE = 'https://majelis-taklim-api.SUBDOMAIN.workers.dev/api';
```

---

## Environment Variables & Secrets

### Secrets (via wrangler secret put)

| Nama | Deskripsi | Contoh Nilai |
|------|-----------|-------------|
| `JWT_SECRET` | Kunci untuk menandatangani JWT | String random 32+ karakter |
| `ADMIN_KEY` | Kunci untuk registrasi akun admin | String rahasia pilihan Anda |

```bash
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_KEY
```

### Vars (di wrangler.toml, boleh publik)

```toml
[vars]
ENVIRONMENT = "production"
```

---

## Update Aplikasi

### Update Backend

```bash
cd workers
# Edit kode...
npm run deploy
```

### Update Frontend

```bash
# Edit pages/public/index.html atau file lain...
wrangler pages deploy pages/public --project-name=majelis-taklim
```

### Update Database Schema

```bash
# Buat file migration baru: migrations/0002_update.sql
wrangler d1 execute majelis_taklim_db --file=../migrations/0002_update.sql
```

---

## Akun Demo & Default

Setelah migration berjalan, akun yang tersedia:

| Username | Password | Role |
|----------|----------|------|
| `admin`  | `admin123` | Admin |

> ⚠️ **PENTING**: Ganti password admin segera setelah deploy production!

Untuk mengganti password via API:
```bash
# Buat akun admin baru dengan password kuat
curl -X POST https://WORKER_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_baru",
    "password": "PasswordKuat123!",
    "role": "admin",
    "admin_key": "majelis-admin-2024"
  }'
```

Untuk menambahkan akun jamaah:
```bash
curl -X POST https://WORKER_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "siti_aminah",
    "password": "password123",
    "role": "jamaah",
    "jamaah_id": 2,
    "admin_key": "majelis-admin-2024"
  }'
```

---

## Troubleshooting

### Error: "D1 database not found"

```bash
# Pastikan database_id di wrangler.toml sudah benar
wrangler d1 list
# Salin ID yang sesuai ke wrangler.toml
```

### Error: "JWT Secret not set"

```bash
wrangler secret put JWT_SECRET
# Masukkan nilai secret
```

### Error: CORS di browser

Pastikan `_redirects` sudah menggunakan URL Worker yang benar.
Jika masih error, tambahkan domain Pages ke `corsHeaders` di `helpers.js`:
```javascript
'Access-Control-Allow-Origin': 'https://majelis-taklim.pages.dev',
```

### Service Worker tidak update

Ubah `CACHE_VERSION` di `sw.js`:
```javascript
const CACHE_VERSION = 'mt-v1.0.1'; // Naikkan versi
```
Kemudian re-deploy Pages.

### Login selalu gagal

Cek apakah password hash di database sesuai. Default hash dibuat dengan SHA-256 + salt.
Reset password via D1:
```bash
# Hitung hash baru
node -e "
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update('admin123majelis_salt').digest('base64');
console.log(hash);
"
# Lalu update di D1
wrangler d1 execute majelis_taklim_db \
  --command=\"UPDATE users SET password_hash='HASH_BARU' WHERE username='admin'\"
```

---

## Struktur API

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login → token JWT |
| POST | `/api/auth/register` | Daftar akun (butuh admin_key) |
| GET  | `/api/me` | Profil user login |

### Jamaah
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/jamaah` | List jamaah (`?status=aktif&q=nama`) |
| GET | `/api/jamaah/:id` | Detail jamaah |
| POST | `/api/jamaah` | Tambah jamaah (admin) |
| PUT | `/api/jamaah/:id` | Edit jamaah (admin) |
| DELETE | `/api/jamaah/:id` | Nonaktifkan jamaah (admin) |

### Bacaan
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/bacaan` | List semua bacaan |
| GET | `/api/bacaan/:slug` | Konten bacaan |
| PUT | `/api/bacaan/:slug` | Update konten (admin) |

### Jadwal
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/jadwal` | List jadwal (`?bulan=2025-01`) |
| POST | `/api/jadwal` | Tambah jadwal (admin) |
| PUT | `/api/jadwal/:id` | Edit jadwal (admin) |
| DELETE | `/api/jadwal/:id` | Batalkan jadwal (admin) |

### Kehadiran
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/kehadiran?jadwal_id=` | Daftar hadir per kegiatan |
| GET | `/api/kehadiran?jamaah_id=&bulan=` | Riwayat per jamaah |
| GET | `/api/kehadiran?bulan=` | Rekap bulanan |
| POST | `/api/kehadiran` | Simpan absensi batch (admin) |

### Iuran
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/iuran` | List pembayaran |
| GET | `/api/iuran/jenis` | Jenis iuran |
| GET | `/api/iuran/rekap?periode=` | Rekap bulanan |
| GET | `/api/iuran/tunggakan?periode=&jenis_iuran_id=` | Daftar belum bayar |
| POST | `/api/iuran` | Catat pembayaran (admin) |
| DELETE | `/api/iuran/:id` | Hapus pembayaran (admin) |

### Spinner Giliran
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/spinner/fase` | List semua fase |
| GET | `/api/spinner/fase/:id` | Detail fase + peserta + histori |
| POST | `/api/spinner/fase` | Buat fase baru (admin) |
| POST | `/api/spinner/putar` | Putar spinner (admin) |
| POST | `/api/spinner/priority` | Set prioritas peserta (admin) |
| POST | `/api/spinner/skip` | Skip peserta (admin) |
| POST | `/api/spinner/restore` | Kembalikan dari skip (admin) |

### Dashboard & Pengumuman
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard` | Statistik dashboard |
| GET | `/api/pengumuman` | List pengumuman aktif |
| POST | `/api/pengumuman` | Tambah pengumuman (admin) |
| DELETE | `/api/pengumuman/:id` | Hapus pengumuman (admin) |

---

## Fitur PWA

### Install ke Android
1. Buka URL aplikasi di Chrome
2. Tap ikon **Add to Home Screen** di menu browser
3. Aplikasi terinstall seperti native app

### Offline Mode
- Halaman utama, CSS, dan font ter-cache otomatis saat pertama buka
- Data bacaan (Tahlil, Yasin, dll) tersedia offline
- Jadwal dan pengumuman ter-cache 1 hari

### Push Notification
Implementasi push notification membutuhkan VAPID key:
```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Tambahkan ke Worker sebagai secret
wrangler secret put VAPID_PRIVATE_KEY
```

---

*Dokumentasi dibuat untuk Majelis Taklim v1.0.0*
*Cloudflare Workers + D1 + Pages*
