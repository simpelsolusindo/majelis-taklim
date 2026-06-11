import { useQuery } from '@tanstack/react-query'
import { dashboardApi, pengumumanApi, jadwalApi } from '../../api/services'
import { StatCard, Card, Spinner } from '../../components/ui'
import { formatDate, formatTime, formatCurrency, getPriorityColor, getPriorityLabel } from '../../utils/helpers'
import { Calendar, Clock, MapPin, ChevronRight, BookOpen, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PublicDashboard() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardApi.get().then(r => r.data)
  })
  const { data: pengumumanData } = useQuery({
    queryKey: ['pengumuman-public'],
    queryFn:  () => pengumumanApi.getAll({ limit: 3 }).then(r => r.data)
  })
  const { data: jadwalData } = useQuery({
    queryKey: ['jadwal-public'],
    queryFn:  () => jadwalApi.getAll({ limit: 3 }).then(r => r.data)
  })

  const dashboard   = dashData?.data || dashData
  const pengumumans = pengumumanData?.data || pengumumanData || []
  const jadwals     = jadwalData?.data    || jadwalData    || []

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-700 to-emerald-800 dark:from-emerald-900 dark:to-gray-900 text-white px-4 py-7 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grd" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 2 L38 38 L2 38 Z" fill="none" stroke="white" strokeWidth="0.7"/>
                <circle cx="20" cy="20" r="7" fill="none" stroke="white" strokeWidth="0.7"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grd)"/>
          </svg>
        </div>
        <div className="relative">
          <p className="text-right text-emerald-100 mb-2 leading-loose" style={{ fontFamily: 'Amiri, serif', fontSize: '17px' }}>
            السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
          </p>
          <h1 className="text-xl font-black">Majelis Ta&apos;lim</h1>
          <p className="text-emerald-200 font-semibold">Perum The Cemandi</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-black/15 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-xs text-white">
              {new Intl.DateTimeFormat('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date())}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Shortcut Bacaan */}
        <Link to="/bacaan">
          <div className="flex items-center gap-3 bg-emerald-600 dark:bg-emerald-700 rounded-2xl px-4 py-4 text-white active:scale-[0.98] transition-transform shadow-sm">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Baca Doa &amp; Bacaan Majelis</p>
              <p className="text-emerald-100 text-xs mt-0.5">Tawassul · Yasin · Tahlil · Istighatsah · Doa Arwah</p>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
          </div>
        </Link>

        {/* Stats */}
        {isLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="👥" label="Jamaah Aktif"    value={dashboard?.totalJamaah    || dashboard?.total_jamaah    || 0} color="emerald" />
            <StatCard icon="✅" label="Hadir Bulan Ini"  value={dashboard?.kehadiranBulanIni || dashboard?.kehadiran_bulan_ini || 0} color="blue"    />
            <StatCard icon="💰" label="Iuran Bulan Ini"  value={formatCurrency(dashboard?.iuranBulanIni || dashboard?.iuran_bulan_ini || 0)} sub="Terkumpul" color="amber"   />
            <StatCard icon="📢" label="Pengumuman"      value={dashboard?.pengumumanAktif || dashboard?.pengumuman_aktif || 0} sub="Aktif" color="purple"  />
          </div>
        )}

        {/* Jadwal Terdekat */}
        {jadwals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" /> Jadwal Terdekat
              </h2>
              <Link to="/jadwal" className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-semibold">
                Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {jadwals.slice(0, 2).map((j, i) => (
                <Card key={j.id || i} className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                        {new Intl.DateTimeFormat('id-ID',{month:'short'}).format(new Date(j.tanggal))}
                      </span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 leading-none">
                        {new Date(j.tanggal).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">
                        {j.keterangan || "Majelis Ta'lim"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {j.waktu && <>{formatTime(j.waktu)} WIB</>}
                        {j.lokasi && <> · {j.lokasi}</>}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Pengumuman terbaru */}
        {pengumumans.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-emerald-600" /> Pengumuman
              </h2>
              <Link to="/pengumuman" className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-semibold">
                Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {pengumumans.slice(0, 2).map((p, i) => (
                <Card key={p.id || i} className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{p.judul}</h3>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(p.prioritas)}`}>
                      {getPriorityLabel(p.prioritas)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{p.isi}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
