#!/usr/bin/env node
// ============================================================
// generate-icons.js — Buat icon PWA sederhana dengan Canvas
// Jalankan: node generate-icons.js
// Requires: npm install canvas
// ============================================================

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 192, 512];
const outDir = path.join(__dirname, '../pages/public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // Background hijau tua
  ctx.fillStyle = '#1a472a';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Lingkaran emas
  ctx.fillStyle = '#c9a84c';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Bintang + Bulan sederhana (teks emoji)
  ctx.fillStyle = '#1a472a';
  ctx.font      = `bold ${size * 0.45}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('☪', size / 2, size / 2 + size * 0.02);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buffer);
  console.log(`✅ icon-${size}.png`);
});

console.log('Semua icon berhasil dibuat!');
