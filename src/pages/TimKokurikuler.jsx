import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { TIM_PERAN } from '../lib/constants'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function TimKokurikuler() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(initForm())

  function initForm(d = {}) { return { tahun_pelajaran: d.tahun_pelajaran || '', nama_kepala_madrasah: d.nama_kepala_madrasah || '', koordinator_kokurikuler: d.koordinator_kokurikuler || '', guru_fasilitator: d.guru_fasilitator || [], tenaga_kependidikan: d.tenaga_kependidikan || [], warga_madrasah_lainnya: d.warga_madrasah_lainnya || [], mitra_eksternal: d.mitra_eksternal || [] } }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await getSupabase().from('tim_kokurikuler').select('*').order('created_at', { ascending: false })
    setData(data || [])
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    const sb = getSupabase()
    const p = { ...form, created_by: user.id, updated_at: new Date().toISOString() }
    if (editing) await sb.from('tim_kokurikuler').update(p).eq('id', editing.id)
    else { p.created_at = new Date().toISOString(); await sb.from('tim_kokurikuler').insert(p) }
    setShowForm(false); setEditing(null); loadData()
  }

  async function handleDelete() { if (!deleteId) return; await getSupabase().from('tim_kokurikuler').delete().eq('id', deleteId); setDeleteId(null); loadData() }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Tim Kerja Kokurikuler" subtitle="Kelola tim kerja kokurikuler madrasah">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Plus size={16} /> Tambah</button>
      </PageHeader>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'Tambah'} Tim Kerja</h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <F label="Tahun Pelajaran" value={form.tahun_pelajaran} onChange={e => setForm({ ...form, tahun_pelajaran: e.target.value })} />
              <F label="Nama Kepala Madrasah" value={form.nama_kepala_madrasah} onChange={e => setForm({ ...form, nama_kepala_madrasah: e.target.value })} />
              <F label="Koordinator Kokurikuler" value={form.koordinator_kokurikuler} onChange={e => setForm({ ...form, koordinator_kokurikuler: e.target.value })} />
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Guru Fasilitator (nama-nama, dipisah koma)</label>
                <textarea value={Array.isArray(form.guru_fasilitator) ? form.guru_fasilitator.join(', ') : ''} onChange={e => setForm({ ...form, guru_fasilitator: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Tenaga Kependidikan</label>
                <textarea value={Array.isArray(form.tenaga_kependidikan) ? form.tenaga_kependidikan.join(', ') : ''} onChange={e => setForm({ ...form, tenaga_kependidikan: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Warga Madrasah Lainnya</label>
                <textarea value={Array.isArray(form.warga_madrasah_lainnya) ? form.warga_madrasah_lainnya.join(', ') : ''} onChange={e => setForm({ ...form, warga_madrasah_lainnya: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Mitra Eksternal</label>
                <textarea value={Array.isArray(form.mitra_eksternal) ? form.mitra_eksternal.join(', ') : ''} onChange={e => setForm({ ...form, mitra_eksternal: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Peran Table */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Pembagian Peran Tim Kokurikuler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(TIM_PERAN).map(([role, tugas]) => (
            <div key={role} className="border rounded-lg p-3">
              <h4 className="text-sm font-semibold text-green-700 mb-1">{role}</h4>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                {tugas.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {data.length === 0 ? <EmptyState message="Belum ada tim kerja kokurikuler." icon="👨‍💼" /> : (
        <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-3">No</th><th className="text-left px-4 py-3">Tahun Pelajaran</th><th className="text-left px-4 py-3">Kepala Madrasah</th><th className="text-left px-4 py-3">Koordinator</th><th className="text-left px-4 py-3 hidden md:table-cell">Fasilitator</th><th className="text-right px-4 py-3">Aksi</th></tr></thead>
            <tbody className="divide-y">{data.map((d, i) => (<tr key={d.id} className="hover:bg-gray-50"><td className="px-4 py-3">{i + 1}</td><td className="px-4 py-3">{d.tahun_pelajaran}</td><td className="px-4 py-3">{d.nama_kepala_madrasah || '-'}</td><td className="px-4 py-3">{d.koordinator_kokurikuler || '-'}</td><td className="px-4 py-3 hidden md:table-cell">{(d.guru_fasilitator || []).join(', ') || '-'}</td><td className="px-4 py-3 text-right"><button onClick={() => { setForm(initForm(d)); setEditing(d); setShowForm(true) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-1"><Edit size={14} /></button><button onClick={() => setDeleteId(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button></td></tr>))}</tbody></table>
        </div></div>
      )}
      <ConfirmModal open={!!deleteId} title="Hapus Tim" message="Data yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function F({ label, value, onChange }) { return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label><input type="text" value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div> }