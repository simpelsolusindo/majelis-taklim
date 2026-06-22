import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jadwalApi } from '../../api/services'
import { Button, Input, Textarea, Modal, Table, Pagination, ConfirmDialog, Badge } from '../../components/ui'
import { Plus, Edit, Trash2, Lightbulb, CheckCircle } from 'lucide-react'
import { formatDate, formatTime } from '../../utils/helpers'

const EMPTY_FORM = { judul: '', tanggal: '', waktu_mulai: '19:30', lokasi: '', deskripsi: '' }

// Hitung usulan +14 hari dari jadwal terakhir
function getUsulTanggal(jadwals) {
  if (!jadwals || jadwals.length === 0) {
    const d = new Date()
    const day = d.getDay()
    const daysToSat = (6 - day + 7) % 7 || 7
    d.setDate(d.getDate() + daysToSat)
    return d.toISOString().split('T')[0]
  }
  const sorted = [...jadwals].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  const last = new Date(sorted[0].tanggal)
  last.setDate(last.getDate() + 14)
  return last.toISOString().split('T')[0]
}

export default function AdminJadwal() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [selesaiId, setSelesaiId] = useState(null)  // konfirmasi tandai selesai

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jadwal', page],
    queryFn: () => jadwalApi.getAll({ page, limit: 15 }).then(r => r.data)
  })

  const jadwals = data?.data || data || []
  const totalPages = data?.totalPages || 1

  const deleteMut = useMutation({
    mutationFn: id => jadwalApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-jadwal']); setDeleteId(null) }
  })

  // Tandai jadwal sebagai selesai — update status di backend
  const selesaiMut = useMutation({
    mutationFn: id => jadwalApi.update(id, { status: 'selesai' }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-jadwal'])
      qc.invalidateQueries(['jadwal-terakhir'])
      setSelesaiId(null)
    }
  })

  function openAdd() {
    const usul = getUsulTanggal(jadwals)
    setForm({ ...EMPTY_FORM, tanggal: usul, judul: "Pertemuan Majelis Ta'lim" })
    setEditId(null)
    setShowTip(true)
    setModal(true)
  }

  function openEdit(j) {
    setForm({
      judul: j.judul || '',
      tanggal: j.tanggal || '',
      waktu_mulai: j.waktu_mulai || '19:30',
      lokasi: j.lokasi || '',
      deskripsi: j.deskripsi || ''
    })
    setEditId(j.id)
    setShowTip(false)
    setModal(true)
  }

  async function handleSave() {
    if (!form.tanggal) return
    if (!form.judul) return
    setSaving(true)
    try {
      if (editId) await jadwalApi.update(editId, form)
      else await jadwalApi.create(form)
      qc.invalidateQueries(['admin-jadwal'])
      qc.invalidateQueries(['jadwal-terakhir'])
      setModal(false)
    } finally { setSaving(false) }
  }

  const columns = [
    {
      key: 'judul', title: 'Judul',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{v || '-'}</p>
          <p className="text-xs text-gray-400">{formatDate(row.tanggal)} · {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(row.tanggal))}</p>
        </div>
      )
    },
    {
      key: 'waktu_mulai', title: 'Waktu',
      render: v => <span className="text-sm text-gray-600 dark:text-gray-400">{v ? `${formatTime(v)} WIB` : '-'}</span>
    },
    {
      key: 'lokasi', title: 'Lokasi',
      render: v => <span className="text-sm text-gray-500">{v || '-'}</span>
    },
    {
      key: 'status', title: 'Status',
      render: (v) => {
        if (v === 'selesai') return <Badge color="emerald">Selesai</Badge>
        return <Badge color="amber">Akan Datang</Badge>
      }
    },
    {
      key: 'id', title: 'Aksi',
      render: (_, row) => (
        <div className="flex gap-1 items-center">
          {/* Tombol tandai selesai — hanya muncul jika belum selesai */}
          {row.status !== 'selesai' && (
            <button
              onClick={() => setSelesaiId(row.id)}
              title="Tandai Selesai"
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jadwal Pertemuan</h1>
          <p className="text-sm text-gray-500">Pertemuan rutin setiap 2 minggu</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" /> Tambah</Button>
      </div>

      {/* Petunjuk workflow */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Workflow Spinner:</strong> Tandai jadwal sebagai <strong>Selesai</strong> (ikon ✓) setelah pertemuan selesai, lalu catat iuran dari kehadiran di menu Iuran. Setelah itu Spinner dapat digunakan.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={jadwals} loading={isLoading} emptyText="Belum ada jadwal pertemuan" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Modal Tambah/Edit Jadwal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Jadwal' : 'Tambah Jadwal'}>
        <div className="space-y-4">
          {showTip && (
            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
              <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Tanggal diusulkan otomatis <strong>+14 hari</strong> dari pertemuan terakhir. Anda boleh mengubahnya.
              </p>
            </div>
          )}
          <Input
            label="Judul Pertemuan*"
            placeholder="contoh: Pertemuan Majelis Ta'lim"
            value={form.judul}
            onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
          />
          <Input
            label="Tanggal Pertemuan*"
            type="date"
            value={form.tanggal}
            onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
          />
          <Input
            label="Waktu"
            type="time"
            value={form.waktu_mulai}
            onChange={e => setForm(f => ({ ...f, waktu_mulai: e.target.value }))}
          />
          <Input
            label="Lokasi / Tuan Rumah"
            placeholder="Nama/alamat tuan rumah"
            value={form.lokasi}
            onChange={e => setForm(f => ({ ...f, lokasi: e.target.value }))}
          />
          <Textarea
            label="Keterangan"
            placeholder="Keterangan tambahan"
            rows={2}
            value={form.deskripsi}
            onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
          />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {editId ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Konfirmasi Tandai Selesai */}
      <ConfirmDialog
        isOpen={!!selesaiId}
        onClose={() => setSelesaiId(null)}
        onConfirm={() => selesaiMut.mutate(selesaiId)}
        loading={selesaiMut.isPending}
        title="Tandai Pertemuan Selesai"
        message="Pertemuan ini akan ditandai sebagai selesai. Setelah itu, catat iuran dari kehadiran untuk mengaktifkan Spinner. Lanjutkan?"
      />

      {/* Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        loading={deleteMut.isPending}
        title="Hapus Jadwal"
        message="Hapus jadwal pertemuan ini?"
      />
    </div>
  )
}
