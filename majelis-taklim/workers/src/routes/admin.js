// ============================================================
// Admin Routes — Pengumuman, Laporan Export, Ganti Password
// ============================================================

import { createResponse, requireAdmin, auditLog } from '../utils/helpers.js';

// ── PENGUMUMAN (admin CRUD) ──────────────────────────────────
export async function handlePengumumanAdmin(request, env, path) {
  const segments = path.split('/').filter(Boolean);
  const id       = segments[2] ? parseInt(segments[2]) : null;

  requireAdmin(request);

  if (request.method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT * FROM pengumuman ORDER BY created_at DESC'
    ).all();
    return createResponse(rows.results);
  }

  if (request.method === 'POST') {
    const { judul, isi, prioritas, tanggal_mulai, tanggal_selesai } = await request.json();
    if (!judul || !isi) return createResponse({ error: 'Judul dan isi wajib diisi' }, 400);
    const result = await env.DB.prepare(
      `INSERT INTO pengumuman (judul, isi, prioritas, tanggal_mulai, tanggal_selesai, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(judul, isi, prioritas || 'normal', tanggal_mulai || null,
           tanggal_selesai || null, request.user.id).run();
    await auditLog(env, request.user.id, 'CREATE', 'pengumuman', result.meta.last_row_id, { judul });
    return createResponse({ id: result.meta.last_row_id }, 201);
  }

  if (request.method === 'PUT' && id) {
    const { judul, isi, prioritas, tanggal_selesai } = await request.json();
    await env.DB.prepare(
      `UPDATE pengumuman SET judul=?, isi=?, prioritas=?, tanggal_selesai=? WHERE id=?`
    ).bind(judul, isi, prioritas || 'normal', tanggal_selesai || null, id).run();
    return createResponse({ success: true });
  }

  if (request.method === 'DELETE' && id) {
    await env.DB.prepare('DELETE FROM pengumuman WHERE id = ?').bind(id).run();
    await auditLog(env, request.user.id, 'DELETE', 'pengumuman', id, {});
    return createResponse({ success: true });
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}

// ── LAPORAN / EXPORT ─────────────────────────────────────────
// GET /api/laporan/iuran?periode=2025-01&format=csv
// GET /api/laporan/kehadiran?bulan=2025-01&format=csv
// GET /api/laporan/jamaah?format=csv

export async function handleLaporan(request, env, path) {
  requireAdmin(request);
  if (request.method !== 'GET') return createResponse({ error: 'Method not allowed' }, 405);

  const url      = new URL(request.url);
  const segments = path.split('/').filter(Boolean); // ['api','laporan','jenis']
  const jenis    = segments[2];
  const format   = url.searchParams.get('format') || 'json';

  // ── Laporan Iuran ──────────────────────────────────────────
  if (jenis === 'iuran') {
    const periode = url.searchParams.get('periode') || new Date().toISOString().slice(0, 7);
    const rows = await env.DB.prepare(
      `SELECT i.id, j.nama as jamaah, j.nomor_hp, ji.nama as jenis_iuran,
              i.nominal, i.tanggal_bayar, i.periode, i.keterangan
       FROM iuran i
       JOIN jamaah j     ON j.id = i.jamaah_id
       JOIN jenis_iuran ji ON ji.id = i.jenis_iuran_id
       WHERE i.periode = ?
       ORDER BY ji.nama, j.nama`
    ).bind(periode).all();

    if (format === 'csv') {
      const header = 'No,Nama Jamaah,No HP,Jenis Iuran,Nominal,Tanggal Bayar,Periode,Keterangan';
      const lines  = rows.results.map((r, i) =>
        `${i+1},"${r.jamaah}","${r.nomor_hp||''}","${r.jenis_iuran}",${r.nominal},"${r.tanggal_bayar}","${r.periode}","${r.keterangan||''}"`
      );
      const csv = [header, ...lines].join('\n');
      return new Response('\uFEFF' + csv, {   // BOM untuk Excel
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="iuran-${periode}.csv"`,
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const total = rows.results.reduce((s, r) => s + r.nominal, 0);
    return createResponse({ periode, total, jumlah: rows.results.length, data: rows.results });
  }

  // ── Laporan Kehadiran ──────────────────────────────────────
  if (jenis === 'kehadiran') {
    const bulan = url.searchParams.get('bulan') || new Date().toISOString().slice(0, 7);
    const rows  = await env.DB.prepare(
      `SELECT j.nama as jamaah, j.nomor_hp,
              COUNT(CASE WHEN k.status='hadir'       THEN 1 END) as hadir,
              COUNT(CASE WHEN k.status='izin'        THEN 1 END) as izin,
              COUNT(CASE WHEN k.status='tidak_hadir' THEN 1 END) as tidak_hadir,
              COUNT(k.id) as total_kegiatan,
              ROUND(COUNT(CASE WHEN k.status='hadir' THEN 1 END)*100.0/NULLIF(COUNT(k.id),0),1) as persen_hadir
       FROM jamaah j
       LEFT JOIN kehadiran k  ON k.jamaah_id = j.id
       LEFT JOIN jadwal    jd ON jd.id = k.jadwal_id
          AND strftime('%Y-%m', jd.tanggal) = ?
       WHERE j.status = 'aktif'
       GROUP BY j.id ORDER BY j.nama`
    ).bind(bulan).all();

    if (format === 'csv') {
      const header = 'No,Nama Jamaah,No HP,Hadir,Izin,Tidak Hadir,Total Kegiatan,% Hadir';
      const lines  = rows.results.map((r, i) =>
        `${i+1},"${r.jamaah}","${r.nomor_hp||''}",${r.hadir||0},${r.izin||0},${r.tidak_hadir||0},${r.total_kegiatan||0},${r.persen_hadir||0}%`
      );
      const csv = [header, ...lines].join('\n');
      return new Response('\uFEFF' + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="kehadiran-${bulan}.csv"`,
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    return createResponse({ bulan, data: rows.results });
  }

  // ── Laporan Jamaah ─────────────────────────────────────────
  if (jenis === 'jamaah') {
    const rows = await env.DB.prepare(
      `SELECT id, nama, nomor_hp, alamat, status, tanggal_bergabung FROM jamaah ORDER BY nama`
    ).all();

    if (format === 'csv') {
      const header = 'No,Nama,No HP,Alamat,Status,Tanggal Bergabung';
      const lines  = rows.results.map((r, i) =>
        `${i+1},"${r.nama}","${r.nomor_hp||''}","${r.alamat||''}","${r.status}","${r.tanggal_bergabung||''}"`
      );
      const csv = [header, ...lines].join('\n');
      return new Response('\uFEFF' + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="jamaah.csv"',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    return createResponse({ data: rows.results });
  }

  // ── Rekap Dashboard Admin ──────────────────────────────────
  if (jenis === 'rekap') {
    const bulan = url.searchParams.get('bulan') || new Date().toISOString().slice(0, 7);
    const [jamaahAktif, totalIuran, totalHadir, tunggakanPKK] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) as c FROM jamaah WHERE status='aktif'").first(),
      env.DB.prepare("SELECT SUM(nominal) as total FROM iuran WHERE periode=?").bind(bulan).first(),
      env.DB.prepare(
        `SELECT COUNT(*) as c FROM kehadiran k JOIN jadwal j ON j.id=k.jadwal_id
         WHERE strftime('%Y-%m',j.tanggal)=? AND k.status='hadir'`
      ).bind(bulan).first(),
      env.DB.prepare(
        `SELECT COUNT(*) as c FROM jamaah WHERE status='aktif'
         AND id NOT IN (SELECT jamaah_id FROM iuran WHERE periode=? AND jenis_iuran_id=1)`
      ).bind(bulan).first(),
    ]);
    return createResponse({
      bulan,
      jamaah_aktif:   jamaahAktif.c,
      total_iuran:    totalIuran.total || 0,
      total_hadir:    totalHadir.c,
      tunggakan_pkk:  tunggakanPKK.c,
    });
  }

  return createResponse({ error: 'Jenis laporan tidak dikenal: ' + jenis }, 404);
}

// ── GANTI PASSWORD ────────────────────────────────────────────
// POST /api/admin/ganti-password
export async function handleAdminMisc(request, env, path) {
  requireAdmin(request);
  const subpath = path.split('/').slice(3).join('/');

  if (subpath === 'ganti-password' && request.method === 'POST') {
    const { hashPassword } = await import('../utils/helpers.js');
    const { password_lama, password_baru } = await request.json();
    if (!password_lama || !password_baru)
      return createResponse({ error: 'Password lama dan baru wajib diisi' }, 400);

    const user = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(request.user.id).first();
    const { verifyPassword } = await import('../utils/helpers.js');
    const valid = await verifyPassword(password_lama, user.password_hash);
    if (!valid) return createResponse({ error: 'Password lama salah' }, 401);

    const newHash = await hashPassword(password_baru);
    await env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(newHash, request.user.id).run();
    return createResponse({ success: true, message: 'Password berhasil diubah' });
  }

  // GET /api/admin/audit-log
  if (subpath === 'audit-log' && request.method === 'GET') {
    const url   = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const rows  = await env.DB.prepare(
      `SELECT a.*, u.username FROM audit_log a
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC LIMIT ?`
    ).bind(limit).all();
    return createResponse(rows.results);
  }

  return createResponse({ error: 'Route tidak ditemukan' }, 404);
}
