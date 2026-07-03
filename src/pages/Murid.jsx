import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { JENJANG, FASE } from '../lib/constants'
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react'

export default function Murid() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [madrasah, setMadrasah] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [form, setForm] = useState(initForm())

  function initForm(d = {}) { return { nama_murid: d.nama_murid || '', nis_nisn: d.nis_nisn || '', kelas: d.kelas || '', fase: d.fase || '', jenjang: d.jenjang || 'MI', jenis_kelamin: d.jenis_kelamin || 'Laki-laki', nama_orang_tua: d.nama_orang_tua || '', nomor_hp_orang_tua: d.nomor_hp_orang_tua || '', madrasah_id: d.madrasah_id || '' } }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const sb = getSupabase()
    const [m, mad] = await Promise.all([sb.from('murid').select('*, madrasah(nama_madrasah)').order('created_at', { ascending: false }), sb.from('madrasah').select('id, nama_madrasah')])
    setData(m.data || [])
    setMadrasah(mad.data || [])
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nama_murid) return alert('Nama murid wajib diisi.')
    const sb = getSupabase()
    const p = { ...form, created_by: user.id, updated_at: new Date().toISOString() }
    if (editing) await sb.from('murid').update(p).eq('id', editing.id)
    else { p.created_at = new Date().toISOString(); await sb.from('murid').insert(p) }
    setShowForm(false); setEditing(null); loadData()
  }

  async function handleDelete() { if (!deleteId) return; const sb = getSupabase(); await sb.from('murid').delete().eq('id', deleteId); setDeleteId(null); loadData() }

  const kelasList = [...new Set(data.map(d => d.kelas).filter(Boolean))]
  let filtered = data.filter(d => d.nama_murid?.toLowerCase().includes(search.toLowerCase()))
  if (filterKelas) filtered = filtered.filter(d => d.kelas === filterKelas)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Data Murid" subtitle="Kelola data murid madrasah">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Plus size={16} /> Tambah</button>
      </PageHeader>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input type="text" placeholder="Cari murid..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-green-500 outline-none" />
        <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="">Semua Kelas</option>{kelasList.map(k => <option key={k} value={k}>{k}</option>)}</select>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Tambah'} Murid</h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <FInput label="Nama Murid" required value={form.nama_murid} onChange={e => setForm({ ...form, nama_murid: e.target.value })} />
              <FInput label="NIS/NISN" value={form.nis_nisn} onChange={e => setForm({ ...form, nis_nisn: e.target.value })} />
              <FInput label="Kelas" value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })} />
              <FSel label="Fase" value={form.fase} onChange={e => setForm({ ...form, fase: e.target.value })} options={FASE} />
              <FSel label="Jenjang" value={form.jenjang} onChange={e => setForm({ ...form, jenjang: e.target.value })} options={JENJANG} />
              <FSel label="Jenis Kelamin" value={form.jenis_kelamin} onChange={e => setForm({ ...form, jenis_kelamin: e.target.value })} options={['Laki-laki', 'Perempuan']} />
              <FInput label="Nama Orang Tua/Wali" value={form.nama_orang_tua} onChange={e => setForm({ ...form, nama_orang_tua: e.target.value })} />
              <FInput label="Nomor HP Orang Tua" value={form.nomor_hp_orang_tua} onChange={e => setForm({ ...form, nomor_hp_orang_tua: e.target.value })} />
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Madrasah</label><select value={form.madrasah_id} onChange={e => setForm({ ...form, madrasah_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Pilih</option>{madrasah.map(m => <option key={m.id} value={m.id}>{m.nama_madrasah}</option>)}</select></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? <EmptyState message="Belum ada data murid." icon="🎓" /> : (
        <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-3">No</th><th className="text-left px-4 py-3">Nama Murid</th><th className="text-left px-4 py-3 hidden md:table-cell">Kelas</th><th className="text-left px-4 py-3 hidden md:table-cell">Jenjang</th><th className="text-left px-4 py-3 hidden lg:table-cell">Orang Tua</th><th className="text-right px-4 py-3">Aksi</th></tr></thead>
            <tbody className="divide-y">{filtered.map((d, i) => (<tr key={d.id} className="hover:bg-gray-50"><td className="px-4 py-3">{i + 1}</td><td className="px-4 py-3 font-medium">{d.nama_murid}</td><td className="px-4 py-3 hidden md:table-cell">{d.kelas || '-'}</td><td className="px-4 py-3 hidden md:table-cell">{d.jenjang || '-'}</td><td className="px-4 py-3 hidden lg:table-cell">{d.nama_orang_tua || '-'}</td><td className="px-4 py-3 text-right"><button onClick={() => { setForm(initForm(d)); setEditing(d); setShowForm(true) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-1"><Edit size={14} /></button><button onClick={() => setDeleteId(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button></td></tr>))}</tbody></table>
        </div></div>
      )}
      <ConfirmModal open={!!deleteId} title="Hapus Murid" message="Data yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function FInput({ label, value, onChange, required }) { return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label><input type="text" value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div> }
function FSel({ label, value, onChange, options }) { return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label><select value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Pilih</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></div> }