import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jadwalApi, jamaahApi, kehadiranApi } from '../../api/services'
import { Button, Input, Textarea, Modal, Table, Pagination, ConfirmDialog, Badge } from '../../components/ui'
import { Plus, Edit, Trash2, Lightbulb } from 'lucide-react'
import { formatDate, formatTime } from '../../utils/helpers'

const EMPTY_FORM = { tanggal: '', waktu: '19:30', lokasi: '', keterangan: '' }

// Hitung usulan +14 hari dari jadwal terakhir (Sabtu malam → malam Minggu)
function getUsulTanggal(jadwals) {
  if (!jadwals || jadwals.length === 0) {
    // Tidak ada jadwal → Sabtu malam berikutnya
    const d = new Date()
    const day = d.getDay()           // 0=Sun,1=Mon,…,6=Sat
    const daysToSat = (6 - day + 7) % 7 || 7
    d.setDate(d.getDate() + daysToSat)
    return d.toISOString().split('T')[0]
  }
  // Ambil jadwal terbaru lalu +14 hari
  const sorted = [...jadwals].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  const last   = new Date(sorted[0].tanggal)
  last.setDate(last.getDate() + 14)
  return last.toISOString().split('T')[0]
}

export default function AdminJadwal() {
  const qc = useQueryClient()
  const [page, setPage]       = useState(1)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [editId, setEditId]   = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [kehadiranModal, setKehadiranModal] = useState(false)
  const [jadwalAktif, setJadwalAktif] = useState(null)
  const [jamaahHadir, setJamaahHadir] = useState([])
  const { data, isLoading } = useQuery({
    queryKey: ['admin-jadwal', page],
    queryFn:  () => jadwalApi.getAll({ page, limit: 15 }).then(r => r.data)
  })
const { data: jamaahData } = useQuery({
  queryKey: ['jamaah-all'],
  queryFn: () =>
    jamaahApi.getAll({ limit: 200 }).then(r => r.data)
})
  const jadwals = data?.data || data || []

console.log(
  'JADWAL PERTAMA',
  JSON.stringify(jadwals[0], null, 2)
)

console.log(
  'JADWAL TERAKHIR DETAIL',
  JSON.stringify(jadwals, null, 2)
)
console.log('JADWALS FULL', jadwals)

const totalPages = data?.totalPages || 1
const jamaahList = jamaahData?.data || jamaahData || []
console.log(
  'HOST ID 2',
  jamaahList.find(j => Number(j.id) === 2)
)
  const deleteMut = useMutation({
    mutationFn: id => jadwalApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries(['admin-jadwal']); setDeleteId(null) }
  })

  function openAdd() {
    const usul = getUsulTanggal(jadwals)
    setForm({ ...EMPTY_FORM, tanggal: usul })
    setEditId(null)
    setShowTip(true)
    setModal(true)
  }

  function openEdit(j) {
    setForm({ tanggal: j.tanggal || '', waktu: j.waktu || '19:30', lokasi: j.lokasi || '', keterangan: j.keterangan || '' })
    setEditId(j.id)
    setShowTip(false)
    setModal(true)
  }
  function openKehadiran(jadwal) {
  setJadwalAktif(jadwal)

  const aktif = jamaahList
    .filter(j => j.status === 'aktif')
    .map(j => ({
      id: j.id,
      nama: j.nama,
      hadir: true
    }))

  setJamaahHadir(aktif)
  setKehadiranModal(true)
}
  async function handleSave() {
    if (!form.tanggal) return
    setSaving(true)
    try {
      if (editId) await jadwalApi.update(editId, form)
      else await jadwalApi.create(form)
      qc.invalidateQueries(['admin-jadwal'])
      setModal(false)
    } finally { setSaving(false) }
  }
console.log('JAMAAH LIST', jamaahList)
async function simpanKehadiran() {
  if (!jadwalAktif) return

  const absensi = jamaahHadir
    .filter(j => j.hadir)
    .map(j => ({
      jamaah_id: j.id,
      status: 'hadir'
    }))

  console.log('TOKEN', localStorage.getItem('token'))
  console.log('ORIGIN', window.location.origin)

  await kehadiranApi.create({
  jadwal_id: jadwalAktif.id,
  absensi
})

  

  setKehadiranModal(false)
}
  const columns = [
    {
      key: 'tanggal', title: 'Tanggal',
      render: val => (
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{formatDate(val)}</p>
          <p className="text-xs text-gray-400">{new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(new Date(val))}</p>
        </div>
      )
    },
    { key: 'waktu',     title: 'Waktu',      render: v => <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(v)} WIB</span> },
    { key: 'lokasi',    title: 'Lokasi',     render: v => <span className="text-sm text-gray-500">{v || '-'}</span> },
{
  key: 'host_id',
  title: 'Host',
  render: (val) => {
    const host = jamaahList.find(
      j => Number(j.id) === Number(val)
    )

    return (
      <span className="text-sm font-medium text-emerald-600">
        {host?.nama || '-'}
      </span>
    )
  }
},
    { key: 'keterangan',title: 'Keterangan', render: v => <span className="text-xs text-gray-500 line-clamp-1">{v || '-'}</span> },
    {
  key: 'id',
  title: 'Aksi',
  render: (_, row) => (
    <div className="flex gap-1 flex-wrap">

      <button
        className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700"
        onClick={() => openKehadiran(row)}
      >
        Hadir
      </button>

      <button
        className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700"
        onClick={() => console.log('IURAN', row)}
      >
        Iuran
      </button>

      <button
        className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700"
        onClick={() => console.log('SELESAIKAN', row)}
      >
        Selesai
      </button>

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
          <p className="text-sm text-gray-500">Pertemuan rutin setiap 2 minggu, malam Minggu</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4" /> Tambah</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={jadwals} loading={isLoading} emptyText="Belum ada jadwal pertemuan" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Jadwal' : 'Tambah Jadwal'}>
        <div className="space-y-4">
          {/* Info usulan otomatis */}
          {showTip && (
            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
              <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Tanggal diusulkan otomatis <strong>+14 hari</strong> dari pertemuan terakhir sesuai aturan majelis. Anda boleh mengubahnya.
              </p>
            </div>
          )}
          <Input label="Tanggal Pertemuan*" type="date" value={form.tanggal}
            onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} />
          <Input label="Waktu" type="time" value={form.waktu}
            onChange={e => setForm(f => ({ ...f, waktu: e.target.value }))} />
          <Input label="Lokasi / Tuan Rumah" placeholder="Nama/alamat tuan rumah"
            value={form.lokasi} onChange={e => setForm(f => ({ ...f, lokasi: e.target.value }))} />
          <Textarea label="Keterangan" placeholder="Keterangan tambahan" rows={2}
            value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Batal</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isPending}
        title="Hapus Jadwal" message="Hapus jadwal pertemuan ini?" />
      <Modal
  isOpen={kehadiranModal}
  onClose={() => setKehadiranModal(false)}
  title={`Kehadiran - ${jadwalAktif?.tanggal || ''}`}
>
  <div className="space-y-3 max-h-[400px] overflow-auto">

    {jamaahHadir.map((j, index) => (
      <label
        key={j.id}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
      >
        <input
          type="checkbox"
          checked={j.hadir}
          onChange={(e) => {
            const copy = [...jamaahHadir]
            copy[index].hadir = e.target.checked
            setJamaahHadir(copy)
          }}
        />

        <span>{j.nama}</span>
      </label>
    ))}

    <Button
      className="w-full mt-4"
      onClick={simpanKehadiran}
    >
      Simpan Kehadiran
    </Button>

  </div>
</Modal>
    </div>
  )
}
