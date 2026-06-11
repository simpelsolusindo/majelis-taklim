import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { jamaahApi } from '../../api/services'
import { Card, Spinner, EmptyState, Pagination } from '../../components/ui'
import { getInitials } from '../../utils/helpers'
import { Search, Users } from 'lucide-react'

export default function JamaahPage() {
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['jamaah-public', page, search],
    queryFn:  () => jamaahApi.getAll({ page, limit: 20, search: search || undefined, status: 'aktif' }).then(r => r.data),
    keepPreviousData: true,
  })

  const jamaah    = data?.data || data || []
  const total     = data?.total || jamaah.length
  const totalPages = data?.totalPages || data?.total_pages || 1

  const BG_COLORS = [
    'bg-emerald-500','bg-blue-500','bg-purple-500','bg-amber-500',
    'bg-rose-500','bg-cyan-500','bg-indigo-500','bg-teal-500',
  ]

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jamaah</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Daftar anggota majelis</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{total} orang</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Cari nama jamaah..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : jamaah.length === 0 ? (
        <EmptyState icon="👥" title="Jamaah tidak ditemukan" />
      ) : (
        <>
          {/* Grid kartu jamaah */}
          <div className="grid grid-cols-2 gap-3">
            {jamaah.map((j, i) => {
              const bgColor = BG_COLORS[i % BG_COLORS.length]
              return (
                <Card key={j.id || i} className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-2xl ${bgColor} flex items-center justify-center mb-2 shadow-sm`}>
                    <span className="text-white font-bold text-base">{getInitials(j.nama)}</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">
                    {j.nama}
                  </p>
                  {j.alamat && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{j.alamat}</p>
                  )}
                  <span className={`inline-flex mt-2 items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${j.status === 'aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                    {j.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                  </span>
                </Card>
              )
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
