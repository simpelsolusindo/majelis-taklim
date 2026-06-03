// ============================================================
// Majelis Taklim — Cloudflare Workers Entry Point
//
// Akses publik  : GET /api/dashboard, /api/bacaan, /api/jadwal, /api/pengumuman
// Akses admin   : semua POST/PUT/DELETE + jamaah, iuran, kehadiran, spinner, laporan
// ============================================================

import { handleAuth }    from './routes/auth.js';
import { handleJamaah }  from './routes/jamaah.js';
import { handleIuran }   from './routes/iuran.js';
import { handleSpinner } from './routes/spinner.js';
import {
  handleDashboard,
  handleBacaan,
  handleJadwal,
  handleKehadiran,
  handlePengumuman,
} from './routes/other.js';
import {
  handleLaporan,
  handleAdminMisc,
} from './routes/admin.js';

import { createResponse, corsHeaders, verifyJWT } from './utils/helpers.js';

// Route yang boleh diakses TANPA token (hanya GET)
function isPublic(path, method) {
  if (path === '/api/auth/login') return true;
  if (method !== 'GET') return false;
  const publicPrefixes = ['/api/dashboard', '/api/bacaan', '/api/jadwal', '/api/pengumuman'];
  return publicPrefixes.some(p => path.startsWith(p));
}

export default {
  async fetch(request, env, ctx) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (!path.startsWith('/api/')) return new Response('Not Found', { status: 404 });

    try {
      return await route(request, env, path);
    } catch (err) {
      console.error('[Worker]', err.message);
      // Bedakan error admin-guard vs error server
      if (err.message === 'Admin access required') {
        return createResponse({ error: 'Akses ditolak: hanya admin' }, 403);
      }
      return createResponse({ error: 'Internal server error', detail: err.message }, 500);
    }
  }
};

async function route(request, env, path) {
  // --- Auth terbuka ---
  if (path.startsWith('/api/auth')) return handleAuth(request, env, path);

  // --- Public routes ---
  if (isPublic(path, request.method)) {
    request.user = null;
    return dispatch(request, env, path);
  }

  // --- Protected: cek JWT ---
  const auth = await verifyJWT(request, env);
  if (!auth.success) {
    return createResponse({
      error: 'Login diperlukan untuk fitur ini',
      reason: auth.error || 'Token tidak valid atau sudah kadaluarsa',
    }, 401);
  }
  request.user = auth.user;
  return dispatch(request, env, path);
}

function dispatch(request, env, path) {
  if (path.startsWith('/api/dashboard'))  return handleDashboard(request, env, path);
  if (path.startsWith('/api/bacaan'))     return handleBacaan(request, env, path);
  if (path.startsWith('/api/jadwal'))     return handleJadwal(request, env, path);
  if (path.startsWith('/api/pengumuman')) return handlePengumuman(request, env, path);
  if (path.startsWith('/api/jamaah'))     return handleJamaah(request, env, path);
  if (path.startsWith('/api/kehadiran'))  return handleKehadiran(request, env, path);
  if (path.startsWith('/api/iuran'))      return handleIuran(request, env, path);
  if (path.startsWith('/api/spinner'))    return handleSpinner(request, env, path);
  if (path.startsWith('/api/laporan'))    return handleLaporan(request, env, path);
  if (path.startsWith('/api/admin'))      return handleAdminMisc(request, env, path);

  // Profil sendiri
  if (path === '/api/me' && request.method === 'GET') {
    if (!request.user) return createResponse({ error: 'Login diperlukan' }, 401);
    return env.DB.prepare(
      `SELECT u.id, u.username, u.role, u.last_login,
              j.nama, j.nomor_hp, j.alamat
       FROM users u LEFT JOIN jamaah j ON j.id = u.jamaah_id
       WHERE u.id = ?`
    ).bind(request.user.id).first().then(u => createResponse(u));
  }

  return createResponse({ error: 'Route tidak ditemukan: ' + path }, 404);
}
