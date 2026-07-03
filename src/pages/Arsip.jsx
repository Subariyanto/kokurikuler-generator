import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { JENJANG, JENIS_KOKURIKULER, TEMA_KOKURIKULER, STATUS_DOKUMEN } from '../lib/constants'
import { formatDate } from '../lib/utils'
import { Search, Eye, Edit, Copy, Printer, Trash2 } from 'lucide-react'

export default function Arsip() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    jenjang: '',
    kelas: '',
    tema: '',
    jenis: '',
    guru: '',
    tahun: '',
    status: '',
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const { data: d } = await sb.from('perencanaan_kokurikuler').select('*').order('created_at', { ascending: false })
      setData(d || [])
    } catch { }
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    const sb = getSupabase()
    await sb.from('perencanaan_kokurikuler').delete().eq('id', deleteId)
    setDeleteId(null); loadData()
  }

  async function handleDuplicate(row) {
    const sb = getSupabase()
    const { id, created_at, updated_at, ...rest } = row
    await sb.from('perencanaan_kokurikuler').insert({
      ...rest,
      status: 'Draft',
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    loadData()
  }

  const filtered = data.filter(d => {
    const q = filters.search.toLowerCase()
    return (
      (!q || d.nama_kegiatan?.toLowerCase().includes(q) || d.tema_kegiatan?.toLowerCase().includes(q)) &&
      (!filters.jenjang || d.jenjang === filters.jenjang) &&
      (!filters.kelas || d.kelas?.toLowerCase().includes(filters.kelas.toLowerCase())) &&
      (!filters.tema || d.tema_kegiatan === filters.tema) &&
      (!filters.jenis || d.jenis_kokurikuler === filters.jenis) &&
      (!filters.guru || d.nama_guru?.toLowerCase().includes(filters.guru.toLowerCase())) &&
      (!filters.tahun || d.tahun_pelajaran === filters.tahun) &&
      (!filters.status || d.status === filters.status)
    )
  })

  function clearFilters() {
    setFilters({ search: '', jenjang: '', kelas: '', tema: '', jenis: '', guru: '', tahun: '', status: '' })
  }

  const hasFilter = Object.values(filters).some(v => v)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Arsip Dokumen" subtitle="Semua perencanaan kokurikuler" />

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
          <div className="col-span-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama/tema kegiatan..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
          <select value={filters.jenjang} onChange={e => setFilters({ ...filters, jenjang: e.target.value })} className="px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500 outline-none">
            <option value="">Semua Jenjang</option>
            {JENJANG.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          <select value={filters.jenis} onChange={e => setFilters({ ...filters, jenis: e.target.value })} className="px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500 outline-none">
            <option value="">Semua Jenis</option>
            {JENIS_KOKURIKULER.map(j => <option key={j} value={j}>{j.length > 30 ? j.substring(0, 30) + '...' : j}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500 outline-none">
            <option value="">Semua Status</option>
            {STATUS_DOKUMEN.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter kelas..."
            value={filters.kelas}
            onChange={e => setFilters({ ...filters, kelas: e.target.value })}
            className="px-2 py-1.5 border rounded-lg text-xs w-28 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <input
            type="text"
            placeholder="Filter guru..."
            value={filters.guru}
            onChange={e => setFilters({ ...filters, guru: e.target.value })}
            className="px-2 py-1.5 border rounded-lg text-xs w-36 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <input
            type="text"
            placeholder="Tahun..."
            value={filters.tahun}
            onChange={e => setFilters({ ...filters, tahun: e.target.value })}
            className="px-2 py-1.5 border rounded-lg text-xs w-24 focus:ring-2 focus:ring-green-500 outline-none"
          />
          {hasFilter && (
            <button onClick={clearFilters} className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
              Bersihkan
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={hasFilter ? 'Tidak ada hasil dengan filter ini.' : 'Belum ada dokumen.'} icon="📁" />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">No</th>
                  <th className="text-left px-3 py-2">Nama Kegiatan</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Jenjang</th>
                  <th className="text-left px-3 py-2 hidden lg:table-cell">Tema</th>
                  <th className="text-left px-3 py-2 hidden lg:table-cell">Jenis</th>
                  <th className="text-left px-3 py-2 hidden xl:table-cell">Status</th>
                  <th className="text-left px-3 py-2 hidden xl:table-cell">Tanggal</th>
                  <th className="text-right px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium max-w-[180px] truncate">{d.nama_kegiatan || '-'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{d.jenjang || '-'}{d.kelas ? ` / ${d.kelas}` : ''}</td>
                    <td className="px-3 py-2 hidden lg:table-cell max-w-[150px] truncate">{d.tema_kegiatan || '-'}</td>
                    <td className="px-3 py-2 hidden lg:table-cell max-w-[150px] truncate">{d.jenis_kokurikuler || '-'}</td>
                    <td className="px-3 py-2 hidden xl:table-cell">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-3 py-2 hidden xl:table-cell text-gray-500 text-xs">{formatDate(d.created_at)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-0.5 justify-end">
                        <button onClick={() => navigate(`/preview/${d.id}`)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Lihat"><Eye size={14} /></button>
                        <button onClick={() => navigate(`/generator/${d.id}`)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={14} /></button>
                        <button onClick={() => handleDuplicate(d)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Duplikat"><Copy size={14} /></button>
                        <button onClick={() => navigate(`/preview/${d.id}?print=1`)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded" title="Cetak"><Printer size={14} /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Hapus Dokumen" message="Dokumen yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Selesai': 'bg-green-100 text-green-700',
    'Disetujui': 'bg-blue-100 text-blue-700',
    'Perlu Revisi': 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.Draft}`}>{status || 'Draft'}</span>
}