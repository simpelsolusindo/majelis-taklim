import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { iuranApi, jamaahApi } from '../../api/services'
import { Button, Input, Select, Modal, Table, Pagination, ConfirmDialog, Badge } from '../../components/ui'
import { Plus, Edit, Trash2, Filter } from 'lucide-react'
import { formatCurrency, formatDate, currentMonth } from '../../utils/helpers'

const EMPTY_FORM = {
  jamaah_id: '',
  nominal: '',
  tanggal_bayar: new Date().toISOString().slice(0, 10),
  periode: currentMonth(),
  keterangan: ''
}

export default function AdminIuran() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState({ periode: currentMonth(), jamaah_id: '' })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-iuran', page, filter],
    queryFn: () => iuranApi.getAll({ page, limit: 15, ...filter }).then(r => r.data)
  })

  const { data: jamaahData } = useQuery({
    queryKey: ['jamaah-all'],
    queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data)
  })

  

  const iurans = data?.data || data || []
  const totalPages = data?.totalPages || 1
  const jamaahList = jamaahData?.data || jamaahData || []
  

  const deleteMut = useMutation({
    mutationFn: (id) => iuranApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-iuran']); setDeleteId(null) }
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(row) {
    setForm({
      jamaah_id: row.jamaah_id || '',
  nominal: row.nominal || '',
  tanggal_bayar: row.tanggal_bayar || new Date().toISOString().slice(0, 10),
  periode: row.periode || currentMonth(),
  keterangan: row.keterangan || ''

    })
    setEditId(row.id)
    setModal(true)
  }

  async function handleSave() {
    if (!form.jamaah_id || !form.nominal || !form.tanggal_bayar) return
    setSaving(true)
    try {
      if (editId) await iuranApi.update(editId, form)
      else await iuranApi.create(form)
      qc.invalidateQueries(['admin-iuran'])
      setModal(false)
    } finally { setSaving(false) }
  }

  const columns = [
    {
      key: 'jamaah_nama',
      title: 'Jamaah',
      render: (val, row) => <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{val || row.nama || '-'}</p>
    },
    {
  key: 'nominal',
  title: 'Jumlah',
  render: (val) => (
    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
      {formatCurrency(val)}
    </span>
  )
},
    {
      key: 'periode',
      title: 'Periode',
      render: (val) => <span className="text-xs text-gray-500">{val || '-'}</span>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Iuran</h1>
          <p className="text-sm text-gray-500">Riwayat pembayaran iuran</p>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input
          type="month"
          value={filter.periode}
          onChange={e => setFilter(f => ({ ...f, periode: e.target.value }))}
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={filter.jamaah_id}
          onChange={e => setFilter(f => ({ ...f, jamaah_id: e.target.value }))}
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Semua Jamaah</option>
          {jamaahList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={iurans} loading={isLoading} emptyText="Belum ada data iuran" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Form Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Iuran' : 'Tambah Iuran'}>
        <div className="space-y-4">
          <Select label="Jamaah*" value={form.jamaah_id} onChange={e => setForm(f => ({ ...f, jamaah_id: e.target.value }))}>
            <option value="">Pilih jamaah</option>
            {jamaahList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </Select>
          <Input
  label="Jumlah (Rp)*"
  type="number"
  placeholder="0"
  value={form.nominal}
  onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))}
 />
          <Input label="Tanggal Bayar*" type="date" value={form.tanggal_bayar} onChange={e => setForm(f => ({ ...f, tanggal_bayar: e.target.value }))} />
          <Input label="Periode" type="month" value={form.periode} onChange={e => setForm(f => ({ ...f, periode: e.target.value }))} />
          <Input label="Keterangan" placeholder="Opsional" value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        loading={deleteMut.isPending}
        title="Hapus Iuran"
        message="Hapus data iuran ini?"
      />
    </div>
  )
}
