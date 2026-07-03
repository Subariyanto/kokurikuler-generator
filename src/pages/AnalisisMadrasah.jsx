import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { DIMENSI_PROFIL, PANCA_CINTA } from '../lib/constants'
import { formatDate, generateNarasiAnalisis } from '../lib/utils'
import { Plus, Edit, Trash2, Save, X, Sparkles } from 'lucide-react'

const SUMBER_DAYA = {
  fisik: ['Ruang kelas', 'Laboratorium', 'Perpustakaan', 'Mushalla/Masjid', 'Kebun/Lahan madrasah', 'Kantin', 'Toilet', 'Sarana olahraga'],
  manusia: ['Guru yang kompeten', 'Tenaga kependidikan', 'Orang tua/wali murid', 'Komite madrasah', 'Tokoh masyarakat'],
  finansial: ['Dana BOS', 'Dana mandiri madrasah', 'Dana komite', 'Sponsor/CSR', 'Hibah pemerintah'],
  lingkungan: ['Lingkungan hijau', 'Lingkungan bersih', 'Lingkungan aman', 'Akses sumber belajar alam', 'Kemitraan dengan lembaga'],
}

export default function AnalisisMadrasah() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(initForm())
  const [narasiGenerating, setNarasiGenerating] = useState(false)

  function initForm(d = {}) {
    return {
      kesesuaian_kurikulum: d.kesesuaian_kurikulum || '',
      minat_bakat_murid: d.minat_bakat_murid || '',
      capaian_belum_optimal: d.capaian_belum_optimal || '',
      dimensi_perlu_diperkuat: d.dimensi_perlu_diperkuat ? (typeof d.dimensi_perlu_diperkuat === 'string' ? JSON.parse(d.dimensi_perlu_diperkuat) : d.dimensi_perlu_diperkuat) : [],
      panca_cinta_perlu_diperkuat: d.panca_cinta_perlu_diperkuat ? (typeof d.panca_cinta_perlu_diperkuat === 'string' ? JSON.parse(d.panca_cinta_perlu_diperkuat) : d.panca_cinta_perlu_diperkuat) : [],
      sumber_daya_fisik: d.sumber_daya_fisik ? (typeof d.sumber_daya_fisik === 'string' ? JSON.parse(d.sumber_daya_fisik) : d.sumber_daya_fisik) : [],
      sumber_daya_manusia: d.sumber_daya_manusia ? (typeof d.sumber_daya_manusia === 'string' ? JSON.parse(d.sumber_daya_manusia) : d.sumber_daya_manusia) : [],
      sumber_daya_finansial: d.sumber_daya_finansial ? (typeof d.sumber_daya_finansial === 'string' ? JSON.parse(d.sumber_daya_finansial) : d.sumber_daya_finansial) : [],
      sumber_daya_lingkungan: d.sumber_daya_lingkungan ? (typeof d.sumber_daya_lingkungan === 'string' ? JSON.parse(d.sumber_daya_lingkungan) : d.sumber_daya_lingkungan) : [],
      kondisi_sosial_budaya: d.kondisi_sosial_budaya || '',
      masalah_aktual: d.masalah_aktual || '',
      potensi_lokal: d.potensi_lokal || '',
      alasan_pemilihan_kegiatan: d.alasan_pemilihan_kegiatan || '',
      narasi_otomatis: d.narasi_otomatis || '',
    }
  }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const { data: d } = await sb.from('analisis_madrasah').select('*').order('created_at', { ascending: false })
      setData(d || [])
    } catch { }
    setLoading(false)
  }

  function toggleCheckbox(field, value) {
    const arr = form[field]
    setForm({ ...form, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] })
  }

  function handleGenerateNarasi() {
    setNarasiGenerating(true)
    setTimeout(() => {
      const narasi = generateNarasiAnalisis({
        dimensi: form.dimensi_perlu_diperkuat,
        pancaCinta: form.panca_cinta_perlu_diperkuat,
        alasan: form.alasan_pemilihan_kegiatan,
      })
      setForm({ ...form, narasi_otomatis: narasi })
      setNarasiGenerating(false)
    }, 300)
  }

  async function handleSave(e) {
    e.preventDefault()
    const sb = getSupabase()
    const payload = {
      ...form,
      dimensi_perlu_diperkuat: JSON.stringify(form.dimensi_perlu_diperkuat),
      panca_cinta_perlu_diperkuat: JSON.stringify(form.panca_cinta_perlu_diperkuat),
      sumber_daya_fisik: JSON.stringify(form.sumber_daya_fisik),
      sumber_daya_manusia: JSON.stringify(form.sumber_daya_manusia),
      sumber_daya_finansial: JSON.stringify(form.sumber_daya_finansial),
      sumber_daya_lingkungan: JSON.stringify(form.sumber_daya_lingkungan),
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }
    if (editing) {
      await sb.from('analisis_madrasah').update(payload).eq('id', editing.id)
    } else {
      payload.created_at = new Date().toISOString()
      await sb.from('analisis_madrasah').insert(payload)
    }
    setShowForm(false); setEditing(null); loadData()
  }

  async function handleDelete() {
    if (!deleteId) return
    const sb = getSupabase()
    await sb.from('analisis_madrasah').delete().eq('id', deleteId)
    setDeleteId(null); loadData()
  }

  function safeParse(v) {
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return [] }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Analisis Madrasah" subtitle="Analisis kebutuhan kokurikuler madrasah">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
          <Plus size={16} /> Tambah Analisis
        </button>
      </PageHeader>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Tambah'} Analisis Madrasah</h3>
          <form onSubmit={handleSave}>
            <Section label="Kesesuaian Kurikulum">
              <Textarea value={form.kesesuaian_kurikulum} onChange={e => setForm({ ...form, kesesuaian_kurikulum: e.target.value })} placeholder="Jelaskan kesesuaian dengan kurikulum madrasah..." />
            </Section>

            <Section label="Minat dan Bakat Murid">
              <Textarea value={form.minat_bakat_murid} onChange={e => setForm({ ...form, minat_bakat_murid: e.target.value })} placeholder="Jelaskan minat dan bakat murid yang teridentifikasi..." />
            </Section>

            <Section label="Capaian Murid yang Belum Optimal">
              <Textarea value={form.capaian_belum_optimal} onChange={e => setForm({ ...form, capaian_belum_optimal: e.target.value })} placeholder="Jelaskan capaian murid yang masih perlu ditingkatkan..." />
            </Section>

            <Section label="Dimensi Profil yang Perlu Diperkuat">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DIMENSI_PROFIL.map(d => <Checkbox key={d} label={d} checked={form.dimensi_perlu_diperkuat.includes(d)} onChange={() => toggleCheckbox('dimensi_perlu_diperkuat', d)} />)}
              </div>
            </Section>

            <Section label="Panca Cinta yang Perlu Diperkuat">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PANCA_CINTA.map(p => <Checkbox key={p} label={p} checked={form.panca_cinta_perlu_diperkuat.includes(p)} onChange={() => toggleCheckbox('panca_cinta_perlu_diperkuat', p)} />)}
              </div>
            </Section>

            <Section label="Sumber Daya Fisik">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUMBER_DAYA.fisik.map(s => <Checkbox key={s} label={s} checked={form.sumber_daya_fisik.includes(s)} onChange={() => toggleCheckbox('sumber_daya_fisik', s)} />)}
              </div>
            </Section>

            <Section label="Sumber Daya Manusia">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUMBER_DAYA.manusia.map(s => <Checkbox key={s} label={s} checked={form.sumber_daya_manusia.includes(s)} onChange={() => toggleCheckbox('sumber_daya_manusia', s)} />)}
              </div>
            </Section>

            <Section label="Sumber Daya Finansial">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUMBER_DAYA.finansial.map(s => <Checkbox key={s} label={s} checked={form.sumber_daya_finansial.includes(s)} onChange={() => toggleCheckbox('sumber_daya_finansial', s)} />)}
              </div>
            </Section>

            <Section label="Sumber Daya Lingkungan">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUMBER_DAYA.lingkungan.map(s => <Checkbox key={s} label={s} checked={form.sumber_daya_lingkungan.includes(s)} onChange={() => toggleCheckbox('sumber_daya_lingkungan', s)} />)}
              </div>
            </Section>

            <Section label="Kondisi Sosial Budaya">
              <Textarea value={form.kondisi_sosial_budaya} onChange={e => setForm({ ...form, kondisi_sosial_budaya: e.target.value })} placeholder="Jelaskan kondisi sosial budaya yang relevan..." />
            </Section>

            <Section label="Masalah Aktual">
              <Textarea value={form.masalah_aktual} onChange={e => setForm({ ...form, masalah_aktual: e.target.value })} placeholder="Jelaskan masalah aktual yang dihadapi..." />
            </Section>

            <Section label="Potensi Lokal">
              <Textarea value={form.potensi_lokal} onChange={e => setForm({ ...form, potensi_lokal: e.target.value })} placeholder="Jelaskan potensi lokal yang dapat dimanfaatkan..." />
            </Section>

            <Section label="Alasan Pemilihan Kegiatan">
              <Textarea value={form.alasan_pemilihan_kegiatan} onChange={e => setForm({ ...form, alasan_pemilihan_kegiatan: e.target.value })} placeholder="Jelaskan alasan pemilihan kegiatan kokurikuler..." />
            </Section>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Narasi Otomatis</label>
                <button type="button" onClick={handleGenerateNarasi} disabled={narasiGenerating} className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs flex items-center gap-1 hover:bg-yellow-600 disabled:opacity-50">
                  <Sparkles size={12} /> {narasiGenerating ? 'Generating...' : 'Generate Narasi'}
                </button>
              </div>
              <textarea rows={5} value={form.narasi_otomatis} onChange={e => setForm({ ...form, narasi_otomatis: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-yellow-50" placeholder="Klik 'Generate Narasi' untuk otomatis..." />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState message="Belum ada data analisis madrasah." icon="🔍" />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">No</th>
                  <th className="text-left px-4 py-3">Dimensi Diperkuat</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Panca Cinta</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Sumber Daya</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Dibuat</th>
                  <th className="text-right px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((d, i) => {
                  const dim = safeParse(d.dimensi_perlu_diperkuat)
                  const pc = safeParse(d.panca_cinta_perlu_diperkuat)
                  const sd = (safeParse(d.sumber_daya_fisik).length + safeParse(d.sumber_daya_manusia).length + safeParse(d.sumber_daya_finansial).length + safeParse(d.sumber_daya_lingkungan).length)
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">{dim.length > 0 ? dim.slice(0, 2).join(', ') + (dim.length > 2 ? ` +${dim.length - 2}` : '') : '-'}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{pc.length > 0 ? pc.slice(0, 2).join(', ') + (pc.length > 2 ? ` +${pc.length - 2}` : '') : '-'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{sd} item</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{formatDate(d.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setForm(initForm(d)); setEditing(d); setShowForm(true) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-1"><Edit size={14} /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Hapus Analisis" message="Data yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-white p-1.5 rounded">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded text-green-600 focus:ring-green-500" />
      {label}
    </label>
  )
}