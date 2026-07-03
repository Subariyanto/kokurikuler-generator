import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmModal } from '../components/UI'
import { generateKodeAktivasi, formatDate, formatDateTime, downloadCSV } from '../lib/utils'
import { ROLES } from '../lib/constants'
import { Plus, Edit, Trash2, Save, X, Copy, Download, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react'

export default function KodeAktivasi() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [singleCode, setSingleCode] = useState('')
  const [copied, setCopied] = useState(null)
  const [filters, setFilters] = useState({ role: '', status: '' })
  const [form, setForm] = useState(initForm())

  function initForm(d = {}) {
    return {
      nama_paket: d.nama_paket || '',
      role_tujuan: d.role_tujuan || 'Koordinator Kokurikuler',
      jumlah: d.jumlah || 1,
      tanggal_mulai: d.tanggal_mulai || '',
      tanggal_kedaluwarsa: d.tanggal_kedaluwarsa || '',
      status: d.status || 'Aktif',
      jenis_penggunaan: d.jenis_penggunaan || 'Sekali Pakai',
      batas_maksimal_penggunaan: d.batas_maksimal_penggunaan || 1,
      nama_madrasah_tujuan: d.nama_madrasah_tujuan || '',
      catatan: d.catatan || '',
    }
  }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const sb = getSupabase()
      const { data: d } = await sb.from('activation_codes').select('*').order('created_at', { ascending: false })
      setData(d || [])
    } catch { }
    setLoading(false)
  }

  function handleGenerateSingle() {
    setSingleCode(generateKodeAktivasi())
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nama_paket) return alert('Nama paket wajib diisi.')
    const sb = getSupabase()
    if (editing) {
      const payload = {
        nama_paket: form.nama_paket,
        role_tujuan: form.role_tujuan,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_kedaluwarsa: form.tanggal_kedaluwarsa || null,
        status: form.status,
        jenis_penggunaan: form.jenis_penggunaan,
        batas_maksimal_penggunaan: form.batas_maksimal_penggunaan,
        nama_madrasah_tujuan: form.nama_madrasah_tujuan,
        catatan: form.catatan,
        updated_at: new Date().toISOString(),
      }
      await sb.from('activation_codes').update(payload).eq('id', editing.id)
      setShowForm(false); setEditing(null); loadData()
    } else {
      // Generate batch
      const codes = []
      for (let i = 0; i < (parseInt(form.jumlah) || 1); i++) {
        codes.push({
          kode: generateKodeAktivasi(),
          nama_paket: form.nama_paket,
          role_tujuan: form.role_tujuan,
          tanggal_mulai: form.tanggal_mulai || null,
          tanggal_kedaluwarsa: form.tanggal_kedaluwarsa || null,
          status: 'Aktif',
          jenis_penggunaan: form.jenis_penggunaan,
          batas_maksimal_penggunaan: parseInt(form.batas_maksimal_penggunaan) || 1,
          nama_madrasah_tujuan: form.nama_madrasah_tujuan,
          catatan: form.catatan,
          jumlah_terpakai: 0,
          created_by: user.id,
          created_at: new Date().toISOString(),
        })
      }
      const { error } = await sb.from('activation_codes').insert(codes)
      if (error) { alert(error.message); return }
      setShowForm(false); setEditing(null); loadData()
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const sb = getSupabase()
    await sb.from('activation_codes').delete().eq('id', deleteId)
    setDeleteId(null); loadData()
  }

  async function handleToggleStatus(row) {
    const sb = getSupabase()
    const newStatus = row.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
    await sb.from('activation_codes').update({ status: newStatus }).eq('id', row.id)
    loadData()
  }

  function handleCopy(kode) {
    navigator.clipboard.writeText(kode).then(() => {
      setCopied(kode)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function handleExportCSV() {
    const headers = ['Kode', 'Nama Paket', 'Role', 'Status', 'Jenis', 'Terpakai', 'Maks', 'Tgl Mulai', 'Tgl Kedaluwarsa', 'Dibuat']
    const rows = filtered.map(d => [
      d.kode,
      d.nama_paket || '',
      d.role_tujuan || '',
      d.status || '',
      d.jenis_penggunaan || '',
      d.jumlah_terpakai || 0,
      d.batas_maksimal_penggunaan || 1,
      d.tanggal_mulai || '',
      d.tanggal_kedaluwarsa || '',
      formatDateTime(d.created_at),
    ])
    downloadCSV(headers, rows, 'kode_aktivasi.csv')
  }

  const filtered = data.filter(d => {
    return (!filters.role || d.role_tujuan === filters.role) &&
      (!filters.status || d.status === filters.status)
  })

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Kode Aktivasi" subtitle="Generate dan kelola kode aktivasi">
        <button onClick={() => { setForm(initForm()); setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
          <Plus size={16} /> Generate Kode
        </button>
        <button onClick={handleExportCSV} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50">
          <Download size={16} /> Export CSV
        </button>
      </PageHeader>

      {/* Single Code Generator */}
      <div className="bg-white rounded-xl border p-4 mb-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">Generate Kode Tunggal</h3>
        <div className="flex items-center gap-2">
          <input type="text" value={singleCode} readOnly placeholder="Klik Generate..." className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 font-mono" />
          <button onClick={handleGenerateSingle} className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-yellow-600">
            <RefreshCw size={14} /> Generate
          </button>
          {singleCode && (
            <button onClick={() => handleCopy(singleCode)} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50">
              {copied === singleCode ? '✓ Tersalin' : <><Copy size={14} /> Salin</>}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit' : 'Generate'} Kode Aktivasi</h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <FInput label="Nama Paket" required value={form.nama_paket} onChange={e => setForm({ ...form, nama_paket: e.target.value })} placeholder="Contoh: Paket Guru Batch 1" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role Tujuan</label>
                <select value={form.role_tujuan} onChange={e => setForm({ ...form, role_tujuan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="Koordinator Kokurikuler">Koordinator Kokurikuler</option>
                </select>
              </div>
              {!editing && <FInput label="Jumlah Kode" type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: parseInt(e.target.value) || 1 })} min="1" max="1000" />}
              <FInput label="Tanggal Mulai" type="date" value={form.tanggal_mulai} onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })} />
              <FInput label="Tanggal Kedaluwarsa" type="date" value={form.tanggal_kedaluwarsa} onChange={e => setForm({ ...form, tanggal_kedaluwarsa: e.target.value })} />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Penggunaan</label>
                <select value={form.jenis_penggunaan} onChange={e => setForm({ ...form, jenis_penggunaan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="Sekali Pakai">Sekali Pakai</option>
                  <option value="Bisa Dipakai Beberapa Kali">Bisa Dipakai Beberapa Kali</option>
                </select>
              </div>
              <FInput label="Batas Maksimal Penggunaan" type="number" value={form.batas_maksimal_penggunaan} onChange={e => setForm({ ...form, batas_maksimal_penggunaan: parseInt(e.target.value) || 1 })} min="1" />
              <FInput label="Nama Madrasah Tujuan" value={form.nama_madrasah_tujuan} onChange={e => setForm({ ...form, nama_madrasah_tujuan: e.target.value })} placeholder="Opsional" />
              {editing && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              )}
            </div>
            <FTextarea label="Catatan" value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} placeholder="Opsional" />
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"><Save size={16} /> {editing ? 'Simpan' : 'Generate Batch'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"><X size={16} /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })} className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
          <option value="">Semua Role</option>
          <option value="Koordinator Kokurikuler">Koordinator Kokurikuler</option>
        </select>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Belum ada kode aktivasi." icon="🔑" />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">No</th>
                  <th className="text-left px-3 py-2">Kode</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Paket</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Role</th>
                  <th className="text-center px-3 py-2">Status</th>
                  <th className="text-center px-3 py-2 hidden lg:table-cell">Pakai</th>
                  <th className="text-left px-3 py-2 hidden xl:table-cell">Kedaluwarsa</th>
                  <th className="text-right px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs">{d.kode}</td>
                    <td className="px-3 py-2 hidden md:table-cell max-w-[120px] truncate">{d.nama_paket || '-'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{d.role_tujuan || '-'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {d.status || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center hidden lg:table-cell text-xs">
                      {d.jumlah_terpakai || 0}/{d.jenis_penggunaan === 'Sekali Pakai' ? 1 : (d.batas_maksimal_penggunaan || '∞')}
                    </td>
                    <td className="px-3 py-2 hidden xl:table-cell text-xs text-gray-500">{d.tanggal_kedaluwarsa ? formatDate(d.tanggal_kedaluwarsa) : '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-0.5 justify-end">
                        <button onClick={() => handleCopy(d.kode)} className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="Salin">
                          {copied === d.kode ? <span className="text-green-600 text-xs">✓</span> : <Copy size={14} />}
                        </button>
                        <button onClick={() => handleToggleStatus(d)} className="p-1 hover:bg-gray-100 rounded" title={d.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}>
                          {d.status === 'Aktif' ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} className="text-gray-400" />}
                        </button>
                        <button onClick={() => { setForm(initForm(d)); setEditing(d); setShowForm(true) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Hapus Kode" message="Kode yang dihapus tidak dapat dikembalikan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function FInput({ label, value, onChange, required, type = 'text', placeholder, min, max }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label} {required && '*'}</label>
      <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} min={min} max={max} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
    </div>
  )
}

function FTextarea({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea rows={2} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
    </div>
  )
}