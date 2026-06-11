import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pengumumanApi } from '../../api/services'
import { Button, Input, Select, Textarea, Modal, Table, Pagination, ConfirmDialog, Badge } from '../../components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatDate, getPriorityColor, getPriorityLabel } from '../../utils/helpers'

const EMPTY_FORM = { judul: '', isi: '', prioritas: 'sedang', tanggal_mulai: '', tanggal_selesai: '' }

export default function AdminPengumuman() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pengumuman', page],
    queryFn: () => pengumumanApi.getAll({ page, limit: 15 }).then(r => r.data)
  })

  const pengumumans = data?.data || data || []
  const totalPages = data?.totalPages || 1

  const deleteMut = useMutation({
    mutationFn: (id) => pengumumanApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-pengumuman']); setDeleteId(null) }
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(p) {
    setForm({ judul: p.judul || '', isi: p.isi || '', prioritas: p.prioritas || 'sedang', tanggal_mulai: p.tanggal_mulai || '', tanggal_selesai: p.tanggal_selesai || '' })
    setEditId(p.id); setModal(true)
  }

  async function handleSave() {
    if (!form.judul || !form.isi) return
    setSaving(true)
    try {
      if (editId) await pengumumanApi.update(editId, form)
      else await pengumumanApi.create(form)
      qc.invalidateQueries(['admin-pengumuman'])
      setModal(false)
    } finally { setSaving(false) }
  }

  const columns = [
    {
      key: 'judul',
      title: 'Judul',
      render: (val, row) => (
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{val}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{row.isi}</p>
        </div>
      )
    },
    {
      key: 'prioritas',
      title: 'Prioritas',
      render: (val) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(val)}`}>
          {getPriorityLabel(val)}
        </span>
      )
    },
    {
      key: 'tanggal_mulai',
      title: 'Periode',
      render: (val, row) => (
        <span className="text-xs text-gray-500">
          {val ? formatDate(val) : '-'}
          {row.tanggal_selesai ? ` s/d ${formatDate(row.tanggal_selesai)}` : ''}
        </span>
      )
    },
    {
      key: 'id',
      title: 'Aksi',
      render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-5 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pengumuman</h1>
          <p className="text-sm text-gray-500">Kelola pengumuman majelis</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" /> Tambah</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={pengumumans} loading={isLoading} emptyText="Belum ada pengumuman" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Pengumuman' : 'Buat Pengumuman'}>
        <div className="space-y-4">
          <Input label="Judul*" placeholder="Judul pengumuman" value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} />
          <Textarea label="Isi Pengumuman*" placeholder="Tuliskan pengumuman di sini..." rows={4} value={form.isi} onChange={e => setForm(f => ({ ...f, isi: e.target.value }))} />
          <Select label="Prioritas" value={form.prioritas} onChange={e => setForm(f => ({ ...f, prioritas: e.target.value }))}>
            <option value="tinggi">Tinggi</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tanggal Mulai" type="date" value={form.tanggal_mulai} onChange={e => setForm(f => ({ ...f, tanggal_mulai: e.target.value }))} />
            <Input label="Tanggal Selesai" type="date" value={form.tanggal_selesai} onChange={e => setForm(f => ({ ...f, tanggal_selesai: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editId ? 'Simpan' : 'Publikasikan'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isPending} title="Hapus Pengumuman" message="Hapus pengumuman ini?" />
    </div>
  )
}
