import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './store/auth'
import { ThemeProvider } from './store/theme'
import ProtectedRoute from './components/layout/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// ── Public pages ──────────────────────────────────────────
import PublicDashboard from './pages/public/Dashboard'
import BacaanPage      from './pages/public/Bacaan'
import JadwalPage      from './pages/public/Jadwal'
import IuranPage       from './pages/public/Iuran'
import GiliranPage     from './pages/public/Giliran'
import JamaahPage      from './pages/public/Jamaah'
import LaporanPage     from './pages/public/Laporan'
import PengumumanPage  from './pages/public/Pengumuman'

// ── Admin pages ───────────────────────────────────────────
import AdminLogin      from './pages/admin/Login'
import AdminDashboard  from './pages/admin/Dashboard'
import AdminJamaah     from './pages/admin/Jamaah'
import AdminIuran      from './pages/admin/Iuran'
import AdminJenisIuran from './pages/admin/JenisIuran'
import AdminKehadiran  from './pages/admin/Kehadiran'
import AdminPengumuman from './pages/admin/Pengumuman'
import AdminJadwal     from './pages/admin/Jadwal'
import AdminSpinner    from './pages/admin/Spinner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
})

function PL({ children }) {
  return <PublicLayout>{children}</PublicLayout>
}

function AdminApp() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Routes>
          <Route index                element={<AdminDashboard  />} />
          <Route path="jamaah"        element={<AdminJamaah     />} />
          <Route path="iuran"         element={<AdminIuran      />} />
          <Route path="jenis-iuran"   element={<AdminJenisIuran />} />
          <Route path="kehadiran"     element={<AdminKehadiran  />} />
          <Route path="pengumuman"    element={<AdminPengumuman />} />
          <Route path="jadwal"        element={<AdminJadwal     />} />
          <Route path="spinner"       element={<AdminSpinner    />} />
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public — 7 menu utama */}
              <Route path="/"           element={<PL><PublicDashboard /></PL>} />
              <Route path="/bacaan"     element={<PL><BacaanPage      /></PL>} />
              <Route path="/jadwal"     element={<PL><JadwalPage      /></PL>} />
              <Route path="/iuran"      element={<PL><IuranPage       /></PL>} />
              <Route path="/giliran"    element={<PL><GiliranPage     /></PL>} />
              <Route path="/jamaah"     element={<PL><JamaahPage      /></PL>} />
              <Route path="/laporan"    element={<PL><LaporanPage     /></PL>} />
              <Route path="/pengumuman" element={<PL><PengumumanPage  /></PL>} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*"     element={<AdminApp   />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
