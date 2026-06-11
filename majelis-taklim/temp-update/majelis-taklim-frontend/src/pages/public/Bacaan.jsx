import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../../store/theme'
import {
  MENU_BACAAN, WARNA,
  TAWASSUL, SURAT_YASIN, TAHLIL, ISTIGHATSAH, DOA_ARWAH, DOA_PENUTUP,
} from '../../data/index'
import { cn } from '../../utils/helpers'
import {
  ChevronLeft, Minus, Plus, Moon, Sun, BookOpen,
  Type, Globe, EyeOff, Eye, Users, X, Check,
} from 'lucide-react'

// ── simpan ukuran font ke localStorage ──────────────────────
const LS_SIZE = 'bacaan_arab_size'
const DEFAULT_SIZE = 28

// ── Helper: ambil data sesuai ID + nama almarhum ────────────
function getData(id, almarhum) {
  switch (id) {
    case 'tawassul':    return TAWASSUL(almarhum)
    case 'yasin':       return SURAT_YASIN
    case 'tahlil':      return TAHLIL(almarhum)
    case 'istighatsah': return ISTIGHATSAH
    case 'doa-arwah':   return DOA_ARWAH(almarhum)
    case 'doa-penutup': return DOA_PENUTUP
    default:            return []
  }
}

// ── Satu baris ayat / dzikir ────────────────────────────────
function AyatItem({ item, arabSize, showLatin, showTerjemah, nightMode, isYasin }) {
  const textColor = nightMode
  ? 'text-amber-100'
  : 'text-black'
  const subColor  = nightMode ? 'text-gray-400'  : 'text-gray-500 dark:text-gray-400'
  const labelColor = nightMode ? 'text-gray-500' : 'text-gray-400 dark:text-gray-600'
  const divider    = nightMode ? 'border-gray-800' : 'border-gray-100 dark:border-gray-800'
console.log({
  nightMode,
  textColor,
})
  // Yasin: tampilan mushaf
  if (isYasin) {
    const isBasmalah = item.n === 0

    return (
      <div className={cn('py-1.5 border-b last:border-0', divider)}>
        {isBasmalah ? (
          <p
            className={cn('text-center py-2', textColor)}
            style={{
              fontFamily: 'Amiri, serif',
              fontSize: arabSize + 2,
              direction: 'rtl',
              lineHeight: 2,
            }}
          >
            {item.arab}
          </p>
        ) : (
          <div className="flex items-start gap-0" dir="rtl">
            <span
              className={cn(
                'shrink-0 w-7 h-7 mt-1 rounded-full border text-xs flex items-center justify-center font-bold ml-2',
                nightMode
                  ? 'border-amber-800 text-amber-600 bg-amber-950/40'
                  : 'border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              )}
            >
              {item.n}
            </span>

            <p
              className={cn('flex-1 leading-loose', textColor)}
              style={{
                fontFamily: 'Amiri, serif',
                fontSize: arabSize,
                direction: 'rtl',
                lineHeight: 2.2,
              }}
            >
              {item.arab}
            </p>
          </div>
        )}

        {showLatin && item.latin && (
          <p className={cn('text-sm leading-relaxed mt-1 italic px-1', subColor)}>
            {item.latin}
          </p>
        )}

        {showTerjemah && item.terjemahan && (
          <p className={cn('text-sm leading-relaxed mt-0.5 px-1', subColor)}>
            {item.terjemahan}
          </p>
        )}
      </div>
    )
  }

  const jenis = item.jenis || ''

  if (jenis === 'section') {
    return (
      <div className="py-3 text-center">
        <p className={cn('text-xs font-semibold uppercase tracking-widest', labelColor)}>
          {item.label}
        </p>

        {item.catatan && (
          <p className={cn('text-xs italic mt-0.5', subColor)}>
            {item.catatan}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('py-3 border-b last:border-0', divider)}>
      <div className="flex items-center justify-between mb-2">
        <p className={cn('text-xs font-semibold', labelColor)}>
          {item.label}
        </p>

        {item.ulang && item.ulang > 1 && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-bold',
              nightMode
                ? 'bg-amber-900/40 text-amber-400'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            )}
          >
            ×{item.ulang}
          </span>
        )}
      </div>

      {item.arab && (
  <p
    className={cn(
  'leading-loose text-right',
  textColor,
  item.besar && 'font-bold'
)}
          
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: item.besar ? arabSize + 4 : arabSize,
            direction: 'rtl',
            lineHeight: 2.2,
          }}
        >
          {item.arab}
        </p>
      )}

      {item.catatan && (
        <p className={cn('text-xs italic mt-1', subColor)}>
          {item.catatan}
        </p>
      )}

      {showLatin && item.latin && (
        <p className={cn('text-sm leading-relaxed mt-2 italic', subColor)}>
          {item.latin}
        </p>
      )}

      {showTerjemah && item.terjemahan && (
        <p className={cn('text-sm leading-relaxed mt-1.5', subColor)}>
          {item.terjemahan}
        </p>
      )}
    </div>
  )
}
// ── Sanitasi nama almarhum (per nama, setelah split) ─────────
function sanitizeName(raw) {
  let s = String(raw)
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '') // hapus script + isinya
  s = s.replace(/<[^>]*>/g, '')           // hapus tag HTML lainnya
  s = s.replace(/https?:\/\/\S+/gi, '')   // hapus URL http/https
  s = s.replace(/[\x00-\x1F\x7F]/g, ' ') // eslint-disable-line no-control-regex
  s = s.replace(/\s+/g, ' ').trim()       // normalisasi spasi ganda
  return s
}

// ── Modal Input Nama Almarhum ────────────────────────────────
function ModalAlmarhum({ namaList, onSave, onClose }) {
  const [input, setInput] = useState(namaList.join('\n'))

  function handleSave() {
    const list = input.split('\n').map(s => sanitizeName(s)).filter(Boolean)
    onSave(list)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Nama Almarhum / Almarhumah</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Tulis satu nama per baris. Nama akan muncul otomatis di Tawassul dan Doa Arwah.
        </p>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={5}
          placeholder={'contoh:\nAhmad bin Abdullah\nFatimah binti Umar'}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400">
            Batal
          </button>
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reader View ──────────────────────────────────────────────
function ReaderView({ menu, almarhum, onBack }) {
  const { dark } = useTheme()
  const [arabSize,   setArabSize]   = useState(() => Number(localStorage.getItem(LS_SIZE)) || DEFAULT_SIZE)
  const [nightMode, setNightMode] = useState(dark)
  const [showLatin,  setShowLatin]  = useState(false)
  const [showTerjemah, setShowTerjemah] = useState(false)
  const [showNamaModal, setShowNamaModal] = useState(false)
  const [namaList, setNamaList] = useState(almarhum)
  const containerRef = useRef(null)
  const pinchRef = useRef({ dist: null })

  const warna = WARNA[menu.warna] || WARNA.emerald
  const isYasin = menu.id === 'yasin'
  const needsNama = ['tawassul', 'tahlil', 'doa-arwah'].includes(menu.id)
  const ayatList = getData(menu.id, namaList)
console.log('MENU:', menu.id)
console.log('JUMLAH AYAT:', ayatList.length)
console.log('DATA:', ayatList.slice(0, 5))
  // Simpan ukuran ke localStorage
  useEffect(() => {
    localStorage.setItem(LS_SIZE, String(arabSize))
  }, [arabSize])
useEffect(() => {
  setNightMode(dark)
}, [dark])
  // Pinch-to-zoom support
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function dist(t) {
      const [a, b] = t
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    }
    function onTouchMove(e) {
      if (e.touches.length !== 2) return
      const d = dist(e.touches)
      if (pinchRef.current.dist !== null) {
        const delta = d - pinchRef.current.dist
        if (Math.abs(delta) > 2) {
          setArabSize(s => Math.min(52, Math.max(16, s + (delta > 0 ? 1 : -1))))
        }
      }
      pinchRef.current.dist = d
    }
    function onTouchEnd(e) {
      if (e.touches.length < 2) pinchRef.current.dist = null
    }
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

const bg = nightMode
  ? 'bg-[#0d0d0d]'
  : dark
    ? 'bg-gray-950'
    : 'bg-white'

const headerBg = nightMode
  ? 'bg-[#111] border-gray-900'
  : dark
    ? 'bg-gray-900 border-gray-800'
    : 'bg-white border-gray-100'

  return (
    <div className={cn('min-h-screen flex flex-col transition-colors', bg)} ref={containerRef}>
      {/* ── Header ── */}
      <div className={cn('sticky top-0 z-30 border-b', headerBg)}>
        {/* Baris 1: back + judul + night mode */}
        <div className="max-w-2xl mx-auto px-3 h-12 flex items-center gap-2">
          <button onClick={onBack}
            className={cn('w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0',
              nightMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn('font-bold text-sm truncate', nightMode ? 'text-amber-100' : 'text-gray-900 dark:text-white')}>
              {menu.emoji} {menu.label}
            </p>
          </div>
          {/* Night mode */}
          <button onClick={() => setNightMode(n => !n)}
            className={cn('w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0',
              nightMode ? 'bg-amber-500 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
            {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Nama almarhum */}
          {needsNama && (
            <button onClick={() => setShowNamaModal(true)}
              className={cn('w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0 relative',
                namaList.length > 0
                  ? nightMode ? 'bg-green-800 text-green-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : nightMode ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
              <Users className="w-4 h-4" />
              {namaList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {namaList.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Baris 2: kontrol font + toggle latin/terjemah */}
        <div className="max-w-2xl mx-auto px-3 pb-2 flex items-center gap-1.5">
          {/* Ukuran font */}
          <button onClick={() => setArabSize(s => Math.max(16, s - 2))}
            className={cn('h-8 px-3 rounded-lg text-sm font-bold transition-all flex items-center gap-1',
              nightMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700')}>
            <Minus className="w-3 h-3" /><span className="text-xs">A</span>
          </button>
          <span className={cn('text-xs w-7 text-center font-mono', nightMode ? 'text-gray-500' : 'text-gray-400')}>
            {arabSize}
          </span>
          <button onClick={() => setArabSize(s => Math.min(52, s + 2))}
            className={cn('h-8 px-3 rounded-lg text-sm font-bold transition-all flex items-center gap-1',
              nightMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700')}>
            <span className="text-sm">A</span><Plus className="w-3 h-3" />
          </button>

          <div className="flex-1" />

          {/* Toggle Latin */}
          <button onClick={() => setShowLatin(s => !s)}
            className={cn('h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
              showLatin
                ? nightMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : nightMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400')}>
            <Type className="w-3 h-3" /> Latin
          </button>

          {/* Toggle Terjemah */}
          <button onClick={() => setShowTerjemah(s => !s)}
            className={cn('h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
              showTerjemah
                ? nightMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : nightMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400')}>
            <Globe className="w-3 h-3" /> Arti
          </button>
        </div>
      </div>

      {/* ── Konten ── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-2 pb-10">
        {isYasin && (
          <p className={cn('text-center text-xs py-2 mb-1', nightMode ? 'text-gray-600' : 'text-gray-400')}>
            Surat Yasin — 83 Ayat
          </p>
        )}
        {ayatList.map((item, idx) => (
          <AyatItem
            key={item.id || idx}
            item={item}
            arabSize={arabSize}
            showLatin={showLatin}
            showTerjemah={showTerjemah}
            nightMode={nightMode}
            dark={dark}
            isYasin={isYasin}
          />
        ))}
        <div className="py-6 text-center">
          <p className={cn('text-xs', nightMode ? 'text-gray-700' : 'text-gray-300 dark:text-gray-700')}>
            — Akhir {menu.label} —
          </p>
        </div>
      </div>

      {/* Modal nama */}
      {showNamaModal && (
        <ModalAlmarhum
          namaList={namaList}
          onSave={setNamaList}
          onClose={() => setShowNamaModal(false)}
        />
      )}
    </div>
  )
}

// ── Halaman Daftar Bacaan ────────────────────────────────────
export default function BacaanPage() {
  const [selected, setSelected] = useState(null)
  // Nama almarhum tersimpan di state global halaman
  const [almarhum, setAlmarhum] = useState(() => {
    try { return JSON.parse(localStorage.getItem('almarhum_list') || '[]') } catch { return [] }
  })

  // Simpan ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('almarhum_list', JSON.stringify(almarhum))
  }, [almarhum])

  if (selected) {
    return (
      <ReaderView
        menu={selected}
        almarhum={almarhum}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 dark:from-emerald-900 dark:to-gray-900 rounded-2xl p-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%"><defs><pattern id="p" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M16 2 L30 30 L2 30 Z" fill="none" stroke="white" strokeWidth="0.6"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>
        </div>
        <div className="relative">
          <p className="text-right text-emerald-100 leading-loose mb-1" style={{ fontFamily: 'Amiri, serif', fontSize: 17 }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          <p className="font-black text-lg">Bacaan Majelis Ta&apos;lim</p>
          <p className="text-emerald-200 text-xs mt-0.5">Perum The Cemandi · Amaliyah NU</p>
        </div>
      </div>

      {/* Input nama almarhum — akses cepat dari halaman list */}
      <button
        onClick={() => {
          // buka modal inline
          const nama = window.prompt(
            'Masukkan nama almarhum/almarhumah\n(pisahkan dengan Enter atau koma)',
            almarhum.join('\n')
          )
          if (nama !== null) {
            const list = nama.split(/[\n,]/).map(s => sanitizeName(s)).filter(Boolean)
            setAlmarhum(list)
          }
        }}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left',
          almarhum.length > 0
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
        )}>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          almarhum.length > 0 ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
        )}>
          <Users className={cn('w-5 h-5', almarhum.length > 0 ? 'text-white' : 'text-gray-500')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Nama Almarhum / Almarhumah
          </p>
          {almarhum.length > 0 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
              {almarhum.slice(0, 3).join(', ')}{almarhum.length > 3 ? ` +${almarhum.length - 3} lainnya` : ''}
            </p>
          ) : (
            <p className="text-xs text-gray-400">Ketuk untuk mengisi nama (opsional)</p>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">Ubah</span>
      </button>

      {/* Daftar menu bacaan */}
      <div className="space-y-2">
        {MENU_BACAAN.map((menu) => {
          const w = WARNA[menu.warna] || WARNA.emerald
          return (
            <button
              key={menu.id}
              onClick={() => setSelected(menu)}
              className={cn(
                'w-full text-left rounded-2xl border px-4 py-3.5 transition-all active:scale-[0.98] flex items-center gap-3',
                w.bg, w.border
              )}>
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0', w.icon)}>
                {menu.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{menu.label}</p>
                <p className={cn('text-xs mt-0.5 truncate', w.text)}>{menu.desc}</p>
              </div>
              <ChevronLeft className={cn('w-4 h-4 rotate-180 shrink-0', w.text)} />
            </button>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 pb-2">
        Referensi: quran.nu.or.id · Amaliyah Ahlussunnah wal Jamaah
      </p>
    </div>
  )
}
