import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/UI'
import { JENJANG, JENIS_KOKURIKULER, TEMA_KOKURIKULER } from '../lib/constants'
import { formatDate } from '../lib/utils'
import { Eye, Edit, Link } from 'lucide-react'

export default function Asesmen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const { data: d } = await sb
        .from('perencanaan_kokurikuler')
        .select('*')
        .order('created_at', { ascending: false })
      setData(d || [])
    } catch { }
    setLoading(false)
  }

  const filtered = data.filter(d => {
    const q = search.toLowerCase()
    return (
      d.nama_kegiatan?.toLowerCase().includes(q) ||
      d.tema_kegiatan?.toLowerCase().includes(q) ||
      d.jenis_kokurikuler?.toLowerCase().includes(q) ||
      d.jenjang?.toLowerCase().includes(q) ||
      d.kelas?.toLowerCase().includes(q)
    )
  })

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Asesmen & Rubrik" subtitle="Lihat rubrik dan lembar observasi perencanaan kokurikuler" />

      <div className="mb-4">
        <input type="text" placeholder="Cari kegiatan..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg text-sm w-full max-w-md focus:ring-2 focus:ring-green-500 outline-none" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Belum ada perencanaan kokurikuler." icon="📋" />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">No</th>
                  <th className="text-left px-4 py-3">Nama Kegiatan</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Jenis</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Jenjang/Kelas</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Dibuat</th>
                  <th className="text-right px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{d.nama_kegiatan || '-'}</td>
                    <td className="px-4 py-3 hidden md:table-cell max-w-[200px] truncate">{d.jenis_kokurikuler || '-'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{d.jenjang || '-'}{d.kelas ? ` / ${d.kelas}` : ''}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/preview/${d.id}?tab=asesmen`)}
                          className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 flex items-center gap-1"
                        >
                          <Eye size={12} /> Lihat
                        </button>
                        <button
                          onClick={() => navigate(`/generator/${d.id}`)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 flex items-center gap-1"
                        >
                          <Edit size={12} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}