import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../api/services'
import { StatCard, Card, Spinner } from '../../components/ui'
import { formatCurrency } from '../../utils/helpers'
import { useAuth } from '../../store/auth'
import { Link } from 'react-router-dom'

const shortcuts = [
  { to: '/admin/jamaah',     icon: '👥', label: 'Jamaah'    },
  { to: '/admin/iuran',      icon: '💰', label: 'Iuran'     },
  { to: '/admin/kehadiran',  icon: '✅', label: 'Kehadiran' },
  { to: '/admin/pengumuman', icon: '📢', label: 'Pengumuman'},
  { to: '/admin/jadwal',     icon: '📅', label: 'Jadwal'    },
  { to: '/admin/spinner',    icon: '🎡', label: 'Giliran'   },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn:  () => dashboardApi.get().then(r => r.data)
  })
  const d = data?.data || data

  const hour = new Date().getHours()
  const sapa = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam'

  return (
    <div className="p-5 space-y-5 max-w-4xl">
      {/* Greeting */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative">
          <p className="text-emerald-100 text-sm font-arabic mb-0.5" style={{ fontFamily: 'Amiri, serif' }}>
            السَّلَامُ عَلَيْكُمْ
          </p>
          <h1 className="text-xl font-bold">{sapa}, {user?.username}!</h1>
          <p className="text-emerald-200 text-sm mt-0.5">
            {new Intl.DateTimeFormat('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date())}
          </p>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="👥" label="Total Jamaah"    value={d?.totalJamaah    || d?.total_jamaah    || 0} color="emerald" />
          <StatCard icon="✅" label="Hadir Bulan Ini"  value={d?.kehadiranBulanIni || d?.kehadiran_bulan_ini || 0} color="blue" />
          <StatCard icon="💰" label="Iuran Bulan Ini"  value={formatCurrency(d?.iuranBulanIni || d?.iuran_bulan_ini || 0)} color="amber" />
          <StatCard icon="📢" label="Pengumuman Aktif" value={d?.pengumumanAktif || d?.pengumuman_aktif || 0} color="purple" />
        </div>
      )}

      {/* Quick Access */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-3 gap-3">
          {shortcuts.map(item => (
            <Link key={item.to} to={item.to}>
              <Card className="p-3 text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-95 cursor-pointer">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
