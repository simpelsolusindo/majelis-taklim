-- ============================================================
-- Migration 0004: Perbaikan Sistem Spinner
--
-- Tujuan:
--  1. Tambah kolom jadwal.host_id (sudah ada di INSERT tapi tidak di schema)
--  2. Tambah kolom jamaah.is_next_host & tanggal_host (untuk menandai host berikutnya)
--  3. Tambah tabel spinner_hasil (riwayat pemenang spinner)
--  4. Pastikan hanya 1 fase aktif — fase lain di-selesai-kan
--  5. Jika belum ada fase aktif, buat fase default dari jamaah aktif
-- ============================================================

-- 1. Tambah host_id ke jadwal jika belum ada
ALTER TABLE jadwal ADD COLUMN IF NOT EXISTS host_id INTEGER REFERENCES jamaah(id);

-- 2. Tambah flag next_host ke jamaah
ALTER TABLE jamaah ADD COLUMN IF NOT EXISTS is_next_host INTEGER DEFAULT 0;
ALTER TABLE jamaah ADD COLUMN IF NOT EXISTS tanggal_host TEXT;

-- 3. Tabel riwayat hasil spinner (terpisah dari histori_giliran untuk kemudahan query)
CREATE TABLE IF NOT EXISTS spinner_hasil (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fase_id INTEGER REFERENCES fase_giliran(id),
  jamaah_id INTEGER NOT NULL REFERENCES jamaah(id),
  nama_terpilih TEXT NOT NULL,
  jadwal_id INTEGER REFERENCES jadwal(id),
  dipilih_pada TEXT DEFAULT (datetime('now')),
  dicatat_oleh INTEGER REFERENCES users(id)
);

-- 4. Pastikan hanya 1 fase aktif: selesaikan semua kecuali yang terbaru
UPDATE fase_giliran
SET status = 'selesai', selesai_at = datetime('now')
WHERE status = 'aktif'
  AND id != (
    SELECT id FROM fase_giliran
    WHERE status = 'aktif'
    ORDER BY created_at DESC
    LIMIT 1
  );

-- ============================================================
-- CATATAN: Jika belum ada fase aktif sama sekali, jalankan manual:
--
-- INSERT INTO fase_giliran (nama, deskripsi, status)
-- VALUES ('Fase 1', 'Fase pertama - dibuat otomatis', 'aktif');
--
-- Lalu insert semua jamaah aktif ke peserta_fase:
-- INSERT OR IGNORE INTO peserta_fase (fase_id, jamaah_id)
-- SELECT (SELECT id FROM fase_giliran WHERE status='aktif' LIMIT 1), id
-- FROM jamaah WHERE status = 'aktif';
-- ============================================================
