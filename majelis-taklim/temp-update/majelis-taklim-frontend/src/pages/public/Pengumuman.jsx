import { useQuery } from '@tanstack/react-query'
import { pengumumanApi } from '../../api/services'
import { Card, Spinner, EmptyState } from '../../components/ui'
import { formatDate, getPriorityColor, getPriorityLabel } from '../../utils/helpers'
import { Megaphone } from 'lucide-react'

export default function PengumumanPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pengumuman-public-list'],
    queryFn: () => pengumumanApi.getAll().then(r => r.data)
  })

  const pengumumans = data?.data || data || []

  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pengumuman</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Informasi dan pengumuman terbaru</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : pengumumans.length === 0 ? (
        <EmptyState icon="📢" title="Belum ada pengumuman" description="Pengumuman akan ditampilkan di sini" />
      ) : (
        <div className="space-y-3">
          {pengumumans.map((p, i) => (
            <Card key={p.id || i} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">{p.judul}</h3>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(p.prioritas)}`}>
                  {getPriorityLabel(p.prioritas)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.isi}</p>
              {(p.tanggal_mulai || p.tanggal_selesai) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {p.tanggal_mulai && `Dari: ${formatDate(p.tanggal_mulai)}`}
                  {p.tanggal_selesai && ` s/d ${formatDate(p.tanggal_selesai)}`}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
