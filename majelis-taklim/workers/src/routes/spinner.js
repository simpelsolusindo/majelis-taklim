// ============================================================
// Spinner / Giliran Routes
// ============================================================

import { createResponse, requireAdmin, auditLog } from '../utils/helpers.js';

export async function handleSpinner(request, env, path) {
  const url = new URL(request.url);
  const segments = path.split('/').filter(Boolean);
  const subpath = segments.slice(2).join('/'); // e.g., 'putar', 'fase', 'priority'

  // GET /api/spinner/fase - list all phases
  if (request.method === 'GET' && subpath === 'fase') {
    const fases = await env.DB.prepare(
      `SELECT f.*, COUNT(p.id) as total_peserta,
       SUM(CASE WHEN p.status = 'selected' THEN 1 ELSE 0 END) as sudah_giliran,
       SUM(CASE WHEN p.status = 'waiting' THEN 1 ELSE 0 END) as menunggu
       FROM fase_giliran f LEFT JOIN peserta_fase p ON p.fase_id = f.id
       GROUP BY f.id ORDER BY f.created_at DESC`
    ).all();
    return createResponse(fases.results);
  }

  // GET /api/spinner/fase/:id - get phase detail with participants
  if (request.method === 'GET' && subpath.startsWith('fase/')) {
    const faseId = parseInt(subpath.split('/')[1]);
    const [fase, peserta, histori] = await Promise.all([
      env.DB.prepare('SELECT * FROM fase_giliran WHERE id = ?').bind(faseId).first(),
      env.DB.prepare(
        `SELECT p.*, j.nama, j.nomor_hp FROM peserta_fase p
         JOIN jamaah j ON j.id = p.jamaah_id
         WHERE p.fase_id = ? ORDER BY p.status, j.nama`
      ).bind(faseId).all(),
      env.DB.prepare(
        `SELECT h.*, j.nama FROM histori_giliran h
         JOIN jamaah j ON j.id = h.jamaah_id
         WHERE h.fase_id = ? ORDER BY h.putaran ASC`
      ).bind(faseId).all()
    ]);

    if (!fase) return createResponse({ error: 'Fase tidak ditemukan' }, 404);
    return createResponse({ fase, peserta: peserta.results, histori: histori.results });
  }

  // POST /api/spinner/fase - create new phase
  if (request.method === 'POST' && subpath === 'fase') {
    requireAdmin(request);
    const { nama, deskripsi, jamaah_ids } = await request.json();
    if (!nama) return createResponse({ error: 'Nama fase wajib diisi' }, 400);

    const result = await env.DB.prepare(
      'INSERT INTO fase_giliran (nama, deskripsi) VALUES (?, ?)'
    ).bind(nama, deskripsi || null).run();

    const faseId = result.meta.last_row_id;

    // Add participants
    if (jamaah_ids && jamaah_ids.length > 0) {
      const stmts = jamaah_ids.map(jId =>
        env.DB.prepare('INSERT OR IGNORE INTO peserta_fase (fase_id, jamaah_id) VALUES (?, ?)')
          .bind(faseId, jId)
      );
      await env.DB.batch(stmts);
    }

    await auditLog(env, request.user.id, 'CREATE_FASE', 'fase_giliran', faseId, { nama });
    return createResponse({ id: faseId, nama, deskripsi }, 201);
  }

  // POST /api/spinner/putar - spin the wheel
  if (request.method === 'POST' && subpath === 'putar') {
    requireAdmin(request);
    const { fase_id } = await request.json();
    if (!fase_id) return createResponse({ error: 'fase_id wajib diisi' }, 400);

    const fase = await env.DB.prepare(
      'SELECT * FROM fase_giliran WHERE id = ? AND status = "aktif"'
    ).bind(fase_id).first();
    if (!fase) return createResponse({ error: 'Fase tidak ditemukan atau sudah selesai' }, 404);

    // Check priority first
    const priorityPeserta = await env.DB.prepare(
      `SELECT p.*, j.nama FROM peserta_fase p JOIN jamaah j ON j.id = p.jamaah_id
       WHERE p.fase_id = ? AND p.status = 'priority' LIMIT 1`
    ).bind(fase_id).first();

    let terpilih = priorityPeserta;

    if (!terpilih) {
      // Pick random from waiting
      const waitingList = await env.DB.prepare(
        `SELECT p.*, j.nama FROM peserta_fase p JOIN jamaah j ON j.id = p.jamaah_id
         WHERE p.fase_id = ? AND p.status = 'waiting'`
      ).bind(fase_id).all();

      if (waitingList.results.length === 0) {
        // Check if phase is complete
        const remaining = await env.DB.prepare(
          `SELECT COUNT(*) as c FROM peserta_fase WHERE fase_id = ? AND status NOT IN ('selected','inactive')`
        ).bind(fase_id).first();

        if (remaining.c === 0) {
          await env.DB.prepare(
            'UPDATE fase_giliran SET status = "selesai", selesai_at = datetime("now") WHERE id = ?'
          ).bind(fase_id).run();
          return createResponse({ selesai: true, message: 'Fase sudah selesai! Semua jamaah telah mendapat giliran.' });
        }

        return createResponse({ error: 'Tidak ada peserta yang menunggu giliran' }, 400);
      }

      // Random selection
      const idx = Math.floor(Math.random() * waitingList.results.length);
      terpilih = waitingList.results[idx];
    }

    // Get current round number
    const lastRound = await env.DB.prepare(
      'SELECT MAX(putaran) as max_p FROM histori_giliran WHERE fase_id = ?'
    ).bind(fase_id).first();
    const putaran = (lastRound.max_p || 0) + 1;

    // Update participant status
    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'selected', urutan_terpilih = ?, updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ?`
    ).bind(putaran, fase_id, terpilih.jamaah_id).run();

    // Record history
    await env.DB.prepare(
      'INSERT INTO histori_giliran (fase_id, jamaah_id, putaran, dipilih_oleh) VALUES (?, ?, ?, ?)'
    ).bind(fase_id, terpilih.jamaah_id, putaran, request.user.id).run();

    await auditLog(env, request.user.id, 'SPIN', 'histori_giliran', terpilih.jamaah_id, { fase_id, putaran });

    return createResponse({
      terpilih: { jamaah_id: terpilih.jamaah_id, nama: terpilih.nama },
      putaran,
      was_priority: !!priorityPeserta
    });
  }

  // POST /api/spinner/priority - set priority
  if (request.method === 'POST' && subpath === 'priority') {
    requireAdmin(request);
    const { fase_id, jamaah_id } = await request.json();

    // Clear existing priority
    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'waiting', updated_at = datetime('now')
       WHERE fase_id = ? AND status = 'priority'`
    ).bind(fase_id).run();

    // Set new priority
    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'priority', updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ? AND status IN ('waiting','skipped')`
    ).bind(fase_id, jamaah_id).run();

    await auditLog(env, request.user.id, 'SET_PRIORITY', 'peserta_fase', jamaah_id, { fase_id });
    return createResponse({ success: true });
  }

  // POST /api/spinner/skip - skip participant
  if (request.method === 'POST' && subpath === 'skip') {
    requireAdmin(request);
    const { fase_id, jamaah_id } = await request.json();

    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'skipped', updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ? AND status IN ('waiting','priority')`
    ).bind(fase_id, jamaah_id).run();

    await auditLog(env, request.user.id, 'SKIP', 'peserta_fase', jamaah_id, { fase_id });
    return createResponse({ success: true });
  }

  // POST /api/spinner/restore - restore skipped participant
  if (request.method === 'POST' && subpath === 'restore') {
    requireAdmin(request);
    const { fase_id, jamaah_id } = await request.json();

    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'waiting', updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ? AND status = 'skipped'`
    ).bind(fase_id, jamaah_id).run();

    return createResponse({ success: true });
  }

  return createResponse({ error: 'Route not found' }, 404);
}
