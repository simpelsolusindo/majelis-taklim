import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { iuranApi, jamaahApi } from '../../api/services'
import { Card, Spinner, EmptyState, Badge } from '../../components/ui'
import { formatCurrency, formatDate, currentMonth } from '../../utils/helpers'
import { Wallet, Search, ChevronDown } from 'lucide-react'

export default function IuranPage() {
  const [periode, setPeriode] = useState(currentMonth())
  const [searchJamaah, setSearchJamaah] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['iuran-public', periode],
    queryFn: () => iuranApi.getAll({ periode, limit: 100 }).then(r => r.data)
  })

  const iuranList = data?.data || data || []

  const filtered = searchJamaah
    ? iuranList.filter(i =>
        (i.jamaah_nama || i.nama || '').toLowerCase().includes(searchJamaah.toLowerCase())
      )
    : iuranList

  const totalLunas   = iuranList.filter(i => i.status === 'lunas').reduce((s, i) => s + Number(i.jumlah || 0), 0)
  const totalBelum   = iuranList.filter(i => i.status !== 'lunas').reduce((s, i) => s + Number(i.jumlah || 0), 0)
  const jumlahLunas  = iuranList.filter(i => i.status === 'lunas').length
  const jumlahBelum  = iuranList.filter(i => i.status !== 'lunas').length

  // Format bulan yang ditampilkan
  const periodeLabel = periode
    ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(periode + '-01'))
    : ''

  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Iuran</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Rekap iuran Majelis Ta&apos;lim</p>
      </div>

      {/* Filter bulan */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      {/* Ringkasan bulan */}
      {!isLoading && iuranList.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Sudah Lunas</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalLunas)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{jumlahLunas} orang</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Belum Lunas</p>
            <p className="text-xl font-bold text-amber-500">{formatCurrency(totalBelum)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{jumlahBelum} orang</p>
          </Card>
        </div>
      )}

      {/* Search nama */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Cari nama jamaah..." value={searchJamaah}
          onChange={e => setSearchJamaah(e.target.value)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      {/* List iuran */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="💰" title="Belum ada data iuran"
          description={`Belum ada catatan iuran untuk ${periodeLabel}`} />
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <Card key={item.id || i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {item.jamaah_nama || item.nama || '-'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.jenis_nama || item.jenis_iuran || 'Iuran'} · {periodeLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.jumlah)}
                  </p>
                  <Badge color={item.status === 'lunas' ? 'emerald' : 'amber'} className="mt-0.5">
                    {item.status === 'lunas' ? 'Lunas' : 'Belum'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
