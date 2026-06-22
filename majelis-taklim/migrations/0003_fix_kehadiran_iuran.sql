-- ============================================================
-- Migration 0003: Perbaikan struktur Kehadiran & Iuran
--
-- Tujuan:
--  1. Tambah kolom jadwal.iuran_sudah_dicatat (penanda Langkah 3 selesai)
--  2. Tambah UNIQUE index pada kehadiran(jadwal_id, jamaah_id)
--     -> dibutuhkan agar ON CONFLICT(...) DO UPDATE di backend bisa jalan
--  3. Tambah kolom iuran.jadwal_id (opsional, untuk kaitkan iuran ke pertemuan)
--  4. Bersihkan jenis_iuran: hanya 2 jenis -> "Iuran Rutinan" & "Iuran Lain-lain"
--  5. Hapus 10 baris data iuran hasil testing manual (periode salah / tidak valid)
-- ============================================================

-- 1. Kolom penanda iuran sudah dicatat untuk suatu jadwal
ALTER TABLE jadwal ADD COLUMN iuran_sudah_dicatat INTEGER DEFAULT 0;

-- 2. Unique index agar ON CONFLICT(jadwal_id, jamaah_id) berfungsi di backend
--    (sebelumnya tidak ada constraint apa pun di tabel kehadiran produksi)
CREATE UNIQUE INDEX IF NOT EXISTS idx_kehadiran_unique
  ON kehadiran(jadwal_id, jamaah_id);

-- 3. Kolom relasi opsional dari iuran ke jadwal asal (kehadiran)
ALTER TABLE iuran ADD COLUMN jadwal_id INTEGER REFERENCES jadwal(id);

-- 4a. Hapus data iuran hasil testing manual yang periode-nya tidak valid
--     (format periode wajib YYYY-MM; baris dengan periode = "1" adalah data uji)
DELETE FROM iuran WHERE periode = '1';

-- 4b. Bersihkan jenis_iuran lama, ganti ke 2 kategori baku
DELETE FROM iuran WHERE jenis_iuran_id NOT IN (SELECT id FROM jenis_iuran);
DELETE FROM jenis_iuran;

INSERT INTO jenis_iuran (id, nama, nominal_default, deskripsi, is_active) VALUES
  (1, 'Iuran Rutinan',   5000, 'Iuran otomatis dari pencatatan kehadiran pertemuan', 1),
  (2, 'Iuran Lain-lain', 0,    'Iuran/infaq/kontribusi di luar pertemuan rutin',      1);

-- Pastikan auto-increment lanjut dari id 2 ke atas untuk jenis_iuran baru
UPDATE sqlite_sequence SET seq = 2 WHERE name = 'jenis_iuran';

-- ============================================================
-- Verifikasi (jalankan manual setelah migrasi jika perlu):
--   SELECT * FROM jenis_iuran;
--   PRAGMA table_info(jadwal);
--   PRAGMA table_info(iuran);
--   PRAGMA index_list('kehadiran');
-- ============================================================
