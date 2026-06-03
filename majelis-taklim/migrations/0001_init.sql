-- ============================================================
-- Majelis Taklim - D1 Database Migration
-- ============================================================

-- Users (login accounts)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'jamaah' CHECK(role IN ('admin','jamaah')),
  jamaah_id INTEGER REFERENCES jamaah(id),
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT,
  is_active INTEGER DEFAULT 1
);

-- Jamaah (members)
CREATE TABLE IF NOT EXISTS jamaah (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  nomor_hp TEXT,
  alamat TEXT,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','nonaktif')),
  tanggal_bergabung TEXT DEFAULT (date('now')),
  catatan TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Bacaan (readings)
CREATE TABLE IF NOT EXISTS bacaan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  judul TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  kategori TEXT NOT NULL CHECK(kategori IN ('tawasul','tahlil','istighotsah','yasin','doa_harian','doa_penutup')),
  konten_json TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Jadwal (schedule)
CREATE TABLE IF NOT EXISTS jadwal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  jenis TEXT NOT NULL CHECK(jenis IN ('mingguan','bulanan','tahunan','khusus')),
  tanggal TEXT NOT NULL,
  waktu_mulai TEXT,
  waktu_selesai TEXT,
  lokasi TEXT,
  penanggung_jawab TEXT,
  status TEXT DEFAULT 'aktif' CHECK(status IN ('aktif','batal','selesai')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Kehadiran (attendance)
CREATE TABLE IF NOT EXISTS kehadiran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jadwal_id INTEGER NOT NULL REFERENCES jadwal(id),
  jamaah_id INTEGER NOT NULL REFERENCES jamaah(id),
  status TEXT NOT NULL DEFAULT 'hadir' CHECK(status IN ('hadir','tidak_hadir','izin')),
  catatan TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(jadwal_id, jamaah_id)
);

-- Iuran types
CREATE TABLE IF NOT EXISTS jenis_iuran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL UNIQUE,
  nominal_default REAL DEFAULT 0,
  deskripsi TEXT,
  is_active INTEGER DEFAULT 1
);

-- Iuran payments
CREATE TABLE IF NOT EXISTS iuran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jamaah_id INTEGER NOT NULL REFERENCES jamaah(id),
  jenis_iuran_id INTEGER NOT NULL REFERENCES jenis_iuran(id),
  nominal REAL NOT NULL,
  tanggal_bayar TEXT NOT NULL,
  periode TEXT NOT NULL,
  keterangan TEXT,
  dicatat_oleh INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Fase giliran (lottery phases)
CREATE TABLE IF NOT EXISTS fase_giliran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','selesai')),
  created_at TEXT DEFAULT (datetime('now')),
  selesai_at TEXT
);

-- Peserta fase (phase participants)
CREATE TABLE IF NOT EXISTS peserta_fase (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fase_id INTEGER NOT NULL REFERENCES fase_giliran(id),
  jamaah_id INTEGER NOT NULL REFERENCES jamaah(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','selected','priority','skipped','inactive')),
  urutan_terpilih INTEGER,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(fase_id, jamaah_id)
);

-- Histori giliran (lottery history)
CREATE TABLE IF NOT EXISTS histori_giliran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fase_id INTEGER NOT NULL REFERENCES fase_giliran(id),
  jamaah_id INTEGER NOT NULL REFERENCES jamaah(id),
  putaran INTEGER NOT NULL,
  dipilih_pada TEXT DEFAULT (datetime('now')),
  dipilih_oleh INTEGER REFERENCES users(id)
);

-- Pengumuman (announcements)
CREATE TABLE IF NOT EXISTS pengumuman (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  prioritas TEXT DEFAULT 'normal' CHECK(prioritas IN ('rendah','normal','tinggi')),
  tanggal_mulai TEXT DEFAULT (date('now')),
  tanggal_selesai TEXT,
  dibuat_oleh INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  aksi TEXT NOT NULL,
  tabel TEXT,
  record_id INTEGER,
  detail TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_jamaah_status ON jamaah(status);
CREATE INDEX IF NOT EXISTS idx_kehadiran_jadwal ON kehadiran(jadwal_id);
CREATE INDEX IF NOT EXISTS idx_kehadiran_jamaah ON kehadiran(jamaah_id);
CREATE INDEX IF NOT EXISTS idx_iuran_jamaah ON iuran(jamaah_id);
CREATE INDEX IF NOT EXISTS idx_iuran_periode ON iuran(periode);
CREATE INDEX IF NOT EXISTS idx_peserta_fase ON peserta_fase(fase_id, status);
CREATE INDEX IF NOT EXISTS idx_histori_fase ON histori_giliran(fase_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_tanggal ON jadwal(tanggal);

-- ============================================================
-- Seed Data
-- ============================================================

-- Default admin user (password: admin123 - SHA-256 + salt "majelis_salt")
-- Hash dihitung dengan: SHA256("admin123majelis_salt") -> base64
INSERT OR IGNORE INTO users (username, password_hash, role) VALUES 
  ('admin', 'bqz/3ZJ/fn4AVuA2V6KCBByTARKSLYgBj6LLM1wwYqU=', 'admin');

-- Default jenis iuran
INSERT OR IGNORE INTO jenis_iuran (nama, nominal_default, deskripsi) VALUES
  ('Iuran PKK', 5000, 'Iuran rutin PKK bulanan'),
  ('Iuran Kegiatan', 10000, 'Iuran kegiatan majelis'),
  ('Infaq', 0, 'Infaq sukarela');

-- Sample bacaan data
INSERT OR IGNORE INTO bacaan (judul, slug, kategori, konten_json, urutan) VALUES
  ('Tawasul', 'tawasul', 'tawasul', '[]', 1),
  ('Tahlil', 'tahlil', 'tahlil', '[]', 2),
  ('Istighotsah', 'istighotsah', 'istighotsah', '[]', 3),
  ('Yasin', 'yasin', 'yasin', '[]', 4),
  ('Doa Harian', 'doa-harian', 'doa_harian', '[]', 5),
  ('Doa Penutup', 'doa-penutup', 'doa_penutup', '[]', 6);

-- Sample jamaah
INSERT OR IGNORE INTO jamaah (nama, nomor_hp, alamat, tanggal_bergabung) VALUES
  ('Hj. Fatimah Zahra', '081234567890', 'Jl. Mawar No. 1', '2023-01-15'),
  ('Ibu Siti Aminah', '081234567891', 'Jl. Melati No. 5', '2023-02-01'),
  ('Ibu Khadijah', '081234567892', 'Jl. Anggrek No. 3', '2023-02-15'),
  ('Ibu Aisyah', '081234567893', 'Jl. Dahlia No. 7', '2023-03-01'),
  ('Ibu Maryam', '081234567894', 'Jl. Kenanga No. 2', '2023-03-15');
