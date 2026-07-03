import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/UI'
import { generateDeskripsiPelaporan } from '../lib/utils'
import { DIMENSI_PROFIL, PANCA_CINTA } from '../lib/constants'
import { Search, FileText, Users, Printer, RefreshCw } from 'lucide-react'

export default function Pelaporan() {
  const { user } = useAuth()
  const [perencanaan, setPerencanaan] = useState([])
  const [murid, setMurid] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [deskripsiMurid, setDeskripsiMurid] = useState([])
  const [deskripsiKelas, setDeskripsiKelas] = useState('')
  const [tab, setTab] = useState('murid')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const [{ data: p }, { data: m }] = await Promise.all([
        sb.from('perencanaan_kokurikuler').select('*').order('created_at', { ascending: false }),
        sb.from('murid').select('*').order('nama_murid'),
      ])
      setPerencanaan(p || [])
      setMurid(m || [])
    } catch { }
    setLoading(false)
  }

  function handleGenerateMurid() {
    if (!selected) return
    const p = perencanaan.find(d => d.id === selected)
    const dim = safeParse(p?.dimensi)
    const pc = safeParse(p?.panca_cinta)
    const filtered = murid.filter(m => {
      const q = search.toLowerCase()
      return !q || m.nama_murid?.toLowerCase().includes(q) || m.kelas?.toLowerCase().includes(q) || m.jenjang?.toLowerCase().includes(q)
    })
    const desk = filtered.map(m => ({
      id: m.id,
      nama: m.nama_murid,
      kelas: m.kelas,
      deskripsi: generateDeskripsiPelaporan(m.nama_murid, dim, pc, p?.nama_kegiatan),
    }))
    setDeskripsiMurid(desk)
    setTab('murid')
  }

  function handleGenerateKelas() {
    if (!selected) return
    const p = perencanaan.find(d => d.id === selected)
    const dim = safeParse(p?.dimensi)
    const pc = safeParse(p?.panca_cinta)
    const filtered = murid.filter(m => {
      const q = search.toLowerCase()
      return !q || m.nama_murid?.toLowerCase().includes(q) || m.kelas?.toLowerCase().includes(q) || m.jenjang?.toLowerCase().includes(q)
    })
    const allDesk = filtered.map(m =>
      generateDeskripsiPelaporan(m.nama_murid, dim, pc, p?.nama_kegiatan)
    ).join('\n\n---\n\n')
    setDeskripsiKelas(allDesk)
    setTab('kelas')
  }

  function safeParse(v) {
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return [] }
  }

  const selectedData = perencanaan.find(p => p.id === selected)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Pelaporan Hasil" subtitle="Generate deskripsi laporan hasil kokurikuler per murid atau satu kelas" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Pilih Perencanaan</h3>
          <select
            value={selected || ''}
            onChange={e => { setSelected(e.target.value || null); setDeskripsiMurid([]); setDeskripsiKelas('') }}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none mb-3"
          >
            <option value="">-- Pilih Perencanaan --</option>
            {perencanaan.map(p => (
              <option key={p.id} value={p.id}>{p.nama_kegiatan || 'Tanpa Nama'} ({p.jenjang || '-'})</option>
            ))}
          </select>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Filter murid (nama/kelas)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleGenerateMurid}
              disabled={!selected}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users size={14} /> Generate Deskripsi Per Murid
            </button>
            <button
              onClick={handleGenerateKelas}
              disabled={!selected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={14} /> Generate Deskripsi Satu Kelas
            </button>
          </div>

          {selectedData && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
              <p className="font-medium text-gray-700">{selectedData.nama_kegiatan}</p>
              <p className="text-gray-500 mt-1">Jenjang: {selectedData.jenjang || '-'} | Kelas: {selectedData.kelas || '-'}</p>
              <p className="text-gray-500">Tema: {selectedData.tema_kegiatan || '-'}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Pilih perencanaan terlebih dahulu, lalu klik tombol Generate.</p>
            </div>
          ) : deskripsiMurid.length === 0 && !deskripsiKelas ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <RefreshCw size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Klik "Generate" untuk membuat deskripsi.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setTab('murid')}
                  className={`px-4 py-2 text-sm font-medium ${tab === 'murid' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Per Murid ({deskripsiMurid.length})
                </button>
                <button
                  onClick={() => setTab('kelas')}
                  className={`px-4 py-2 text-sm font-medium ${tab === 'kelas' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                  disabled={!deskripsiKelas}
                >
                  Satu Kelas
                </button>
              </div>

              <div className="p-4">
                {tab === 'murid' ? (
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {deskripsiMurid.map(m => (
                      <div key={m.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-800">{m.nama}</span>
                          <span className="text-xs text-gray-400">{m.kelas || '-'}</span>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{m.deskripsi}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{deskripsiKelas}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"
                  >
                    <Printer size={14} /> Cetak
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}