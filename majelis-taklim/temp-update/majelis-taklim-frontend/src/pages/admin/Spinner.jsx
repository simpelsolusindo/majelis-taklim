import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spinnerApi, jamaahApi, jadwalApi } from '../../api/services'
import { Button, Card, Modal, Input, Select } from '../../components/ui'
import { Play, Trophy, Calendar, CheckCircle, AlertCircle, Lock, RefreshCw, Users } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// ALUR KERJA SPINNER:
//  1. GET /jadwal/terakhir → cek pertemuan sudah selesai & iuran dicatat
//  2. GET /spinner/aktif   → ambil fase aktif + peserta (auto-create jika belum ada)
//  3. POST /spinner/putar  → backend pilih acak (dari fase aktif, tanpa perlu kirim fase_id)
//  4. Admin lihat pemenang → isi form jadwal → POST /spinner/hasil + PUT /jamaah/:id/next-host + POST /jadwal
//  5. Jika semua sudah giliran → backend auto-buat fase baru
// ─────────────────────────────────────────────────────────────

const COLORS = [
  '#059669', '#0d9488', '#0891b2', '#7c3aed', '#db2777',
  '#dc2626', '#d97706', '#65a30d', '#0284c7', '#9333ea',
  '#c2410c', '#0f766e', '#1d4ed8', '#7e22ce', '#be185d'
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

// ── WorkflowGate ──────────────────────────────────────────────
function WorkflowGate({ jadwalTerakhir, loadingJadwal, errorTeknis, jadwalBelumAda }) {
  if (loadingJadwal) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-gray-200 dark:border-gray-700">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Memeriksa status pertemuan terakhir...</p>
      </Card>
    )
  }

  if (jadwalBelumAda || !jadwalTerakhir) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Belum ada jadwal pertemuan</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Buat jadwal pertemuan di menu Jadwal, lalu catat kehadirannya agar Spinner dapat digunakan.
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
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Gagal memuat status pertemuan</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Terjadi gangguan koneksi. Coba muat ulang halaman.</p>
        </div>
      </Card>
    )
  }

  const sudahSelesai = jadwalTerakhir.status === 'selesai'
  const iuranSudahDicatat = !!jadwalTerakhir.iuran_sudah_dicatat

  if (!sudahSelesai) {
    return (
      <Card className="p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Spinner belum dapat digunakan</p>
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
            Pertemuan terakhir belum ditandai selesai. Tandai di menu Jadwal terlebih dahulu.
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
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Spinner belum dapat digunakan</p>
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
            Iuran pertemuan terakhir belum dicatat. Catat iuran di menu Iuran terlebih dahulu.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
      <div>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Pertemuan selesai &amp; iuran sudah dicatat</p>
        <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">Spinner siap digunakan untuk memilih tuan rumah berikutnya.</p>
      </div>
    </Card>
  )
}

// ── SpinWheel ─────────────────────────────────────────────────
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
      ctx.font = `bold ${count > 12 ? 10 : count > 8 ? 11 : 13}px Poppins, sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 4
      const label = (p.nama || p.name || `${i + 1}`).substring(0, 12)
      ctx.fillText(label, r - 12, 5)
      ctx.restore()
    })

    // Lingkaran tengah
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

    // Penanda (pointer)
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
        <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada peserta tersisa</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${disabled ? 'opacity-40 grayscale' : ''}`}>
        <canvas ref={canvasRef} width={300} height={300} className="drop-shadow-xl" />
        {disabled && (
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
            Simpan hasil terlebih dahulu sebelum memutar ulang.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function AdminSpinner() {
  const qc = useQueryClient()

  const [hasPendingWinner, setHasPendingWinner] = useState(false)
  const [showWinnerPopup, setShowWinnerPopup] = useState(false)
  const [hasilModal, setHasilModal] = useState(false)
  const [hasilWinner, setHasilWinner] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [savedJadwal, setSavedJadwal] = useState(null)
  const [faseBaru, setFaseBaru] = useState(null) // notifikasi fase baru dibuat

  const [hasilForm, setHasilForm] = useState({
    nama_terpilih: '',
    host_jamaah_id: '',
    jadwal_tanggal: '',
    jadwal_waktu: '19:30',
    jadwal_lokasi: '',
    jadwal_keterangan: ''
  })

  // ── Queries ────────────────────────────────────────────────
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
    retry: (failureCount, err) => err?.response?.status !== 404 && failureCount < 2
  })

  const jadwalBelumAda = jadwalErrorObj?.response?.status === 404
  const errorTeknis = errorJadwal && !jadwalBelumAda
  const jadwalTerakhir = jadwalTerakhirData?.data || jadwalTerakhirData || null

  const workflowSiap = !loadingJadwal
    && !errorTeknis
    && jadwalTerakhir !== null
    && jadwalTerakhir.status === 'selesai'
    && !!jadwalTerakhir.iuran_sudah_dicatat

  // Ambil fase aktif + peserta dari backend (auto-create jika belum ada)
  const {
    data: faseAktifData,
    isLoading: loadingFase,
    isError: faseError,
    error: faseErrDetail,
    refetch: refetchFase
  } = useQuery({
    queryKey: ['spinner-aktif'],
    queryFn: () => spinnerApi.getFaseAktif().then(r => r.data),
    enabled: workflowSiap,
    staleTime: 0
  })

  const { data: jamaahData } = useQuery({
    queryKey: ['jamaah-all'],
    queryFn: () => jamaahApi.getAll({ limit: 200 }).then(r => r.data)
  })

  const { data: riwayatData } = useQuery({
    queryKey: ['spinner-riwayat'],
    queryFn: () => spinnerApi.getRiwayat().then(r => r.data),
    enabled: workflowSiap
  })

  // ── Derived state ──────────────────────────────────────────
  const faseAktif = faseAktifData?.data || faseAktifData || null
  const pesertaFase = faseAktif ? (faseAktifData?.peserta || faseAktifData?.data?.peserta || []) : []

  // Peserta yang masih menunggu giliran (waiting + priority)
  const participants = pesertaFase.filter(p => p.status === 'waiting' || p.status === 'priority')

  const jamaahList = jamaahData?.data || jamaahData || []
  const riwayat = riwayatData?.data || riwayatData || []

  // ── handleResult: setelah animasi berhenti ─────────────────
  function handleResult(winner) {
    setHasPendingWinner(true)
    setHasilWinner(winner)
    setSaveError(null)
    setSavedJadwal(null)

    const tanggalRef = jadwalTerakhir?.tanggal || null
    const fallbackDateObj = new Date()
    fallbackDateObj.setDate(fallbackDateObj.getDate() + 14)
    const fallbackDate = formatDateLocal(fallbackDateObj)

    setHasilForm({
      nama_terpilih: winner.nama || winner.name || '',
      host_jamaah_id: winner.jamaah_id || winner.id || '',
      jadwal_tanggal: getDefaultNextDate(tanggalRef) || fallbackDate,
      jadwal_waktu: '19:30',
      // Kosongkan lokasi — biarkan admin isi alamat rumah yang sebenarnya
      jadwal_lokasi: '',
      jadwal_keterangan: `Tuan rumah terpilih via Spinner — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
    })

    setShowWinnerPopup(true)
  }

  // ── handleSimpanHasil ──────────────────────────────────────
  async function handleSimpanHasil() {
    if (!hasilWinner || !hasilForm.jadwal_tanggal) return
    if (!hasilForm.host_jamaah_id) {
      setSaveError('Tuan rumah wajib dipilih dari daftar jamaah.')
      return
    }
    setSaving(true)
    setSaveError(null)

    let jadwalId = null
    const hostId = Number(hasilForm.host_jamaah_id)
    const faseId = faseAktif?.id || faseAktif?.fase?.id || null

    try {
      // 1. Simpan hasil spinner
      await spinnerApi.saveHasil({
        jamaah_id: hostId,
        nama_terpilih: hasilForm.nama_terpilih,
        fase_id: faseId,
        waktu: new Date().toISOString()
      })

      // 2. Tandai jamaah sebagai next host
      await spinnerApi.setNextHost(hostId, {
        is_next_host: true,
        tanggal_host: hasilForm.jadwal_tanggal
      })

      // 3. Buat jadwal pertemuan berikutnya
      const jadwalRes = await jadwalApi.create({
        judul: "Pertemuan Majelis Ta'lim",
        tanggal: hasilForm.jadwal_tanggal,
        waktu_mulai: hasilForm.jadwal_waktu,
        lokasi: hasilForm.jadwal_lokasi,
        deskripsi: hasilForm.jadwal_keterangan,
        jenis: 'bulanan',
        host_id: hostId
      })
      jadwalId = jadwalRes?.data?.id || jadwalRes?.id || null
      setSavedJadwal({ ...hasilForm, id: jadwalId })

      // Refresh semua query terkait
      // exact: false memastikan semua halaman ['admin-jadwal', page] ikut di-invalidate
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['jamaah-all'], exact: false }),
        qc.invalidateQueries({ queryKey: ['jadwal-terakhir'], exact: false }),
        qc.invalidateQueries({ queryKey: ['admin-jadwal'], exact: false }),
        qc.invalidateQueries({ queryKey: ['spinner-riwayat'], exact: false }),
        qc.invalidateQueries({ queryKey: ['spinner-aktif'], exact: false }),
      ])

    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Terjadi kesalahan'
      setSaveError(`Gagal menyimpan: ${errMsg}. Silakan coba lagi.`)
      if (jadwalId) await jadwalApi.delete(jadwalId).catch(() => {})
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

  function handleCloseModal() {
    if (savedJadwal) handleTutupHasil()
  }

  // ── Notifikasi fase baru setelah putar (fase_baru dari backend) ─
  const putarMut = useMutation({
    mutationFn: () => spinnerApi.putar({}),
    onSuccess: (res) => {
      const data = res.data?.data || res.data
      if (data?.fase_baru) {
        setFaseBaru(data)
        qc.invalidateQueries({ queryKey: ['spinner-aktif'] })
      }
    }
  })

  return (
    <div className="p-5 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Spinner Giliran</h1>
        <p className="text-sm text-gray-500">Roda putar pemilihan tuan rumah berikutnya</p>
      </div>

      {/* Banner Validasi Workflow */}
      <WorkflowGate
        jadwalTerakhir={jadwalTerakhir}
        loadingJadwal={loadingJadwal}
        errorTeknis={errorTeknis}
        jadwalBelumAda={jadwalBelumAda}
      />

      {/* Notifikasi Fase Baru Dibuat Otomatis */}
      {faseBaru && (
        <Card className="p-4 flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              🎉 Semua jamaah sudah mendapat giliran!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              Fase baru telah dibuat otomatis. Semua jamaah aktif dimasukkan kembali ke siklus berikutnya.
            </p>
          </div>
          <button onClick={() => setFaseBaru(null)} className="text-emerald-400 hover:text-emerald-600 text-lg">×</button>
        </Card>
      )}

      {/* Info Fase Aktif */}
      {workflowSiap && (
        <>
          {loadingFase && (
            <Card className="p-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Memuat fase aktif...
            </Card>
          )}

          {faseError && (
            <Card className="p-4 flex items-center gap-2 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-500">{faseErrDetail?.message || 'Gagal memuat fase'}</p>
            </Card>
          )}

          {!loadingFase && faseAktif && (
            <Card className="p-3 flex items-center gap-3 border border-gray-100 dark:border-gray-800">
              <Users className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {faseAktif?.fase?.nama || faseAktif?.nama || 'Fase Aktif'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {participants.length} menunggu giliran &middot; {(faseAktif?.sudah_giliran || faseAktif?.fase?.sudah_giliran || 0)} sudah dapat giliran
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-medium">
                Aktif
              </span>
            </Card>
          )}
        </>
      )}

      {/* Spinner Wheel */}
      {workflowSiap && !loadingFase && participants.length > 0 && (
        <Card className="p-6">
          <SpinWheel
            participants={participants}
            onResult={handleResult}
            locked={hasPendingWinner}
            disabled={!workflowSiap}
          />
        </Card>
      )}

      {/* Semua sudah dapat giliran */}
      {workflowSiap && !loadingFase && faseAktif && participants.length === 0 && (
        <Card className="p-5 text-center space-y-2 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-2xl">🎉</p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Semua jamaah sudah mendapat giliran!
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Putar spinner sekali lagi untuk memulai siklus baru secara otomatis.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              putarMut.mutate()
              refetchFase()
            }}
            loading={putarMut.isPending}
            className="mx-auto"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Mulai Siklus Baru
          </Button>
        </Card>
      )}

      {/* Daftar Peserta yang Menunggu */}
      {workflowSiap && participants.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Menunggu Giliran ({participants.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((p, i) => (
              <span
                key={p.id || i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              >
                {p.status === 'priority' && '⭐ '}
                {p.nama || p.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Sudah Dapat Giliran */}
      {workflowSiap && !loadingFase && faseAktif && pesertaFase.filter(p => p.status === 'selected').length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
            Sudah Dapat Giliran ({pesertaFase.filter(p => p.status === 'selected').length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {pesertaFase.filter(p => p.status === 'selected').sort((a,b) => a.urutan_terpilih - b.urutan_terpilih).map((p, i) => (
              <span
                key={p.id || i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 line-through"
              >
                {p.urutan_terpilih}. {p.nama}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Riwayat Hasil Spinner */}
      {riwayat.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Riwayat Tuan Rumah
          </h3>
          <div className="space-y-2">
            {riwayat.slice(0, 10).map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">#{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {r.nama_terpilih || r.jamaah_nama}
                  </span>
                  {r.fase_nama && <span className="text-xs text-gray-400">({r.fase_nama})</span>}
                </div>
                <div className="flex items-center gap-2 text-right">
                  {r.jadwal_tanggal && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.jadwal_tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Popup Pemenang */}
      <Modal isOpen={showWinnerPopup} onClose={() => {}} title="">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="text-5xl">🎉</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tuan rumah terpilih:</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {hasilWinner?.nama || hasilWinner?.name}
          </p>
          <Button className="w-full mt-3" onClick={() => { setShowWinnerPopup(false); setHasilModal(true) }}>
            Lanjutkan & Buat Jadwal
          </Button>
        </div>
      </Modal>

      {/* Modal Simpan Hasil */}
      <Modal isOpen={hasilModal} onClose={handleCloseModal} title="Simpan Hasil & Buat Jadwal">
        <div className="space-y-4">
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
                <p className="text-xs text-emerald-600 dark:text-emerald-400 pl-6">
                  📍 {savedJadwal.jadwal_lokasi || `Rumah ${savedJadwal.nama_terpilih}`}
                </p>
              </div>
              <Button className="w-full" onClick={handleTutupHasil}>Tutup</Button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ✏️ Data dapat diedit sebelum disimpan. Klik <strong>Simpan & Buat Jadwal</strong> untuk menyimpan ke database.
                </p>
              </div>

              {saveError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">{saveError}</p>
                </div>
              )}

              <div className="space-y-3">
                <Select
                  label="Tuan Rumah Terpilih*"
                  value={hasilForm.host_jamaah_id}
                  onChange={e => {
                    const id = e.target.value
                    const j = jamaahList.find(j => String(j.id) === String(id))
                    setHasilForm(f => ({
                      ...f,
                      host_jamaah_id: id,
                      nama_terpilih: j?.nama || '',
                    }))
                  }}
                >
                  <option value="">— Pilih jamaah —</option>
                  {jamaahList.map(j => (
                    <option key={j.id} value={j.id}>{j.nama}{j.alamat ? ` — ${j.alamat}` : ""}</option>
                  ))}
                </Select>
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

              <div className="flex gap-3 pt-1">
                {saveError && (
                  <Button variant="secondary" className="flex-1" onClick={() => setSaveError(null)}>
                    Coba Lagi
                  </Button>
                )}
                <Button
                  className="flex-1"
                  loading={saving}
                  disabled={!hasilForm.jadwal_tanggal || !hasilForm.host_jamaah_id || saving}
                  onClick={handleSimpanHasil}
                >
                  Simpan & Buat Jadwal
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
