import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../store/theme'
import { Home, BookOpen, CalendarDays, Wallet, Disc, Users, BarChart2, Moon, Sun, Settings } from 'lucide-react'
import { cn } from '../../utils/helpers'

// 7 menu sesuai panduan — Bacaan di urutan ke-2 setelah Beranda
const navItems = [
  { to: '/',        icon: Home,          label: 'Beranda',  exact: true },
  { to: '/bacaan',  icon: BookOpen,       label: 'Bacaan'               },
  { to: '/jadwal',  icon: CalendarDays,   label: 'Jadwal'               },
  { to: '/iuran',   icon: Wallet,         label: 'Iuran'                },
  { to: '/giliran', icon: Disc,           label: 'Giliran'              },
  { to: '/jamaah',  icon: Users,          label: 'Jamaah'               },
  { to: '/laporan', icon: BarChart2,      label: 'Laporan'              },
]

export default function PublicLayout({ children }) {
  const { dark, toggle } = useTheme()
  const { pathname } = useLocation()

  function isActive(item) {
    if (item.exact) return pathname === item.to
    return pathname === item.to || pathname.startsWith(item.to + '/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold" style={{ fontFamily: 'Amiri, serif', fontSize: '16px' }}>م</span>
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Majelis Ta&apos;lim</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Perum The Cemandi</p>
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={toggle} aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/admin" aria-label="Panel admin"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full pb-24">
        {children}
      </main>

      {/* Bottom Navigation — scrollable untuk 7 item */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto overflow-x-auto scrollbar-none">
          <div className="flex min-w-max">
            {navItems.map(({ to, icon: Icon, label, exact }) => {
              const active = isActive({ to, exact })
              return (
                <Link key={to} to={to}
                  className={cn(
                    'flex flex-col items-center justify-center px-3 pt-2 pb-3 gap-0.5 min-w-[64px] relative transition-colors',
                    active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'
                  )}>
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                  <span className={cn('text-[10px] whitespace-nowrap', active ? 'font-bold' : 'font-medium')}>{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
