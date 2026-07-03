import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { generateNarasiEvaluasi, formatDate } from '../lib/utils'
import { Plus, Edit, Trash2, Save, X, Sparkles } from 'lucide-react'

export default function Evaluasi() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [narasiGenerating, setNarasiGenerating] = useState(false)
  const [form, setForm] = useState(initForm())

  function initForm(d = {}) {
    return {
      nama_kegiatan: d.nama_kegiatan || '',
      waktu_pelaksanaan: d.waktu_pelaksanaan || '',
      tujuan_kegiatan: d.tujuan_kegiatan || '',
      ketercapaian: d.ketercapaian || '',
      faktor_pendukung: d.faktor_pendukung || '',
      hambatan: d.hambatan || '',
      solusi: d.solusi || '',
      dampak_murid: d.dampak_murid || '',
      dampak_madrasah: d.dampak_madrasah || '',
      rencana_tindak_lanjut: d.rencana_tindak_lanjut || '',
      rekomendasi: d.rekomendasi || '',
      narasi_otomatis: d.narasi_otomatis || '',
    }
  }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const { data: d } = await sb.from('evaluasi').select('*').order('created_at', { ascending: false })
      setData(d || [])
    } catch { }
    setLoading(false)
  }

  function handleGenerateNarasi() {
    setNarasiGenerating(true)
    setTimeout(() => {
      const narasi = generateNarasiEvaluasi({
        ketercapaian: form.ketercapaian,
        dampakMurid: form.dampak_murid,
        tindakLanjut: form.rencana_tindak_lanjut,
      })
      setForm({ ...form, narasi_otomatis: narasi })
      setNarasiGenerating(false)
    }, 300)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nama_kegiatan) return alert('Nama kegiatan wajib diisi.')
    const sb = getSupabase()
    const payload = { ...form, created_by: user.id, updated_at: new Date().toISOString() }
    if (editing) {
      await sb.from('evaluasi').update(payload).eq('id', editing.id)
    } else {
      payload.created_at = new Date().toISOString()
      await sb.from('evaluasi').insert(payload)
    }
    setShowForm(false); setEditing(null); loadData()
  }

  async function handleDelete() {
    if (!deleteId) return
    const sb = getSupabase()
    await sb.from('evaluasi').delete().eq('id', deleteId)
    setDeleteId(null); loadData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Evaluasi & Tindak Lanjut" subtitle="Kelola evaluasi kegiatan kokurikuler">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
          <Plus size={16} /> Tambah Evaluasi
        </button>
      </PageHeader>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Tambah'} Evaluasi</h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <FInput label="Nama Kegiatan" required value={form.nama_kegiatan} onChange={e => setForm({ ...form, nama_kegiatan: e.target.value })} />
              <FInput label="Waktu Pelaksanaan" value={form.waktu_pelaksanaan} onChange={e => setForm({ ...form, waktu_pelaksanaan: e.target.value })} placeholder="Contoh: 5-10 Januari 2026" />
            </div>
            <FTextarea label="Tujuan Kegiatan" value={form.tujuan_kegiatan} onChange={e => setForm({ ...form, tujuan_kegiatan: e.target.value })} />
            <FTextarea label="Ketercapaian" value={form.ketercapaian} onChange={e => setForm({ ...form, ketercapaian: e.target.value })} />
            <FTextarea label="Faktor Pendukung" value={form.faktor_pendukung} onChange={e => setForm({ ...form, faktor_pendukung: e.target.value })} />
            <FTextarea label="Hambatan" value={form.hambatan} onChange={e => setForm({ ...form, hambatan: e.target.value })} />
            <FTextarea label="Solusi" value={form.solusi} onChange={e => setForm({ ...form, solusi: e.target.value })} />
            <FTextarea label="Dampak terhadap Murid" value={form.dampak_murid} onChange={e => setForm({ ...form, dampak_murid: e.target.value })} />
            <FTextarea label="Dampak terhadap Madrasah" value={form.dampak_madrasah} onChange={e => setForm({ ...form, dampak_madrasah: e.target.value })} />
            <FTextarea label="Rencana Tindak Lanjut" value={form.rencana_tindak_lanjut} onChange={e => setForm({ ...form, rencana_tindak_lanjut: e.target.value })} />
            <FTextarea label="Rekomendasi" value={form.rekomendasi} onChange={e => setForm({ ...form, rekomendasi: e.target.value })} />

            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Narasi Otomatis</label>
                <button type="button" onClick={handleGenerateNarasi} disabled={narasiGenerating} className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs flex items-center gap-1 hover:bg-yellow-600 disabled:opacity-50">
                  <Sparkles size={12} /> {narasiGenerating ? 'Generating...' : 'Generate Narasi'}
                </button>
              </div>
              <textarea rows={4} value={form.narasi_otomatis} onChange={e => setForm({ ...form, narasi_otomatis: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-yellow-50" placeholder="Klik 'Generate Narasi'..." />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState message="Belum ada data evaluasi." icon="🔄" />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">No</th>
                  <th className="text-left px-4 py-3">Nama Kegiatan</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Waktu</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Dampak Murid</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Tanggal</th>
                  <th className="text-right px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{d.nama_kegiatan || '-'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{d.waktu_pelaksanaan || '-'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell max-w-[200px] truncate">{d.dampak_murid || '-'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded mr-1" title="Detail">{expanded === d.id ? '▲' : '▼'}</button>
                      <button onClick={() => { setForm(initForm(d)); setEditing(d); setShowForm(true) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-1"><Edit size={14} /></button>
                      <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expanded && (
            <div className="p-4 border-t bg-gray-50">
              <EvaluasiDetail row={data.find(d => d.id === expanded)} />
            </div>
          )}
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Hapus Evaluasi" message="Data yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function EvaluasiDetail({ row }) {
  if (!row) return null
  const fields = [
    { label: 'Tujuan Kegiatan', value: row.tujuan_kegiatan },
    { label: 'Ketercapaian', value: row.ketercapaian },
    { label: 'Faktor Pendukung', value: row.faktor_pendukung },
    { label: 'Hambatan', value: row.hambatan },
    { label: 'Solusi', value: row.solusi },
    { label: 'Dampak terhadap Murid', value: row.dampak_murid },
    { label: 'Dampak terhadap Madrasah', value: row.dampak_madrasah },
    { label: 'Rencana Tindak Lanjut', value: row.rencana_tindak_lanjut },
    { label: 'Rekomendasi', value: row.rekomendasi },
    { label: 'Narasi Otomatis', value: row.narasi_otomatis },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      {fields.filter(f => f.value).map((f, i) => (
        <div key={i} className={f.label === 'Narasi Otomatis' ? 'md:col-span-2' : ''}>
          <h4 className="font-semibold text-gray-700 mb-1">{f.label}</h4>
          <p className="text-gray-600 whitespace-pre-wrap">{f.value}</p>
        </div>
      ))}
    </div>
  )
}

function FInput({ label, value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label>
      <input type="text" value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
    </div>
  )
}

function FTextarea({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea rows={2} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
    </div>
  )
}