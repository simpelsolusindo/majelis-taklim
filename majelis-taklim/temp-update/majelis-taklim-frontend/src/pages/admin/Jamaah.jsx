import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jamaahApi } from '../../api/services'
import { Button, Input, Select, Modal, Table, Pagination, ConfirmDialog, EmptyState, Badge } from '../../components/ui'
import { Search, Plus, Edit, Trash2, User } from 'lucide-react'
import { getInitials } from '../../utils/helpers'

const EMPTY_FORM = { nama: '', alamat: '', no_hp: '', status: 'aktif', jenis_kelamin: 'laki-laki' }

export default function AdminJamaah() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jamaah', page, search],
    queryFn: () => jamaahApi.getAll({ page, limit: 15, search: search || undefined }).then(r => r.data)
  })

  const jamaah = data?.data || data || []
  const totalPages = data?.totalPages || data?.total_pages || 1

  const deleteMut = useMutation({
    mutationFn: (id) => jamaahApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-jamaah']); setDeleteId(null) }
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(j) { setForm({ nama: j.nama, alamat: j.alamat || '', no_hp: j.no_hp || '', status: j.status || 'aktif', jenis_kelamin: j.jenis_kelamin || 'laki-laki' }); setEditId(j.id); setModal(true) }

  async function handleSave() {
    if (!form.nama) return
    setSaving(true)
    try {
      if (editId) await jamaahApi.update(editId, form)
      else await jamaahApi.create(form)
      qc.invalidateQueries(['admin-jamaah'])
      setModal(false)
    } finally { setSaving(false) }
  }

  const columns = [
    {
      key: 'nama',
      title: 'Nama',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{getInitials(val)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{val}</p>
            {row.no_hp && <p className="text-xs text-gray-500">{row.no_hp}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'jenis_kelamin',
      title: 'JK',
      render: (val) => (
        <Badge color={val === 'laki-laki' ? 'blue' : 'amber'}>
          {val === 'laki-laki' ? 'L' : 'P'}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => (
        <Badge color={val === 'aktif' ? 'emerald' : 'gray'}>
          {val === 'aktif' ? 'Aktif' : 'Non-aktif'}
        </Badge>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jamaah</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manajemen data jamaah</p>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama jamaah..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={jamaah} loading={isLoading} emptyText="Belum ada data jamaah" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Form Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Jamaah' : 'Tambah Jamaah'}>
        <div className="space-y-4">
          <Input label="Nama Lengkap*" placeholder="Nama jamaah" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
          <Input label="Nomor HP" placeholder="08xxxxxxxxx" value={form.no_hp} onChange={e => setForm(f => ({ ...f, no_hp: e.target.value }))} />
          <Input label="Alamat" placeholder="Alamat lengkap" value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Jenis Kelamin" value={form.jenis_kelamin} onChange={e => setForm(f => ({ ...f, jenis_kelamin: e.target.value }))}>
              <option value="laki-laki">Laki-laki</option>
              <option value="perempuan">Perempuan</option>
            </Select>
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="aktif">Aktif</option>
              <option value="non-aktif">Non-aktif</option>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {editId ? 'Simpan Perubahan' : 'Tambah Jamaah'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        loading={deleteMut.isPending}
        title="Hapus Jamaah"
        message="Apakah Anda yakin ingin menghapus data jamaah ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
