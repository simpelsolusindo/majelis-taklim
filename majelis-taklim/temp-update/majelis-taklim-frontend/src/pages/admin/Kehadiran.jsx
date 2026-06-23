import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { kehadiranApi, jamaahApi, jadwalApi, iuranApi, jenisIuranApi } from '../../api/services'
import { Button, Select, Modal, Table, Pagination, ConfirmDialog, Badge, Card, Input } from '../../components/ui'
import { Plus, Trash2, CheckCircle, AlertCircle, Lock, Users, CreditCard, ChevronRight } from 'lucide-react'
import { formatDate, formatCurrency, currentMonth } from '../../utils/helpers'

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW KEHADIRAN (disederhanakan jadi satu langkah):
//
// LANGKAH 1 — Pilih jadwal pertemuan
// LANGKAH 2 — Checklist kehadiran (Hadir/Izin/Tidak Hadir) → Simpan
//             → kehadiran TERSIMPAN + iuran otomatis tercatat BERSAMAAN
//             → jadwal.status = 'selesai' DAN iuran_sudah_dicatat = true
//
// Setelah langkah 2 selesai → Spinner aktif
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

// ── Tab: Catat Kehadiran Pertemuan ───────────────────────────────────────────
//
// SATU LANGKAH: checklist kehadiran + iuran otomatis tersimpan bersamaan.
//
// Aturan iuran otomatis (nominal dari jenis_iuran "Iuran Rutinan".nominal_default):
//   - Hadir       → iuran tercatat sebesar nominal_default
//   - Izin        → iuran TETAP tercatat sebesar nominal_default (tetap kena iuran)
//                   tapi status yang DISIMPAN ke tabel kehadiran adalah 'tidak_hadir'
//                   (DB hanya mengenal 2 nilai efektif: hadir / tidak_hadir)
//   - Tidak Hadir → iuran tidak dicatat sama sekali (Rp0)
//
function TabKehadiran({ jadwalList, jamaahList, jenisIuranList, qc }) {
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [checklistStatus, setChecklistStatus] = useState({}) // { jamaah_id: 'hadir'|'izin'|'tidak_hadir' }
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Nominal iuran otomatis — ambil dari jenis "Iuran Rutinan" (id=1)
  const jenisRutinan = jenisIuranList.find(j => j.id === 1)
  const nominalRutinan = Number(jenisRutinan?.nominal_default || 0)

  // Fetch kehadiran yang sudah ada untuk jadwal terpilih
  const { data: existingKehadiranData, isLoading: loadingExisting } = useQuery({
    queryKey: ['kehadiran-by-jadwal', selectedJadwal],
    queryFn: () => kehadiranApi.getAll({ jadwal_id: selectedJadwal, limit: 200 }).then(r => r.data),
    enabled: !!selectedJadwal,
    onSuccess: (data) => {
      const list = data?.data || data || []
      if (list.length > 0) {
        // Pre-fill checklist dari data yang sudah ada.
        // Catatan: karena 'izin' disimpan sebagai 'tidak_hadir' di DB, saat
        // membuka kembali data lama, izin akan tampil sebagai 'Tidak Hadir'
        // (tidak bisa dibedakan lagi dari tidak hadir biasa setelah tersimpan).
        const existing = {}
        list.forEach(k => { existing[k.jamaah_id] = k.status })
        setChecklistStatus(existing)
        setSaved(true)
      }
    }
  })

  const jadwalTerpilih = jadwalList.find(j => String(j.id) === String(selectedJadwal))

  // Ketika pilih jadwal baru, reset state dan langsung set semua jamaah = hadir
  function handleSelectJadwal(id) {
    setSelectedJadwal(id)
    const init = {}
    jamaahList.forEach(j => { init[j.id] = 'hadir' })
    setChecklistStatus(init)
    setSaved(false)
    setError('')
  }

  // Estimasi total iuran yang akan tercatat (hadir + izin, bukan tidak_hadir)
  const estimasiIuran = jamaahList.reduce((total, j) => {
    const status = checklistStatus[j.id]
    return (status === 'hadir' || status === 'izin') ? total + nominalRutinan : total
  }, 0)

  // Simpan kehadiran DAN iuran sekaligus dalam satu langkah
  async function handleSimpanSemua() {
    if (!selectedJadwal) return
    if (Object.keys(checklistStatus).length === 0) {
      setError('Belum ada status kehadiran yang diisi. Isi checklist terlebih dahulu.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const jadwal = jadwalList.find(j => String(j.id) === String(selectedJadwal))
      const periode = jadwal?.tanggal ? jadwal.tanggal.slice(0, 7) : currentMonth()
      const tanggalBayar = jadwal?.tanggal || new Date().toISOString().slice(0, 10)

      // 1) Simpan kehadiran — status 'izin' dikonversi jadi 'tidak_hadir' di DB,
      //    tapi kita simpan dulu status ASLI (sebelum konversi) untuk menentukan iuran.
      const absensi = jamaahList.map(j => {
        const statusAsli = checklistStatus[j.id] || 'tidak_hadir'
        const statusDb = statusAsli === 'izin' ? 'tidak_hadir' : statusAsli
        return { jamaah_id: j.id, status: statusDb, catatan: statusAsli === 'izin' ? 'izin' : '' }
      })

      await kehadiranApi.create({ jadwal_id: selectedJadwal, absensi })
      await jadwalApi.update(selectedJadwal, { status: 'selesai' })

      // 2) Simpan iuran otomatis untuk jamaah yang Hadir ATAU Izin (status asli,
      //    bukan status yang sudah dikonversi ke DB)
      const jamaahKenaIuran = jamaahList.filter(j => {
        const statusAsli = checklistStatus[j.id]
        return statusAsli === 'hadir' || statusAsli === 'izin'
      })

      if (jamaahKenaIuran.length > 0 && nominalRutinan > 0) {
        const iuranPromises = jamaahKenaIuran.map(j => iuranApi.create({
          jamaah_id: j.id,
          jadwal_id: selectedJadwal,
          nominal: nominalRutinan,
          tanggal_bayar: tanggalBayar,
          periode,
          keterangan: checklistStatus[j.id] === 'izin'
            ? 'Iuran otomatis — izin tidak hadir'
            : 'Iuran otomatis dari kehadiran pertemuan'
        }))
        await Promise.all(iuranPromises)
      }

      // 3) Tandai iuran sudah dicatat — karena di alur baru ini, iuran SELALU
      //    ikut tercatat bersamaan dengan kehadiran (tidak ada langkah terpisah lagi)
      await jadwalApi.update(selectedJadwal, { iuran_sudah_dicatat: true })

      qc.invalidateQueries(['admin-kehadiran'])
      qc.invalidateQueries(['kehadiran-by-jadwal', selectedJadwal])
      qc.invalidateQueries(['admin-jadwal'])
      qc.invalidateQueries(['jadwal-terakhir'])
      qc.invalidateQueries(['jadwal-all'])
      qc.invalidateQueries(['admin-iuran'])
      qc.invalidateQueries(['iuran-by-jadwal', selectedJadwal])

      setSaved(true)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Gagal menyimpan kehadiran & iuran.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const isSelesai = jadwalTerpilih?.status === 'selesai'
  // Catatan: D1/SQLite menyimpan INTEGER (0/1), bukan boolean asli —
  // pakai truthy check, bukan `=== true`.
  const isTercatatLengkap = isSelesai && !!jadwalTerpilih?.iuran_sudah_dicatat

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
          <div className="mt-3">
            <Badge color={isTercatatLengkap ? 'emerald' : 'amber'}>
              {isTercatatLengkap ? '✓ Kehadiran & iuran tercatat' : '⏳ Belum dicatat'}
            </Badge>
          </div>
        )}
      </Card>

      {/* LANGKAH 2 — Checklist Kehadiran */}
      {selectedJadwal && (
        <Card className="p-5">
          <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${isTercatatLengkap ? 'bg-emerald-500' : 'bg-emerald-600'}`}>
                {isTercatatLengkap ? '✓' : '2'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Checklist Kehadiran & Iuran</h3>
                <p className="text-xs text-gray-400">{jamaahList.length} jamaah terdaftar — default semua hadir</p>
              </div>
            </div>

          {/* Sudah selesai */}
          {isTercatatLengkap && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-4 mt-3">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                Kehadiran & iuran sudah tercatat. Spinner kini dapat digunakan.
              </p>
            </div>
          )}

          {/* Info aturan iuran otomatis */}
          {!isTercatatLengkap && (
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2.5 mt-3 mb-3 space-y-1">
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

          {/* Estimasi total iuran */}
          {!isTercatatLengkap && (
            <div className="flex items-center justify-between mt-4 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Estimasi total iuran tercatat</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(estimasiIuran)}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Tombol simpan — satu langkah untuk kehadiran + iuran */}
          {!isTercatatLengkap && (
            <div className="mt-4">
              <Button
                className="w-full"
                loading={saving}
                disabled={Object.keys(checklistStatus).length === 0 || saving}
                onClick={handleSimpanSemua}
              >
                <CheckCircle className="w-4 h-4" />
                Simpan Kehadiran & Iuran
              </Button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Iuran otomatis tercatat sesuai status. Setelah disimpan, <strong>Spinner</strong> dapat digunakan.
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
