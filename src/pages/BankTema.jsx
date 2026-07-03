import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { TEMA_KOKURIKULER } from '../lib/constants'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function BankTema() {
  const { user } = useAuth()
  const [customTema, setCustomTema] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [newTema, setNewTema] = useState('')
  const [search, setSearch] = useState('')
  const allTema = [...TEMA_KOKURIKULER.map((t, i) => ({ id: `default-${i}`, nama_tema: t, isDefault: true })), ...customTema]

  useEffect(() => { loadCustom() }, [])

  async function loadCustom() {
    try {
      const sb = getSupabase()
      const { data } = await sb.from('bank_tema').select('*').order('created_at', { ascending: false })
      setCustomTema(data || [])
    } catch { }
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!newTema.trim()) return alert('Nama tema wajib diisi.')
    const sb = getSupabase()
    if (editing) {
      await sb.from('bank_tema').update({ nama_tema: newTema.trim(), updated_at: new Date().toISOString() }).eq('id', editing.id)
    } else {
      await sb.from('bank_tema').insert({ nama_tema: newTema.trim(), created_by: user.id, created_at: new Date().toISOString() })
    }
    setShowForm(false); setEditing(null); setNewTema(''); loadCustom()
  }

  async function handleDelete() {
    if (!deleteId) return
    const sb = getSupabase()
    await sb.from('bank_tema').delete().eq('id', deleteId)
    setDeleteId(null); loadCustom()
  }

  function openEdit(d) {
    setNewTema(d.nama_tema)
    setEditing(d)
    setShowForm(true)
  }

  const filtered = allTema.filter(t => t.nama_tema.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Bank Tema Kokurikuler" subtitle={`${allTema.length} tema tersedia (${TEMA_KOKURIKULER.length} default, ${customTema.length} kustom)`}>
        <button onClick={() => { setNewTema(''); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
          <Plus size={16} /> Tema Kustom
        </button>
      </PageHeader>

      <div className="mb-4">
        <input type="text" placeholder="Cari tema..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-green-500 outline-none" />
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Tambah'} Tema Kustom</h3>
          <form onSubmit={handleSave}>
            <FInput label="Nama Tema" required value={newTema} onChange={e => setNewTema(e.target.value)} />
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setNewTema('') }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message="Tidak ada tema yang ditemukan." icon="📚" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((t) => (
            <div key={t.id} className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${t.isDefault ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm truncate">{t.nama_tema}</h3>
                  <p className={`text-xs mt-1 ${t.isDefault ? 'text-green-600' : 'text-yellow-600'}`}>
                    {t.isDefault ? 'Default' : 'Kustom'}
                  </p>
                </div>
                {!t.isDefault && (
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button onClick={() => openEdit(t)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                    <button onClick={() => setDeleteId(t.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Hapus Tema" message="Tema kustom yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function FInput({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label>
      <input type="text" value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
    </div>
  )
}