// ============================================================
// Jamaah Routes
// ============================================================

import { createResponse, requireAdmin, getPagination, auditLog } from '../utils/helpers.js';

export async function handleJamaah(request, env, path) {
  const url = new URL(request.url);
  const segments = path.split('/').filter(Boolean); // ['api','jamaah','id?']
  const id = segments[2] ? parseInt(segments[2]) : null;

  // GET /api/jamaah - list all
  if (request.method === 'GET' && !id) {
    const { limit, offset } = getPagination(url);
    const search = url.searchParams.get('q') || '';
    const status = url.searchParams.get('status') || 'aktif';

    let query, countQuery;
    if (search) {
      query = env.DB.prepare(
        `SELECT * FROM jamaah WHERE status = ? AND (nama LIKE ? OR nomor_hp LIKE ? OR alamat LIKE ?)
         ORDER BY nama LIMIT ? OFFSET ?`
      ).bind(status, `%${search}%`, `%${search}%`, `%${search}%`, limit, offset);
      countQuery = env.DB.prepare(
        `SELECT COUNT(*) as total FROM jamaah WHERE status = ? AND (nama LIKE ? OR nomor_hp LIKE ? OR alamat LIKE ?)`
      ).bind(status, `%${search}%`, `%${search}%`, `%${search}%`);
    } else {
      query = env.DB.prepare(
        `SELECT * FROM jamaah WHERE status = ? ORDER BY nama LIMIT ? OFFSET ?`
      ).bind(status, limit, offset);
      countQuery = env.DB.prepare(
        `SELECT COUNT(*) as total FROM jamaah WHERE status = ?`
      ).bind(status);
    }

    const [data, count] = await Promise.all([query.all(), countQuery.first()]);
    return createResponse({ data: data.results, total: count.total, limit, offset });
  }

  // GET /api/jamaah/:id
  if (request.method === 'GET' && id) {
    const jamaah = await env.DB.prepare('SELECT * FROM jamaah WHERE id = ?').bind(id).first();
    if (!jamaah) return createResponse({ error: 'Jamaah tidak ditemukan' }, 404);
    return createResponse(jamaah);
  }

  // POST /api/jamaah - create
  if (request.method === 'POST') {
    requireAdmin(request);
    const body = await request.json();
    const { nama, nomor_hp, alamat, tanggal_bergabung, catatan } = body;
    if (!nama) return createResponse({ error: 'Nama wajib diisi' }, 400);

    const result = await env.DB.prepare(
      `INSERT INTO jamaah (nama, nomor_hp, alamat, tanggal_bergabung, catatan)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(nama, nomor_hp || null, alamat || null, tanggal_bergabung || new Date().toISOString().split('T')[0], catatan || null).run();

    await auditLog(env, request.user.id, 'CREATE', 'jamaah', result.meta.last_row_id, { nama });
    return createResponse({ id: result.meta.last_row_id, ...body }, 201);
  }

  // PUT /api/jamaah/:id
  if (request.method === 'PUT' && id) {
    requireAdmin(request);
    const body = await request.json();
    const { nama, nomor_hp, alamat, status, catatan } = body;

    await env.DB.prepare(
      `UPDATE jamaah SET nama = ?, nomor_hp = ?, alamat = ?, status = ?, catatan = ?,
       updated_at = datetime('now') WHERE id = ?`
    ).bind(nama, nomor_hp || null, alamat || null, status || 'aktif', catatan || null, id).run();

    await auditLog(env, request.user.id, 'UPDATE', 'jamaah', id, body);
    return createResponse({ success: true });
  }

  // DELETE /api/jamaah/:id (soft delete - set inactive)
  if (request.method === 'DELETE' && id) {
    requireAdmin(request);
    await env.DB.prepare(
      `UPDATE jamaah SET status = 'nonaktif', updated_at = datetime('now') WHERE id = ?`
    ).bind(id).run();
    await auditLog(env, request.user.id, 'DEACTIVATE', 'jamaah', id, {});
    return createResponse({ success: true });
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}
