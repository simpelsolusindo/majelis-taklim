export { SURAT_YASIN } from './yasin'
export { TAWASSUL, TAHLIL } from './tahlil'
export { ISTIGHATSAH, DOA_ARWAH, DOA_PENUTUP } from './istighatsah'

// Menu utama bacaan
export const MENU_BACAAN = [
  { id: 'tawassul',    label: 'Tawassul',     emoji: '🤲', warna: 'emerald', desc: 'Tawassul kepada Nabi, Sahabat, dan para Ulama' },
  { id: 'yasin',      label: 'Surat Yasin',  emoji: '📖', warna: 'blue',    desc: "83 ayat lengkap sesuai mushaf Al-Qur'an" },
  { id: 'tahlil',     label: 'Tahlil',       emoji: '📿', warna: 'purple',  desc: 'Urutan tahlil NU lengkap beserta doa' },
  { id: 'istighatsah',label: 'Istighatsah',  emoji: '🕌', warna: 'amber',   desc: 'Susunan Istighatsah NU lengkap' },
  { id: 'doa-arwah',  label: 'Doa Arwah',    emoji: '🌿', warna: 'rose',    desc: 'Doa untuk almarhum/almarhumah' },
  { id: 'doa-penutup',label: 'Doa Penutup',  emoji: '🙏', warna: 'teal',    desc: 'Kafaratul majelis dan doa penutup' },
]

export const WARNA = {
  emerald: { bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-200 dark:border-emerald-800', icon:'bg-emerald-600', text:'text-emerald-700 dark:text-emerald-300', ring:'ring-emerald-500', header:'from-emerald-700 to-emerald-800 dark:from-emerald-900 dark:to-emerald-950' },
  blue:    { bg:'bg-blue-50 dark:bg-blue-900/20',       border:'border-blue-200 dark:border-blue-800',       icon:'bg-blue-600',    text:'text-blue-700 dark:text-blue-300',       ring:'ring-blue-500',    header:'from-blue-700 to-blue-800 dark:from-blue-900 dark:to-blue-950' },
  purple:  { bg:'bg-purple-50 dark:bg-purple-900/20',   border:'border-purple-200 dark:border-purple-800',   icon:'bg-purple-600',  text:'text-purple-700 dark:text-purple-300',   ring:'ring-purple-500',  header:'from-purple-700 to-purple-800 dark:from-purple-900 dark:to-purple-950' },
  amber:   { bg:'bg-amber-50 dark:bg-amber-900/20',     border:'border-amber-200 dark:border-amber-800',     icon:'bg-amber-600',   text:'text-amber-700 dark:text-amber-300',     ring:'ring-amber-500',   header:'from-amber-700 to-amber-800 dark:from-amber-900 dark:to-amber-950' },
  rose:    { bg:'bg-rose-50 dark:bg-rose-900/20',       border:'border-rose-200 dark:border-rose-800',       icon:'bg-rose-600',    text:'text-rose-700 dark:text-rose-300',       ring:'ring-rose-500',    header:'from-rose-700 to-rose-800 dark:from-rose-900 dark:to-rose-950' },
  teal:    { bg:'bg-teal-50 dark:bg-teal-900/20',       border:'border-teal-200 dark:border-teal-800',       icon:'bg-teal-600',    text:'text-teal-700 dark:text-teal-300',       ring:'ring-teal-500',    header:'from-teal-700 to-teal-800 dark:from-teal-900 dark:to-teal-950' },
}
