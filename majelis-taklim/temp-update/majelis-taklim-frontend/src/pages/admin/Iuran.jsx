import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { iuranApi, jamaahApi, jenisIuranApi } from '../../api/services'
import { Button, Input, Select, Modal, Table, Pagination, ConfirmDialog, Badge } from '../../components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, currentMonth } from '../../utils/helpers'

// ─────────────────────────────────────────────────────────────────────────────
// Halaman ini KHUSUS untuk pencatatan iuran MANUAL (di luar kehadiran).
// Iuran dari kehadiran pertemuan dicatat lewat menu Kehadiran dan otomatis
// bertipe "Iuran Rutinan" — tidak bisa dan tidak perlu diinput di sini.
// Jenis iuran di form ini wajib dipilih dari jenis selain "Iuran Rutinan"
// (mis. "Iuran Lain-lain").
// ─────────────────────────────────────────────────────────────────────────────

const ID_IURAN_RUTINAN = 1 // harus sinkron dengan JENIS_IURAN_RUTINAN_ID di backend

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM = {
  jamaah_id: '',
  jenis_iuran_id: '',
  nominal: '',
  tanggal_bayar: todayStr(),
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
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-iuran', page, filter],
    queryFn: () => iuranApi.getAll({ page, limit: 15, ...filter }).then(r => r.data)
  })

  const { data: jamaahData } = useQuery({
    queryKey: ['jamaah-all'],
    queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data)
  })

  const { data: jenisData } = useQuery({
    queryKey: ['jenis-iuran'],
    queryFn: () => jenisIuranApi.getAll().then(r => r.data)
  })

  const iurans = data?.data || data || []
  const totalPages = data?.totalPages || 1
  const jamaahList = jamaahData?.data || jamaahData || []
  // Untuk input manual, "Iuran Rutinan" tidak boleh dipilih — jenis itu khusus
  // dari alur kehadiran dan dipaksa otomatis oleh backend.
  const jenisList = (jenisData?.data || jenisData || []).filter(j => j.id !== ID_IURAN_RUTINAN)

  const deleteMut = useMutation({
    mutationFn: (id) => iuranApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-iuran']); setDeleteId(null) }
  })

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setFormError('')
    setModal(true)
  }

  function openEdit(row) {
    setForm({
      jamaah_id: row.jamaah_id || '',
      jenis_iuran_id: row.jenis_iuran_id || '',
      nominal: row.nominal || '',
      tanggal_bayar: row.tanggal_bayar || todayStr(),
      periode: row.periode || currentMonth(),
      keterangan: row.keterangan || ''
    })
    setEditId(row.id)
    setFormError('')
    setModal(true)
  }

  async function handleSave() {
    // Validasi wajib: jamaah, jenis, dan nominal harus diisi
    if (!form.jamaah_id) {
      setFormError('Jamaah wajib dipilih.')
      return
    }
    if (!form.jenis_iuran_id) {
      setFormError('Jenis iuran wajib dipilih.')
      return
    }
    if (!form.nominal || Number(form.nominal) <= 0) {
      setFormError('Nominal iuran wajib diisi dan lebih dari 0.')
      return
    }
    if (!form.tanggal_bayar) {
      setFormError('Tanggal bayar wajib diisi.')
      return
    }
    setFormError('')
    setSaving(true)

    const payload = {
      jamaah_id: form.jamaah_id,
      jenis_iuran_id: form.jenis_iuran_id,
      nominal: Number(form.nominal),
      tanggal_bayar: form.tanggal_bayar,
      periode: form.periode,
      keterangan: form.keterangan || ''
    }

    try {
      if (editId) await iuranApi.update(editId, payload)
      else await iuranApi.create(payload)
      qc.invalidateQueries(['admin-iuran'])
      setModal(false)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Gagal menyimpan iuran.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'jamaah_nama',
      title: 'Jamaah',
      render: (val, row) => <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{val || row.nama || '-'}</p>
    },
    {
      key: 'jenis_nama',
      title: 'Jenis',
      render: (val) => <span className="text-xs text-gray-600 dark:text-gray-400">{val || '-'}</span>
    },
    {
      key: 'nominal',
      title: 'Jumlah',
      render: (val) => <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(val)}</span>
    },
    {
      key: 'periode',
      title: 'Periode',
      render: (val) => <span className="text-xs text-gray-500">{val || '-'}</span>
    },
    {
      key: 'tanggal_bayar',
      title: 'Tgl Bayar',
      render: (val) => <span className="text-xs text-gray-500">{val ? formatDate(val) : '-'}</span>
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

      {/* Filter */}
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

          {/* Error */}
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700 dark:text-red-300">{formError}</p>
            </div>
          )}

          <Select
            label="Jamaah*"
            value={form.jamaah_id}
            onChange={e => setForm(f => ({ ...f, jamaah_id: e.target.value }))}
          >
            <option value="">Pilih jamaah</option>
            {jamaahList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </Select>

          <Select
            label="Jenis Iuran*"
            value={form.jenis_iuran_id}
            onChange={e => setForm(f => ({ ...f, jenis_iuran_id: e.target.value }))}
          >
            <option value="">Pilih jenis iuran</option>
            {jenisList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </Select>
          <p className="text-xs text-gray-400 -mt-2">
            "Iuran Rutinan" hanya dicatat otomatis lewat menu Kehadiran, bukan di sini.
          </p>

          <Input
            label="Nominal (Rp)*"
            type="number"
            placeholder="0"
            min="0"
            value={form.nominal}
            onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))}
          />

          <Input
            label="Tanggal Bayar*"
            type="date"
            value={form.tanggal_bayar}
            onChange={e => setForm(f => ({ ...f, tanggal_bayar: e.target.value }))}
          />

          <Input
            label="Periode"
            type="month"
            value={form.periode}
            onChange={e => setForm(f => ({ ...f, periode: e.target.value }))}
          />

          <Input
            label="Keterangan"
            placeholder="Opsional"
            value={form.keterangan}
            onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {editId ? 'Simpan' : 'Tambah'}
            </Button>
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
