import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jenisIuranApi } from '../../api/services'
import { Button, Input, Textarea, Modal, Table, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

const EMPTY_FORM = { nama: '', nominal: '', keterangan: '' }

export default function AdminJenisIuran() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['jenis-iuran'],
    queryFn: () => jenisIuranApi.getAll().then(r => r.data)
  })

  const jenisList = data?.data || data || []

  const deleteMut = useMutation({
    mutationFn: (id) => jenisIuranApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['jenis-iuran']); setDeleteId(null) }
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(j) { setForm({ nama: j.nama, nominal: j.nominal || '', keterangan: j.keterangan || '' }); setEditId(j.id); setModal(true) }

  async function handleSave() {
    if (!form.nama) return
    setSaving(true)
    try {
      if (editId) await jenisIuranApi.update(editId, form)
      else await jenisIuranApi.create(form)
      qc.invalidateQueries(['jenis-iuran'])
      setModal(false)
    } finally { setSaving(false) }
  }

  const columns = [
    { key: 'nama', title: 'Nama Iuran', render: (v) => <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{v}</p> },
    { key: 'nominal', title: 'Nominal', render: (v) => <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{v ? formatCurrency(v) : '-'}</span> },
    { key: 'keterangan', title: 'Keterangan', render: (v) => <span className="text-xs text-gray-500">{v || '-'}</span> },
    {
      key: 'id', title: 'Aksi',
      render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jenis Iuran</h1>
          <p className="text-sm text-gray-500">Kelola kategori iuran</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" /> Tambah</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={jenisList} loading={isLoading} emptyText="Belum ada jenis iuran" />
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Jenis Iuran' : 'Tambah Jenis Iuran'}>
        <div className="space-y-4">
          <Input label="Nama Iuran*" placeholder="contoh: Iuran PKK" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
          <Input label="Nominal (Rp)" type="number" placeholder="0" value={form.nominal} onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))} />
          <Textarea label="Keterangan" placeholder="Keterangan opsional" rows={2} value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isPending} title="Hapus Jenis Iuran" message="Hapus jenis iuran ini?" />
    </div>
  )
}
