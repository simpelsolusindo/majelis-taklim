import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jadwalApi, jamaahApi, kehadiranApi } from '../../api/services'
import { Button, Input, Textarea, Modal, Table, Pagination, ConfirmDialog, Badge } from '../../components/ui'
import { Lightbulb } from 'lucide-react'
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
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage]       = useState(1)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  
  const [saving, setSaving]   = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [kehadiranModal, setKehadiranModal] = useState(false)
  const [modeKehadiran, setModeKehadiran] = useState('input')
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
  

  function openAdd() {
    const usul = getUsulTanggal(jadwals)
    setForm({ ...EMPTY_FORM, tanggal: usul })
    setEditId(null)
    setShowTip(true)
    setModal(true)
  }

  
  async function openKehadiran(jadwal) {
  setJadwalAktif(jadwal)
console.log(
  'OPEN KEHADIRAN',
  jadwal.id,
  jadwal.status
)
  // JADWAL SUDAH SELESAI
  if (jadwal.status === 'selesai') {
    const res = await kehadiranApi.getAll({
      jadwal_id: jadwal.id
    })

    const data = res.data || res

    setJamaahHadir(
      data.map(item => ({
        id: item.jamaah_id,
        nama: item.nama,
        hadir: true
      }))
    )

    setModeKehadiran('lihat')
setKehadiranModal(true)
return
  }

  // JADWAL AKTIF
  const aktif = jamaahList
    .filter(j => j.status === 'aktif')
    .map(j => ({
      id: j.id,
      nama: j.nama,
      hadir: true
    }))

  setJamaahHadir(aktif)

setModeKehadiran('input')
setKehadiranModal(true)
}
  async function handleSave() {
  console.log('FORM AKAN DIKIRIM', form)

  if (!form.tanggal) return

  setSaving(true)

  try {
    let res

    res = await jadwalApi.create(form)

    console.log('RESPON JADWAL', res)

    qc.invalidateQueries(['admin-jadwal'])
    setModal(false)

  } catch (err) {
    console.error('GAGAL SIMPAN JADWAL', err)
    console.error('DETAIL', err?.response?.data)
  } finally {
    setSaving(false)
  }
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
  console.log('KIRIM KEHADIRAN', {
  jadwal_id: jadwalAktif.id,
  absensi
})
  await kehadiranApi.create({
  jadwal_id: jadwalAktif.id,
  absensi
})

  

  setKehadiranModal(false)
  navigate('/admin/spinner')
}
console.log(
  'ROW JADWAL PERTAMA',
  JSON.stringify(jadwals[0], null, 2)
)
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
  render: (val, row) => {

    console.log('HOST CELL', {
      val,
      row
    })

    const host = jamaahList.find(
      j => Number(j.id) === Number(val)
    )

    console.log('HOST DITEMUKAN', host)

    return (
      <span>
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
    <div className="flex gap-2 flex-wrap">

      {row.status === 'selesai' ? (
        <>
          <Badge color="green">
            ✓ Selesai
          </Badge>

          <button
            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700"
            onClick={() => openKehadiran(row)}
          >
            Lihat Kehadiran
          </button>

          <button
            className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700"
            onClick={() => console.log('EDIT IURAN', row)}
          >
            Edit Iuran
          </button>
        </>
      ) : (
        <button
          className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700"
          onClick={() => openKehadiran(row)}
        >
          Input Kehadiran
        </button>
      )}

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
        
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={jadwals} loading={isLoading} emptyText="Belum ada jadwal pertemuan" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Tambah Jadwal">
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
            <Button
  className="flex-1"
  loading={saving}
  onClick={handleSave}
>
  Tambah
</Button>
          </div>
        </div>
      </Modal>

      
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
  disabled={modeKehadiran === 'lihat'}
  onChange={(e) => {
    if (modeKehadiran === 'lihat') return

    const copy = [...jamaahHadir]
    copy[index].hadir = e.target.checked
    setJamaahHadir(copy)
  }}
/>

        <span>{j.nama}</span>
      </label>
    ))}

    {modeKehadiran === 'input' && (
  <Button
    className="w-full mt-4"
    onClick={simpanKehadiran}
  >
    Simpan Kehadiran
  </Button>
)}

  </div>
</Modal>
    </div>
  )
}
