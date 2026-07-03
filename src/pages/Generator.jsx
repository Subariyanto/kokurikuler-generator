import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner } from '../components/UI'
import {
  JENJANG, SEMESTER, FASE, JENIS_KOKURIKULER, DIMENSI_PROFIL, PANCA_CINTA, MATERI_KBC,
  PRAKTIK_PEDAGOGIS, LINGKUNGAN_BELAJAR, TEKNOLOGI_DIGITAL, PRODUK_HASIL,
  TEMA_KOKURIKULER, CONTOH_CEPAT, DIMENSI_INDIKATOR, STATUS_DOKUMEN
} from '../lib/constants'
import { generateTujuanPembelajaran, generateRubrik, generateAlurKegiatan, generateDimensiNarasi, generatePancaCintaNarasi, formatDate } from '../lib/utils'
import { Save, FileText, Eye, Copy, ArrowLeft } from 'lucide-react'

export default function Generator() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dataMadrasah, setDataMadrasah] = useState([])
  const [dataGuru, setDataGuru] = useState([])
  const [dataMurid, setDataMurid] = useState([])
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    nama_kegiatan: '', jenjang: '', kelas_fase: '', semester: 'Gasal', tahun_pelajaran: '2025/2026',
    tema_kegiatan: '', subtema: '', jenis_kokurikuler: '', alokasi_waktu: '', lokasi_kegiatan: '',
    guru_koordinator: '', mata_pelajaran_muatan: '', jumlah_murid: '', produk_hasil: '',
    dimensi_profil_lulusan: [], topik_panca_cinta: [], materi_integrasi_kbc: [],
    praktik_pedagogis: [], lingkungan_pembelajaran: [], teknologi_digital: [],
    kemitraan_pembelajaran: { madrasah: '', keluarga: '', masyarakat: '', media: '' },
    tujuan_pembelajaran: [], analisis_kebutuhan: '',
    alur_kegiatan: [], rubrik: [], lembar_observasi: [],
    asesmen: { formatif: '', sumatif: '', teknik: [] },
    jurnal_pelaksanaan: [], pelaporan_hasil: {},
    evaluasi_tindak_lanjut: {},
    status_dokumen: 'Draft',
    madrasah_id: '',
  })

  useEffect(() => {
    loadRefData()
    if (id) loadExisting()
  }, [id])

  async function loadRefData() {
    const sb = getSupabase()
    const [m, g] = await Promise.all([sb.from('madrasah').select('id, nama_madrasah, jenjang, kepala_madrasah, nip_kepala'), sb.from('guru').select('id, nama_guru, nip_nuptk')])
    setDataMadrasah(m.data || [])
    setDataGuru(g.data || [])
  }

  async function loadExisting() {
    setLoading(true)
    const sb = getSupabase()
    const { data, error } = await sb.from('perencanaan_kokurikuler').select('*').eq('id', id).single()
    if (!error && data) {
      setForm({
        nama_kegiatan: data.nama_kegiatan || '', jenjang: data.jenjang || '', kelas_fase: data.kelas_fase || '',
        semester: data.semester || 'Gasal', tahun_pelajaran: data.tahun_pelajaran || '2025/2026',
        tema_kegiatan: data.tema_kegiatan || '', subtema: data.subtema || '',
        jenis_kokurikuler: data.jenis_kokurikuler || '', alokasi_waktu: data.alokasi_waktu || '',
        lokasi_kegiatan: data.lokasi_kegiatan || '', guru_koordinator: data.guru_koordinator || '',
        mata_pelajaran_muatan: data.mata_pelajaran_muatan || '', jumlah_murid: data.jumlah_murid || '',
        produk_hasil: data.produk_hasil || '',
        dimensi_profil_lulusan: data.dimensi_profil_lulusan || [],
        topik_panca_cinta: data.topik_panca_cinta || [],
        materi_integrasi_kbc: data.materi_integrasi_kbc || [],
        praktik_pedagogis: data.praktik_pedagogis || [],
        lingkungan_pembelajaran: data.lingkungan_pembelajaran || [],
        teknologi_digital: data.teknologi_digital || [],
        kemitraan_pembelajaran: data.kemitraan_pembelajaran || { madrasah: '', keluarga: '', masyarakat: '', media: '' },
        tujuan_pembelajaran: data.tujuan_pembelajaran || [],
        analisis_kebutuhan: data.analisis_kebutuhan || '',
        alur_kegiatan: data.alur_kegiatan || [],
        rubrik: data.rubrik || [],
        lembar_observasi: data.lembar_observasi || [],
        asesmen: data.asesmen || { formatif: '', sumatif: '', teknik: [] },
        jurnal_pelaksanaan: data.jurnal_pelaksanaan || [],
        pelaporan_hasil: data.pelaporan_hasil || {},
        evaluasi_tindak_lanjut: data.evaluasi_tindak_lanjut || {},
        status_dokumen: data.status_dokumen || 'Draft',
        madrasah_id: data.madrasah_id || '',
      })
    }
    setLoading(false)
  }

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })) }
  function toggleArray(key, value) {
    setForm(prev => ({ ...prev, [key]: prev[key]?.includes(value) ? prev[key].filter(v => v !== value) : [...(prev[key] || []), value] }))
  }

  function applyContohCepat(jenjang) {
    const c = CONTOH_CEPAT[jenjang]
    if (!c) return
    setForm(prev => ({
      ...prev, nama_kegiatan: c.nama_kegiatan, tema_kegiatan: c.tema_kegiatan,
      jenis_kokurikuler: c.jenis_kokurikuler, dimensi_profil_lulusan: c.dimensi,
      topik_panca_cinta: c.panca_cinta, produk_hasil: c.produk_hasil, jenjang
    }))
    setMsg('Contoh cepat diterapkan. Silakan edit sesuai kebutuhan.')
  }

  function generateAll() {
    if (form.dimensi_profil_lulusan.length === 0) return setMsg('Pilih minimal satu Dimensi Profil Lulusan.')
    if (form.topik_panca_cinta.length === 0) return setMsg('Pilih minimal satu Topik Panca Cinta.')
    if (!form.tema_kegiatan) return setMsg('Tema kegiatan wajib dipilih.')

    const tujuan = generateTujuanPembelajaran(form.tema_kegiatan, form.dimensi_profil_lulusan, form.topik_panca_cinta, form.mata_pelajaran_muatan)
    const rubrik = generateRubrik(form.dimensi_profil_lulusan)
    const alur = generateAlurKegiatan(form.tema_kegiatan, form.jenis_kokurikuler)
    const dimensiNarasi = generateDimensiNarasi(form.dimensi_profil_lulusan)
    const pancaCintaNarasi = generatePancaCintaNarasi(form.topik_panca_cinta)

    // auto-pick materi KBC based on panca cinta selections
    const materi = []
    form.topik_panca_cinta.forEach(p => {
      if (MATERI_KBC[p]) materi.push({ topik: p, materi: MATERI_KBC[p] })
    })

    setForm(prev => ({
      ...prev, tujuan_pembelajaran: tujuan, rubrik, alur_kegiatan: alur,
      materi_integrasi_kbc: materi,
      asesmen: { ...prev.asesmen, formatif: 'Dilakukan selama proses kegiatan melalui observasi, tanya jawab, catatan guru, refleksi, dan umpan balik.', sumatif: 'Dilakukan pada akhir kegiatan melalui produk, presentasi, portofolio, atau aksi nyata.', teknik: ['Observasi', 'Penilaian proses', 'Penilaian produk', 'Refleksi murid', 'Jurnal guru', 'Umpan balik teman', 'Umpan balik orang tua'] }
    }))
    setMsg('Semua komponen berhasil digenerate!')
  }

  async function handleSave() {
    if (!form.nama_kegiatan) return setMsg('Nama kegiatan wajib diisi.')
    if (!form.jenjang) return setMsg('Jenjang wajib dipilih.')
    if (!form.tema_kegiatan) return setMsg('Tema wajib dipilih.')
    if (form.dimensi_profil_lulusan.length === 0) return setMsg('Minimal satu Dimensi Profil Lulusan wajib dipilih.')
    if (form.topik_panca_cinta.length === 0) return setMsg('Minimal satu Topik Panca Cinta wajib dipilih.')

    setSaving(true)
    try {
      const sb = getSupabase()
      const payload = { ...form, created_by: user.id, updated_at: new Date().toISOString() }
      if (id) {
        await sb.from('perencanaan_kokurikuler').update(payload).eq('id', id)
      } else {
        payload.created_at = new Date().toISOString()
        const { data, error } = await sb.from('perencanaan_kokurikuler').insert(payload).select().single()
        if (error) throw error
        navigate(`/generator/${data.id}`, { replace: true })
      }
      setMsg('Perencanaan berhasil disimpan!')
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Generator Perencanaan Kokurikuler" subtitle="Buat dokumen perencanaan kokurikuler madrasah secara otomatis">
        <div className="flex gap-2 flex-wrap">
          <button onClick={generateAll} className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600">⚡ Generate Otomatis</button>
          <button onClick={() => navigate(`/preview/${id}`)} disabled={!id} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"><Eye size={14} /> Preview</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} /> {id ? 'Update' : 'Simpan'}</button>
        </div>
      </PageHeader>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') || msg.includes('wajib') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{msg}</div>}

      {/* Contoh Cepat */}
      <Section title="Contoh Cepat">
        <div className="flex gap-2 flex-wrap">
          {Object.keys(CONTOH_CEPAT).map(j => (
            <button key={j} onClick={() => applyContohCepat(j)} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs hover:bg-blue-100">{j}: {CONTOH_CEPAT[j].tema_kegiatan}</button>
          ))}
          <button onClick={() => applyContohCepat('RA')} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs hover:bg-green-100">Semua: Harianku Penuh Cinta</button>
        </div>
      </Section>

      {/* 1. Identitas Kegiatan */}
      <Section title="1. Identitas Kegiatan">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <GInput label="Nama Kegiatan" required value={form.nama_kegiatan} onChange={e => update('nama_kegiatan', e.target.value)} />
          <GSel label="Jenjang" required value={form.jenjang} onChange={e => update('jenjang', e.target.value)} options={JENJANG} />
          <GInput label="Kelas/Fase" required value={form.kelas_fase} onChange={e => update('kelas_fase', e.target.value)} />
          <GSel label="Semester" value={form.semester} onChange={e => update('semester', e.target.value)} options={SEMESTER} />
          <GInput label="Tahun Pelajaran" value={form.tahun_pelajaran} onChange={e => update('tahun_pelajaran', e.target.value)} />
          <GSel label="Tema Kegiatan" required value={form.tema_kegiatan} onChange={e => update('tema_kegiatan', e.target.value)} options={TEMA_KOKURIKULER} />
          <GInput label="Subtema" value={form.subtema} onChange={e => update('subtema', e.target.value)} />
          <GSel label="Jenis Kokurikuler" required value={form.jenis_kokurikuler} onChange={e => update('jenis_kokurikuler', e.target.value)} options={JENIS_KOKURIKULER} />
          <GInput label="Alokasi Waktu" value={form.alokasi_waktu} onChange={e => update('alokasi_waktu', e.target.value)} placeholder="cth: 4 x 35 menit" />
          <GInput label="Lokasi Kegiatan" value={form.lokasi_kegiatan} onChange={e => update('lokasi_kegiatan', e.target.value)} />
          <GSel label="Guru/Koordinator" value={form.guru_koordinator} onChange={e => update('guru_koordinator', e.target.value)} options={dataGuru.map(g => g.nama_guru)} />
          <GInput label="Mata Pelajaran/Muatan" value={form.mata_pelajaran_muatan} onChange={e => update('mata_pelajaran_muatan', e.target.value)} />
          <GInput label="Jumlah Murid" type="number" value={form.jumlah_murid} onChange={e => update('jumlah_murid', e.target.value)} />
          <GSel label="Produk/Hasil" value={form.produk_hasil} onChange={e => update('produk_hasil', e.target.value)} options={PRODUK_HASIL} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Madrasah</label>
            <select value={form.madrasah_id} onChange={e => update('madrasah_id', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Pilih Madrasah</option>
              {dataMadrasah.map(m => <option key={m.id} value={m.id}>{m.nama_madrasah}</option>)}
            </select>
          </div>
          <GSel label="Status Dokumen" value={form.status_dokumen} onChange={e => update('status_dokumen', e.target.value)} options={STATUS_DOKUMEN} />
        </div>
      </Section>

      {/* 2. Dimensi Profil Lulusan */}
      <Section title="2. Dimensi Profil Lulusan">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DIMENSI_PROFIL.map(d => (
            <label key={d} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${form.dimensi_profil_lulusan?.includes(d) ? 'bg-green-50 border-green-300 text-green-800' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="checkbox" checked={form.dimensi_profil_lulusan?.includes(d) || false} onChange={() => toggleArray('dimensi_profil_lulusan', d)} className="rounded" />
              {d}
            </label>
          ))}
        </div>
      </Section>

      {/* 3. Topik Panca Cinta */}
      <Section title="3. Topik Panca Cinta">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PANCA_CINTA.map(p => (
            <label key={p} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${form.topik_panca_cinta?.includes(p) ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="checkbox" checked={form.topik_panca_cinta?.includes(p) || false} onChange={() => toggleArray('topik_panca_cinta', p)} className="rounded" />
              {p}
            </label>
          ))}
        </div>
      </Section>

      {/* 4. Materi Integrasi KBC */}
      <Section title="4. Materi Integrasi Kurikulum Berbasis Cinta">
        {form.materi_integrasi_kbc?.length > 0 ? (
          form.materi_integrasi_kbc.map((item, i) => (
            <div key={i} className="mb-3">
              <h4 className="text-sm font-semibold text-green-700 mb-1">{item.topik}</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
                {item.materi.map((m, j) => <li key={j}>{m}</li>)}
              </ul>
            </div>
          ))
        ) : <p className="text-sm text-gray-400">Pilih Topik Panca Cinta terlebih dahulu, lalu klik "Generate Otomatis" untuk melihat rekomendasi materi.</p>}
      </Section>

      {/* 5. Analisis Kebutuhan */}
      <Section title="5. Analisis Kebutuhan dan Konteks">
        <GTextarea label="Kebutuhan belajar murid, kondisi, potensi madrasah, sumber daya, kearifan lokal, dan alasan tema dipilih" value={form.analisis_kebutuhan} onChange={e => update('analisis_kebutuhan', e.target.value)} rows={4} />
      </Section>

      {/* 6. Tujuan Pembelajaran */}
      <Section title="6. Tujuan Pembelajaran Kokurikuler">
        {form.tujuan_pembelajaran?.length > 0 ? (
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            {form.tujuan_pembelajaran.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        ) : <p className="text-sm text-gray-400">Klik "Generate Otomatis" untuk membuat tujuan pembelajaran.</p>}
      </Section>

      {/* 7. Praktik Pedagogis */}
      <Section title="7. Praktik Pedagogis">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {PRAKTIK_PEDAGOGIS.map(p => (
            <label key={p} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${form.praktik_pedagogis?.includes(p) ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`}>
              <input type="checkbox" checked={form.praktik_pedagogis?.includes(p) || false} onChange={() => toggleArray('praktik_pedagogis', p)} className="rounded" />{p}
            </label>
          ))}
        </div>
      </Section>

      {/* 8. Lingkungan Pembelajaran */}
      <Section title="8. Lingkungan Pembelajaran">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {LINGKUNGAN_BELAJAR.map(l => (
            <label key={l} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${form.lingkungan_pembelajaran?.includes(l) ? 'bg-purple-50 border-purple-300' : 'border-gray-200'}`}>
              <input type="checkbox" checked={form.lingkungan_pembelajaran?.includes(l) || false} onChange={() => toggleArray('lingkungan_pembelajaran', l)} className="rounded" />{l}
            </label>
          ))}
        </div>
      </Section>

      {/* 9. Teknologi Digital */}
      <Section title="9. Pemanfaatan Teknologi Digital">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TEKNOLOGI_DIGITAL.map(t => (
            <label key={t} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${form.teknologi_digital?.includes(t) ? 'bg-indigo-50 border-indigo-300' : 'border-gray-200'}`}>
              <input type="checkbox" checked={form.teknologi_digital?.includes(t) || false} onChange={() => toggleArray('teknologi_digital', t)} className="rounded" />{t}
            </label>
          ))}
        </div>
      </Section>

      {/* 10. Kemitraan Pembelajaran */}
      <Section title="10. Kemitraan Pembelajaran (Catur Pusat Pendidikan)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['madrasah', 'keluarga', 'masyarakat', 'media'].map(k => (
            <GTextarea key={k} label={`Peran ${k.charAt(0).toUpperCase() + k.slice(1)}`} value={form.kemitraan_pembelajaran?.[k] || ''} onChange={e => update('kemitraan_pembelajaran', { ...form.kemitraan_pembelajaran, [k]: e.target.value })} rows={2} />
          ))}
        </div>
      </Section>

      {/* 11. Alur Kegiatan */}
      <Section title="11. Alur Kegiatan Kokurikuler">
        {form.alur_kegiatan?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border">
              <thead className="bg-green-50">
                <tr>
                  <th className="border px-2 py-1 text-left">Tahap</th><th className="border px-2 py-1 text-left">Aktivitas Guru</th><th className="border px-2 py-1 text-left">Aktivitas Murid</th><th className="border px-2 py-1 text-left">Nilai/Dimensi</th><th className="border px-2 py-1 text-left">Waktu</th><th className="border px-2 py-1 text-left">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {form.alur_kegiatan.map((a, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 font-medium">{a.tahap}</td><td className="border px-2 py-1">{a.aktivitasGuru}</td><td className="border px-2 py-1">{a.aktivitasMurid}</td><td className="border px-2 py-1">{a.nilai}</td><td className="border px-2 py-1">{a.waktu}</td><td className="border px-2 py-1">{a.bukti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-gray-400">Klik "Generate Otomatis" untuk membuat alur kegiatan.</p>}
      </Section>

      {/* 12. Asesmen */}
      <Section title="12. Asesmen Kokurikuler">
        <div className="space-y-3">
          <GTextarea label="Asesmen Formatif" value={form.asesmen?.formatif || ''} onChange={e => update('asesmen', { ...form.asesmen, formatif: e.target.value })} rows={3} />
          <GTextarea label="Asesmen Sumatif" value={form.asesmen?.sumatif || ''} onChange={e => update('asesmen', { ...form.asesmen, sumatif: e.target.value })} rows={3} />
          <div>
            <p className="text-xs text-gray-600 mb-1">Teknik Asesmen:</p>
            <div className="flex flex-wrap gap-2">
              {['Observasi', 'Penilaian proses', 'Penilaian produk', 'Refleksi murid', 'Jurnal guru', 'Umpan balik teman', 'Umpan balik orang tua'].map(t => (
                <label key={t} className={`flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer ${form.asesmen?.teknik?.includes(t) ? 'bg-green-50 border-green-300' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={form.asesmen?.teknik?.includes(t) || false} onChange={() => update('asesmen', { ...form.asesmen, teknik: form.asesmen?.teknik?.includes(t) ? form.asesmen.teknik.filter(v => v !== t) : [...(form.asesmen?.teknik || []), t] })} className="rounded" />{t}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 13. Rubrik Asesmen */}
      <Section title="13. Rubrik Asesmen">
        {form.rubrik?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border">
              <thead className="bg-green-50">
                <tr><th className="border px-2 py-1">Dimensi/Topik</th><th className="border px-2 py-1">Indikator</th><th className="border px-2 py-1">SB</th><th className="border px-2 py-1">B</th><th className="border px-2 py-1">C</th><th className="border px-2 py-1">K</th></tr>
              </thead>
              <tbody>
                {form.rubrik.map((r, i) => (
                  <tr key={i}><td className="border px-2 py-1 font-medium">{r.dimensi}</td><td className="border px-2 py-1">{r.indikator}</td><td className="border px-2 py-1 text-xs">{r.SB}</td><td className="border px-2 py-1 text-xs">{r.B}</td><td className="border px-2 py-1 text-xs">{r.C}</td><td className="border px-2 py-1 text-xs">{r.K}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-gray-400">Klik "Generate Otomatis" untuk membuat rubrik asesmen.</p>}
      </Section>

      {/* 14. Lembar Observasi */}
      <Section title="14. Lembar Observasi Murid">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
          Lembar observasi akan ditampilkan saat Preview/Cetak. Silakan simpan perencanaan terlebih dahulu.
        </div>
      </Section>

      {/* 15. Evaluasi */}
      <Section title="15. Evaluasi dan Tindak Lanjut">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['nama_kegiatan', 'waktu_pelaksanaan', 'tujuan_kegiatan', 'ketercapaian', 'faktor_pendukung', 'hambatan', 'solusi', 'dampak_murid', 'dampak_madrasah', 'rencana_tindak_lanjut', 'rekomendasi'].map(k => (
            <GTextarea key={k} label={k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={(form.evaluasi_tindak_lanjut || {})[k] || ''} onChange={e => update('evaluasi_tindak_lanjut', { ...form.evaluasi_tindak_lanjut, [k]: e.target.value })} rows={2} />
          ))}
        </div>
      </Section>

      {/* Bottom Actions */}
      <div className="flex gap-2 mt-6 flex-wrap">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"><Save size={16} /> {id ? 'Update Perencanaan' : 'Simpan Perencanaan'}</button>
        {id && <button onClick={() => navigate(`/preview/${id}`)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 flex items-center gap-2"><Eye size={16} /> Preview & Cetak</button>}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border p-4 md:p-6 mb-4">
      <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b text-sm md:text-base">{title}</h3>
      {children}
    </div>
  )
}

function GInput({ label, value, onChange, required, type = 'text', placeholder }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label><input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
}

function GSel({ label, value, onChange, options, required }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label><select value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"><option value="">Pilih...</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
}

function GTextarea({ label, value, onChange, rows = 3 }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label><textarea value={value} onChange={onChange} rows={rows} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
}