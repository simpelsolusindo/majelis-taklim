import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { spinnerApi } from '../../api/services'
import { Card, Spinner, EmptyState } from '../../components/ui'
import { Disc, Trophy, ChevronDown, Users } from 'lucide-react'

const WHEEL_COLORS = [
  '#059669','#0d9488','#0891b2','#7c3aed',
  '#db2777','#dc2626','#d97706','#65a30d',
  '#0284c7','#9333ea','#ea580c','#0f766e',
]

function SpinWheel({ participants, spinning, finalAngle, onAnimEnd }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const angleRef  = useRef(0)

  const count = participants.length

  function draw(angle) {
    const canvas = canvasRef.current
    if (!canvas || count === 0) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const R = Math.min(cx, cy) - 8
    const arc = (2 * Math.PI) / count

    ctx.clearRect(0, 0, W, H)

    // Shadow
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur  = 18
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill()
    ctx.restore()

    participants.forEach((p, i) => {
      const start = angle + i * arc, end = start + arc
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, R, start, end)
      ctx.closePath()
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4
      const fs = count > 10 ? 10 : count > 6 ? 12 : 13
      ctx.font = `600 ${fs}px Poppins, sans-serif`
      ctx.fillText((p.nama || p.name || `${i+1}`).substring(0, 14), R - 14, 5)
      ctx.restore()
    })

    // Centre circle
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.strokeStyle = '#059669'; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = '#059669'; ctx.font = '14px serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('☪', cx, cy)

    // Pointer ▲
    const px = cx
    ctx.beginPath()
    ctx.moveTo(px - 10, 4)
    ctx.lineTo(px + 10, 4)
    ctx.lineTo(px, 26)
    ctx.closePath()
    ctx.fillStyle = '#f59e0b'
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
    ctx.fill(); ctx.stroke()
  }

  useEffect(() => {
    draw(angleRef.current)
  }, [participants])

  useEffect(() => {
    if (!spinning) return
    const totalRot = (Math.random() * 5 + 8) * 2 * Math.PI
    const duration = 4200
    const start    = performance.now()
    const startA   = angleRef.current

    function step(now) {
      const t  = Math.min((now - start) / duration, 1)
      const e  = 1 - Math.pow(1 - t, 3)
      const a  = startA + totalRot * e
      angleRef.current = a
      draw(a)
      if (t < 1) { animRef.current = requestAnimationFrame(step) }
      else {
        const arc  = (2 * Math.PI) / count
        const norm = ((-a) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
        const idx  = Math.floor(norm / arc) % count
        onAnimEnd(participants[idx], a)
      }
    }
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [spinning])

  if (count === 0) return (
    <div className="flex flex-col items-center justify-center h-56 text-center gap-3">
      <Disc className="w-12 h-12 text-gray-200 dark:text-gray-700" />
      <p className="text-sm text-gray-400">Belum ada peserta pada fase ini</p>
    </div>
  )

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} width={300} height={300} className="max-w-full drop-shadow-2xl" />
    </div>
  )
}

export default function GiliranPage() {
  const [selectedFaseId, setSelectedFaseId] = useState('')
  const [isSpinning, setIsSpinning]         = useState(false)
  const [winner, setWinner]                 = useState(null)
  const [riwayat, setRiwayat]               = useState([])

  const { data: fasesData, isLoading: fasesLoading } = useQuery({
    queryKey: ['spinner-fases'],
    queryFn:  () => spinnerApi.getFases().then(r => r.data)
  })

  const { data: faseDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['spinner-fase', selectedFaseId],
    queryFn:  () => spinnerApi.getFaseById(selectedFaseId).then(r => r.data),
    enabled:  !!selectedFaseId
  })

  const fases = fasesData?.data || fasesData || []
  const activeFase = fases.find(f => String(f.id) === String(selectedFaseId))
  const participants = faseDetail?.peserta || faseDetail?.data?.peserta || []

  function handleAnimEnd(pemenang) {
    setIsSpinning(false)
    setWinner(pemenang)
    setRiwayat(r => [
      { id: Date.now(), nama: pemenang.nama || pemenang.name, waktu: new Date().toLocaleTimeString('id-ID') },
      ...r.slice(0, 9)
    ])
  }

  function putar() {
    if (isSpinning || participants.length === 0) return
    setWinner(null)
    setIsSpinning(true)
  }

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Giliran Tuan Rumah</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Putar roda untuk menentukan giliran tuan rumah</p>
      </div>

      {/* Pilih fase */}
      {fasesLoading ? (
        <div className="flex justify-center py-4"><Spinner size="sm" /></div>
      ) : fases.length === 0 ? (
        <EmptyState icon="🎡" title="Belum ada fase giliran"
          description="Admin perlu membuat fase terlebih dahulu" />
      ) : (
        <>
          <div className="relative">
            <select value={selectedFaseId} onChange={e => { setSelectedFaseId(e.target.value); setWinner(null) }}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
              <option value="">Pilih fase giliran...</option>
              {fases.map(f => (
                <option key={f.id} value={f.id}>{f.nama}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Roda spinner */}
          <Card className="p-5">
            {detailLoading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
              <SpinWheel
                participants={participants}
                spinning={isSpinning}
                onAnimEnd={handleAnimEnd}
              />
            )}

            {/* Hasil */}
            {winner && (
              <div className="mt-4 text-center bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl px-4 py-3">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">🏆 Giliran Tuan Rumah</p>
                <p className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1">
                  {winner.nama || winner.name}
                </p>
              </div>
            )}

            {/* Tombol putar */}
            {selectedFaseId && participants.length > 0 && (
              <button onClick={putar} disabled={isSpinning}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-base">
                {isSpinning ? '⏳ Memutar...' : '🎯 Putar Roda!'}
              </button>
            )}
          </Card>

          {/* Peserta */}
          {participants.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Peserta ({participants.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {participants.map((p, i) => (
                  <span key={p.id || i}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }}>
                    {p.nama || p.name}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Riwayat */}
          {riwayat.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Riwayat Putaran</h3>
              </div>
              <div className="space-y-2">
                {riwayat.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.nama}</span>
                    </div>
                    <span className="text-xs text-gray-400">{r.waktu}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
