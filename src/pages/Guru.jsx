import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function Guru() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [madrasah, setMadrasah] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initForm())

  function initForm(d = {}) { return { nama_guru: d.nama_guru || '', nip_nuptk: d.nip_nuptk || '', jabatan: d.jabatan || '', mata_pelajaran_muatan: d.mata_pelajaran_muatan || '', kelas_diampu: d.kelas_diampu || '', nomor_hp: d.nomor_hp || '', email: d.email || '', madrasah_id: d.madrasah_id || '' } }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const sb = getSupabase()
    const [g, m] = await Promise.all([sb.from('guru').select('*, madrasah(nama_madrasah)').order('created_at', { ascending: false }), sb.from('madrasah').select('id, nama_madrasah')])
    setData(g.data || [])
    setMadrasah(m.data || [])
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nama_guru) return alert('Nama guru wajib diisi.')
    const sb = getSupabase()
    const p = { ...form, created_by: user.id, updated_at: new Date().toISOString() }
    if (editing) await sb.from('guru').update(p).eq('id', editing.id)
    else { p.created_at = new Date().toISOString(); await sb.from('guru').insert(p) }
    setShowForm(false); setEditing(null); loadData()
  }

  async function handleDelete() { if (!deleteId) return; const sb = getSupabase(); await sb.from('guru').delete().eq('id', deleteId); setDeleteId(null); loadData() }

  const filtered = data.filter(d => d.nama_guru?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Data Guru" subtitle="Kelola data guru madrasah">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Plus size={16} /> Tambah</button>
      </PageHeader>

      <div className="mb-4"><input type="text" placeholder="Cari guru..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-green-500 outline-none" /></div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Tambah'} Guru</h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <FInput label="Nama Guru" required value={form.nama_guru} onChange={e => setForm({ ...form, nama_guru: e.target.value })} />
              <FInput label="NIP/NUPTK" value={form.nip_nuptk} onChange={e => setForm({ ...form, nip_nuptk: e.target.value })} />
              <FInput label="Jabatan" value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })} />
              <FInput label="Mata Pelajaran/Muatan" value={form.mata_pelajaran_muatan} onChange={e => setForm({ ...form, mata_pelajaran_muatan: e.target.value })} />
              <FInput label="Kelas Diampu" value={form.kelas_diampu} onChange={e => setForm({ ...form, kelas_diampu: e.target.value })} />
              <FInput label="Nomor HP" value={form.nomor_hp} onChange={e => setForm({ ...form, nomor_hp: e.target.value })} />
              <FInput label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Madrasah</label>
                <select value={form.madrasah_id} onChange={e => setForm({ ...form, madrasah_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Pilih Madrasah</option>
                  {madrasah.map(m => <option key={m.id} value={m.id}>{m.nama_madrasah}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? <EmptyState message="Belum ada data guru." icon="👥" /> : (
        <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left px-4 py-3">No</th><th className="text-left px-4 py-3">Nama Guru</th><th className="text-left px-4 py-3 hidden md:table-cell">NIP/NUPTK</th><th className="text-left px-4 py-3 hidden md:table-cell">Mata Pelajaran</th><th className="text-left px-4 py-3 hidden lg:table-cell">Madrasah</th><th className="text-right px-4 py-3">Aksi</th></tr></thead>
            <tbody className="divide-y">
              {filtered.map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50"><td className="px-4 py-3">{i + 1}</td><td className="px-4 py-3 font-medium">{d.nama_guru}</td><td className="px-4 py-3 hidden md:table-cell">{d.nip_nuptk || '-'}</td><td className="px-4 py-3 hidden md:table-cell">{d.mata_pelajaran_muatan || '-'}</td><td className="px-4 py-3 hidden lg:table-cell">{d.madrasah?.nama_madrasah || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setForm(initForm(d)); setEditing(d); setShowForm(true) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-1"><Edit size={14} /></button>
                    <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
      <ConfirmModal open={!!deleteId} title="Hapus Guru" message="Data yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function FInput({ label, value, onChange, required }) { return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label><input type="text" value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div> }