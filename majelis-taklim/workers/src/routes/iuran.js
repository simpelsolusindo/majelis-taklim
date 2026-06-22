// Iuran Routes
// ============================================================

import { createResponse, requireAdmin, getPagination, auditLog, JENIS_IURAN_RUTINAN_ID, JENIS_IURAN_LAIN_ID } from '../utils/helpers.js';

// ============================================================
// Jenis Iuran Routes — /api/jenis-iuran
//
// Dipakai oleh frontend (jenisIuranApi). Berbeda dari GET /api/iuran/jenis
// (yang juga tetap ada untuk kompatibilitas), endpoint ini mendukung
// penuh CRUD agar halaman "Kelola Jenis Iuran" berfungsi.
//
// "Iuran Rutinan" (id=1) tidak boleh diubah/dihapus karena dipakai
// otomatis oleh alur kehadiran — admin hanya boleh menambah jenis lain
// di luar 2 jenis baku.
// ============================================================
export async function handleJenisIuran(request, env, path) {
  const segments = path.split('/').filter(Boolean);
  const id = segments[2] && !isNaN(segments[2]) ? parseInt(segments[2]) : null;

  if (request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM jenis_iuran ORDER BY id').all();
    return createResponse(rows.results);
  }

  requireAdmin(request);

  if (request.method === 'POST') {
    const { nama, nominal_default, deskripsi } = await request.json();
    if (!nama) return createResponse({ error: 'Nama jenis iuran wajib diisi' }, 400);
    const result = await env.DB.prepare(
      `INSERT INTO jenis_iuran (nama, nominal_default, deskripsi, is_active) VALUES (?, ?, ?, 1)`
    ).bind(nama, nominal_default || 0, deskripsi || null).run();
    await auditLog(env, request.user.id, 'CREATE', 'jenis_iuran', result.meta.last_row_id, { nama });
    return createResponse({ id: result.meta.last_row_id, nama, nominal_default, deskripsi }, 201);
  }

  if (request.method === 'PUT' && id) {
    if (id === JENIS_IURAN_RUTINAN_ID) {
      return createResponse({ error: '"Iuran Rutinan" tidak dapat diubah karena dipakai otomatis oleh alur kehadiran' }, 400);
    }
    const { nama, nominal_default, deskripsi } = await request.json();
    await env.DB.prepare(
      `UPDATE jenis_iuran SET nama=?, nominal_default=?, deskripsi=? WHERE id=?`
    ).bind(nama, nominal_default || 0, deskripsi || null, id).run();
    await auditLog(env, request.user.id, 'UPDATE', 'jenis_iuran', id, { nama });
    return createResponse({ success: true });
  }

  if (request.method === 'DELETE' && id) {
    if (id === JENIS_IURAN_RUTINAN_ID || id === JENIS_IURAN_LAIN_ID) {
      return createResponse({ error: 'Jenis iuran baku ("Iuran Rutinan" / "Iuran Lain-lain") tidak dapat dihapus' }, 400);
    }
    await env.DB.prepare('UPDATE jenis_iuran SET is_active = 0 WHERE id = ?').bind(id).run();
    await auditLog(env, request.user.id, 'DELETE', 'jenis_iuran', id, {});
    return createResponse({ success: true });
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}

export async function handleIuran(request, env, path) {
  const url = new URL(request.url);
  const segments = path.split('/').filter(Boolean);
  const subpath = segments[2];
  const id = subpath && !isNaN(subpath) ? parseInt(subpath) : null;

  // GET /api/iuran/jenis - jenis iuran list
  if (request.method === 'GET' && subpath === 'jenis') {
    const jenis = await env.DB.prepare('SELECT * FROM jenis_iuran WHERE is_active = 1 ORDER BY id').all();
    return createResponse(jenis.results);
  }

  // GET /api/iuran - list payments
  if (request.method === 'GET' && !id && subpath !== 'jenis') {
    const { limit, offset } = getPagination(url);
    const jamaah_id = url.searchParams.get('jamaah_id');
    const periode = url.searchParams.get('periode');
    const jenis_id = url.searchParams.get('jenis_iuran_id');
    const jadwal_id = url.searchParams.get('jadwal_id');

    let where = '1=1';
    const params = [];

    if (jamaah_id) { where += ' AND i.jamaah_id = ?'; params.push(jamaah_id); }
    if (periode) { where += ' AND i.periode = ?'; params.push(periode); }
    if (jenis_id) { where += ' AND i.jenis_iuran_id = ?'; params.push(jenis_id); }
    if (jadwal_id) { where += ' AND i.jadwal_id = ?'; params.push(jadwal_id); }

    const query = await env.DB.prepare(
      `SELECT i.*, j.nama as jamaah_nama, ji.nama as jenis_nama
       FROM iuran i
       JOIN jamaah j ON j.id = i.jamaah_id
       JOIN jenis_iuran ji ON ji.id = i.jenis_iuran_id
       WHERE ${where} ORDER BY i.tanggal_bayar DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    const count = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM iuran i WHERE ${where}`
    ).bind(...params).first();

    return createResponse({ data: query.results, total: count.total });
  }

  // GET /api/iuran/rekap - monthly summary
  if (request.method === 'GET' && subpath === 'rekap') {
    const periode = url.searchParams.get('periode') || new Date().toISOString().slice(0, 7);
    const rekap = await env.DB.prepare(
      `SELECT ji.nama as jenis, COUNT(i.id) as jumlah_pembayar,
       SUM(i.nominal) as total_nominal
       FROM iuran i
       JOIN jenis_iuran ji ON ji.id = i.jenis_iuran_id
       WHERE i.periode = ?
       GROUP BY i.jenis_iuran_id`
    ).bind(periode).all();
    return createResponse(rekap.results);
  }

  // GET /api/iuran/tunggakan - list unpaid
  if (request.method === 'GET' && subpath === 'tunggakan') {
    const periode = url.searchParams.get('periode') || new Date().toISOString().slice(0, 7);
    const jenis_id = url.searchParams.get('jenis_iuran_id');

    const tunggakan = await env.DB.prepare(
      `SELECT j.id, j.nama, j.nomor_hp
       FROM jamaah j
       WHERE j.status = 'aktif'
       AND j.id NOT IN (
         SELECT jamaah_id FROM iuran
         WHERE periode = ? AND jenis_iuran_id = ?
       )
       ORDER BY j.nama`
    ).bind(periode, jenis_id || JENIS_IURAN_RUTINAN_ID).all();

    return createResponse(tunggakan.results);
  }

  // POST /api/iuran - record payment
  if (request.method === 'POST' && !subpath) {
    requireAdmin(request);
    const body = await request.json();
    let { jamaah_id, jenis_iuran_id, nominal, tanggal_bayar, periode, keterangan, jadwal_id } = body;

    if (!jamaah_id || !nominal || !tanggal_bayar || !periode) {
      return createResponse({ error: 'Data tidak lengkap: jamaah_id, nominal, tanggal_bayar, dan periode wajib diisi' }, 400);
    }

    if (jadwal_id) {
      // Iuran yang berasal dari pencatatan kehadiran pertemuan SELALU
      // bertipe "Iuran Rutinan" — abaikan jenis_iuran_id dari client agar
      // tidak bisa diubah jadi jenis lain lewat form ini.
      jenis_iuran_id = JENIS_IURAN_RUTINAN_ID;
    } else if (!jenis_iuran_id) {
      return createResponse({ error: 'Jenis iuran wajib dipilih untuk pencatatan iuran manual' }, 400);
    }

    const jenisValid = await env.DB.prepare(
      'SELECT id FROM jenis_iuran WHERE id = ? AND is_active = 1'
    ).bind(jenis_iuran_id).first();
    if (!jenisValid) {
      return createResponse({ error: 'Jenis iuran tidak ditemukan atau tidak aktif' }, 400);
    }

    const result = await env.DB.prepare(
      `INSERT INTO iuran (jamaah_id, jenis_iuran_id, nominal, tanggal_bayar, periode, keterangan, jadwal_id, dicatat_oleh, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(jamaah_id, jenis_iuran_id, nominal, tanggal_bayar, periode, keterangan || null, jadwal_id || null, request.user.id).run();

    await auditLog(env, request.user.id, 'CREATE', 'iuran', result.meta.last_row_id, { jamaah_id, periode, nominal, jenis_iuran_id });
    return createResponse({ id: result.meta.last_row_id, ...body, jenis_iuran_id }, 201);
  }

  // PUT /api/iuran/:id - update payment
  if (request.method === 'PUT' && id) {
    requireAdmin(request);
    const existing = await env.DB.prepare('SELECT * FROM iuran WHERE id = ?').bind(id).first();
    if (!existing) return createResponse({ error: 'Data iuran tidak ditemukan' }, 404);

    const body = await request.json();
    let jenis_iuran_id = body.jenis_iuran_id ?? existing.jenis_iuran_id;
    const jadwal_id = body.jadwal_id !== undefined ? body.jadwal_id : existing.jadwal_id;

    // Sama seperti POST: kalau terkait jadwal (kehadiran), jenis dipaksa "Rutinan"
    if (jadwal_id) jenis_iuran_id = JENIS_IURAN_RUTINAN_ID;

    const merged = {
      jamaah_id: body.jamaah_id ?? existing.jamaah_id,
      jenis_iuran_id,
      nominal: body.nominal ?? existing.nominal,
      tanggal_bayar: body.tanggal_bayar ?? existing.tanggal_bayar,
      periode: body.periode ?? existing.periode,
      keterangan: body.keterangan ?? existing.keterangan,
      jadwal_id,
    };

    await env.DB.prepare(
      `UPDATE iuran SET jamaah_id=?, jenis_iuran_id=?, nominal=?, tanggal_bayar=?, periode=?, keterangan=?, jadwal_id=?
       WHERE id=?`
    ).bind(merged.jamaah_id, merged.jenis_iuran_id, merged.nominal, merged.tanggal_bayar,
           merged.periode, merged.keterangan, merged.jadwal_id, id).run();

    await auditLog(env, request.user.id, 'UPDATE', 'iuran', id, body);
    return createResponse({ success: true, id, ...merged });
  }

  // DELETE /api/iuran/:id
  if (request.method === 'DELETE' && id) {
    requireAdmin(request);
    await env.DB.prepare('DELETE FROM iuran WHERE id = ?').bind(id).run();
    await auditLog(env, request.user.id, 'DELETE', 'iuran', id, {});
    return createResponse({ success: true });
  }

  return createResponse({ error: 'Route not found' }, 404);
}
EOF_IURANJS
