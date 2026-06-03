-- ============================================================
-- 0002_seed_sample.sql — Data Contoh untuk Pengujian
-- Jalankan SETELAH 0001_init.sql
-- ============================================================

-- ── Jamaah tambahan ─────────────────────────────────────────
INSERT OR IGNORE INTO jamaah (id, nama, nomor_hp, alamat, tanggal_bergabung) VALUES
  (6,  'Ibu Nurul Hidayah',    '081298765432', 'Jl. Flamboyan No. 4',   '2023-04-01'),
  (7,  'Hj. Zubaidah',         '081234567895', 'Jl. Tulip No. 8',       '2023-04-15'),
  (8,  'Ibu Sri Wahyuni',      '081234567896', 'Jl. Cempaka No. 12',    '2023-05-01'),
  (9,  'Ibu Rahmawati',        '081234567897', 'Jl. Kamboja No. 6',     '2023-05-15'),
  (10, 'Ibu Halimah Sa''diah', '081234567898', 'Jl. Mawar No. 15',      '2023-06-01'),
  (11, 'Ibu Nur Azizah',       '081234567899', 'Jl. Melati No. 9',      '2023-06-15'),
  (12, 'Hj. Romlah',           '082134567890', 'Jl. Anggrek No. 7',     '2023-07-01'),
  (13, 'Ibu Munawaroh',        '082134567891', 'Jl. Dahlia No. 11',     '2023-07-15'),
  (14, 'Ibu Fatkhiyah',        '082134567892', 'Jl. Kenanga No. 5',     '2023-08-01'),
  (15, 'Ibu Sumarni',          '082134567893', 'Jl. Flamboyan No. 2',   '2023-08-15');

-- ── Jadwal kegiatan ─────────────────────────────────────────
INSERT OR IGNORE INTO jadwal (id, judul, deskripsi, jenis, tanggal, waktu_mulai, waktu_selesai, lokasi, penanggung_jawab) VALUES
  (1, 'Pengajian Rutin Mingguan',   'Pengajian rutin setiap Minggu pagi',         'mingguan', date('now', '+3 days'),  '08:00', '10:00', 'Mushola Al-Ikhlas',    'Hj. Fatimah Zahra'),
  (2, 'Arisan Bulanan PKK',         'Arisan bulanan disertai pengajian singkat',  'bulanan',  date('now', '+7 days'),  '10:00', '12:00', 'Rumah Ibu Ketua',      'Ibu Siti Aminah'),
  (3, 'Tahlilan Bersama',           'Tahlil rutin setiap malam Jumat',            'mingguan', date('now', '+5 days'),  '19:30', '21:00', 'Mushola Al-Ikhlas',    'Ibu Khadijah'),
  (4, 'Istighotsah Bulanan',        'Istighotsah bersama seluruh jamaah',         'bulanan',  date('now', '+14 days'), '08:00', '10:30', 'Gedung Pertemuan RT',  'Hj. Zubaidah'),
  (5, 'Yasinan & Doa Bersama',      'Yasin dan doa untuk arwah almarhum',        'mingguan', date('now', '-7 days'),  '20:00', '21:30', 'Mushola Al-Ikhlas',    'Ibu Sri Wahyuni'),
  (6, 'Peringatan Maulid Nabi SAW', 'Acara peringatan Maulid Nabi Muhammad SAW', 'tahunan',  date('now', '+21 days'), '08:00', '12:00', 'Balai RW',             'Panitia Gabungan');

-- ── Iuran bulan ini ─────────────────────────────────────────
-- Pastikan kolom periode sesuai bulan berjalan
INSERT OR IGNORE INTO iuran (jamaah_id, jenis_iuran_id, nominal, tanggal_bayar, periode, keterangan, dicatat_oleh) VALUES
  (1,  1, 5000,  date('now'),         strftime('%Y-%m', 'now'), 'Lunas',    1),
  (2,  1, 5000,  date('now'),         strftime('%Y-%m', 'now'), 'Lunas',    1),
  (3,  1, 5000,  date('now'),         strftime('%Y-%m', 'now'), 'Lunas',    1),
  (4,  1, 5000,  date('now', '-2 days'), strftime('%Y-%m', 'now'), 'Lunas', 1),
  (5,  1, 5000,  date('now', '-3 days'), strftime('%Y-%m', 'now'), 'Lunas', 1),
  (6,  1, 5000,  date('now', '-1 days'), strftime('%Y-%m', 'now'), 'Lunas', 1),
  (7,  1, 5000,  date('now', '-4 days'), strftime('%Y-%m', 'now'), 'Lunas', 1),
  (1,  2, 10000, date('now'),         strftime('%Y-%m', 'now'), 'Lunas',    1),
  (2,  2, 10000, date('now'),         strftime('%Y-%m', 'now'), 'Lunas',    1),
  (3,  2, 10000, date('now', '-2 days'), strftime('%Y-%m', 'now'), 'Lunas', 1);

-- ── Fase giliran aktif ──────────────────────────────────────
INSERT OR IGNORE INTO fase_giliran (id, nama, deskripsi, status) VALUES
  (1, 'Giliran Arisan 2025', 'Fase giliran arisan untuk tahun 2025', 'aktif');

-- Masukkan semua jamaah ke fase, beberapa sudah terpilih
INSERT OR IGNORE INTO peserta_fase (fase_id, jamaah_id, status, urutan_terpilih) VALUES
  (1, 1,  'selected',  1),
  (1, 2,  'selected',  2),
  (1, 3,  'selected',  3),
  (1, 4,  'priority',  NULL),
  (1, 5,  'waiting',   NULL),
  (1, 6,  'waiting',   NULL),
  (1, 7,  'waiting',   NULL),
  (1, 8,  'waiting',   NULL),
  (1, 9,  'skipped',   NULL),
  (1, 10, 'waiting',   NULL),
  (1, 11, 'waiting',   NULL),
  (1, 12, 'waiting',   NULL),
  (1, 13, 'waiting',   NULL),
  (1, 14, 'waiting',   NULL),
  (1, 15, 'waiting',   NULL);

-- Histori giliran
INSERT OR IGNORE INTO histori_giliran (fase_id, jamaah_id, putaran, dipilih_oleh) VALUES
  (1, 1, 1, 1),
  (1, 2, 2, 1),
  (1, 3, 3, 1);

-- ── Absensi kegiatan lalu ───────────────────────────────────
INSERT OR IGNORE INTO kehadiran (jadwal_id, jamaah_id, status) VALUES
  (5, 1,  'hadir'),
  (5, 2,  'hadir'),
  (5, 3,  'hadir'),
  (5, 4,  'izin'),
  (5, 5,  'hadir'),
  (5, 6,  'tidak_hadir'),
  (5, 7,  'hadir'),
  (5, 8,  'hadir'),
  (5, 9,  'hadir'),
  (5, 10, 'izin');

-- ── Pengumuman ──────────────────────────────────────────────
INSERT OR IGNORE INTO pengumuman (id, judul, isi, prioritas, dibuat_oleh) VALUES
  (1, 'Jadwal Pengajian Maulid Nabi',
      'Assalamualaikum. Diberitahukan kepada seluruh jamaah bahwa akan diadakan Peringatan Maulid Nabi Muhammad SAW. Mohon kehadiran seluruh jamaah. Terima kasih.',
      'tinggi', 1),
  (2, 'Iuran PKK Bulan Ini',
      'Iuran PKK bulan ini dapat dibayarkan langsung kepada bendahara setiap kegiatan pengajian. Nominal: Rp 5.000.',
      'normal', 1);

-- ── Update bacaan dengan konten (update dari empty) ─────────
UPDATE bacaan SET konten_json = '[{"keterangan":"Silakan lihat data bacaan di /bacaan/data.js untuk konten lengkap"},{"arab":"بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ","latin":"Bismillaahir-rahmaanir-rahiim","arti":"Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang"}]'
WHERE konten_json = '[]';
