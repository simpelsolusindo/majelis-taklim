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
  getById: (id) => client.get(`/jadwal/${id}`),   // GET /jadwal/:id — wajib ada field: { status, iuran_sudah_dicatat }
  create: (data) => client.post('/jadwal', data),  // Body harus terima field host_id
  update: (id, data) => client.put(`/jadwal/${id}`, data),
  delete: (id) => client.delete(`/jadwal/${id}`),
  // Ambil jadwal terakhir — backend endpoint GET /jadwal/terakhir
  // Response wajib: { id, tanggal, status: 'selesai'|'akan-datang', iuran_sudah_dicatat: bool }
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
// CHECKLIST ENDPOINT BACKEND (semua wajib tersedia sebelum fitur ini final):
//   ✓ GET  /spinner/fase           — daftar fase
//   ✓ GET  /spinner/fase/:id       — detail fase + peserta
//   ✓ POST /spinner/fase           — buat fase baru
//   ✓ POST /spinner/putar          — catat putaran (opsional, bisa digabung ke /spinner/hasil)
//   ✗ POST /spinner/hasil          — simpan hasil pemenang (WAJIB ada)
//   ✗ PUT  /jamaah/:id/next-host   — tandai jamaah sebagai host berikutnya (WAJIB ada)
//   ✗ GET  /spinner/riwayat        — riwayat putaran (aktifkan enabled:true setelah tersedia)
//
// ROLLBACK: Selama backend belum menyediakan transaksi atomik, frontend
// hanya bisa rollback jadwal (DELETE /jadwal/:id). Untuk rollback penuh,
// backend perlu: DELETE /spinner/hasil/:id dan reset PUT /jamaah/:id/next-host.
export const spinnerApi = {
  getFases: () => client.get('/spinner/fase'),
  getFaseById: (id) => client.get(`/spinner/fase/${id}`),
  createFase: (data) => client.post('/spinner/fase', data),
  putar: (data) => client.post('/spinner/putar', data),
  // Simpan hasil putaran ke backend — endpoint wajib tersedia
  saveHasil: (data) => client.post('/spinner/hasil', data),
  // Tandai jamaah sebagai host berikutnya — endpoint wajib tersedia
  setNextHost: (jamaahId, data) => client.put(`/jamaah/${jamaahId}/next-host`, data),
  // Riwayat putaran — aktifkan query enabled:true setelah endpoint ini tersedia
  getRiwayat: (params) => client.get('/spinner/riwayat', { params }),
}
