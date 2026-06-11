import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { kehadiranApi, jamaahApi, jadwalApi } from '../../api/services'
import { Button, Select, Modal, Table, Pagination, ConfirmDialog, Badge } from '../../components/ui'
import { Plus, Trash2, Edit } from 'lucide-react'
import { formatDate, currentMonth } from '../../utils/helpers'

const EMPTY_FORM = { jamaah_id: '', jadwal_id: '', status: 'hadir', keterangan: '' }

export default function AdminKehadiran() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [periode, setPeriode] = useState(currentMonth())
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kehadiran', page, periode],
    queryFn: () => kehadiranApi.getAll({ page, limit: 20, periode }).then(r => r.data)
  })

  const { data: jamaahData } = useQuery({ queryKey: ['jamaah-all'], queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data) })
  const { data: jadwalData } = useQuery({ queryKey: ['jadwal-all'], queryFn: () => jadwalApi.getAll({ limit: 100 }).then(r => r.data) })

  const kehadiran = data?.data || data || []
  const totalPages = data?.totalPages || 1
  const jamaahList = jamaahData?.data || jamaahData || []
  const jadwalList = jadwalData?.data || jadwalData || []

  const deleteMut = useMutation({
    mutationFn: (id) => kehadiranApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-kehadiran']); setDeleteId(null) }
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }

  async function handleSave() {
    if (!form.jamaah_id) return
    setSaving(true)
    try {
      if (editId) await kehadiranApi.update(editId, form)
      else await kehadiranApi.create(form)
      qc.invalidateQueries(['admin-kehadiran'])
      setModal(false)
    } finally { setSaving(false) }
  }

  const statusColors = { hadir: 'emerald', izin: 'blue', sakit: 'amber', alpha: 'red' }

  const columns = [
    {
      key: 'jamaah_nama',
      title: 'Jamaah',
      render: (val, row) => <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{val || row.nama || '-'}</p>
    },
    {
      key: 'jadwal_keterangan',
      title: 'Kegiatan',
      render: (val, row) => <p className="text-xs text-gray-500">{val || row.tanggal || '-'}</p>
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => (
        <Badge color={statusColors[val] || 'gray'}>
          {val ? val.charAt(0).toUpperCase() + val.slice(1) : '-'}
        </Badge>
      )
    },
    {
      key: 'id',
      title: 'Aksi',
      render: (_, row) => (
        <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )
    }
  ]

  return (
    <div className="p-5 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kehadiran</h1>
          <p className="text-sm text-gray-500">Rekap kehadiran jamaah</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" /> Catat</Button>
      </div>

      <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={kehadiran} loading={isLoading} emptyText="Belum ada data kehadiran" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Catat Kehadiran">
        <div className="space-y-4">
          <Select label="Jamaah*" value={form.jamaah_id} onChange={e => setForm(f => ({ ...f, jamaah_id: e.target.value }))}>
            <option value="">Pilih jamaah</option>
            {jamaahList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </Select>
          <Select label="Kegiatan/Jadwal" value={form.jadwal_id} onChange={e => setForm(f => ({ ...f, jadwal_id: e.target.value }))}>
            <option value="">Pilih kegiatan</option>
            {jadwalList.map(j => <option key={j.id} value={j.id}>{j.keterangan || formatDate(j.tanggal)}</option>)}
          </Select>
          <Select label="Status Kehadiran" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="hadir">Hadir</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
            <option value="alpha">Alpha</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isPending} title="Hapus Kehadiran" message="Hapus data kehadiran ini?" />
    </div>
  )
}
