#!/bin/bash
# ============================================================
# Majelis Taklim — Script Setup Otomatis
# Jalankan: bash setup.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step()  { echo -e "\n${GREEN}══ $1 ══${NC}"; }

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Majelis Taklim — Setup Wizard      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Cek prasyarat ────────────────────────────────────────
step "Memeriksa prasyarat"

command -v node >/dev/null 2>&1 || error "Node.js tidak ditemukan. Install dari https://nodejs.org"
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
[ "$NODE_VER" -ge 18 ] || error "Node.js versi 18+ diperlukan (saat ini: $(node -v))"
info "Node.js $(node -v)"

command -v wrangler >/dev/null 2>&1 || {
  warn "Wrangler belum terinstal, menginstal..."
  npm install -g wrangler
}
info "Wrangler $(wrangler --version 2>/dev/null | head -1)"

# ── Install dependencies ─────────────────────────────────
step "Instalasi dependensi Workers"
cd workers
npm install
info "npm install selesai"
cd ..

# ── Login Cloudflare ─────────────────────────────────────
step "Login Cloudflare"
if ! wrangler whoami >/dev/null 2>&1; then
  warn "Belum login ke Cloudflare. Membuka browser..."
  wrangler login
fi
info "Login: $(wrangler whoami 2>/dev/null | grep -o 'You are logged in as.*' || echo 'OK')"

# ── Buat D1 database ─────────────────────────────────────
step "Membuat database D1"
echo ""
warn "Membuat database 'majelis_taklim_db'..."

DB_OUTPUT=$(cd workers && wrangler d1 create majelis_taklim_db 2>&1) || {
  if echo "$DB_OUTPUT" | grep -q "already exists"; then
    warn "Database sudah ada, lanjutkan..."
    DB_OUTPUT=$(cd workers && wrangler d1 list 2>&1)
  else
    echo "$DB_OUTPUT"
    error "Gagal membuat database"
  fi
}

# Ekstrak database_id
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
if [ -z "$DB_ID" ]; then
  DB_ID=$(echo "$DB_OUTPUT" | grep -o '[0-9a-f-]\{36\}' | head -1)
fi

if [ -z "$DB_ID" ]; then
  warn "Tidak bisa otomatis mendapatkan database_id."
  echo "Jalankan: wrangler d1 list"
  echo "Salin database_id ke workers/wrangler.toml"
  read -p "Masukkan database_id secara manual: " DB_ID
fi

info "Database ID: $DB_ID"

# Update wrangler.toml
sed -i.bak "s/database_id  = \"ISI_SETELAH_d1_create\"/database_id  = \"$DB_ID\"/" workers/wrangler.toml
info "wrangler.toml diperbarui"

# ── Jalankan migration ───────────────────────────────────
step "Menjalankan database migration"

info "Migration 1: Schema..."
cd workers && wrangler d1 execute majelis_taklim_db \
  --file=../migrations/0001_init.sql
info "Migration 1 selesai"

info "Migration 2: Data contoh..."
wrangler d1 execute majelis_taklim_db \
  --file=../migrations/0002_seed_sample.sql
info "Migration 2 selesai"
cd ..

# ── Set secrets ──────────────────────────────────────────
step "Konfigurasi secrets"

echo ""
warn "Anda perlu menetapkan 2 secret untuk keamanan:"
echo ""

# JWT Secret
echo -n "Masukkan JWT_SECRET (atau tekan Enter untuk generate otomatis): "
read JWT_VAL
if [ -z "$JWT_VAL" ]; then
  JWT_VAL=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  info "JWT_SECRET di-generate: $JWT_VAL"
fi
echo "$JWT_VAL" | cd workers && wrangler secret put JWT_SECRET
info "JWT_SECRET tersimpan"

# Admin Key
echo -n "Masukkan ADMIN_KEY untuk registrasi admin (atau Enter untuk default): "
read ADMIN_VAL
if [ -z "$ADMIN_VAL" ]; then
  ADMIN_VAL="majelis-admin-$(date +%Y)"
fi
echo "$ADMIN_VAL" | cd workers && wrangler secret put ADMIN_KEY
info "ADMIN_KEY tersimpan: $ADMIN_VAL"

# ── Deploy Workers ───────────────────────────────────────
step "Deploy Cloudflare Workers (Backend)"
cd workers && npm run deploy
WORKER_URL=$(wrangler deploy --dry-run 2>&1 | grep -o 'https://[^ ]*workers.dev' | head -1)
cd ..
info "Workers berhasil di-deploy!"

# ── Deploy Pages ─────────────────────────────────────────
step "Deploy Cloudflare Pages (Frontend)"

# Update _redirects dengan URL worker yang benar
if [ -n "$WORKER_URL" ]; then
  sed -i.bak "s|https://majelis-taklim-api.SUBDOMAIN_KAMU.workers.dev|$WORKER_URL|" \
    pages/public/_redirects
  info "_redirects diperbarui dengan URL: $WORKER_URL"
fi

wrangler pages deploy pages/public --project-name=majelis-taklim
info "Pages berhasil di-deploy!"

# ── Summary ──────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║            SETUP BERHASIL! 🎉                ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Frontend : https://majelis-taklim.pages.dev ║"
echo "║  Backend  : $WORKER_URL"
echo "║                                              ║"
echo "║  Login Admin:                                ║"
echo "║    Username : admin                          ║"
echo "║    Password : admin123                       ║"
echo "║                                              ║"
echo "║  ⚠️  SEGERA ganti password admin!            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
