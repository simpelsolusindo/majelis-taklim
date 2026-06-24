// ============================================================
// Spinner / Giliran Routes
//
// Aturan:
//  - Hanya 1 fase AKTIF dalam satu waktu
//  - Ketika semua peserta sudah dapat giliran → fase auto-selesai
//    & fase baru dibuat otomatis dari semua jamaah aktif
//  - Tidak perlu admin pilih fase secara manual
// ============================================================

import { createResponse, requireAdmin, auditLog } from '../utils/helpers.js';

// ── Helper: dapatkan fase aktif (satu-satunya) ───────────────
async function getFaseAktif(env) {
  return env.DB.prepare(
    `SELECT f.*,
       COUNT(p.id) as total_peserta,
       SUM(CASE WHEN p.status IN ('waiting','priority') THEN 1 ELSE 0 END) as menunggu,
       SUM(CASE WHEN p.status = 'selected' THEN 1 ELSE 0 END) as sudah_giliran
     FROM fase_giliran f
     LEFT JOIN peserta_fase p ON p.fase_id = f.id
     WHERE f.status = 'aktif'
     GROUP BY f.id
     LIMIT 1`
  ).first();
}

// ── Helper: buat fase baru dari semua jamaah aktif ───────────
async function buatFaseBaru(env, userId) {
  // Hitung fase ke berapa
  const count = await env.DB.prepare(
    'SELECT COUNT(*) as c FROM fase_giliran'
  ).first();
  const nomorFase = (count.c || 0) + 1;
  const namaFase = `Fase ${nomorFase}`;

  // Insert fase baru
  const result = await env.DB.prepare(
    `INSERT INTO fase_giliran (nama, deskripsi, status)
     VALUES (?, ?, 'aktif')`
  ).bind(namaFase, `Dibuat otomatis - siklus ke-${nomorFase}`).run();

  const faseId = result.meta.last_row_id;

  // Masukkan semua jamaah aktif sebagai peserta
  const jamaahAktif = await env.DB.prepare(
    `SELECT id FROM jamaah WHERE status = 'aktif'`
  ).all();

  if (jamaahAktif.results.length > 0) {
    const stmts = jamaahAktif.results.map(j =>
      env.DB.prepare(
        'INSERT OR IGNORE INTO peserta_fase (fase_id, jamaah_id, status) VALUES (?, ?, ?)'
      ).bind(faseId, j.id, 'waiting')
    );
    await env.DB.batch(stmts);
  }

  if (userId) {
    await auditLog(env, userId, 'AUTO_CREATE_FASE', 'fase_giliran', faseId, {
      nama: namaFase,
      jumlah_peserta: jamaahAktif.results.length
    });
  }

  return faseId;
}

export async function handleSpinner(request, env, path) {
  const segments = path.split('/').filter(Boolean);
  const subpath = segments.slice(2).join('/');

  // ── GET /api/spinner/aktif — fase aktif + peserta ────────────
  if (request.method === 'GET' && subpath === 'aktif') {
    let fase = await getFaseAktif(env);

    // Jika belum ada fase aktif, buat otomatis
    if (!fase) {
      const faseId = await buatFaseBaru(env, request.user?.id);
      fase = await getFaseAktif(env);
    }

    if (!fase) return createResponse({ error: 'Tidak dapat membuat fase' }, 500);

    const [peserta, histori] = await Promise.all([
      env.DB.prepare(
        `SELECT p.*, j.nama, j.nomor_hp FROM peserta_fase p
         JOIN jamaah j ON j.id = p.jamaah_id
         WHERE p.fase_id = ? ORDER BY p.status DESC, j.nama ASC`
      ).bind(fase.id).all(),
      env.DB.prepare(
        `SELECT h.*, j.nama FROM histori_giliran h
         JOIN jamaah j ON j.id = h.jamaah_id
         WHERE h.fase_id = ? ORDER BY h.putaran ASC`
      ).bind(fase.id).all()
    ]);

    return createResponse({
      fase,
      peserta: peserta.results,
      histori: histori.results
    });
  }

  // ── GET /api/spinner/fase — list semua fase (admin info) ─────
  if (request.method === 'GET' && subpath === 'fase') {
    const fases = await env.DB.prepare(
      `SELECT f.*, COUNT(p.id) as total_peserta,
       SUM(CASE WHEN p.status = 'selected' THEN 1 ELSE 0 END) as sudah_giliran,
       SUM(CASE WHEN p.status IN ('waiting','priority') THEN 1 ELSE 0 END) as menunggu
       FROM fase_giliran f LEFT JOIN peserta_fase p ON p.fase_id = f.id
       GROUP BY f.id ORDER BY f.created_at DESC`
    ).all();
    return createResponse(fases.results);
  }

  // ── GET /api/spinner/fase/:id — detail fase ──────────────────
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

  // ── GET /api/spinner/riwayat — riwayat hasil spinner ─────────
  if (request.method === 'GET' && subpath === 'riwayat') {
    const rows = await env.DB.prepare(
      `SELECT sh.*, j.nama as jamaah_nama, jd.tanggal as jadwal_tanggal,
              jd.lokasi as jadwal_lokasi, f.nama as fase_nama
       FROM spinner_hasil sh
       JOIN jamaah j ON j.id = sh.jamaah_id
       LEFT JOIN jadwal jd ON jd.id = sh.jadwal_id
       LEFT JOIN fase_giliran f ON f.id = sh.fase_id
       ORDER BY sh.dipilih_pada DESC
       LIMIT 50`
    ).all();
    return createResponse(rows.results);
  }

  // ── POST /api/spinner/putar — putar spinner ───────────────────
  if (request.method === 'POST' && subpath === 'putar') {
    requireAdmin(request);

    let fase = await getFaseAktif(env);

    // Tidak ada fase aktif? Buat baru otomatis
    if (!fase) {
      await buatFaseBaru(env, request.user.id);
      fase = await getFaseAktif(env);
    }

    if (!fase) return createResponse({ error: 'Tidak dapat membuat fase aktif' }, 500);

    const fase_id = fase.id;

    // Cek priority dulu
    const priorityPeserta = await env.DB.prepare(
      `SELECT p.*, j.nama FROM peserta_fase p JOIN jamaah j ON j.id = p.jamaah_id
       WHERE p.fase_id = ? AND p.status = 'priority' LIMIT 1`
    ).bind(fase_id).first();

    let terpilih = priorityPeserta;

    if (!terpilih) {
      const waitingList = await env.DB.prepare(
        `SELECT p.*, j.nama FROM peserta_fase p JOIN jamaah j ON j.id = p.jamaah_id
         WHERE p.fase_id = ? AND p.status = 'waiting'`
      ).bind(fase_id).all();

      if (waitingList.results.length === 0) {
        // Semua sudah giliran — selesaikan fase, buat fase baru otomatis
        await env.DB.prepare(
          `UPDATE fase_giliran SET status = 'selesai', selesai_at = datetime('now') WHERE id = ?`
        ).bind(fase_id).run();

        const newFaseId = await buatFaseBaru(env, request.user.id);

        return createResponse({
          fase_baru: true,
          fase_baru_id: newFaseId,
          message: 'Semua jamaah sudah mendapat giliran! Fase baru telah dibuat secara otomatis.'
        });
      }

      const idx = Math.floor(Math.random() * waitingList.results.length);
      terpilih = waitingList.results[idx];
    }

    // Nomor putaran
    const lastRound = await env.DB.prepare(
      'SELECT MAX(putaran) as max_p FROM histori_giliran WHERE fase_id = ?'
    ).bind(fase_id).first();
    const putaran = (lastRound.max_p || 0) + 1;

    // Update status peserta → selected
    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'selected', urutan_terpilih = ?, updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ?`
    ).bind(putaran, fase_id, terpilih.jamaah_id).run();

    // Catat histori
    await env.DB.prepare(
      'INSERT INTO histori_giliran (fase_id, jamaah_id, putaran, dipilih_oleh) VALUES (?, ?, ?, ?)'
    ).bind(fase_id, terpilih.jamaah_id, putaran, request.user.id).run();

    await auditLog(env, request.user.id, 'SPIN', 'histori_giliran', terpilih.jamaah_id, { fase_id, putaran });

    return createResponse({
      terpilih: { jamaah_id: terpilih.jamaah_id, nama: terpilih.nama, id: terpilih.jamaah_id },
      putaran,
      fase_id,
      was_priority: !!priorityPeserta
    });
  }

  // ── POST /api/spinner/hasil — simpan hasil + buat jadwal ─────
  if (request.method === 'POST' && subpath === 'hasil') {
    requireAdmin(request);
    const { jamaah_id, nama_terpilih, fase_id, jadwal_id, waktu } = await request.json();

    if (!jamaah_id || !nama_terpilih) {
      return createResponse({ error: 'jamaah_id dan nama_terpilih wajib diisi' }, 400);
    }

    // Cari fase aktif jika fase_id tidak dikirim
    const resolvedFaseId = fase_id || (await getFaseAktif(env))?.id || null;

    const result = await env.DB.prepare(
      `INSERT INTO spinner_hasil (fase_id, jamaah_id, nama_terpilih, jadwal_id, dipilih_pada, dicatat_oleh)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      resolvedFaseId,
      jamaah_id,
      nama_terpilih,
      jadwal_id || null,
      waktu || new Date().toISOString(),
      request.user.id
    ).run();

    await auditLog(env, request.user.id, 'SAVE_HASIL', 'spinner_hasil', result.meta.last_row_id, {
      jamaah_id, nama_terpilih
    });

    return createResponse({ id: result.meta.last_row_id, success: true }, 201);
  }

  // ── POST /api/spinner/priority — set prioritas peserta ───────
  if (request.method === 'POST' && subpath === 'priority') {
    requireAdmin(request);
    const { jamaah_id } = await request.json();

    const fase = await getFaseAktif(env);
    if (!fase) return createResponse({ error: 'Tidak ada fase aktif' }, 404);

    // Hapus priority lama
    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'waiting', updated_at = datetime('now')
       WHERE fase_id = ? AND status = 'priority'`
    ).bind(fase.id).run();

    // Set priority baru
    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'priority', updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ? AND status IN ('waiting','skipped')`
    ).bind(fase.id, jamaah_id).run();

    await auditLog(env, request.user.id, 'SET_PRIORITY', 'peserta_fase', jamaah_id, { fase_id: fase.id });
    return createResponse({ success: true });
  }

  // ── POST /api/spinner/skip — skip peserta ────────────────────
  if (request.method === 'POST' && subpath === 'skip') {
    requireAdmin(request);
    const { jamaah_id } = await request.json();

    const fase = await getFaseAktif(env);
    if (!fase) return createResponse({ error: 'Tidak ada fase aktif' }, 404);

    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'skipped', updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ? AND status IN ('waiting','priority')`
    ).bind(fase.id, jamaah_id).run();

    await auditLog(env, request.user.id, 'SKIP', 'peserta_fase', jamaah_id, { fase_id: fase.id });
    return createResponse({ success: true });
  }

  // ── POST /api/spinner/restore — restore peserta skipped ──────
  if (request.method === 'POST' && subpath === 'restore') {
    requireAdmin(request);
    const { jamaah_id } = await request.json();

    const fase = await getFaseAktif(env);
    if (!fase) return createResponse({ error: 'Tidak ada fase aktif' }, 404);

    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'waiting', updated_at = datetime('now')
       WHERE fase_id = ? AND jamaah_id = ? AND status = 'skipped'`
    ).bind(fase.id, jamaah_id).run();

    return createResponse({ success: true });
  }

  // ── POST /api/spinner/reset — reset fase aktif ───────────────
  if (request.method === 'POST' && subpath === 'reset') {
    requireAdmin(request);

    const fase = await getFaseAktif(env);
    if (!fase) return createResponse({ error: 'Tidak ada fase aktif untuk di-reset' }, 404);

    await env.DB.prepare(
      `UPDATE peserta_fase SET status = 'waiting', urutan_terpilih = NULL, updated_at = datetime('now')
       WHERE fase_id = ?`
    ).bind(fase.id).run();

    await env.DB.prepare(
      `DELETE FROM histori_giliran WHERE fase_id = ?`
    ).bind(fase.id).run();

    await auditLog(env, request.user.id, 'RESET_FASE', 'fase_giliran', fase.id, {});
    return createResponse({ success: true, message: 'Fase berhasil direset' });
  }

  // ── POST /api/spinner/fase — buat fase baru (manual, jarang dipakai) ──
  if (request.method === 'POST' && subpath === 'fase') {
    requireAdmin(request);

    // Pastikan tidak ada fase aktif lain
    const existing = await getFaseAktif(env);
    if (existing) {
      return createResponse({
        error: 'Masih ada fase aktif. Selesaikan fase saat ini sebelum membuat fase baru.',
        fase_aktif: existing
      }, 400);
    }

    const faseId = await buatFaseBaru(env, request.user.id);
    const fase = await env.DB.prepare('SELECT * FROM fase_giliran WHERE id = ?').bind(faseId).first();
    return createResponse(fase, 201);
  }

  return createResponse({ error: 'Route not found' }, 404);
}
