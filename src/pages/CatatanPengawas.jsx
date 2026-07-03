import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { STATUS_TINDAK_LANJUT } from '../lib/constants'
import { formatDateTime } from '../lib/utils'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function CatatanPengawas() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [perencanaanList, setPerencanaanList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(initForm())

  const canEdit = true

  function initForm(d = {}) {
    return {
      perencanaan_id: d.perencanaan_id || '',
      catatan: d.catatan || '',
      rekomendasi: d.rekomendasi || '',
      status_tindak_lanjut: d.status_tindak_lanjut || 'Belum Ditindaklanjuti',
    }
  }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const [{ data: c }, { data: p }] = await Promise.all([
        sb.from('catatan_pengawas').select('*, perencanaan_kokurikuler(nama_kegiatan, jenjang, kelas)').order('created_at', { ascending: false }),
        sb.from('perencanaan_kokurikuler').select('id, nama_kegiatan, jenjang').order('created_at', { ascending: false }),
      ])
      setData(c || [])
      setPerencanaanList(p || [])
    } catch { }
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.perencanaan_id) return alert('Pilih perencanaan.')
    if (!form.catatan) return alert('Catatan wajib diisi.')
    const sb = getSupabase()
    const payload = { ...form, created_by: user.id, updated_at: new Date().toISOString() }
    if (editing) {
      await sb.from('catatan_pengawas').update(payload).eq('id', editing.id)
    } else {
      payload.created_at = new Date().toISOString()
      await sb.from('catatan_pengawas').insert(payload)
    }
    setShowForm(false); setEditing(null); loadData()
  }

  async function handleDelete() {
    if (!deleteId) return
    const sb = getSupabase()
    await sb.from('catatan_pengawas').delete().eq('id', deleteId)
    setDeleteId(null); loadData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Catatan Pengawas" subtitle="Catatan, rekomendasi, dan tindak lanjut dari pengawas">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
          <Plus size={16} /> Tambah Catatan
        </button>
      </PageHeader>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Tambah'} Catatan Pengawas</h3>
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Perencanaan *</label>
              <select value={form.perencanaan_id} onChange={e => setForm({ ...form, perencanaan_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="">-- Pilih Perencanaan --</option>
                {perencanaanList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_kegiatan || 'Tanpa Nama'} ({p.jenjang || '-'})</option>
                ))}
              </select>
            </div>
            <FTextarea label="Catatan *" value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} rows={4} placeholder="Tulis catatan pengawas..." />
            <FTextarea label="Rekomendasi" value={form.rekomendasi} onChange={e => setForm({ ...form, rekomendasi: e.target.value })} rows={3} placeholder="Tulis rekomendasi..." />
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Status Tindak Lanjut</label>
              <select value={form.status_tindak_lanjut} onChange={e => setForm({ ...form, status_tindak_lanjut: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                {STATUS_TINDAK_LANJUT.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState message="Belum ada catatan pengawas." icon="📝" />
      ) : (
        <div className="space-y-4">
          {data.map((d, i) => {
            const kegiatan = d.perencanaan_kokurikuler
            return (
              <div key={d.id} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-gray-400">{i + 1}. {kegiatan?.nama_kegiatan || 'Perencanaan #' + d.perencanaan_id}</span>
                    {kegiatan?.jenjang && <span className="text-xs text-gray-400 ml-2">({kegiatan.jenjang}{kegiatan.kelas ? ` / ${kegiatan.kelas}` : ''})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusTL status={d.status_tindak_lanjut} />
                    <div className="flex gap-0.5">
                      <button onClick={() => { setForm(initForm(d)); setEditing(d); setShowForm(true) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                      <button onClick={() => setDeleteId(d.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg mb-2">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{d.catatan}</p>
                </div>
                {d.rekomendasi && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-2">
                    <span className="text-xs font-semibold text-blue-700">Rekomendasi:</span>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap mt-1">{d.rekomendasi}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Oleh: {d.created_by || '-'}</span>
                  <span>{formatDateTime(d.created_at)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Hapus Catatan" message="Catatan yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function StatusTL({ status }) {
  const colors = {
    'Belum Ditindaklanjuti': 'bg-red-100 text-red-700',
    'Sedang Ditindaklanjuti': 'bg-yellow-100 text-yellow-700',
    'Selesai': 'bg-green-100 text-green-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors['Belum Ditindaklanjuti']}`}>{status || 'Belum Ditindaklanjuti'}</span>
}

function FTextarea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
    </div>
  )
}