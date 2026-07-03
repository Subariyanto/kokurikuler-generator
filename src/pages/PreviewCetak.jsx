import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner } from '../components/UI'
import { DIMENSI_PROFIL, PANCA_CINTA, PREDIKAT_LABEL, DIMENSI_INDIKATOR, STATUS_DOKUMEN } from '../lib/constants'
import { formatDate, generateRubrik, generateAlurKegiatan } from '../lib/utils'
import { Printer, ArrowLeft } from 'lucide-react'

export default function PreviewCetak() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const sb = getSupabase()
      const { data: d, error: err } = await sb.from('perencanaan_kokurikuler').select('*').eq('id', id).single()
      if (err) throw new Error('Data tidak ditemukan.')
      setData(d)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  function safeParse(v, fallback = []) {
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return fallback }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>
  if (!data) return <div className="text-center py-12 text-gray-500">Data tidak ditemukan.</div>

  const dimensi = safeParse(data.dimensi)
  const pancaCinta = safeParse(data.panca_cinta)
  const materiKBC = safeParse(data.materi_kbc)
  const tujuan = safeParse(data.tujuan_pembelajaran)
  const praktikPedagogis = safeParse(data.praktik_pedagogis)
  const lingkungan = safeParse(data.lingkungan_belajar)
  const teknologi = safeParse(data.teknologi_digital)
  const kemitraan = safeParse(data.kemitraan)
  const produk = safeParse(data.produk_hasil)
  const rubrik = data.rubrik ? safeParse(data.rubrik) : generateRubrik(dimensi)
  const alurKegiatan = data.alur_kegiatan ? safeParse(data.alur_kegiatan) : generateAlurKegiatan(data.tema_kegiatan, data.jenis_kokurikuler)
  const lembarObservasi = safeParse(data.lembar_observasi, [])
  const jurnal = safeParse(data.jurnal_refleksi, [])
  const pelaporan = safeParse(data.pelaporan, [])
  const evaluasi = safeParse(data.evaluasi, [])
  const catatan = safeParse(data.catatan_pengawas, [])

  return (
    <div>
      <PageHeader title="Preview & Cetak" subtitle={data.nama_kegiatan || 'Tanpa Nama'}>
        <button onClick={() => window.history.back()} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50 no-print">
          <ArrowLeft size={16} /> Kembali
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700 no-print">
          <Printer size={16} /> Cetak
        </button>
      </PageHeader>

      <div className="print-area">
        <PrintContent data={data} dimensi={dimensi} pancaCinta={pancaCinta} materiKBC={materiKBC} tujuan={tujuan} praktikPedagogis={praktikPedagogis} lingkungan={lingkungan} teknologi={teknologi} kemitraan={kemitraan} produk={produk} rubrik={rubrik} alurKegiatan={alurKegiatan} lembarObservasi={lembarObservasi} jurnal={jurnal} pelaporan={pelaporan} evaluasi={evaluasi} catatan={catatan} />
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { margin: 0; padding: 0; }
          .print-page { page-break-after: always; }
          @page { size: A4; margin: 15mm; }
        }
      `}</style>
    </div>
  )
}

function PrintContent({ data, dimensi, pancaCinta, materiKBC, tujuan, praktikPedagogis, lingkungan, teknologi, kemitraan, produk, rubrik, alurKegiatan, lembarObservasi, jurnal, pelaporan, evaluasi, catatan }) {
  return (
    <div className="bg-white max-w-[210mm] mx-auto p-6 md:p-10 text-sm text-black print:p-0">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-lg font-bold uppercase tracking-wide">PERENCANAAN KOKURIKULER MADRASAH</h1>
        <p className="text-xs mt-1 text-gray-600">Tahun Pelajaran {data.tahun_pelajaran || '...'}</p>
      </div>

      {/* Identitas Madrasah */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">A. Identitas Madrasah</h2>
        <table className="w-full text-xs">
          <tbody>
            <TableRow label="Nama Madrasah" value={data.nama_madrasah} />
            <TableRow label="Jenjang" value={data.jenjang} />
            <TableRow label="NSM/NPSN" value={[data.nsm, data.npsn].filter(Boolean).join(' / ')} />
            <TableRow label="Alamat" value={data.alamat} />
            <TableRow label="Kecamatan" value={data.kecamatan} />
            <TableRow label="Kabupaten/Kota" value={data.kabupaten_kota} />
            <TableRow label="Provinsi" value={data.provinsi} />
            <TableRow label="Kepala Madrasah" value={data.kepala_madrasah} />
            <TableRow label="NIP Kepala" value={data.nip_kepala} />
            <TableRow label="Tahun Pelajaran" value={data.tahun_pelajaran} />
            <TableRow label="Semester" value={data.semester} />
          </tbody>
        </table>
      </div>

      {/* Identitas Kegiatan */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">B. Identitas Kegiatan Kokurikuler</h2>
        <table className="w-full text-xs">
          <tbody>
            <TableRow label="Nama Kegiatan" value={data.nama_kegiatan} />
            <TableRow label="Tema Kegiatan" value={data.tema_kegiatan} />
            <TableRow label="Jenis Kokurikuler" value={data.jenis_kokurikuler} />
            <TableRow label="Jenjang / Kelas" value={`${data.jenjang || '-'} / ${data.kelas || '-'}`} />
            <TableRow label="Mata Pelajaran Pengampu" value={data.mata_pelajaran} />
            <TableRow label="Nama Guru" value={data.nama_guru} />
            <TableRow label="NIP Guru" value={data.nip_guru} />
            <TableRow label="Alokasi Waktu" value={data.alokasi_waktu} />
            <TableRow label="Status Dokumen" value={data.status || 'Draft'} />
          </tbody>
        </table>
      </div>

      {/* Analisis Madrasah */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">C. Analisis Kebutuhan Madrasah</h2>
        {data.narasi_analisis ? (
          <p className="text-xs leading-relaxed text-justify">{data.narasi_analisis}</p>
        ) : (
          <p className="text-xs text-gray-500">Belum ada analisis.</p>
        )}
      </div>

      {/* Dimensi dan Panca Cinta */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">D. Dimensi Profil dan Panca Cinta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-bold mb-2">Dimensi Profil Lulusan Madrasah</h3>
            {dimensi.length > 0 ? <ChosenList items={dimensi} /> : <p className="text-xs text-gray-500">Belum dipilih.</p>}
          </div>
          <div>
            <h3 className="text-xs font-bold mb-2">Panca Cinta Madrasah</h3>
            {pancaCinta.length > 0 ? <ChosenList items={pancaCinta} /> : <p className="text-xs text-gray-500">Belum dipilih.</p>}
          </div>
        </div>
      </div>

      {/* Materi KBC */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">E. Materi KBC (Kegiatan Berbasis Cinta)</h2>
        {materiKBC.length > 0 ? (
          <div className="space-y-2">
            {materiKBC.map((m, i) => (
              <div key={i} className="p-2 border rounded text-xs">
                <span className="font-medium">{m.panca_cinta || m.cinta}:</span> {m.materi || (typeof m === 'string' ? m : JSON.stringify(m))}
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada materi KBC.</p>}
      </div>

      {/* Tujuan Pembelajaran */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">F. Tujuan Pembelajaran</h2>
        {tujuan.length > 0 ? <ChosenList items={tujuan} ordered /> : <p className="text-xs text-gray-500">Belum ada tujuan pembelajaran.</p>}
      </div>

      {/* Praktik Pedagogis */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">G. Praktik Pedagogis & Pendekatan</h2>
        {praktikPedagogis.length > 0 ? <ChosenList items={praktikPedagogis} /> : <p className="text-xs text-gray-500">Belum dipilih.</p>}
      </div>

      {/* Lingkungan Belajar */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">H. Lingkungan Belajar</h2>
        {lingkungan.length > 0 ? <ChosenList items={lingkungan} /> : <p className="text-xs text-gray-500">Belum dipilih.</p>}
      </div>

      {/* Teknologi Digital */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">I. Teknologi Digital</h2>
        {teknologi.length > 0 ? <ChosenList items={teknologi} /> : <p className="text-xs text-gray-500">Belum dipilih.</p>}
      </div>

      {/* Kemitraan */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">J. Kemitraan</h2>
        {kemitraan.length > 0 ? <ChosenList items={kemitraan} /> : <p className="text-xs text-gray-500">Belum ada data kemitraan.</p>}
      </div>

      {/* Alur Kegiatan */}
      <div className="mb-6 print-page">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">K. Alur Kegiatan</h2>
        {alurKegiatan.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">No</th>
                  <th className="border px-2 py-1 text-left">Tahap</th>
                  <th className="border px-2 py-1 text-left">Aktivitas Guru</th>
                  <th className="border px-2 py-1 text-left">Aktivitas Murid</th>
                  <th className="border px-2 py-1 text-left">Nilai</th>
                  <th className="border px-2 py-1 text-left">Waktu</th>
                  <th className="border px-2 py-1 text-left">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {alurKegiatan.map((a, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">{a.tahap || '-'}</td>
                    <td className="border px-2 py-1">{a.aktivitasGuru || (typeof a === 'string' ? a : '-')}</td>
                    <td className="border px-2 py-1">{a.aktivitasMurid || '-'}</td>
                    <td className="border px-2 py-1">{a.nilai || '-'}</td>
                    <td className="border px-2 py-1">{a.waktu || '-'}</td>
                    <td className="border px-2 py-1">{a.bukti || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada alur kegiatan.</p>}
      </div>

      {/* Produk Hasil */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">L. Produk Hasil Kegiatan</h2>
        {produk.length > 0 ? <ChosenList items={produk} /> : <p className="text-xs text-gray-500">Belum dipilih.</p>}
      </div>

      {/* Asesmen & Rubrik */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">M. Asesmen & Rubrik</h2>
        <p className="text-xs font-medium mb-2">Teknik Asesmen: {data.teknik_asesmen || 'Observasi, Portofolio, Presentasi'}</p>
        {rubrik.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Dimensi</th>
                  <th className="border px-2 py-1 text-left">Indikator</th>
                  <th className="border px-2 py-1 text-center">SB</th>
                  <th className="border px-2 py-1 text-center">B</th>
                  <th className="border px-2 py-1 text-center">C</th>
                  <th className="border px-2 py-1 text-center">K</th>
                </tr>
              </thead>
              <tbody>
                {rubrik.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-2 py-1">{r.dimensi || '-'}</td>
                    <td className="border px-2 py-1">{r.indikator || '-'}</td>
                    <td className="border px-2 py-1 text-xs">{r.SB || '-'}</td>
                    <td className="border px-2 py-1 text-xs">{r.B || '-'}</td>
                    <td className="border px-2 py-1 text-xs">{r.C || '-'}</td>
                    <td className="border px-2 py-1 text-xs">{r.K || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada rubrik.</p>}
      </div>

      {/* Lembar Observasi */}
      <div className="mb-6 print-page">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">N. Lembar Observasi</h2>
        {lembarObservasi.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">No</th>
                  <th className="border px-2 py-1 text-left">Nama Murid</th>
                  <th className="border px-2 py-1 text-left">Dimensi</th>
                  <th className="border px-2 py-1 text-center">Predikat</th>
                  <th className="border px-2 py-1 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {lembarObservasi.map((o, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">{o.nama_murid || '-'}</td>
                    <td className="border px-2 py-1">{o.dimensi || '-'}</td>
                    <td className="border px-2 py-1 text-center font-bold">{PREDIKAT_LABEL[o.predikat] || o.predikat || '-'}</td>
                    <td className="border px-2 py-1 text-xs">{o.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada lembar observasi.</p>}

        <div className="mt-3 text-xs">
          <p><strong>Keterangan Predikat:</strong></p>
          <p>SB = Sangat Baik | B = Baik | C = Cukup | K = Kurang</p>
        </div>
      </div>

      {/* Jurnal Refleksi */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">O. Jurnal Refleksi</h2>
        {jurnal.length > 0 ? (
          <div className="space-y-2">
            {jurnal.map((j, i) => (
              <div key={i} className="p-2 border rounded text-xs">
                <p><strong>Murid:</strong> {j.nama_murid || '-'} | <strong>Kelas:</strong> {j.kelas || '-'}</p>
                <p className="mt-1 whitespace-pre-wrap">{j.refleksi || (typeof j === 'string' ? j : '-')}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada jurnal refleksi.</p>}
      </div>

      {/* Pelaporan */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">P. Pelaporan Hasil</h2>
        {pelaporan.length > 0 ? (
          <div className="space-y-2">
            {pelaporan.map((p, i) => (
              <div key={i} className="p-2 border rounded text-xs">
                <p><strong>{p.nama_murid || '-'}</strong> - {p.kelas || '-'}</p>
                <p className="mt-1 whitespace-pre-wrap">{p.deskripsi || (typeof p === 'string' ? p : '-')}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada pelaporan. Gunakan halaman Pelaporan untuk generate.</p>}
      </div>

      {/* Evaluasi */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">Q. Evaluasi & Tindak Lanjut</h2>
        {evaluasi.length > 0 ? (
          <div className="space-y-2">
            {evaluasi.map((e, i) => (
              <div key={i} className="p-2 border rounded text-xs">
                {e.waktu_pelaksanaan && <p><strong>Waktu:</strong> {e.waktu_pelaksanaan}</p>}
                {e.ketercapaian && <p className="mt-1"><strong>Ketercapaian:</strong> {e.ketercapaian}</p>}
                {e.faktor_pendukung && <p><strong>Faktor Pendukung:</strong> {e.faktor_pendukung}</p>}
                {e.hambatan && <p><strong>Hambatan:</strong> {e.hambatan}</p>}
                {e.solusi && <p><strong>Solusi:</strong> {e.solusi}</p>}
                {e.dampak_murid && <p><strong>Dampak Murid:</strong> {e.dampak_murid}</p>}
                {e.dampak_madrasah && <p><strong>Dampak Madrasah:</strong> {e.dampak_madrasah}</p>}
                {e.rencana_tindak_lanjut && <p><strong>Tindak Lanjut:</strong> {e.rencana_tindak_lanjut}</p>}
                {e.rekomendasi && <p><strong>Rekomendasi:</strong> {e.rekomendasi}</p>}
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada evaluasi.</p>}
      </div>

      {/* Catatan Pengawas */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-3">R. Catatan Pengawas</h2>
        {catatan.length > 0 ? (
          <div className="space-y-2">
            {catatan.map((c, i) => (
              <div key={i} className="p-2 border rounded text-xs">
                {c.catatan && <p className="whitespace-pre-wrap">{c.catatan}</p>}
                {c.rekomendasi && <p className="mt-1"><strong>Rekomendasi:</strong> {c.rekomendasi}</p>}
                {c.status_tindak_lanjut && <p className="text-gray-500 italic mt-1">Status: {c.status_tindak_lanjut}</p>}
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500">Belum ada catatan pengawas.</p>}
      </div>

      {/* Tanda Tangan */}
      <div className="mt-12 print-page">
        <div className="grid grid-cols-3 gap-4 text-xs text-center">
          <div>
            <p className="mb-10">Koordinator Kokurikuler,</p>
            <p className="border-t border-gray-800 pt-2 font-bold">{data.koordinator || '..........................'}</p>
            <p>NIP. {data.nip_koordinator || '..........................'}</p>
          </div>
          <div>
            <p className="mb-10">Guru Pengampu,</p>
            <p className="border-t border-gray-800 pt-2 font-bold">{data.nama_guru || '..........................'}</p>
            <p>NIP. {data.nip_guru || '..........................'}</p>
          </div>
          <div>
            <p className="mb-10">Kepala Madrasah,</p>
            <p className="border-t border-gray-800 pt-2 font-bold">{data.kepala_madrasah || '..........................'}</p>
            <p>NIP. {data.nip_kepala || '..........................'}</p>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Dokumen ini dibuat secara digital melalui Aplikasi Perencanaan Kokurikuler Madrasah Generator</p>
          <p>Tanggal cetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )
}

function TableRow({ label, value }) {
  if (!value) return null
  return (
    <tr className="border-b border-gray-200">
      <td className="py-1 pr-4 w-40 font-medium text-gray-700">{label}</td>
      <td className="py-1">: {value}</td>
    </tr>
  )
}

function ChosenList({ items, ordered = false }) {
  if (ordered) {
    return (
      <ol className="list-decimal ml-4 space-y-1 text-xs">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ol>
    )
  }
  return (
    <ul className="list-disc ml-4 space-y-1 text-xs">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}