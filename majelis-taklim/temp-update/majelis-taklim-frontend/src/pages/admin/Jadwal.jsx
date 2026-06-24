import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jadwalApi, jamaahApi, kehadiranApi, iuranApi, jenisIuranApi } from '../../api/services'
import { Button, Input, Textarea, Modal, Table, Pagination, Badge } from '../../components/ui'
import { Plus, Lightbulb, CheckCircle, AlertCircle, ClipboardCheck } from 'lucide-react'
import { formatDate, formatTime, formatCurrency, currentMonth } from '../../utils/helpers'

const EMPTY_FORM = { judul: '', tanggal: '', waktu_mulai: '19:30', lokasi: '', deskripsi: '' }

const STATUS_KEHADIRAN = [
  { value: 'hadir', label: 'Hadir', color: 'emerald' },
  { value: 'izin', label: 'Izin', color: 'amber' },
  { value: 'tidak_hadir', label: 'Tidak', color: 'red' }
]

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
  const [saving, setSaving] = useState(false)
  const [showTip, setShowTip] = useState(false)

  // Modal checklist kehadiran + iuran (menggantikan menu Kehadiran terpisah)
  const [kehadiranModalJadwal, setKehadiranModalJadwal] = useState(null) // simpan row jadwal yang dibuka

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jadwal', page],
    queryFn: () => jadwalApi.getAll({ page, limit: 15 }).then(r => r.data)
  })

  const jadwals = data?.data || data || []
  const totalPages = data?.totalPages || 1

  function openAdd() {
    const usul = getUsulTanggal(jadwals)
    setForm({ ...EMPTY_FORM, tanggal: usul, judul: "Pertemuan Majelis Ta'lim" })
    setEditId(null)
    setShowTip(true)
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
      render: (v, row) => {
        // 'selesai' HANYA terjadi otomatis setelah kehadiran+iuran disimpan —
        // tidak ada lagi tombol manual untuk menandai selesai tanpa checklist.
        if (v === 'selesai') return <Badge color="emerald">Selesai</Badge>
        return <Badge color="amber">Akan Datang</Badge>
      }
    },
    {
      key: 'id', title: 'Aksi',
      render: (_, row) => {
        const sudahSelesai = row.status === 'selesai'
        return (
          <div className="flex gap-1 items-center">
            {/* Tombol Catat Kehadiran — hilang total setelah status 'selesai',
                supaya tidak terjadi dobel input kehadiran/iuran untuk jadwal
                yang sama. */}
            {!sudahSelesai && (
              <button
                onClick={() => setKehadiranModalJadwal(row)}
                title="Catat Kehadiran & Iuran"
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
              </button>
            )}
            {sudahSelesai && (
              <span className="text-xs text-gray-400 px-1.5">—</span>
            )}
          </div>
        )
      }
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
          <strong>Workflow Spinner:</strong> Klik ikon <ClipboardCheck className="inline w-3.5 h-3.5 -mt-0.5" /> untuk catat kehadiran & iuran. Status pertemuan otomatis menjadi <strong>Selesai</strong> setelah checklist disimpan. Setelah itu Spinner dapat digunakan.
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

      {/* Modal Checklist Kehadiran & Iuran — menggantikan menu Kehadiran terpisah */}
      {kehadiranModalJadwal && (
        <KehadiranModal
          jadwal={kehadiranModalJadwal}
          onClose={() => setKehadiranModalJadwal(null)}
          qc={qc}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KehadiranModal — checklist kehadiran + iuran otomatis, dalam SATU langkah.
//
// Menggantikan halaman /admin/kehadiran yang lama. Dipanggil sebagai modal
// dari baris jadwal manapun di tabel.
//
// Aturan iuran otomatis (nominal dari jenis_iuran "Iuran Rutinan".nominal_default):
//   - Hadir       → iuran tercatat sebesar nominal_default
//   - Izin        → iuran TETAP tercatat sebesar nominal_default (tetap kena iuran)
//                   tapi status yang DISIMPAN ke tabel kehadiran adalah 'tidak_hadir'
//   - Tidak Hadir → iuran tidak dicatat sama sekali (Rp0)
// ─────────────────────────────────────────────────────────────────────────────
function KehadiranModal({ jadwal, onClose, qc }) {
  const [checklistStatus, setChecklistStatus] = useState({}) // { jamaah_id: 'hadir'|'izin'|'tidak_hadir' }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  const { data: jamaahData, isLoading: loadingJamaah } = useQuery({
    queryKey: ['jamaah-all'],
    queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data)
  })
  const jamaahList = (jamaahData?.data || jamaahData || []).filter(j => j.status === 'aktif')

  const { data: jenisData } = useQuery({
    queryKey: ['jenis-iuran'],
    queryFn: () => jenisIuranApi.getAll().then(r => r.data)
  })
  const jenisIuranList = jenisData?.data || jenisData || []
  const jenisRutinan = jenisIuranList.find(j => j.id === 1)
  const nominalRutinan = Number(jenisRutinan?.nominal_default || 0)

  const { isLoading: loadingExisting } = useQuery({
    queryKey: ['kehadiran-by-jadwal', jadwal.id],
    queryFn: () => kehadiranApi.getAll({ jadwal_id: jadwal.id, limit: 200 }).then(r => r.data),
    onSuccess: (data) => {
      const list = data?.data || data || []
      if (list.length > 0) {
        const existing = {}
        list.forEach(k => { existing[k.jamaah_id] = k.status })
        setChecklistStatus(existing)
      } else if (!initialized) {
        // Belum ada data — default semua jamaah aktif jadi 'hadir'
        const init = {}
        jamaahList.forEach(j => { init[j.id] = 'hadir' })
        setChecklistStatus(init)
      }
      setInitialized(true)
    }
  })

  const isTercatatLengkap = jadwal.status === 'selesai' && !!jadwal.iuran_sudah_dicatat

  const estimasiIuran = jamaahList.reduce((total, j) => {
    const status = checklistStatus[j.id]
    return (status === 'hadir' || status === 'izin') ? total + nominalRutinan : total
  }, 0)

  async function handleSimpanSemua() {
    if (Object.keys(checklistStatus).length === 0) {
      setError('Belum ada status kehadiran yang diisi.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const periode = jadwal.tanggal ? jadwal.tanggal.slice(0, 7) : currentMonth()
      const tanggalBayar = jadwal.tanggal || new Date().toISOString().slice(0, 10)

      // 1) Simpan kehadiran — status 'izin' dikonversi jadi 'tidak_hadir' di DB
      const absensi = jamaahList.map(j => {
        const statusAsli = checklistStatus[j.id] || 'tidak_hadir'
        const statusDb = statusAsli === 'izin' ? 'tidak_hadir' : statusAsli
        return { jamaah_id: j.id, status: statusDb, catatan: statusAsli === 'izin' ? 'izin' : '' }
      })
      await kehadiranApi.create({ jadwal_id: jadwal.id, absensi })
      await jadwalApi.update(jadwal.id, { status: 'selesai' })

      // 2) Simpan iuran otomatis untuk yang Hadir atau Izin (status asli)
      const jamaahKenaIuran = jamaahList.filter(j => {
        const statusAsli = checklistStatus[j.id]
        return statusAsli === 'hadir' || statusAsli === 'izin'
      })

      if (jamaahKenaIuran.length > 0 && nominalRutinan > 0) {
        const iuranPromises = jamaahKenaIuran.map(j => iuranApi.create({
          jamaah_id: j.id,
          jadwal_id: jadwal.id,
          nominal: nominalRutinan,
          tanggal_bayar: tanggalBayar,
          periode,
          keterangan: checklistStatus[j.id] === 'izin'
            ? 'Iuran otomatis — izin tidak hadir'
            : 'Iuran otomatis dari kehadiran pertemuan'
        }))
        await Promise.all(iuranPromises)
      }

      // 3) Tandai iuran sudah dicatat — kehadiran+iuran selalu satu langkah
      await jadwalApi.update(jadwal.id, { iuran_sudah_dicatat: true })

      qc.invalidateQueries(['admin-jadwal'])
      qc.invalidateQueries(['jadwal-terakhir'])
      qc.invalidateQueries(['kehadiran-by-jadwal', jadwal.id])
      qc.invalidateQueries(['admin-iuran'])
      qc.invalidateQueries(['iuran-by-jadwal', jadwal.id])

      onClose()
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Gagal menyimpan kehadiran & iuran.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Kehadiran & Iuran — ${jadwal.judul || ''}`} size="lg">
      <div className="space-y-4">
        <p className="text-xs text-gray-400">
          {formatDate(jadwal.tanggal)} · {jamaahList.length} jamaah aktif
        </p>

        {isTercatatLengkap && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              Kehadiran & iuran sudah tercatat. Spinner kini dapat digunakan.
            </p>
          </div>
        )}

        {!isTercatatLengkap && (
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Badge color="emerald">Iuran Rutinan</Badge>
              <p className="text-xs text-gray-400">otomatis {formatCurrency(nominalRutinan)} — tidak perlu diisi manual</p>
            </div>
            <p className="text-xs text-gray-400">
              <strong className="text-emerald-600 dark:text-emerald-400">Hadir</strong> & <strong className="text-amber-600 dark:text-amber-400">Izin</strong> tetap kena iuran ·
              {' '}<strong className="text-red-500">Tidak Hadir</strong> tidak kena iuran
            </p>
          </div>
        )}

        {(loadingJamaah || loadingExisting) ? (
          <p className="text-sm text-gray-400 text-center py-4">Memuat data...</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {jamaahList.map(j => (
              <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{j.nama}</span>
                <div className="flex gap-1">
                  {STATUS_KEHADIRAN.map(s => (
                    <button
                      key={s.value}
                      disabled={isTercatatLengkap}
                      onClick={() => setChecklistStatus(prev => ({ ...prev, [j.id]: s.value }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                        ${checklistStatus[j.id] === s.value
                          ? `bg-${s.color}-100 text-${s.color}-700 dark:bg-${s.color}-900/40 dark:text-${s.color}-300 ring-2 ring-${s.color}-400`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                        ${isTercatatLengkap ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isTercatatLengkap && (
          <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Estimasi total iuran tercatat</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(estimasiIuran)}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {isTercatatLengkap ? 'Tutup' : 'Batal'}
          </Button>
          {!isTercatatLengkap && (
            <Button
              className="flex-1"
              loading={saving}
              disabled={Object.keys(checklistStatus).length === 0 || saving}
              onClick={handleSimpanSemua}
            >
              <CheckCircle className="w-4 h-4" />
              Simpan
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
