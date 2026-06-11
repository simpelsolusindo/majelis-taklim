import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateStr))
}

export function formatTime(timeStr) {
  if (!timeStr) return '-'
  return timeStr.slice(0, 5)
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateStr))
}

export function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function getPriorityLabel(p) {
  const map = { tinggi: 'Tinggi', sedang: 'Sedang', rendah: 'Rendah' }
  return map[p] || p
}

export function getPriorityColor(p) {
  const map = {
    tinggi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    sedang: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    rendah: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
  }
  return map[p] || 'bg-gray-100 text-gray-600'
}
