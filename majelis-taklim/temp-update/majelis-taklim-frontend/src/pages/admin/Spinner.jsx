import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spinnerApi, jamaahApi, jadwalApi } from '../../api/services'
import { Button, Card, Modal, Input } from '../../components/ui'
import { Plus, Play, Trophy, Calendar, CheckCircle, AlertCircle, Lock } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// CATATAN INTEGRASI BACKEND (wajib selesai sebelum produksi)
//
// 1. GET /jadwal/:id
//    Response: { id, tanggal, status: 'selesai'|'akan-datang', iuran_sudah_dicatat: bool }
//    Dipakai untuk validasi workflow sebelum spinner boleh digunakan.
//
// 2. GET /jadwal/terakhir
//    Response: { id, tanggal, status, iuran_sudah_dicatat, ... }
//
// 3. POST /spinner/hasil
//    Body: { jamaah_id, nama_terpilih, fase_id, waktu }
//
// 4. PUT /jamaah/:id/next-host
//    Body: { is_next_host: bool, tanggal_host: string }
//
// 5. GET /spinner/riwayat
//    Response: [{ id, nama_terpilih, waktu, fase_id }]
//    Setelah tersedia, hapus enabled:false pada query riwayat di bawah.
//
// 6. Rollback / transaksi atomik:
//    Idealnya backend menyediakan satu endpoint POST /spinner/proses yang
//    membungkus langkah 3-4-POST /jadwal dalam satu transaksi database.
//    Selama belum tersedia, frontend melakukan rollback parsial (hapus jadwal
//    jika gagal), tetapi hasil spinner & next-host tidak dapat di-rollback
//    karena tidak ada endpoint DELETE /spinner/hasil/:id atau reset next-host.
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = [
  '#059669', '#0d9488', '#0891b2', '#7c3aed', '#db2777',
  '#dc2626', '#d97706', '#65a30d', '#0284c7', '#9333ea'
]

// ── Helper: format tanggal YYYY-MM-DD menggunakan waktu LOKAL (bukan UTC)
//    Mencegah pergeseran 1 hari pada timezone WIB (UTC+7).
function formatDateLocal(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ── Hitung tanggal +14 hari dari referensi jadwal terakhir.
//    Input: string YYYY-MM-DD atau ISO dari backend.
function getDefaultNextDate(tanggalRef) {
  if (!tanggalRef) return ''
  const parts = String(tanggalRef).split('T')[0].split('-')
  if (parts.length !== 3) return ''
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  if (isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + 14)
  return formatDateLocal(d)
}

// ── WorkflowGate: banner validasi status pertemuan ────────────────────────────
// Ditampilkan di atas spinner. Spinner hanya aktif jika workflowSiap === true.
function WorkflowGate({ jadwalTerakhir, loadingJadwal, errorJadwal }) {
  if (loadingJadwal) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-gray-200 dark:border-gray-700">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Memeriksa status pertemuan terakhir...
        </p>
      </Card>
    )
  }

  if (errorJadwal) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Gagal memuat status pertemuan
          </p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
            Pastikan backend endpoint <code className="bg-red-100 dark:bg-red-900 px-1 rounded">GET /jadwal/terakhir</code> sudah tersedia dan dapat diakses.
          </p>
        </div>
      </Card>
    )
  }

  if (!jadwalTerakhir) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Belum ada data jadwal pertemuan. Buat jadwal pertemuan pertama terlebih dahulu.
        </p>
      </Card>
    )
  }

  const sudahSelesai = jadwalTerakhir.status === 'selesai'
  const iuranSudahDicatat = jadwalTerakhir.iuran_sudah_dicatat === true

  if (!sudahSelesai) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Spinner belum dapat digunakan
          </p>
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
            Pertemuan terakhir belum ditandai selesai. Tandai pertemuan sebagai selesai terlebih dahulu.
          </p>
        </div>
      </Card>
    )
  }

  if (!iuranSudahDicatat) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Spinner belum dapat digunakan
          </p>
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
            Iuran pertemuan terakhir belum dicatat. Catat iuran terlebih dahulu sebelum memutar spinner.
          </p>
        </div>
      </Card>
    )
  }

  // Semua syarat terpenuhi — tampilkan badge hijau
  return (
    <Card className="p-4 flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
      <div>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Pertemuan selesai &amp; iuran sudah dicatat
        </p>
        <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">
          Spinner siap digunakan untuk memilih tuan rumah berikutnya.
        </p>
      </div>
    </Card>
  )
}

// ── SpinWheel: menerima prop `locked` untuk memblokir putaran ulang ───────────
function SpinWheel({ participants, onResult, locked, disabled }) {
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [angle, setAngle] = useState(0)
  const [winner, setWinner] = useState(null)
  const animRef = useRef(null)

  const count = participants.length

  function drawWheel(currentAngle) {
    const canvas = canvasRef.current
    if (!canvas || count === 0) return
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = Math.min(cx, cy) - 10
    const arc = (2 * Math.PI) / count

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    participants.forEach((p, i) => {
      const start = currentAngle + i * arc
      const end = start + arc

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${count > 8 ? 11 : 13}px Poppins, sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 4
      const label = (p.nama || p.name || `${i + 1}`).substring(0, 12)
      ctx.fillText(label, r - 12, 5)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#059669'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#059669'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('☪', cx, cy)

    // Pointer
    const px = cx
    const py = 8
    ctx.beginPath()
    ctx.moveTo(px - 10, py)
    ctx.lineTo(px + 10, py)
    ctx.lineTo(px, py + 22)
    ctx.closePath()
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  useEffect(() => { drawWheel(angle) }, [participants, angle])
  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  function spin() {
    // Blokir jika sedang spinning, kosong, locked (pemenang pending), atau disabled (workflow belum siap)
    if (spinning || count === 0 || locked || disabled) return
    setSpinning(true)
    setWinner(null)

    const totalRotation = (Math.random() * 5 + 8) * 2 * Math.PI
    const duration = 4000
    const start = performance.now()
    const startAngle = angle

    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startAngle + totalRotation * eased

      setAngle(current)
      drawWheel(current)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        const finalAngle = current % (2 * Math.PI)
const arc = (2 * Math.PI) / count
const pointerAngle = -Math.PI / 2
const normalized =
  ((pointerAngle - finalAngle) % (2 * Math.PI) + 2 * Math.PI) %
  (2 * Math.PI)

const idx = Math.floor(normalized / arc)

const w = participants[idx]
        setWinner(w)
        onResult?.(w)
        setSpinning(false)
      }
    }

    animRef.current = requestAnimationFrame(step)
  }

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-3">🎡</div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Tambahkan peserta untuk memutar roda</p>
      </div>
    )
  }

  // Overlay visual jika workflow belum siap
  const isBlockedByWorkflow = disabled && !locked

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${isBlockedByWorkflow ? 'opacity-40 grayscale' : ''}`}>
        <canvas ref={canvasRef} width={300} height={300} className="drop-shadow-xl" />
        {isBlockedByWorkflow && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full">
            <div className="bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Workflow belum selesai</span>
            </div>
          </div>
        )}
      </div>
      {winner && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl px-6 py-3 text-center animate-bounce">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">🏆 Terpilih!</p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{winner.nama || winner.name}</p>
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={spin}
          loading={spinning}
          size="lg"
          className="w-40"
          disabled={locked || disabled}
          variant={spinning || locked || disabled ? 'secondary' : 'primary'}
        >
          {spinning ? 'Memutar...' : <><Play className="w-4 h-4" /> Putar!</>}
        </Button>
        {/* Pesan lock — muncul setelah pemenang keluar, sebelum disimpan */}
        {locked && !spinning && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 text-center">
            Simpan hasil untuk melanjutkan. Hasil tidak dapat dibatalkan.
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminSpinner() {
  const qc = useQueryClient()

  // ── hasPendingWinner: true setelah pemenang keluar, false setelah disimpan.
  //    Mengunci SpinWheel agar tidak bisa diputar ulang sampai hasil disimpan.
  //    CATATAN: Tombol "Batalkan" dihapus — sekali roda berhenti, hasil sah.
  const [hasPendingWinner, setHasPendingWinner] = useState(false)

  const [selectedFase, setSelectedFase] = useState(null)
  const [faseModal, setFaseModal] = useState(false)
  const [faseName, setFaseName] = useState('')

  // ── State workflow hasil spinner ─────────────────────────
  const [hasilModal, setHasilModal] = useState(false)
  const [hasilWinner, setHasilWinner] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [savedJadwal, setSavedJadwal] = useState(null)

  // Form jadwal otomatis — bisa diedit admin sebelum disimpan
  const [jadwalForm, setJadwalForm] = useState({
    tanggal: '',
    waktu: '19:30',
    lokasi: '',
    keterangan: ''
  })

  // ── Queries ──────────────────────────────────────────────
  const { data: fasesData } = useQuery({
    queryKey: ['spinner-fases'],
    queryFn: () => spinnerApi.getFases().then(r => r.data)
  })

  const {
    data: jamaahData,
    isLoading: jamaahLoading,
    isError: jamaahError,
    error: jamaahErr
  } = useQuery({
    queryKey: ['jamaah-all'],
    queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data)
  })

  // Jadwal terakhir — sekarang dipakai GANDA:
  //   (a) validasi workflow: cek status & iuran_sudah_dicatat
  //   (b) hitung tanggal default +14 hari untuk jadwal baru
  //
  // Backend WAJIB mengembalikan field:
  //   { id, tanggal, status: 'selesai'|'akan-datang', iuran_sudah_dicatat: bool }
  const {
    data: jadwalTerakhirData,
    isLoading: loadingJadwal,
    isError: errorJadwal
  } = useQuery({
    queryKey: ['jadwal-terakhir'],
    queryFn: () => jadwalApi.getLast().then(r => r.data)
  })

  // Riwayat dari backend.
  // TODO (backend): Buat endpoint GET /spinner/riwayat.
  // Setelah tersedia, hapus `enabled: false` dan aktifkan query ini.
  const { data: riwayatData } = useQuery({
    queryKey: ['spinner-riwayat'],
    queryFn: () => spinnerApi.getRiwayat().then(r => r.data),
    enabled: false   // aktifkan setelah GET /spinner/riwayat tersedia di backend
  })
  const riwayat = riwayatData?.data || riwayatData || []

  const { data: faseDetail, isError: faseError, error: faseErrDetail } = useQuery({
    queryKey: ['spinner-fase', selectedFase],
    queryFn: () => spinnerApi.getFaseById(selectedFase).then(r => r.data),
    enabled: !!selectedFase
  })

  const createFaseMut = useMutation({
    mutationFn: (data) => spinnerApi.createFase(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spinner-fases'] })
      setFaseModal(false)
      setFaseName('')
    }
  })

  // ── Derived state ────────────────────────────────────────
  const fases = fasesData?.data || fasesData || []
  const jamaahList = jamaahData?.data || jamaahData || []
  const rawJadwal =
  jadwalTerakhirData?.data || jadwalTerakhirData || []

const jadwalTerakhir = Array.isArray(rawJadwal)
  ? rawJadwal[0] || null
  : rawJadwal
console.log('jadwalTerakhir=', jadwalTerakhir)
  // ── Validasi workflow: spinner hanya aktif jika pertemuan selesai + iuran dicatat
  //    Backend wajib sediakan field status & iuran_sudah_dicatat di GET /jadwal/terakhir
  const workflowSiap = !loadingJadwal
    && !errorJadwal
    && jadwalTerakhir !== null
    && jadwalTerakhir.status === 'selesai'
    && jadwalTerakhir.iuran_sudah_dicatat === true

  // Hanya jamaah yang belum pernah host di siklus ini.
  // Backend wajib sediakan field sudah_pernah_host per jamaah.
  const jamaahBelumHost = jamaahList.filter(j => !j.sudah_pernah_host)

  const pesertaFase = faseDetail?.peserta || faseDetail?.data?.peserta || []
  const participants = selectedFase
    ? pesertaFase.filter(j => !j.sudah_pernah_host)
    : jamaahBelumHost

  // ── handleResult: dipanggil SpinWheel setelah animasi berhenti ───────────────
  function handleResult(winner) {
    // Lock spinner — tidak boleh diputar lagi sampai hasil disimpan
    // KEBIJAKAN: sekali roda berhenti, hasil sah. Tidak ada tombol Batalkan.
    setHasPendingWinner(true)

    setHasilWinner(winner)
    setSaveError(null)
    setSavedJadwal(null)

    // Hitung tanggal default: jadwal terakhir + 14 hari
    const tanggalRef = jadwalTerakhir?.tanggal || null
    const fallbackDateObj = new Date()
    fallbackDateObj.setDate(fallbackDateObj.getDate() + 14)
    const fallbackDate = formatDateLocal(fallbackDateObj)

    setJadwalForm({
      tanggal: getDefaultNextDate(tanggalRef) || fallbackDate,
      waktu: '19:30',
      lokasi: winner.nama || winner.name || '',
      keterangan: `Tuan rumah terpilih via Spinner — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
    })

    setHasilModal(true)
  }

  // ── handleSimpanHasil: 3 langkah + rollback parsial ─────────────────────────
  //
  // CATATAN ARSITEKTUR: Idealnya backend menyediakan satu endpoint atomik
  // POST /spinner/proses yang menggabungkan langkah 1-3 dalam satu transaksi.
  // Selama belum tersedia, rollback dilakukan secara parsial:
  //   - Jika langkah 3 (buat jadwal) gagal → jadwal dihapus
  //   - Langkah 1 (hasil spinner) & langkah 2 (next-host) tidak dapat di-rollback
  //     karena backend belum menyediakan endpoint DELETE /spinner/hasil/:id
  //     dan belum ada endpoint reset is_next_host.
  async function handleSimpanHasil() {
  console.log('=== SIMPAN HASIL DIMULAI ===')
  console.log('hasilWinner =', hasilWinner)

  if (!hasilWinner) return
    setSaving(true)
    setSaveError(null)

    let hasilId = null
    let jadwalId = null

    try {
      // Langkah 1: Simpan hasil putaran ke backend
      // Endpoint: POST /spinner/hasil
      // Backend wajib tersedia sebelum fitur ini final.
      console.log('STEP 1 - save hasil')

const hasilRes = await spinnerApi.saveHasil({
  jamaah_id: hasilWinner.id,
  nama_terpilih: hasilWinner.nama || hasilWinner.name,
  fase_id: selectedFase || null,
  waktu: new Date().toISOString()
})

console.log('STEP 1 OK', hasilRes)
      hasilId = hasilRes?.data?.id || hasilRes?.id || null

      // Langkah 2: Tandai jamaah terpilih sebagai host berikutnya
      // Endpoint: PUT /jamaah/:id/next-host
      // Backend wajib tersedia sebelum fitur ini final.
      if (hasilWinner.id) {
  console.log('STEP 2 - set next host')

  await spinnerApi.setNextHost(hasilWinner.id, {
    is_next_host: true,
    tanggal_host: jadwalForm.tanggal
  })

  console.log('STEP 2 OK')
}

      // Langkah 3: Buat jadwal pertemuan otomatis dengan host_id
      // Endpoint: POST /jadwal
      // Tabel jadwal wajib memiliki kolom host_id (migrasi database diperlukan).
      console.log('STEP 3 - create jadwal')

console.log('HASIL WINNER FULL', hasilWinner)

console.log('PAYLOAD JADWAL', {
  judul: `Tahlil Bergilir - ${hasilWinner.nama}`,
  tanggal: jadwalForm.tanggal,
  host_id: hasilWinner.id
})

const jadwalRes = await jadwalApi.create({
  judul: `Tahlil Bergilir - ${hasilWinner.nama}`,
  tanggal: jadwalForm.tanggal,

  waktu_mulai: jadwalForm.waktu,

  lokasi: jadwalForm.lokasi,

  deskripsi: jadwalForm.keterangan,

  jenis: 'khusus',

  host_id: hasilWinner.id
})

console.log(
  'STEP 3 OK JSON',
  JSON.stringify(jadwalRes, null, 2)
)
      jadwalId = jadwalRes?.data?.id || jadwalRes?.id || null
      setSavedJadwal({ ...jadwalForm, id: jadwalId })

      // Refresh cache agar UI langsung segar
      await qc.invalidateQueries({ queryKey: ['jamaah-all'] })
      await qc.invalidateQueries({ queryKey: ['jadwal-terakhir'] })
      await qc.invalidateQueries({ queryKey: ['admin-jadwal'] })
      await qc.invalidateQueries({ queryKey: ['spinner-riwayat'] })

    } catch (err) {

  console.error('ERROR SPINNER', err)
  console.error('ERROR RESPONSE', err?.response)
  console.error('ERROR DATA', err?.response?.data)

  const errMsg = err?.response?.data?.message || err?.message || 'Terjadi kesalahan'
  setSaveError(`Gagal menyimpan: ${errMsg}. Silakan coba lagi atau hubungi admin.`)

      // Rollback parsial:
      // - Hapus jadwal jika sudah terlanjur dibuat (langkah 3 berhasil tapi gagal setelahnya)
      if (jadwalId) {
        await jadwalApi.delete(jadwalId).catch(() => {})
      }
      // - TODO (backend): Tambahkan DELETE /spinner/hasil/:id untuk rollback hasil spinner
      //   dan endpoint reset is_next_host agar rollback bisa lengkap.

    } finally {
      setSaving(false)
    }
  }

  // ── handleTutupHasil: hanya menutup modal setelah berhasil disimpan ──────────
  //    KEBIJAKAN: Tombol "Tutup" hanya muncul setelah berhasil disimpan.
  //    Tidak ada tombol "Batalkan" — sekali roda berhenti, hasil sah.
  function handleTutupHasil() {
    if (!savedJadwal && !saveError) return  // Jangan tutup jika belum simpan
    setHasilModal(false)
    setHasilWinner(null)
    setSaveError(null)
    setSavedJadwal(null)
    setJadwalForm({ tanggal: '', waktu: '19:30', lokasi: '', keterangan: '' })
    // Unlock spinner setelah berhasil disimpan
    setHasPendingWinner(false)
  }

  // ── handleCloseModal: hanya diizinkan via tombol, bukan klik backdrop ────────
  //    Modal tidak bisa ditutup paksa jika belum disimpan.
  function handleCloseModal() {
    // Jika sudah tersimpan atau ada error yang butuh konfirmasi, izinkan tutup
    if (savedJadwal) {
      handleTutupHasil()
    }
    // Jika belum disimpan: tidak lakukan apapun — user wajib menekan tombol Simpan
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div className="p-5 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Spinner Giliran</h1>
        <p className="text-sm text-gray-500">Roda putar pemilihan tuan rumah berikutnya</p>
      </div>

      {/* ── Banner Validasi Workflow Pertemuan (Poin 1) ── */}
      <WorkflowGate
        jadwalTerakhir={jadwalTerakhir}
        loadingJadwal={loadingJadwal}
        errorJadwal={errorJadwal}
      />

      {/* Fase Selector — hanya tampil jika workflow siap */}
      {workflowSiap && (
        <div className="flex gap-2">
          <select
            value={selectedFase || ''}
            onChange={e => setSelectedFase(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Pilih fase / gunakan semua jamaah</option>
            {fases.map(f => <option key={f.id} value={f.id}>{f.nama}</option>)}
          </select>
          <Button size="sm" variant="secondary" onClick={() => setFaseModal(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Error fase gagal dimuat */}
      {workflowSiap && selectedFase && faseError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300">
            Gagal memuat data peserta fase:{' '}
            {faseErrDetail?.response?.data?.message || faseErrDetail?.message || 'Terjadi kesalahan'}
          </p>
        </div>
      )}

      {/* Loading jamaah */}
      {jamaahLoading && (
        <Card className="p-4 text-sm text-gray-500 dark:text-gray-400">
          Memuat data jamaah...
        </Card>
      )}

      {/* Error jamaah */}
      {jamaahError && (
        <Card className="p-4 flex items-center gap-2 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-500">
            {jamaahErr?.message || 'Gagal memuat jamaah'}
          </p>
        </Card>
      )}

      {/* Fase dipilih tapi belum ada peserta */}
      {!jamaahLoading && workflowSiap && selectedFase && pesertaFase.length === 0 && (
        <Card className="p-4 text-center space-y-1 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Belum ada peserta pada fase ini.
          </p>
          <p className="text-xs text-amber-500 dark:text-amber-400">
            Tambahkan peserta ke fase terlebih dahulu.
          </p>
        </Card>
      )}

      {/* Semua peserta sudah pernah jadi host — siklus selesai */}
      {!jamaahLoading && workflowSiap && pesertaFase.length > 0 && participants.length === 0 && (
        <Card className="p-4 text-center space-y-1 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Semua peserta pada fase ini sudah pernah menjadi tuan rumah.
          </p>
          <p className="text-xs text-emerald-500 dark:text-emerald-400">
            Silakan buat fase baru atau tunggu reset siklus host dari backend.
          </p>
        </Card>
      )}

      {/* Spinner Wheel */}
      {!jamaahLoading && participants.length > 0 && (
        <Card className="p-6">
          <SpinWheel
            participants={participants}
            onResult={handleResult}
            locked={hasPendingWinner}
            disabled={!workflowSiap}
          />
        </Card>
      )}

      {/* Daftar Peserta */}
      {workflowSiap && participants.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Peserta ({participants.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((p, i) => (
              <span
                key={p.id || i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              >
                {p.nama || p.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Riwayat Putaran dari backend (aktif setelah GET /spinner/riwayat tersedia) */}
      {riwayat.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Riwayat Putaran
          </h3>
          <div className="space-y-2">
            {riwayat.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">#{riwayat.length - i}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {r.nama_terpilih || r.nama}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {r.waktu
                    ? new Date(r.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                    : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Modal Workflow Hasil Spinner ──────────────────── */}
      {/* Modal tidak bisa ditutup paksa (onClose hanya jalan jika sudah disimpan) */}
      <Modal isOpen={hasilModal} onClose={handleCloseModal} title="Simpan Hasil Spinner">
        <div className="space-y-4">

          {/* Pemenang */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">🏆 Tuan Rumah Berikutnya</p>
            <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
              {hasilWinner?.nama || hasilWinner?.name}
            </p>
            {!savedJadwal && (
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                Hasil ini sah dan tidak dapat dibatalkan. Simpan untuk melanjutkan.
              </p>
            )}
          </div>

          {/* Sudah tersimpan */}
          {savedJadwal ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm font-semibold">Berhasil disimpan!</p>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 pl-6">
                Jadwal pertemuan berikutnya dibuat otomatis:
              </p>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 pl-6">
                📅 {new Date(savedJadwal.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{savedJadwal.waktu} WIB
              </p>
              {savedJadwal.lokasi && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 pl-6">
                  📍 {savedJadwal.lokasi}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Error */}
              {saveError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-700 dark:text-red-300">{saveError}</p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      Catatan: Hasil spinner mungkin sudah tersimpan di backend. Periksa data sebelum mencoba lagi.
                    </p>
                  </div>
                </div>
              )}

              {/* Form jadwal otomatis */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <p className="text-xs">Jadwal pertemuan berikutnya (default +14 hari, dapat diubah)</p>
                </div>
                <Input
                  label="Tanggal Pertemuan*"
                  type="date"
                  value={jadwalForm.tanggal}
                  onChange={e => setJadwalForm(f => ({ ...f, tanggal: e.target.value }))}
                />
                <Input
                  label="Waktu"
                  type="time"
                  value={jadwalForm.waktu}
                  onChange={e => setJadwalForm(f => ({ ...f, waktu: e.target.value }))}
                />
                <Input
                  label="Lokasi / Alamat Tuan Rumah"
                  placeholder="Nama/alamat tuan rumah"
                  value={jadwalForm.lokasi}
                  onChange={e => setJadwalForm(f => ({ ...f, lokasi: e.target.value }))}
                />
                <Input
                  label="Keterangan"
                  placeholder="Keterangan tambahan"
                  value={jadwalForm.keterangan}
                  onChange={e => setJadwalForm(f => ({ ...f, keterangan: e.target.value }))}
                />
              </div>
            </>
          )}

          {/* Tombol aksi — KEBIJAKAN: tidak ada tombol Batalkan */}
          <div className="flex gap-3 pt-1">
            {savedJadwal ? (
              <Button className="flex-1" onClick={handleTutupHasil}>
                Tutup
              </Button>
            ) : (
              <>
                {/* Tombol Batalkan dihapus: sekali roda berhenti, hasil sah */}
                {saveError && (
                  <Button variant="secondary" className="flex-1" onClick={() => setSaveError(null)}>
                    Coba Lagi
                  </Button>
                )}
                <Button
                  className="flex-1"
                  loading={saving}
                  disabled={!jadwalForm.tanggal || saving}
                  onClick={handleSimpanHasil}
                >
                  Simpan & Buat Jadwal
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Buat Fase Baru */}
      <Modal isOpen={faseModal} onClose={() => setFaseModal(false)} title="Buat Fase Baru" size="sm">
        <div className="space-y-4">
          <Input
            label="Nama Fase"
            placeholder="contoh: Arisan Bulan Juli"
            value={faseName}
            onChange={e => setFaseName(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setFaseModal(false)}>
              Batal
            </Button>
            <Button
              className="flex-1"
              loading={createFaseMut.isPending}
              onClick={() => createFaseMut.mutate({ nama: faseName })}
            >
              Buat Fase
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
