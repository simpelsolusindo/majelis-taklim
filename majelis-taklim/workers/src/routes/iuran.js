// ============================================================
// Iuran Routes
// ============================================================

import { createResponse, requireAdmin, getPagination, auditLog } from '../utils/helpers.js';

export async function handleIuran(request, env, path) {
  const url = new URL(request.url);
  const segments = path.split('/').filter(Boolean);
  const subpath = segments[2];
  const id = subpath && !isNaN(subpath) ? parseInt(subpath) : null;

  // GET /api/iuran/jenis - jenis iuran list
  if (request.method === 'GET' && subpath === 'jenis') {
    const jenis = await env.DB.prepare('SELECT * FROM jenis_iuran WHERE is_active = 1 ORDER BY nama').all();
    return createResponse(jenis.results);
  }

  // GET /api/iuran - list payments
  if (request.method === 'GET' && !id && subpath !== 'jenis') {
    const { limit, offset } = getPagination(url);
    const jamaah_id = url.searchParams.get('jamaah_id');
    const periode = url.searchParams.get('periode');
    const jenis_id = url.searchParams.get('jenis_iuran_id');

    let where = '1=1';
    const params = [];

    if (jamaah_id) { where += ' AND i.jamaah_id = ?'; params.push(jamaah_id); }
    if (periode) { where += ' AND i.periode = ?'; params.push(periode); }
    if (jenis_id) { where += ' AND i.jenis_iuran_id = ?'; params.push(jenis_id); }

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
    ).bind(periode, jenis_id || 1).all();

    return createResponse(tunggakan.results);
  }

  // POST /api/iuran - record payment
  if (request.method === 'POST' && !subpath) {
    requireAdmin(request);
    const body = await request.json();
    const { jamaah_id, jenis_iuran_id, nominal, tanggal_bayar, periode, keterangan } = body;

    if (!jamaah_id || !jenis_iuran_id || !nominal || !tanggal_bayar || !periode) {
      return createResponse({ error: 'Data tidak lengkap' }, 400);
    }

    const result = await env.DB.prepare(
      `INSERT INTO iuran (jamaah_id, jenis_iuran_id, nominal, tanggal_bayar, periode, keterangan, dicatat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(jamaah_id, jenis_iuran_id, nominal, tanggal_bayar, periode, keterangan || null, request.user.id).run();

    await auditLog(env, request.user.id, 'CREATE', 'iuran', result.meta.last_row_id, { jamaah_id, periode, nominal });
    return createResponse({ id: result.meta.last_row_id, ...body }, 201);
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
