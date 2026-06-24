import client from './client'

// Auth
export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials),
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user') }
}

// Dashboard
export const dashboardApi = {
  get: () => client.get('/dashboard')
}

// Jamaah
export const jamaahApi = {
  getAll: (params) => client.get('/jamaah', { params }),
  getById: (id) => client.get(`/jamaah/${id}`),
  create: (data) => client.post('/jamaah', data),
  update: (id, data) => client.put(`/jamaah/${id}`, data),
  delete: (id) => client.delete(`/jamaah/${id}`)
}

// Iuran
export const iuranApi = {
  getAll: (params) => client.get('/iuran', { params }),
  getById: (id) => client.get(`/iuran/${id}`),
  create: (data) => client.post('/iuran', data),
  update: (id, data) => client.put(`/iuran/${id}`, data),
  delete: (id) => client.delete(`/iuran/${id}`)
}

// Jenis Iuran
export const jenisIuranApi = {
  getAll: () => client.get('/jenis-iuran'),
  create: (data) => client.post('/jenis-iuran', data),
  update: (id, data) => client.put(`/jenis-iuran/${id}`, data),
  delete: (id) => client.delete(`/jenis-iuran/${id}`)
}

// Kehadiran
export const kehadiranApi = {
  getAll: (params) => client.get('/kehadiran', { params }),
  create: (data) => client.post('/kehadiran', data),
  update: (id, data) => client.put(`/kehadiran/${id}`, data),
  delete: (id) => client.delete(`/kehadiran/${id}`)
}

// Jadwal
export const jadwalApi = {
  getAll: (params) => client.get('/jadwal', { params }),
  getById: (id) => client.get(`/jadwal/${id}`),
  create: (data) => client.post('/jadwal', data),
  update: (id, data) => client.put(`/jadwal/${id}`, data),
  delete: (id) => client.delete(`/jadwal/${id}`),
  // GET /jadwal/terakhir — jadwal terbaru berdasarkan tanggal
  getLast: () => client.get('/jadwal/terakhir'),
}

// Pengumuman
export const pengumumanApi = {
  getAll: (params) => client.get('/pengumuman', { params }),
  getById: (id) => client.get(`/pengumuman/${id}`),
  create: (data) => client.post('/pengumuman', data),
  update: (id, data) => client.put(`/pengumuman/${id}`, data),
  delete: (id) => client.delete(`/pengumuman/${id}`)
}

// Bacaan
export const bacaanApi = {
  getAll: () => client.get('/bacaan')
}

// Spinner
export const spinnerApi = {
  // GET /spinner/aktif — fase aktif saat ini + peserta (auto-create jika belum ada)
  getFaseAktif: () => client.get('/spinner/aktif'),
  // GET /spinner/fase — daftar semua fase (untuk info admin)
  getFases: () => client.get('/spinner/fase'),
  getFaseById: (id) => client.get(`/spinner/fase/${id}`),
  // POST /spinner/fase — buat fase baru manual (jarang dipakai, biasanya auto)
  createFase: (data) => client.post('/spinner/fase', data),
  // POST /spinner/putar — backend pilih acak dari fase aktif
  putar: (data) => client.post('/spinner/putar', data),
  // POST /spinner/hasil — simpan hasil pemenang
  saveHasil: (data) => client.post('/spinner/hasil', data),
  // PUT /jamaah/:id/next-host — tandai jamaah sebagai host berikutnya
  setNextHost: (jamaahId, data) => client.put(`/jamaah/${jamaahId}/next-host`, data),
  // GET /spinner/riwayat — riwayat hasil spinner
  getRiwayat: (params) => client.get('/spinner/riwayat', { params }),
  // POST /spinner/reset — reset fase aktif
  reset: () => client.post('/spinner/reset', {}),
}
