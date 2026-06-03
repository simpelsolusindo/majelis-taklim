// ============================================================
// Dashboard, Bacaan, Jadwal, Kehadiran, Pengumuman
//
// GET  → publik (tanpa auth)
// POST/PUT/DELETE → admin only
// ============================================================

import { createResponse, requireAdmin, auditLog, getPagination } from '../utils/helpers.js';

// ── DASHBOARD (publik GET) ───────────────────────────────────
export async function handleDashboard(request, env, path) {
  if (request.method !== 'GET') return createResponse({ error: 'Method not allowed' }, 405);

  const bulanIni = new Date().toISOString().slice(0, 7);

  const [jamaahAktif, kehadiranBulanIni, jadwalDekat, pengumuman, faseAktif] =
    await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as c FROM jamaah WHERE status = "aktif"').first(),
      env.DB.prepare(
        `SELECT COUNT(*) as c FROM kehadiran k
         JOIN jadwal j ON j.id = k.jadwal_id
         WHERE strftime('%Y-%m', j.tanggal) = ? AND k.status = 'hadir'`
      ).bind(bulanIni).first(),
      env.DB.prepare(
        `SELECT * FROM jadwal WHERE tanggal >= date('now') AND status = 'aktif'
         ORDER BY tanggal ASC LIMIT 3`
      ).all(),
      env.DB.prepare(
        `SELECT * FROM pengumuman
         WHERE (tanggal_selesai IS NULL OR tanggal_selesai >= date('now'))
         ORDER BY prioritas DESC, created_at DESC LIMIT 5`
      ).all(),
      env.DB.prepare(
        `SELECT f.*, COUNT(CASE WHEN p.status='waiting' THEN 1 END) as menunggu
         FROM fase_giliran f LEFT JOIN peserta_fase p ON p.fase_id = f.id
         WHERE f.status = 'aktif' GROUP BY f.id LIMIT 1`
      ).first()
    ]);

  // Statistik iuran hanya tampil untuk admin
  let iuranBulanIni = null;
  if (request.user?.role === 'admin') {
    iuranBulanIni = await env.DB.prepare(
      `SELECT SUM(nominal) as total, COUNT(*) as jumlah FROM iuran WHERE periode = ?`
    ).bind(bulanIni).first();
  }

  return createResponse({
    jamaah_aktif:        jamaahAktif.c,
    kehadiran_bulan_ini: kehadiranBulanIni.c,
    iuran_bulan_ini:     iuranBulanIni
      ? { total: iuranBulanIni.total || 0, jumlah: iuranBulanIni.jumlah }
      : null,
    jadwal_terdekat:     jadwalDekat.results,
    pengumuman:          pengumuman.results,
    fase_aktif:          faseAktif,
  });
}

// ── BACAAN (publik GET, admin PUT) ───────────────────────────
export async function handleBacaan(request, env, path) {
  const segments = path.split('/').filter(Boolean);
  const slug     = segments[2];

  if (request.method === 'GET' && !slug) {
    const list = await env.DB.prepare(
      'SELECT id, judul, slug, kategori, urutan FROM bacaan WHERE is_active = 1 ORDER BY urutan'
    ).all();
    return createResponse(list.results);
  }

  if (request.method === 'GET' && slug) {
    const bacaan = await env.DB.prepare(
      'SELECT * FROM bacaan WHERE slug = ? AND is_active = 1'
    ).bind(slug).first();
    if (!bacaan) return createResponse({ error: 'Bacaan tidak ditemukan' }, 404);
    return createResponse({ ...bacaan, konten: JSON.parse(bacaan.konten_json || '[]') });
  }

  // Admin: update konten bacaan
  if (request.method === 'PUT' && slug) {
    requireAdmin(request);
    const { judul, konten } = await request.json();
    await env.DB.prepare(
      `UPDATE bacaan SET judul = ?, konten_json = ?, updated_at = datetime('now') WHERE slug = ?`
    ).bind(judul, JSON.stringify(konten), slug).run();
    await auditLog(env, request.user.id, 'UPDATE', 'bacaan', null, { slug });
    return createResponse({ success: true });
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}

// ── JADWAL (publik GET, admin POST/PUT/DELETE) ───────────────
export async function handleJadwal(request, env, path) {
  const url      = new URL(request.url);
  const segments = path.split('/').filter(Boolean);
  const id       = segments[2] ? parseInt(segments[2]) : null;

  if (request.method === 'GET' && !id) {
    const bulan = url.searchParams.get('bulan');
    const jenis = url.searchParams.get('jenis');
    let where = '1=1';
    const params = [];
    if (bulan) { where += ` AND strftime('%Y-%m', tanggal) = ?`; params.push(bulan); }
    if (jenis) { where += ' AND jenis = ?'; params.push(jenis); }
    const list = await env.DB.prepare(
      `SELECT * FROM jadwal WHERE ${where} AND status != 'batal'
       ORDER BY tanggal ASC, waktu_mulai ASC`
    ).bind(...params).all();
    return createResponse(list.results);
  }

  if (request.method === 'GET' && id) {
    const row = await env.DB.prepare('SELECT * FROM jadwal WHERE id = ?').bind(id).first();
    if (!row) return createResponse({ error: 'Jadwal tidak ditemukan' }, 404);
    return createResponse(row);
  }

  // ── Admin only di bawah ini ─────────────────────────────
  requireAdmin(request);

  if (request.method === 'POST') {
    const body = await request.json();
    const { judul, deskripsi, jenis, tanggal, waktu_mulai, waktu_selesai, lokasi, penanggung_jawab } = body;
    if (!judul || !tanggal) return createResponse({ error: 'Judul dan tanggal wajib diisi' }, 400);
    const result = await env.DB.prepare(
      `INSERT INTO jadwal (judul, deskripsi, jenis, tanggal, waktu_mulai, waktu_selesai, lokasi, penanggung_jawab)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(judul, deskripsi||null, jenis||'khusus', tanggal, waktu_mulai||null,
           waktu_selesai||null, lokasi||null, penanggung_jawab||null).run();
    await auditLog(env, request.user.id, 'CREATE', 'jadwal', result.meta.last_row_id, { judul });
    return createResponse({ id: result.meta.last_row_id, ...body }, 201);
  }

  if (request.method === 'PUT' && id) {
    const body = await request.json();
    const { judul, deskripsi, jenis, tanggal, waktu_mulai, waktu_selesai, lokasi, penanggung_jawab, status } = body;
    await env.DB.prepare(
      `UPDATE jadwal SET judul=?, deskripsi=?, jenis=?, tanggal=?, waktu_mulai=?,
       waktu_selesai=?, lokasi=?, penanggung_jawab=?, status=? WHERE id=?`
    ).bind(judul, deskripsi||null, jenis, tanggal, waktu_mulai||null,
           waktu_selesai||null, lokasi||null, penanggung_jawab||null, status||'aktif', id).run();
    await auditLog(env, request.user.id, 'UPDATE', 'jadwal', id, body);
    return createResponse({ success: true });
  }

  if (request.method === 'DELETE' && id) {
    await env.DB.prepare("UPDATE jadwal SET status='batal' WHERE id=?").bind(id).run();
    await auditLog(env, request.user.id, 'DELETE', 'jadwal', id, {});
    return createResponse({ success: true });
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}

// ── KEHADIRAN (admin POST, publik GET terbatas) ───────────────
export async function handleKehadiran(request, env, path) {
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const jadwal_id = url.searchParams.get('jadwal_id');
    const jamaah_id = url.searchParams.get('jamaah_id');
    const bulan     = url.searchParams.get('bulan');

    if (jadwal_id) {
      const rows = await env.DB.prepare(
        `SELECT k.*, j.nama, j.nomor_hp FROM kehadiran k
         JOIN jamaah j ON j.id = k.jamaah_id
         WHERE k.jadwal_id = ? ORDER BY j.nama`
      ).bind(jadwal_id).all();
      return createResponse(rows.results);
    }

    if (jamaah_id && bulan) {
      const hist = await env.DB.prepare(
        `SELECT k.*, jd.judul, jd.tanggal FROM kehadiran k
         JOIN jadwal jd ON jd.id = k.jadwal_id
         WHERE k.jamaah_id = ? AND strftime('%Y-%m', jd.tanggal) = ?
         ORDER BY jd.tanggal DESC`
      ).bind(jamaah_id, bulan).all();
      return createResponse(hist.results);
    }

    if (bulan) {
      // Rekap bulanan — admin only
      requireAdmin(request);
      const summary = await env.DB.prepare(
        `SELECT j.id, j.nama,
         SUM(CASE WHEN k.status='hadir'       THEN 1 ELSE 0 END) as hadir,
         SUM(CASE WHEN k.status='izin'        THEN 1 ELSE 0 END) as izin,
         SUM(CASE WHEN k.status='tidak_hadir' THEN 1 ELSE 0 END) as tidak_hadir,
         COUNT(k.id) as total_kegiatan
         FROM jamaah j
         LEFT JOIN kehadiran k  ON k.jamaah_id = j.id
         LEFT JOIN jadwal    jd ON jd.id = k.jadwal_id
           AND strftime('%Y-%m', jd.tanggal) = ?
         WHERE j.status = 'aktif'
         GROUP BY j.id ORDER BY j.nama`
      ).bind(bulan).all();
      return createResponse(summary.results);
    }

    return createResponse({ error: 'Parameter bulan atau jadwal_id diperlukan' }, 400);
  }

  // POST: simpan absensi batch — admin only
  if (request.method === 'POST') {
    requireAdmin(request);
    const { jadwal_id, absensi } = await request.json();
    if (!jadwal_id || !absensi?.length)
      return createResponse({ error: 'Data tidak lengkap' }, 400);

    const stmts = absensi.map(a =>
      env.DB.prepare(
        `INSERT INTO kehadiran (jadwal_id, jamaah_id, status, catatan)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(jadwal_id, jamaah_id)
         DO UPDATE SET status=excluded.status, catatan=excluded.catatan`
      ).bind(jadwal_id, a.jamaah_id, a.status||'hadir', a.catatan||null)
    );
    await env.DB.batch(stmts);
    await auditLog(env, request.user.id, 'ABSENSI', 'kehadiran', jadwal_id,
                   { count: absensi.length });
    return createResponse({ success: true, count: absensi.length });
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}

// ── PENGUMUMAN (publik GET, admin POST/DELETE) ────────────────
export async function handlePengumuman(request, env, path) {
  const url      = new URL(request.url);
  const segments = path.split('/').filter(Boolean);
  const id       = segments[2] ? parseInt(segments[2]) : null;

  if (request.method === 'GET') {
    const all = url.searchParams.get('all');
    let rows;
    if (all === '1' && request.user?.role === 'admin') {
      rows = await env.DB.prepare(
        'SELECT * FROM pengumuman ORDER BY created_at DESC'
      ).all();
    } else {
      rows = await env.DB.prepare(
        `SELECT * FROM pengumuman
         WHERE (tanggal_selesai IS NULL OR tanggal_selesai >= date('now'))
         ORDER BY prioritas DESC, created_at DESC`
      ).all();
    }
    return createResponse(rows.results);
  }

  requireAdmin(request);

  if (request.method === 'POST') {
    const { judul, isi, prioritas, tanggal_mulai, tanggal_selesai } = await request.json();
    if (!judul || !isi) return createResponse({ error: 'Judul dan isi wajib diisi' }, 400);
    const result = await env.DB.prepare(
      `INSERT INTO pengumuman (judul, isi, prioritas, tanggal_mulai, tanggal_selesai, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(judul, isi, prioritas||'normal', tanggal_mulai||null,
           tanggal_selesai||null, request.user.id).run();
    return createResponse({ id: result.meta.last_row_id }, 201);
  }

  if (request.method === 'DELETE' && id) {
    await env.DB.prepare('DELETE FROM pengumuman WHERE id = ?').bind(id).run();
    await auditLog(env, request.user.id, 'DELETE', 'pengumuman', id, {});
    return createResponse({ success: true });
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}
