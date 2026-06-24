import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spinnerApi, jamaahApi, jadwalApi } from '../../api/services'
import { Button, Card, Modal, Input, Select } from '../../components/ui'
import { Plus, Play, Trophy, Calendar, CheckCircle, AlertCircle, Lock } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// CATATAN INTEGRASI BACKEND
//
// 1. GET /jadwal/terakhir
//    Response: { id, tanggal, status: 'selesai'|'akan-datang', iuran_sudah_dicatat: bool }
//
// 2. POST /spinner/hasil
//    Body: { jamaah_id, nama_terpilih, fase_id, waktu }
//
// 3. PUT /jamaah/:id/next-host
//    Body: { is_next_host: bool, tanggal_host: string }
//
// 4. GET /spinner/riwayat
//    Response: [{ id, nama_terpilih, waktu, fase_id }]
//
// 5. POST /jadwal
//    Body: { tanggal, waktu, lokasi, keterangan, host_id }
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = [
  '#059669', '#0d9488', '#0891b2', '#7c3aed', '#db2777',
  '#dc2626', '#d97706', '#65a30d', '#0284c7', '#9333ea'
]

function formatDateLocal(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

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
function WorkflowGate({ jadwalTerakhir, loadingJadwal, errorTeknis, jadwalBelumAda }) {
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

  // Database belum punya jadwal sama sekali — kondisi NORMAL (misalnya baru
  // di-reset atau memang belum pernah ada pertemuan), bukan kegagalan teknis.
  if (jadwalBelumAda || !jadwalTerakhir) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Belum ada jadwal pertemuan
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Buat jadwal pertemuan terlebih dahulu di menu Jadwal, lalu catat kehadirannya, agar Spinner dapat digunakan.
          </p>
        </div>
      </Card>
    )
  }

  if (errorTeknis) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Gagal memuat status pertemuan
          </p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
            Terjadi gangguan koneksi ke server. Coba muat ulang halaman.
          </p>
        </div>
      </Card>
    )
  }

  // Catatan: D1/SQLite menyimpan kolom INTEGER (0/1), bukan boolean asli —
  // jadi perbandingan harus truthy check, bukan strict `=== true`.
  const sudahSelesai = jadwalTerakhir.status === 'selesai'
  const iuranSudahDicatat = !!jadwalTerakhir.iuran_sudah_dicatat

  if (!sudahSelesai) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Spinner belum dapat digunakan
          </p>
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
            Pertemuan terakhir belum ditandai selesai. Tandai pertemuan sebagai selesai terlebih dahulu di menu Jadwal.
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
            Iuran dari kehadiran pertemuan terakhir belum dicatat. Catat iuran terlebih dahulu sebelum memutar spinner.
          </p>
        </div>
      </Card>
    )
  }

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

// ── SpinWheel ─────────────────────────────────────────────────────────────────
// disabled = workflow belum siap (pertemuan belum selesai / iuran belum dicatat)
// locked   = menunggu simpan hasil putaran sebelumnya
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
        const arc = (2 * Math.PI) / count

        // Penanda (pointer) digambar di ATAS roda (jam 12 = -90° / -π/2 dalam
        // konvensi ctx.arc(), yang mulai dari kanan/jam-3 dan searah jarum jam).
        // Sektor ke-i digambar pada sudut [currentAngle + i*arc, ...+arc).
        // Supaya pas dengan posisi penanda di atas, sudut itu harus dikurangi
        // offset -π/2 sebelum dicocokkan ke index sektor — sebelumnya offset
        // ini tidak diperhitungkan, sehingga sektor yang terdeteksi "menang"
        // selalu meleset dari sektor yang benar-benar berhenti di bawah penanda.
        const pointerOffset = -Math.PI / 2
        const finalAngle = current % (2 * Math.PI)
        const normalized = (((pointerOffset - finalAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const idx = Math.floor(normalized / arc) % count
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
      {winner && !locked && (
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
          disabled={locked || disabled || spinning}
          variant={spinning || locked || disabled ? 'secondary' : 'primary'}
        >
          {spinning ? 'Memutar...' : <><Play className="w-4 h-4" /> Putar!</>}
        </Button>
        {locked && !spinning && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 text-center">
            Simpan atau edit hasil terlebih dahulu sebelum memutar ulang.
          </p>
        )}
        {disabled && !locked && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
            Selesaikan workflow pertemuan untuk mengaktifkan spinner.
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminSpinner() {
  const qc = useQueryClient()

  // hasPendingWinner: mengunci SpinWheel setelah hasil keluar, sampai disimpan
  const [hasPendingWinner, setHasPendingWinner] = useState(false)

  const [selectedFase, setSelectedFase] = useState(null)
  const [faseModal, setFaseModal] = useState(false)
  const [faseName, setFaseName] = useState('')

  const [hasilModal, setHasilModal] = useState(false)
  const [hasilWinner, setHasilWinner] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [savedJadwal, setSavedJadwal] = useState(null)
  // Popup pengumuman pemenang — tampil dulu sebelum form edit, supaya admin
  // sempat melihat dengan jelas siapa yang terpilih sebelum lanjut mengedit.
  const [showWinnerPopup, setShowWinnerPopup] = useState(false)

  // Form hasil — bisa diedit admin sebelum disimpan (nama host + jadwal)
  const [hasilForm, setHasilForm] = useState({
    nama_terpilih: '',
    host_jamaah_id: '',
    jadwal_tanggal: '',
    jadwal_waktu: '19:30',
    jadwal_lokasi: '',
    jadwal_keterangan: ''
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

  const {
    data: jadwalTerakhirData,
    isLoading: loadingJadwal,
    isError: errorJadwal,
    error: jadwalErrorObj
  } = useQuery({
    queryKey: ['jadwal-terakhir'],
    queryFn: () => jadwalApi.getLast().then(r => r.data),
    refetchOnWindowFocus: true,
    staleTime: 0,
    // 404 di sini artinya "belum ada jadwal sama sekali" — itu kondisi NORMAL
    // (misalnya database baru di-reset), bukan kegagalan yang perlu di-retry.
    retry: (failureCount, err) => err?.response?.status !== 404 && failureCount < 2
  })

  // Bedakan 404 (belum ada jadwal — kondisi normal) dari error teknis sungguhan
  // (network gagal, server error, dll). 404 TIDAK dianggap error oleh UI.
  const jadwalBelumAda = jadwalErrorObj?.response?.status === 404
  const errorTeknis = errorJadwal && !jadwalBelumAda

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
  const jadwalTerakhir = jadwalTerakhirData?.data || jadwalTerakhirData || null

  // Spinner aktif HANYA jika: pertemuan terakhir selesai DAN iuran sudah dicatat.
  // Catatan: iuran_sudah_dicatat dari D1/SQLite berupa INTEGER 0/1, bukan
  // boolean asli — pakai truthy check (!!), bukan `=== true`.
  const workflowSiap = !loadingJadwal
    && !errorTeknis
    && jadwalTerakhir !== null
    && jadwalTerakhir.status === 'selesai'
    && !!jadwalTerakhir.iuran_sudah_dicatat

  const jamaahBelumHost = jamaahList.filter(j => !j.sudah_pernah_host)
  const pesertaFase = faseDetail?.peserta || faseDetail?.data?.peserta || []
  const participants = selectedFase
    ? pesertaFase.filter(j => !j.sudah_pernah_host)
    : jamaahBelumHost

  // ── handleResult: dipanggil SpinWheel setelah animasi berhenti ───────────────
  function handleResult(winner) {
    setHasPendingWinner(true)
    setHasilWinner(winner)
    setSaveError(null)
    setSavedJadwal(null)

    const tanggalRef = jadwalTerakhir?.tanggal || null
    const fallbackDateObj = new Date()
    fallbackDateObj.setDate(fallbackDateObj.getDate() + 14)
    const fallbackDate = formatDateLocal(fallbackDateObj)

    // Isi form dengan nilai default — SEMUA bisa diedit admin sebelum disimpan
    setHasilForm({
      nama_terpilih: winner.nama || winner.name || '',
      host_jamaah_id: winner.id || '',
      jadwal_tanggal: getDefaultNextDate(tanggalRef) || fallbackDate,
      jadwal_waktu: '19:30',
      jadwal_lokasi: winner.nama || winner.name || '',
      jadwal_keterangan: `Tuan rumah terpilih via Spinner — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
    })

    // Tampilkan popup pengumuman pemenang dulu — modal edit baru muncul
    // setelah admin menutup popup ini, supaya tidak langsung tertutupi.
    setShowWinnerPopup(true)
  }

  function handleLanjutKeForm() {
    setShowWinnerPopup(false)
    setHasilModal(true)
  }

  // ── handleSimpanHasil: simpan hasil ke database ──────────────────────────────
  // Data yang disimpan adalah isi hasilForm (yang sudah bisa diedit admin),
  // bukan langsung data mentah dari spinner.
  async function handleSimpanHasil() {
    if (!hasilWinner || !hasilForm.jadwal_tanggal) return
    if (!hasilForm.host_jamaah_id) {
      setSaveError('Tuan rumah wajib dipilih dari daftar jamaah.')
      return
    }
    setSaving(true)
    setSaveError(null)

    let jadwalId = null
    // host_jamaah_id adalah sumber kebenaran (bisa diganti admin lewat dropdown,
    // beda dari hasilWinner.id yang merupakan hasil asli spin) — pastikan ID,
    // bukan string, sebelum dikirim ke backend.
    const hostId = Number(hasilForm.host_jamaah_id)

    try {
      // Langkah 1: Simpan hasil putaran ke backend
      await spinnerApi.saveHasil({
        jamaah_id: hostId,
        nama_terpilih: hasilForm.nama_terpilih,   // pakai nilai yang sudah diedit
        fase_id: selectedFase || null,
        waktu: new Date().toISOString()
      })

      // Langkah 2: Tandai jamaah sebagai host berikutnya
      await spinnerApi.setNextHost(hostId, {
        is_next_host: true,
        tanggal_host: hasilForm.jadwal_tanggal
      })

      // Langkah 3: Buat jadwal pertemuan otomatis menggunakan data form yang sudah diedit
      const jadwalRes = await jadwalApi.create({
        judul: "Pertemuan Majelis Ta'lim",
        tanggal: hasilForm.jadwal_tanggal,
        waktu_mulai: hasilForm.jadwal_waktu,
        lokasi: hasilForm.jadwal_lokasi,
        deskripsi: hasilForm.jadwal_keterangan,
        host_id: hostId
      })
      jadwalId = jadwalRes?.data?.id || jadwalRes?.id || null
      setSavedJadwal({ ...hasilForm, id: jadwalId })

      // Refresh cache
      await qc.invalidateQueries({ queryKey: ['jamaah-all'] })
      await qc.invalidateQueries({ queryKey: ['jadwal-terakhir'] })
      await qc.invalidateQueries({ queryKey: ['admin-jadwal'] })
      await qc.invalidateQueries({ queryKey: ['spinner-riwayat'] })

    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Terjadi kesalahan'
      setSaveError(`Gagal menyimpan: ${errMsg}. Silakan coba lagi.`)

      // Rollback jadwal jika terlanjur dibuat
      if (jadwalId) {
        await jadwalApi.delete(jadwalId).catch(() => {})
      }
    } finally {
      setSaving(false)
    }
  }

  function handleTutupHasil() {
    setHasilModal(false)
    setShowWinnerPopup(false)
    setHasilWinner(null)
    setSaveError(null)
    setSavedJadwal(null)
    setHasilForm({ nama_terpilih: '', host_jamaah_id: '', jadwal_tanggal: '', jadwal_waktu: '19:30', jadwal_lokasi: '', jadwal_keterangan: '' })
    setHasPendingWinner(false)
  }

  // Modal hanya bisa ditutup via tombol setelah tersimpan
  function handleCloseModal() {
    if (savedJadwal) handleTutupHasil()
    // Jika belum disimpan: tidak lakukan apapun
  }

  return (
    <div className="p-5 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Spinner Giliran</h1>
        <p className="text-sm text-gray-500">Roda putar pemilihan tuan rumah berikutnya</p>
      </div>

      {/* ── Banner Validasi Workflow ── */}
      <WorkflowGate
        jadwalTerakhir={jadwalTerakhir}
        loadingJadwal={loadingJadwal}
        errorTeknis={errorTeknis}
        jadwalBelumAda={jadwalBelumAda}
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

      {/* Error fase */}
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
          <p className="text-sm text-red-500">{jamaahErr?.message || 'Gagal memuat jamaah'}</p>
        </Card>
      )}

      {/* Belum ada peserta di fase */}
      {!jamaahLoading && workflowSiap && selectedFase && pesertaFase.length === 0 && (
        <Card className="p-4 text-center space-y-1 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-700 dark:text-amber-300">Belum ada peserta pada fase ini.</p>
          <p className="text-xs text-amber-500 dark:text-amber-400">Tambahkan peserta ke fase terlebih dahulu.</p>
        </Card>
      )}

      {/* Semua sudah pernah host */}
      {!jamaahLoading && workflowSiap && pesertaFase.length > 0 && participants.length === 0 && (
        <Card className="p-4 text-center space-y-1 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Semua peserta pada fase ini sudah pernah menjadi tuan rumah.
          </p>
          <p className="text-xs text-emerald-500 dark:text-emerald-400">
            Silakan buat fase baru atau tunggu reset siklus dari backend.
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

      {/* Riwayat */}
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
                  {r.waktu ? new Date(r.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Popup Pengumuman Pemenang ────────────────────────────────────────────── */}
      {/* Tampil dulu sebelum form edit, supaya admin sempat melihat dengan jelas
          siapa yang terpilih sebelum lanjut mengedit detail jadwal. */}
      <Modal isOpen={showWinnerPopup} onClose={() => {}} title="">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="text-5xl">🎉</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tuan rumah terpilih:</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {hasilWinner?.nama || hasilWinner?.name}
          </p>
          <Button className="w-full mt-3" onClick={handleLanjutKeForm}>
            Lanjutkan
          </Button>
        </div>
      </Modal>

      {/* ── Modal Hasil Spinner ──────────────────────────────────────────────────── */}
      {/* Tidak bisa ditutup paksa sebelum tersimpan */}
      <Modal isOpen={hasilModal} onClose={handleCloseModal} title="Hasil Spinner — Edit & Simpan">
        <div className="space-y-4">

          {/* Sudah tersimpan */}
          {savedJadwal ? (
            <>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-semibold">Berhasil disimpan!</p>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 pl-6">
                  Tuan rumah: <strong>{savedJadwal.nama_terpilih}</strong>
                </p>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 pl-6">
                  📅 {new Date(savedJadwal.jadwal_tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}{savedJadwal.jadwal_waktu} WIB
                </p>
                {savedJadwal.jadwal_lokasi && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 pl-6">
                    📍 {savedJadwal.jadwal_lokasi}
                  </p>
                )}
              </div>
              <Button className="w-full" onClick={handleTutupHasil}>
                Tutup
              </Button>
            </>
          ) : (
            <>
              {/* Info: hasil bisa diedit sebelum disimpan */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ✏️ Data di bawah dapat diedit sebelum disimpan. Klik <strong>Simpan & Buat Jadwal</strong> untuk menyimpan ke database.
                </p>
              </div>

              {/* Error */}
              {saveError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-700 dark:text-red-300">{saveError}</p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      Hasil spinner mungkin sudah tersimpan. Periksa data sebelum mencoba lagi.
                    </p>
                  </div>
                </div>
              )}

              {/* Form — semua field bisa diedit */}
              <div className="space-y-3">
                <Select
                  label="Tuan Rumah Terpilih*"
                  value={hasilForm.host_jamaah_id}
                  onChange={e => {
                    const id = e.target.value
                    const jamaahTerpilih = jamaahList.find(j => String(j.id) === String(id))
                    setHasilForm(f => ({
                      ...f,
                      host_jamaah_id: id,
                      nama_terpilih: jamaahTerpilih?.nama || '',
                      // Lokasi ikut update ke nama jamaah yang baru, kecuali admin
                      // sudah mengubahnya secara manual sebelumnya.
                      jadwal_lokasi: f.jadwal_lokasi === f.nama_terpilih ? (jamaahTerpilih?.nama || '') : f.jadwal_lokasi
                    }))
                  }}
                >
                  <option value="">— Pilih jamaah —</option>
                  {jamaahList.map(j => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </Select>
                <p className="text-xs text-gray-400 -mt-2">
                  Default terisi hasil putaran. Admin dapat memilih jamaah lain dari daftar bila perlu.
                </p>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 pt-1">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <p className="text-xs">Jadwal pertemuan berikutnya (default +14 hari, dapat diubah)</p>
                </div>
                <Input
                  label="Tanggal Pertemuan*"
                  type="date"
                  value={hasilForm.jadwal_tanggal}
                  onChange={e => setHasilForm(f => ({ ...f, jadwal_tanggal: e.target.value }))}
                />
                <Input
                  label="Waktu"
                  type="time"
                  value={hasilForm.jadwal_waktu}
                  onChange={e => setHasilForm(f => ({ ...f, jadwal_waktu: e.target.value }))}
                />
                <Input
                  label="Lokasi / Alamat Tuan Rumah"
                  placeholder="Nama/alamat tuan rumah"
                  value={hasilForm.jadwal_lokasi}
                  onChange={e => setHasilForm(f => ({ ...f, jadwal_lokasi: e.target.value }))}
                />
                <Input
                  label="Keterangan"
                  placeholder="Keterangan tambahan"
                  value={hasilForm.jadwal_keterangan}
                  onChange={e => setHasilForm(f => ({ ...f, jadwal_keterangan: e.target.value }))}
                />
              </div>

              {/* Tombol aksi */}
              <div className="flex gap-3 pt-1">
                {saveError && (
                  <Button variant="secondary" className="flex-1" onClick={() => setSaveError(null)}>
                    Coba Lagi
                  </Button>
                )}
                <Button
                  className="flex-1"
                  loading={saving}
                  disabled={!hasilForm.jadwal_tanggal || !hasilForm.nama_terpilih || saving}
                  onClick={handleSimpanHasil}
                >
                  Simpan & Buat Jadwal
                </Button>
              </div>
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                Data hanya tersimpan ke database setelah tombol Simpan ditekan.
              </p>
            </>
          )}
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
