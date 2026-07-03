import { DIMENSI_PROFIL, PANCA_CINTA, DIMENSI_NARASI, PANCA_CINTA_NARASI, MATERI_KBC, DIMENSI_INDIKATOR, PREDIKAT_LABEL } from './constants'

export function canAccess(userRole, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(userRole)
}

export function generateKodeAktivasi() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `PKMG-${part()}-${part()}`
}

export function hashPassword(password) {
  let hash = 0
  const salt = 'kokurikuler-madrasah-generator-2025'
  const str = password + salt
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(16, '0') + ':' + str.length.toString(36)
}

export function verifyPassword(password, hash) {
  if (!hash || !hash.includes(':')) {
    return hashPassword(password) === hash
  }
  const [h, len] = hash.split(':')
  const expectedLen = (password + 'kokurikuler-madrasah-generator-2025').length.toString(36)
  return h === hashPassword(password).split(':')[0] && len === expectedLen
}

export function generateDimensiNarasi(selectedDimensions) {
  return selectedDimensions.map(d => {
    return `Dimensi ${d.toLowerCase()} dipilih ${DIMENSI_NARASI[d] || ''}.`
  }).join('\n\n')
}

export function generatePancaCintaNarasi(selectedPancaCinta) {
  return selectedPancaCinta.map(p => {
    return `Topik ${p} dipilih karena kegiatan ini ${PANCA_CINTA_NARASI[p] || ''}.`
  }).join('\n\n')
}

export function generateTujuanPembelajaran(tema, dimensi, pancaCinta, mapel) {
  const tujuan = []
  if (dimensi.includes('Penalaran Kritis')) {
    tujuan.push(`Murid mampu mengidentifikasi dan menganalisis permasalahan terkait tema "${tema}" dalam kehidupan sehari-hari.`)
  }
  if (dimensi.includes('Kolaborasi')) {
    tujuan.push('Murid mampu bekerja sama dalam kelompok untuk merancang dan melaksanakan kegiatan secara bersama-sama.')
  }
  if (dimensi.includes('Komunikasi')) {
    tujuan.push('Murid mampu menyampaikan hasil kegiatan secara santun, jelas, dan bertanggung jawab.')
  }
  if (dimensi.includes('Kreativitas')) {
    tujuan.push('Murid mampu menghasilkan karya atau gagasan kreatif sebagai solusi dari permasalahan yang ditemukan.')
  }
  if (pancaCinta.some(p => p.includes('Allah') || p.includes('Cinta Allah'))) {
    tujuan.push('Murid mampu merefleksikan pengalaman belajar sebagai bentuk rasa syukur kepada Allah Swt.')
  }
  if (dimensi.includes('Kemandirian')) {
    tujuan.push('Murid mampu menyelesaikan tugas secara mandiri dengan penuh tanggung jawab.')
  }
  if (mapel && tujuan.length < 5) {
    tujuan.push(`Murid mampu mengaitkan pembelajaran ${mapel} dengan praktik nyata dalam kehidupan sehari-hari.`)
  }
  while (tujuan.length < 3) {
    tujuan.push(`Murid mampu menunjukkan perkembangan karakter sesuai dengan Profil Lulusan Madrasah.`)
  }
  return tujuan.slice(0, 5)
}

export function generateRubrik(dimensiDipilih) {
  return dimensiDipilih.filter(d => DIMENSI_INDIKATOR[d]).map(d => ({
    dimensi: d,
    indikator: DIMENSI_INDIKATOR[d],
    SB: `Sangat Baik: ${DIMENSI_INDIKATOR[d]} secara konsisten dan mandiri`,
    B: `Baik: ${DIMENSI_INDIKATOR[d]} dengan baik`,
    C: `Cukup: ${DIMENSI_INDIKATOR[d]} dengan bimbingan`,
    K: `Kurang: Belum ${DIMENSI_INDIKATOR[d].toLowerCase()}`,
  }))
}

export function generateAlurKegiatan(tema, jenisKokurikuler) {
  const tahapan = [
    { tahap: 'Pembukaan', aktivitasGuru: 'Membuka kegiatan dengan doa dan salam, menyampaikan tujuan kegiatan', aktivitasMurid: 'Berdoa, menyimak penjelasan guru', nilai: 'Keimanan dan Ketakwaan', waktu: '10 menit', bukti: 'Catatan kehadiran' },
    { tahap: 'Apersepsi dan Penguatan Nilai', aktivitasGuru: `Mengaitkan tema ${tema} dengan pengalaman murid, memberikan penguatan nilai`, aktivitasMurid: 'Menceritakan pengalaman pribadi terkait tema', nilai: 'Komunikasi, Keimanan', waktu: '15 menit', bukti: 'Catatan tanya jawab' },
    { tahap: 'Eksplorasi Tema/Masalah', aktivitasGuru: 'Memandu murid mengeksplorasi tema melalui pertanyaan pemantik', aktivitasMurid: 'Mengamati, bertanya, dan mengidentifikasi masalah', nilai: 'Penalaran Kritis', waktu: '20 menit', bukti: 'Lembar kerja eksplorasi' },
    { tahap: 'Pengumpulan Informasi', aktivitasGuru: 'Memfasilitasi murid mencari informasi dari berbagai sumber', aktivitasMurid: 'Mencari dan mengumpulkan informasi terkait tema', nilai: 'Penalaran Kritis, Cinta Ilmu', waktu: '25 menit', bukti: 'Catatan informasi' },
    { tahap: 'Perencanaan Aksi/Proyek', aktivitasGuru: 'Membimbing murid menyusun rencana aksi atau proyek', aktivitasMurid: 'Berdiskusi dan menyusun rencana kegiatan', nilai: 'Kolaborasi, Kreativitas', waktu: '20 menit', bukti: 'Rencana aksi/proyek' },
    { tahap: 'Pelaksanaan Kegiatan Inti', aktivitasGuru: `Mendampingi murid melaksanakan kegiatan terkait tema ${tema}`, aktivitasMurid: 'Melaksanakan kegiatan sesuai rencana', nilai: 'Kolaborasi, Kemandirian', waktu: '60 menit', bukti: 'Dokumentasi foto/video' },
    { tahap: 'Presentasi/Unjuk Karya', aktivitasGuru: 'Memfasilitasi murid menyajikan hasil kegiatan', aktivitasMurid: 'Menyajikan dan menjelaskan hasil kegiatan', nilai: 'Komunikasi, Kreativitas', waktu: '20 menit', bukti: 'Hasil karya/presentasi' },
    { tahap: 'Refleksi', aktivitasGuru: 'Memandu murid merefleksikan pengalaman belajar', aktivitasMurid: 'Menuliskan atau menyampaikan refleksi', nilai: 'Keimanan, Kemandirian', waktu: '15 menit', bukti: 'Jurnal refleksi' },
    { tahap: 'Tindak Lanjut', aktivitasGuru: 'Memberikan arahan tindak lanjut dan menutup kegiatan dengan doa', aktivitasMurid: 'Mencatat rencana tindak lanjut, berdoa', nilai: 'Kemandirian, Keimanan', waktu: '10 menit', bukti: 'Catatan tindak lanjut' },
  ]
  return tahapan
}

export function generateNarasiAnalisis(data) {
  const { dimensi, pancaCinta, alasan } = data
  let narasi = 'Berdasarkan hasil analisis madrasah, kegiatan kokurikuler ini dirancang '
  if (dimensi?.length > 0) {
    narasi += `untuk memperkuat dimensi ${dimensi.slice(0, 3).join(', ')}`
    if (dimensi.length > 3) narasi += `, dan dimensi lainnya`
    narasi += '. '
  }
  if (pancaCinta?.length > 0) {
    narasi += `Kegiatan ini juga diarahkan untuk menumbuhkan ${pancaCinta.slice(0, 2).join(' dan ')}. `
  }
  if (alasan) {
    narasi += `Kegiatan dipilih karena ${alasan}.`
  }
  return narasi
}

export function generateDeskripsiPelaporan(murid, dimensi, pancaCinta, namaKegiatan) {
  const dList = dimensi?.length > 0 ? dimensi.slice(0, 2).join(', ') : 'karakter positif'
  const pList = pancaCinta?.length > 0 ? pancaCinta.slice(0, 1).join(', ') : 'nilai Panca Cinta'
  return `Ananda ${murid || '...'} menunjukkan perkembangan baik dalam kegiatan kokurikuler bertema "${namaKegiatan || '...'}". Ananda mampu menunjukkan ${dList.toLowerCase()} selama mengikuti kegiatan. Nilai ${pList} mulai tampak melalui sikap dan perilaku selama proses pembelajaran. Hal yang perlu dikembangkan adalah kepercayaan diri dan inisiatif dalam menyampaikan gagasan. Disarankan untuk melanjutkan pembiasaan positif di rumah dan madrasah.`
}

export function generateNarasiEvaluasi(data) {
  const { ketercapaian, dampakMurid, tindakLanjut } = data
  let narasi = ''
  if (ketercapaian) narasi += `Ketercapaian tujuan: ${ketercapaian}. `
  if (dampakMurid) narasi += `Dampak terhadap murid: ${dampakMurid}. `
  if (tindakLanjut) narasi += `Rencana tindak lanjut: ${tindakLanjut}.`
  return narasi || 'Evaluasi kegiatan menunjukkan bahwa kegiatan kokurikuler berjalan sesuai rencana dan memberikan dampak positif bagi perkembangan karakter murid.'
}

export function downloadCSV(headers, rows, filename) {
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}