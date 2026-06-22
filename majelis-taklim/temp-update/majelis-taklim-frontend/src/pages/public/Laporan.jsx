import { useQuery } from '@tanstack/react-query'
import { dashboardApi, iuranApi, kehadiranApi, jadwalApi } from '../../api/services'
import { Card, Spinner } from '../../components/ui'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { BarChart2, Users, Wallet, CheckSquare, Calendar } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Laporan publik menampilkan ringkasan dari PERTEMUAN TERAKHIR (jadwal
// terakhir), bukan rekap per bulan kalender — sesuai alur kerja: kehadiran &
// iuran selalu dicatat per pertemuan, jadi laporan publik ikut per pertemuan.
// ─────────────────────────────────────────────────────────────────────────────

// Mini bar chart sederhana (pure CSS, tanpa library)
function MiniBar({ value, max, color = 'emerald' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const colors = {
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-400',
    blue:    'bg-blue-500',
    rose:    'bg-rose-500',
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colors[color]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function LaporanPage() {
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardApi.get().then(r => r.data)
  })

  // Pertemuan/jadwal terakhir — acuan utama laporan ini
  const { data: jadwalData, isLoading: jadwalLoading } = useQuery({
    queryKey: ['jadwal-terakhir'],
    queryFn:  () => jadwalApi.getLast().then(r => r.data)
  })

  const jadwalTerakhir = jadwalData?.data || jadwalData || null

  const { data: iuranData, isLoading: iuranLoading } = useQuery({
    queryKey: ['laporan-iuran', jadwalTerakhir?.id],
    queryFn:  () => iuranApi.getAll({ jadwal_id: jadwalTerakhir.id, limit: 200 }).then(r => r.data),
    enabled:  !!jadwalTerakhir?.id
  })

  const { data: kehadiranData, isLoading: kehadiranLoading } = useQuery({
    queryKey: ['laporan-kehadiran', jadwalTerakhir?.id],
    queryFn:  () => kehadiranApi.getAll({ jadwal_id: jadwalTerakhir.id, limit: 200 }).then(r => r.data),
    enabled:  !!jadwalTerakhir?.id
  })

  const d            = dashData?.data || dashData
  const iuranList    = iuranData?.data || iuranData || []
  const kehadiranList = kehadiranData?.data || kehadiranData || []

  const totalJamaah  = d?.jamaah_aktif || 0
  const totalIuran   = iuranList.reduce((s, i) => s + Number(i.nominal || 0), 0)
  // Catatan: setiap baris iuran adalah pembayaran yang SUDAH masuk, jadi tidak
  // ada konsep "belum lunas" per baris — yang tidak membayar tidak punya baris.
  const jumlahPembayar = iuranList.length
  const hadir        = kehadiranList.filter(k => k.status === 'hadir').length
  const totalAbsen   = kehadiranList.length

  const tanggalLabel = jadwalTerakhir?.tanggal
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(jadwalTerakhir.tanggal))
    : ''

  const isLoading = dashLoading || jadwalLoading || iuranLoading || kehadiranLoading

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Laporan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan pertemuan terakhir</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !jadwalTerakhir ? (
        <Card className="p-8 text-center">
          <Calendar className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Belum ada data pertemuan</p>
        </Card>
      ) : (
        <>
          {/* Info pertemuan terakhir */}
          <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Pertemuan Terakhir</p>
            </div>
            <p className="font-bold text-gray-900 dark:text-white">{jadwalTerakhir.judul || "Majelis Ta'lim"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tanggalLabel}</p>
          </Card>

          {/* Ringkasan angka */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-500">Total Jamaah</p>
                <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{totalJamaah}</p>
              <p className="text-xs text-gray-400 mt-1">Anggota aktif</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-500">Iuran Terkumpul</p>
                <div className="w-7 h-7 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                </div>
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(totalIuran)}</p>
              <p className="text-xs text-gray-400 mt-1">Pertemuan ini</p>
            </Card>
          </div>

          {/* Rekap Iuran */}
          {iuranList.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Rekap Iuran</h2>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Jumlah pembayaran tercatat</span>
                <span className="font-semibold text-emerald-600">{jumlahPembayar} pembayaran</span>
              </div>
            </Card>
          )}

          {/* Rekap Kehadiran */}
          {kehadiranList.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Kehadiran</h2>
              </div>
              <div className="space-y-3">
                {['hadir','izin','tidak_hadir'].map(status => {
                  const jumlah = kehadiranList.filter(k => k.status === status).length
                  const pctColor = { hadir:'emerald', izin:'blue', tidak_hadir:'rose' }[status]
                  const label   = { hadir:'Hadir', izin:'Izin', tidak_hadir:'Tidak Hadir' }[status]
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{label}</span>
                        <span className="font-semibold">{jumlah} orang</span>
                      </div>
                      <MiniBar value={jumlah} max={kehadiranList.length} color={pctColor} />
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex justify-between text-xs">
                <span className="text-gray-500">Persentase Kehadiran</span>
                <span className="font-bold text-emerald-600">
                  {totalAbsen > 0 ? Math.round((hadir / totalAbsen) * 100) : 0}%
                </span>
              </div>
            </Card>
          )}

          {(iuranList.length === 0 && kehadiranList.length === 0) && (
            <Card className="p-8 text-center">
              <BarChart2 className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Belum ada data kehadiran/iuran untuk pertemuan ini</p>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
