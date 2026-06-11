import { useQuery } from '@tanstack/react-query'
import { jadwalApi } from '../../api/services'
import { Card, Spinner, EmptyState } from '../../components/ui'
import { formatDate, formatTime } from '../../utils/helpers'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'

function HijriDate() {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date())
  } catch {
    return null
  }
}

export default function JadwalPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['jadwal-public'],
    queryFn: () => jadwalApi.getAll().then(r => r.data)
  })

  const allJadwal = data?.data || data || []
  const now = new Date()

  // Pisahkan mendatang vs lampau
  const upcoming = allJadwal
    .filter(j => new Date(j.tanggal) >= now)
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
  const past = allJadwal
    .filter(j => new Date(j.tanggal) < now)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

  const next = upcoming[0] || null

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jadwal Pertemuan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pertemuan rutin setiap 2 minggu sekali, malam Minggu</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          {/* Pertemuan berikutnya — card utama */}
          {next && (
            <div className="bg-emerald-600 dark:bg-emerald-700 rounded-2xl p-5 text-white">
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide mb-2">Pertemuan Berikutnya</p>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-100">
                    {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(next.tanggal))}
                  </span>
                  <span className="text-2xl font-black leading-none">
                    {new Date(next.tanggal).getDate()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-lg leading-snug">
                    {next.keterangan || 'Majelis Ta\'lim'}
                  </p>
                  <p className="text-emerald-100 text-sm mt-1">
                    {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(next.tanggal))}
                  </p>
                  {next.waktu && (
                    <p className="text-emerald-100 text-sm flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(next.waktu)} WIB
                    </p>
                  )}
                  {next.lokasi && (
                    <p className="text-emerald-100 text-sm flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {next.lokasi}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Jadwal mendatang lainnya */}
          {upcoming.length > 1 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Akan Datang</h2>
              <div className="space-y-2.5">
                {upcoming.slice(1).map((j, i) => (
                  <JadwalCard key={j.id || i} jadwal={j} />
                ))}
              </div>
            </section>
          )}

          {/* Riwayat pertemuan */}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Riwayat Pertemuan</h2>
              <div className="space-y-2.5">
                {past.map((j, i) => (
                  <JadwalCard key={j.id || i} jadwal={j} past />
                ))}
              </div>
            </section>
          )}

          {allJadwal.length === 0 && (
            <EmptyState icon="📅" title="Belum ada jadwal" description="Jadwal pertemuan akan ditampilkan di sini" />
          )}
        </>
      )}
    </div>
  )
}

function JadwalCard({ jadwal, past }) {
  const tanggal = new Date(jadwal.tanggal)
  return (
    <Card className={`overflow-hidden ${past ? 'opacity-70' : ''}`}>
      <div className="flex">
        <div className={`w-1.5 ${past ? 'bg-gray-300 dark:bg-gray-700' : 'bg-emerald-500'}`} />
        <div className="flex-1 p-3.5 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${past ? 'bg-gray-100 dark:bg-gray-800' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
            <span className={`text-xs font-bold ${past ? 'text-gray-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(tanggal)}
            </span>
            <span className={`text-lg font-black leading-none ${past ? 'text-gray-600 dark:text-gray-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {tanggal.getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {jadwal.keterangan || "Majelis Ta'lim"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(tanggal)}
              {jadwal.waktu ? ` · ${formatTime(jadwal.waktu)} WIB` : ''}
              {jadwal.lokasi ? ` · ${jadwal.lokasi}` : ''}
            </p>
          </div>
          {past && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Selesai</span>}
        </div>
      </div>
    </Card>
  )
}
