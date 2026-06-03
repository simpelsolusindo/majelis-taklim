// ============================================================
// Helpers & Utilities
// ============================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

// Simple JWT implementation using Web Crypto API
export async function createJWT(payload, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 * 7 }));
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${data}.${sigB64}`;
}

export async function verifyJWT(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false };
  }
  const token = authHeader.substring(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { success: false };
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return { success: false, error: 'Token expired' };

    const data = `${parts[0]}.${parts[1]}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.JWT_SECRET || 'majelis-taklim-secret-key'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return { success: false };
    return { success: true, user: payload };
  } catch {
    return { success: false };
  }
}

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'majelis_salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function requireAdmin(request) {
  if (request.user?.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

export function getPagination(url) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export async function auditLog(env, userId, aksi, tabel, recordId, detail) {
  try {
    await env.DB.prepare(
      'INSERT INTO audit_log (user_id, aksi, tabel, record_id, detail) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, aksi, tabel, recordId, JSON.stringify(detail)).run();
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
