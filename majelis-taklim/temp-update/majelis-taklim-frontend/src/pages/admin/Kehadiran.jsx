import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { kehadiranApi, jamaahApi, jadwalApi, iuranApi, jenisIuranApi } from '../../api/services'
import { Button, Select, Modal, Table, Pagination, ConfirmDialog, Badge, Card, Input } from '../../components/ui'
import { Plus, Trash2, CheckCircle, AlertCircle, Lock, Users, CreditCard, ChevronRight } from 'lucide-react'
import { formatDate, formatCurrency, currentMonth } from '../../utils/helpers'

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW KEHADIRAN:
//
// LANGKAH 1 — Pilih jadwal pertemuan
// LANGKAH 2 — Checklist kehadiran semua jamaah → Simpan Kehadiran
//             → backend otomatis/frontend tandai jadwal.status = 'selesai'
// LANGKAH 3 — Catat iuran peserta yang hadir → Simpan Iuran
//             → backend set iuran_sudah_dicatat = true pada jadwal
//
// Setelah langkah 2+3 selesai → Spinner aktif
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_KEHADIRAN = [
  { value: 'hadir', label: 'Hadir', color: 'emerald' },
  { value: 'tidak_hadir', label: 'Tidak', color: 'red' },
  { value: 'izin', label: 'Izin', color: 'amber' }
]

function badgeColor(status) {
  if (status === 'hadir') return 'emerald'
  if (status === 'izin') return 'amber'
  return 'red'
}

// ── Tab: Catat Kehadiran Pertemuan (Langkah 1 & 2) ───────────────────────────
function TabKehadiran({ jadwalList, jamaahList, jenisIuranList, qc }) {
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [checklistStatus, setChecklistStatus] = useState({}) // { jamaah_id: 'hadir'|'tidak' }
  const [savingKehadiran, setSavingKehadiran] = useState(false)
  const [kehadiranSaved, setKehadiranSaved] = useState(false)
  const [kehadiranError, setKehadiranError] = useState('')

  // Iuran per jamaah untuk langkah 3
  const [iuranData, setIuranData] = useState({}) // { jamaah_id: { jumlah, jenis_iuran_id, status } }
  const [savingIuran, setSavingIuran] = useState(false)
  const [iuranSaved, setIuranSaved] = useState(false)
  const [iuranError, setIuranError] = useState('')

  // Fetch kehadiran yang sudah ada untuk jadwal terpilih
  const { data: existingKehadiranData, isLoading: loadingExisting } = useQuery({
    queryKey: ['kehadiran-by-jadwal', selectedJadwal],
    queryFn: () => kehadiranApi.getAll({ jadwal_id: selectedJadwal, limit: 200 }).then(r => r.data),
    enabled: !!selectedJadwal,
    onSuccess: (data) => {
      const list = data?.data || data || []
      if (list.length > 0) {
        // Pre-fill checklist dari data yang sudah ada
        const existing = {}
        list.forEach(k => { existing[k.jamaah_id] = k.status })
        setChecklistStatus(existing)
        setKehadiranSaved(true)
      }
    }
  })

  const existingKehadiran = existingKehadiranData?.data || existingKehadiranData || []

  // Fetch iuran yang sudah ada untuk jadwal terpilih
  const { data: existingIuranData } = useQuery({
    queryKey: ['iuran-by-jadwal', selectedJadwal],
    queryFn: () => iuranApi.getAll({ jadwal_id: selectedJadwal, limit: 200 }).then(r => r.data),
    enabled: !!selectedJadwal && kehadiranSaved,
    onSuccess: (data) => {
      const list = data?.data || data || []
      if (list.length > 0) {
        const existing = {}
        list.forEach(i => {
          existing[i.jamaah_id] = { jumlah: i.nominal || '' }
        })
        setIuranData(existing)
        setIuranSaved(true)
      }
    }
  })

  const jadwalTerpilih = jadwalList.find(j => String(j.id) === String(selectedJadwal))

  // Ketika pilih jadwal baru, reset state dan langsung set semua jamaah = hadir
  function handleSelectJadwal(id) {
    setSelectedJadwal(id)
    // Default semua hadir — admin tinggal ubah yang tidak hadir saja
    const init = {}
    jamaahList.forEach(j => { init[j.id] = 'hadir' })
    setChecklistStatus(init)
    setKehadiranSaved(false)
    setKehadiranError('')
    setIuranData({})
    setIuranSaved(false)
    setIuranError('')
  }

  // jamaah yang hadir → akan dibuatkan iuran
  const jamaahHadir = jamaahList.filter(j => checklistStatus[j.id] === 'hadir')

  // Simpan kehadiran semua jamaah sekaligus (pakai endpoint batch)
  async function handleSimpanKehadiran() {
    if (!selectedJadwal) return
    if (Object.keys(checklistStatus).length === 0) {
      setKehadiranError('Belum ada status kehadiran yang diisi. Isi checklist terlebih dahulu.')
      return
    }
    setSavingKehadiran(true)
    setKehadiranError('')
    try {
      const absensi = jamaahList.map(j => ({
        jamaah_id: j.id,
        status: checklistStatus[j.id] || 'tidak_hadir',
        catatan: ''
      }))

      // Kirim sekaligus lewat endpoint batch — backend menangani insert/update otomatis
      await kehadiranApi.create({ jadwal_id: selectedJadwal, absensi })

      // Tandai jadwal sebagai selesai setelah kehadiran disimpan
      await jadwalApi.update(selectedJadwal, { status: 'selesai' })

      qc.invalidateQueries(['admin-kehadiran'])
      qc.invalidateQueries(['kehadiran-by-jadwal', selectedJadwal])
      qc.invalidateQueries(['admin-jadwal'])
      qc.invalidateQueries(['jadwal-terakhir'])
      qc.invalidateQueries(['jadwal-all'])

      setKehadiranSaved(true)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Gagal menyimpan kehadiran.'
      setKehadiranError(msg)
    } finally {
      setSavingKehadiran(false)
    }
  }

  // Simpan iuran untuk jamaah yang hadir — otomatis bertipe "Iuran Rutinan"
  async function handleSimpanIuran() {
    if (!selectedJadwal) return
    const jadwal = jadwalList.find(j => String(j.id) === String(selectedJadwal))
    const periode = jadwal?.tanggal ? jadwal.tanggal.slice(0, 7) : currentMonth()
    const tanggalBayar = jadwal?.tanggal || new Date().toISOString().slice(0, 10)

    const jamaahDenganIuran = jamaahHadir.filter(j => {
      const d = iuranData[j.id]
      return d && Number(d.jumlah) > 0
    })

    if (jamaahDenganIuran.length === 0) {
      setIuranError('Minimal satu jamaah harus diisi jumlah iurannya.')
      return
    }

    setSavingIuran(true)
    setIuranError('')
    try {
      // Ambil iuran yang sudah ada untuk jadwal ini
      const existingIuran = existingIuranData?.data || existingIuranData || []

      const promises = jamaahDenganIuran.map(j => {
        const d = iuranData[j.id]
        // Tidak perlu kirim jenis_iuran_id — backend otomatis memaksa
        // "Iuran Rutinan" untuk semua iuran yang menyertakan jadwal_id.
        const payload = {
          jamaah_id: j.id,
          jadwal_id: selectedJadwal,
          nominal: Number(d.jumlah),
          tanggal_bayar: tanggalBayar,
          periode,
          keterangan: 'Iuran dari kehadiran pertemuan'
        }

        const existing = existingIuran.find(i => i.jamaah_id === j.id)
        if (existing) return iuranApi.update(existing.id, payload)
        return iuranApi.create(payload)
      })
      await Promise.all(promises)

      // Tandai iuran sudah dicatat di jadwal ini
      await jadwalApi.update(selectedJadwal, { iuran_sudah_dicatat: true })

      qc.invalidateQueries(['admin-iuran'])
      qc.invalidateQueries(['iuran-by-jadwal', selectedJadwal])
      qc.invalidateQueries(['jadwal-terakhir'])

      setIuranSaved(true)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Gagal menyimpan iuran.'
      setIuranError(msg)
    } finally {
      setSavingIuran(false)
    }
  }

  const isJadwalSelesai = jadwalTerpilih?.status === 'selesai'
  // Catatan: D1/SQLite menyimpan INTEGER (0/1), bukan boolean asli —
  // pakai truthy check, bukan `=== true` (sama seperti bug di Spinner.jsx).
  const isIuranDicatat = !!jadwalTerpilih?.iuran_sudah_dicatat

  return (
    <div className="space-y-5">

      {/* LANGKAH 1 — Pilih Jadwal */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pilih Jadwal Pertemuan</h3>
        </div>
        <Select
          value={selectedJadwal}
          onChange={e => handleSelectJadwal(e.target.value)}
        >
          <option value="">— Pilih pertemuan —</option>
          {jadwalList.map(j => (
            <option key={j.id} value={j.id}>
              {formatDate(j.tanggal)}{j.lokasi ? ` — ${j.lokasi}` : ''}
              {j.status === 'selesai' ? ' ✓' : ''}
            </option>
          ))}
        </Select>

        {/* Status badge jadwal terpilih */}
        {jadwalTerpilih && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge color={isJadwalSelesai ? 'emerald' : 'amber'}>
              {isJadwalSelesai ? '✓ Kehadiran tercatat' : '⏳ Kehadiran belum dicatat'}
            </Badge>
            <Badge color={isIuranDicatat ? 'emerald' : 'amber'}>
              {isIuranDicatat ? '✓ Iuran tercatat' : '⏳ Iuran belum dicatat'}
            </Badge>
          </div>
        )}
      </Card>

      {/* LANGKAH 2 — Checklist Kehadiran */}
      {selectedJadwal && (
        <Card className="p-5">
          <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${isJadwalSelesai ? 'bg-emerald-500' : 'bg-emerald-600'}`}>
                {isJadwalSelesai ? '✓' : '2'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Checklist Kehadiran</h3>
                <p className="text-xs text-gray-400">{jamaahList.length} jamaah terdaftar — default semua hadir</p>
              </div>
            </div>

          {/* Sudah selesai */}
          {isJadwalSelesai && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                Kehadiran sudah dicatat dan pertemuan ditandai selesai.
              </p>
            </div>
          )}

          {/* Checklist grid */}
          {loadingExisting ? (
            <p className="text-sm text-gray-400 text-center py-4">Memuat data kehadiran...</p>
          ) : (
            <div className="space-y-2">
              {jamaahList.map(j => (
                <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{j.nama}</span>
                  <div className="flex gap-1">
                    {STATUS_KEHADIRAN.map(s => (
                      <button
                        key={s.value}
                        disabled={isJadwalSelesai}
                        onClick={() => setChecklistStatus(prev => ({ ...prev, [j.id]: s.value }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                          ${checklistStatus[j.id] === s.value
                            ? `bg-${s.color}-100 text-${s.color}-700 dark:bg-${s.color}-900/40 dark:text-${s.color}-300 ring-2 ring-${s.color}-400`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }
                          ${isJadwalSelesai ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
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

          {/* Error kehadiran */}
          {kehadiranError && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-300">{kehadiranError}</p>
            </div>
          )}

          {/* Tombol simpan kehadiran */}
          {!isJadwalSelesai && (
            <div className="mt-4">
              <Button
                className="w-full"
                loading={savingKehadiran}
                disabled={Object.keys(checklistStatus).length === 0 || savingKehadiran}
                onClick={handleSimpanKehadiran}
              >
                <CheckCircle className="w-4 h-4" />
                Simpan Kehadiran & Tandai Pertemuan Selesai
              </Button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Setelah disimpan, status pertemuan otomatis berubah menjadi <strong>Selesai</strong>.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* LANGKAH 3 — Catat Iuran dari Kehadiran */}
      {selectedJadwal && isJadwalSelesai && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${isIuranDicatat ? 'bg-emerald-500' : 'bg-emerald-600'}`}>
              {isIuranDicatat ? '✓' : '3'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Catat Iuran Peserta</h3>
              <p className="text-xs text-gray-400">
                {jamaahHadir.length} jamaah hadir — isi jumlah iuran masing-masing
              </p>
            </div>
          </div>

          {/* Sudah tersimpan */}
          {isIuranDicatat && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                Iuran sudah dicatat. Spinner kini dapat digunakan.
              </p>
            </div>
          )}

          {jamaahHadir.length === 0 && !isIuranDicatat && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center py-3">
              Tidak ada jamaah dengan status Hadir pada pertemuan ini.
            </p>
          )}

          {/* Info: jenis iuran otomatis */}
          {jamaahHadir.length > 0 && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2 mb-3">
              <Badge color="emerald">Iuran Rutinan</Badge>
              <p className="text-xs text-gray-400">
                Jenis iuran dari kehadiran selalu otomatis "Iuran Rutinan" dan tidak dapat diubah.
              </p>
            </div>
          )}

          {/* Form iuran per jamaah */}
          {jamaahHadir.length > 0 && (
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-1">
                <span className="col-span-7 text-xs font-semibold text-gray-500 uppercase">Jamaah</span>
                <span className="col-span-5 text-xs font-semibold text-gray-500 uppercase">Jumlah (Rp)</span>
              </div>

              {jamaahHadir.map(j => {
                const d = iuranData[j.id] || { jumlah: '' }
                return (
                  <div key={j.id} className="grid grid-cols-12 gap-2 items-center border-b border-gray-50 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                    <span className="col-span-7 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{j.nama}</span>
                    <div className="col-span-5">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={isIuranDicatat}
                        value={d.jumlah}
                        onChange={e => setIuranData(prev => ({
                          ...prev,
                          [j.id]: { ...d, jumlah: e.target.value }
                        }))}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Error iuran */}
          {iuranError && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-300">{iuranError}</p>
            </div>
          )}

          {/* Tombol simpan iuran */}
          {!isIuranDicatat && jamaahHadir.length > 0 && (
            <div className="mt-4">
              <Button
                className="w-full"
                loading={savingIuran}
                disabled={savingIuran}
                onClick={handleSimpanIuran}
              >
                <CreditCard className="w-4 h-4" />
                Simpan Iuran Pertemuan
              </Button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Setelah disimpan, <strong>Spinner</strong> dapat digunakan untuk memilih tuan rumah berikutnya.
              </p>
            </div>
          )}

          {/* Semua done */}
          {isIuranDicatat && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Semua langkah selesai. Buka menu <strong>Spinner</strong> untuk memilih tuan rumah berikutnya.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// ── Tab: Riwayat Kehadiran ────────────────────────────────────────────────────
function TabRiwayat({ qc }) {
  const [page, setPage] = useState(1)
  const [periode, setPeriode] = useState(currentMonth())
  const [deleteId, setDeleteId] = useState(null)

  const { data: jamaahData } = useQuery({
    queryKey: ['jamaah-all'],
    queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data)
  })
  const jamaahList = jamaahData?.data || jamaahData || []

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kehadiran', page, periode],
    queryFn: () => kehadiranApi.getAll({ page, limit: 20, periode }).then(r => r.data)
  })

  const kehadiran = data?.data || data || []
  const totalPages = data?.totalPages || 1

  const deleteMut = useMutation({
    mutationFn: (id) => kehadiranApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-kehadiran']); setDeleteId(null) }
  })

  const columns = [
    {
      key: 'jamaah_nama',
      title: 'Jamaah',
      render: (val, row) => <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{val || row.nama || '-'}</p>
    },
    {
      key: 'jadwal_tanggal',
      title: 'Pertemuan',
      render: (val, row) => <p className="text-xs text-gray-500">{val ? formatDate(val) : (row.tanggal ? formatDate(row.tanggal) : '-')}</p>
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => (
        <Badge color={badgeColor(val)}>
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
    <div className="space-y-4">
      <input
        type="month"
        value={periode}
        onChange={e => setPeriode(e.target.value)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4">
        <Table columns={columns} data={kehadiran} loading={isLoading} emptyText="Belum ada data kehadiran" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        loading={deleteMut.isPending}
        title="Hapus Kehadiran"
        message="Hapus data kehadiran ini?"
      />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminKehadiran() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('catat')

  const { data: jamaahData } = useQuery({
    queryKey: ['jamaah-all'],
    queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data)
  })
  const { data: jadwalData } = useQuery({
    queryKey: ['jadwal-all'],
    queryFn: () => jadwalApi.getAll({ limit: 100 }).then(r => r.data)
  })
  const { data: jenisData } = useQuery({
    queryKey: ['jenis-iuran'],
    queryFn: () => jenisIuranApi.getAll().then(r => r.data)
  })

  const jamaahList = jamaahData?.data || jamaahData || []
  const jadwalList = (jadwalData?.data || jadwalData || [])
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)) // terbaru di atas
  const jenisIuranList = jenisData?.data || jenisData || []

  return (
    <div className="p-5 space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kehadiran</h1>
        <p className="text-sm text-gray-500">Catat kehadiran dan iuran pertemuan</p>
      </div>

      {/* Tab */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('catat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'catat'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Users className="w-4 h-4" /> Catat Pertemuan
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'riwayat'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <CreditCard className="w-4 h-4" /> Riwayat
        </button>
      </div>

      {activeTab === 'catat' && (
        <TabKehadiran
          jadwalList={jadwalList}
          jamaahList={jamaahList}
          jenisIuranList={jenisIuranList}
          qc={qc}
        />
      )}
      {activeTab === 'riwayat' && <TabRiwayat qc={qc} />}
    </div>
  )
}
