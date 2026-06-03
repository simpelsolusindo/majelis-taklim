// ============================================================
// Auth Routes
// ============================================================

import { createResponse, createJWT, hashPassword, verifyPassword } from '../utils/helpers.js';

export async function handleAuth(request, env, path) {
  const url = new URL(request.url);

  if (path === '/api/auth/login' && request.method === 'POST') {
    const { username, password } = await request.json();
    if (!username || !password) {
      return createResponse({ error: 'Username dan password wajib diisi' }, 400);
    }

    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE username = ? AND is_active = 1'
    ).bind(username).first();

    if (!user) return createResponse({ error: 'Username atau password salah' }, 401);

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return createResponse({ error: 'Username atau password salah' }, 401);

    // Update last login
    await env.DB.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?')
      .bind(user.id).run();

    const token = await createJWT(
      { id: user.id, username: user.username, role: user.role, jamaah_id: user.jamaah_id },
      env.JWT_SECRET || 'majelis-taklim-secret-key'
    );

    return createResponse({
      token,
      user: { id: user.id, username: user.username, role: user.role, jamaah_id: user.jamaah_id }
    });
  }

  if (path === '/api/auth/register' && request.method === 'POST') {
    // Only allow registration with admin token in body
    const { username, password, role, jamaah_id, admin_key } = await request.json();

    if (admin_key !== (env.ADMIN_KEY || 'majelis-admin-2024')) {
      return createResponse({ error: 'Kunci admin tidak valid' }, 403);
    }

    if (!username || !password) {
      return createResponse({ error: 'Username dan password wajib diisi' }, 400);
    }

    const hash = await hashPassword(password);
    try {
      const result = await env.DB.prepare(
        'INSERT INTO users (username, password_hash, role, jamaah_id) VALUES (?, ?, ?, ?)'
      ).bind(username, hash, role || 'jamaah', jamaah_id || null).run();

      return createResponse({ id: result.meta.last_row_id, username, role: role || 'jamaah' }, 201);
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        return createResponse({ error: 'Username sudah digunakan' }, 409);
      }
      throw e;
    }
  }

  return createResponse({ error: 'Method not allowed' }, 405);
}
