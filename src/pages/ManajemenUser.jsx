import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/UI'
import { ROLES } from '../lib/constants'
import { formatDateTime } from '../lib/utils'
import { Search, Save, X } from 'lucide-react'

export default function ManajemenUser() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ role: '', status_user: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const { data: d } = await sb.from('profiles').select('*').order('created_at', { ascending: false })
      setData(d || [])
    } catch { }
    setLoading(false)
  }

  async function handleSaveEdit() {
    if (!editing) return
    try {
      const sb = getSupabase()
      await sb.from('profiles').update({
        role: editForm.role,
        status_user: editForm.status_user,
        updated_at: new Date().toISOString(),
      }).eq('id', editing.id)
      setEditing(null)
      loadData()
    } catch (err) { alert(err.message) }
  }

  const filtered = data.filter(d => {
    const q = search.toLowerCase()
    return !q || d.nama_lengkap?.toLowerCase().includes(q) || d.username?.toLowerCase().includes(q)
  })

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Manajemen User" subtitle="Kelola pengguna (Admin only)" />

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Tidak ada pengguna ditemukan." icon="👤" />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">No</th>
                  <th className="text-left px-3 py-2">Nama Lengkap</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Username</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Role</th>
                  <th className="text-center px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2 hidden lg:table-cell">Madrasah</th>
                  <th className="text-left px-3 py-2 hidden xl:table-cell">Login Terakhir</th>
                  <th className="text-right px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{d.nama_lengkap || '-'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-gray-500">{d.username || '-'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      {editing?.id === d.id ? (
                        <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-green-500 outline-none">
                          <option value="Admin">Admin</option>
                          <option value="Koordinator Kokurikuler">Koordinator Kokurikuler</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs">{d.role || '-'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {editing?.id === d.id ? (
                        <select value={editForm.status_user} onChange={e => setEditForm({ ...editForm, status_user: e.target.value })} className="px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-green-500 outline-none">
                          <option value="Aktif">Aktif</option>
                          <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status_user === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {d.status_user || 'Aktif'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell max-w-[150px] truncate">{d.nama_madrasah || '-'}</td>
                    <td className="px-3 py-2 hidden xl:table-cell text-xs text-gray-500">{d.terakhir_login ? formatDateTime(d.terakhir_login) : '-'}</td>
                    <td className="px-3 py-2 text-right">
                      {editing?.id === d.id ? (
                        <div className="flex gap-1 justify-end">
                          <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Simpan"><Save size={14} /></button>
                          <button onClick={() => setEditing(null)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Batal"><X size={14} /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditing(d); setEditForm({ role: d.role, status_user: d.status_user }) }}
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        Total: {data.length} pengguna | Aktif: {data.filter(d => d.status_user === 'Aktif').length} | Tidak Aktif: {data.filter(d => d.status_user === 'Tidak Aktif').length}
      </div>
    </div>
  )
}