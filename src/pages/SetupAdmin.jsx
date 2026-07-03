import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { APP_NAME } from '../lib/constants'

export default function SetupAdmin() {
  const [form, setForm] = useState({ nama_lengkap: '', username: '', password: '', confirmPassword: '', nama_madrasah: '', nomor_hp: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasAdmin, setHasAdmin] = useState(null)
  const { setupAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const sb = getSupabase()
      sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'Admin').then(({ count }) => {
        setHasAdmin(count > 0)
        if (count > 0) navigate('/login')
      })
    } catch { setHasAdmin(false) }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    if (!form.nama_lengkap || !form.username || !form.password) return setMsg('Semua field wajib diisi.')
    if (form.password !== form.confirmPassword) return setMsg('Password dan konfirmasi password tidak sama.')
    if (form.password.length < 6) return setMsg('Password minimal 6 karakter.')
    setLoading(true)
    try {
      await setupAdmin(form)
      navigate('/')
    } catch (err) {
      setMsg(err.message)
    }
    setLoading(false)
  }

  if (hasAdmin === null) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🕌</div>
          <h1 className="text-lg font-bold text-green-800">{APP_NAME}</h1>
          <p className="text-sm text-gray-500 mt-1">Setup Admin Utama</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            Selamat datang! Silakan buat akun Admin pertama untuk memulai aplikasi. Admin tidak memerlukan kode aktivasi.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Admin</label>
                <input type="text" value={form.nama_lengkap} onChange={e => setForm({ ...form, nama_lengkap: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                  <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Madrasah/Instansi</label>
                <input type="text" value={form.nama_madrasah} onChange={e => setForm({ ...form, nama_madrasah: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nomor HP</label>
                <input type="text" value={form.nomor_hp} onChange={e => setForm({ ...form, nomor_hp: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50">{loading ? 'Membuat Admin...' : 'Buat Admin'}</button>
            </div>
          </form>
          {msg && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{msg}</div>}
        </div>
      </div>
    </div>
  )
}