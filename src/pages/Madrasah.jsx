import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { JENJANG, SEMESTER } from '../lib/constants'
import { formatDate } from '../lib/utils'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function Madrasah() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(initForm())

  function initForm(d = {}) {
    return {
      nama_madrasah: d.nama_madrasah || '',
      nsm: d.nsm || '',
      npsn: d.npsn || '',
      jenjang: d.jenjang || 'MI',
      alamat: d.alamat || '',
      kecamatan: d.kecamatan || '',
      kabupaten_kota: d.kabupaten_kota || '',
      provinsi: d.provinsi || '',
      kepala_madrasah: d.kepala_madrasah || '',
      nip_kepala: d.nip_kepala || '',
      tahun_pelajaran: d.tahun_pelajaran || '2025/2026',
      semester: d.semester || 'Gasal',
    }
  }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      let query = sb.from('madrasah').select('*').order('created_at', { ascending: false })
      const { data, error } = await query
      if (!error) setData(data || [])
    } catch { }
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nama_madrasah) return alert('Nama madrasah wajib diisi.')
    try {
      const sb = getSupabase()
      const payload = { ...form, created_by: user.id, updated_at: new Date().toISOString() }
      if (editing) {
        await sb.from('madrasah').update(payload).eq('id', editing.id)
      } else {
        payload.created_at = new Date().toISOString()
        await sb.from('madrasah').insert(payload)
      }
      setShowForm(false)
      setEditing(null)
      loadData()
    } catch (err) { alert(err.message) }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const sb = getSupabase()
      await sb.from('madrasah').delete().eq('id', deleteId)
      setDeleteId(null)
      loadData()
    } catch (err) { alert(err.message) }
  }

  function openEdit(d) {
    setForm(initForm(d))
    setEditing(d)
    setShowForm(true)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Data Madrasah" subtitle="Kelola data madrasah">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Plus size={16} /> Tambah</button>
      </PageHeader>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Tambah'} Madrasah</h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input label="Nama Madrasah" required value={form.nama_madrasah} onChange={e => setForm({ ...form, nama_madrasah: e.target.value })} />
              <Input label="NSM" value={form.nsm} onChange={e => setForm({ ...form, nsm: e.target.value })} />
              <Input label="NPSN" value={form.npsn} onChange={e => setForm({ ...form, npsn: e.target.value })} />
              <Select label="Jenjang" value={form.jenjang} onChange={e => setForm({ ...form, jenjang: e.target.value })} options={JENJANG} />
              <Input label="Alamat" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
              <Input label="Kecamatan" value={form.kecamatan} onChange={e => setForm({ ...form, kecamatan: e.target.value })} />
              <Input label="Kabupaten/Kota" value={form.kabupaten_kota} onChange={e => setForm({ ...form, kabupaten_kota: e.target.value })} />
              <Input label="Provinsi" value={form.provinsi} onChange={e => setForm({ ...form, provinsi: e.target.value })} />
              <Input label="Kepala Madrasah" value={form.kepala_madrasah} onChange={e => setForm({ ...form, kepala_madrasah: e.target.value })} />
              <Input label="NIP Kepala" value={form.nip_kepala} onChange={e => setForm({ ...form, nip_kepala: e.target.value })} />
              <Input label="Tahun Pelajaran" value={form.tahun_pelajaran} onChange={e => setForm({ ...form, tahun_pelajaran: e.target.value })} />
              <Select label="Semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} options={SEMESTER} />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState message="Belum ada data madrasah. Klik Tambah untuk menambahkan." icon="🏫" />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">No</th>
                  <th className="text-left px-4 py-3 font-medium">Nama Madrasah</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Jenjang</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Kepala</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Tahun Pelajaran</th>
                  <th className="text-right px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{d.nama_madrasah}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{d.jenjang}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{d.kepala_madrasah || '-'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{d.tahun_pelajaran || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Hapus Madrasah" message="Data yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function Input({ label, value, onChange, required, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label>
      <input type={type} value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}