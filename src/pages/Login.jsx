import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { APP_NAME, APP_SUBTITLE } from '../lib/constants'

export default function Login() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', nama_lengkap: '', confirmPassword: '', nama_madrasah: '', nomor_hp: '', email: '', kode_aktivasi: '' })
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [hasAdmin, setHasAdmin] = useState(null)
  const { login, aktivasi } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const sb = getSupabase()
      sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'Admin').then(({ count }) => setHasAdmin(count > 0))
    } catch { setHasAdmin(false) }
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setMsg({ text: '', type: '' })
    if (!form.username || !form.password) return setMsg({ text: 'Username dan password wajib diisi.', type: 'error' })
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setMsg({ text: err.message, type: 'error' })
    }
    setLoading(false)
  }

  async function handleAktivasi(e) {
    e.preventDefault()
    setMsg({ text: '', type: '' })
    if (!form.nama_lengkap || !form.username || !form.password) return setMsg({ text: 'Semua field wajib diisi.', type: 'error' })
    if (form.password !== form.confirmPassword) return setMsg({ text: 'Password dan konfirmasi password tidak sama.', type: 'error' })
    if (!form.kode_aktivasi) return setMsg({ text: 'Kode aktivasi wajib diisi.', type: 'error' })
    setLoading(true)
    try {
      await aktivasi(form)
      navigate('/')
    } catch (err) {
      setMsg({ text: err.message, type: 'error' })
    }
    setLoading(false)
  }

  if (hasAdmin === null) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🕌</div>
          <h1 className="text-lg font-bold text-green-800 leading-tight">{APP_NAME}</h1>
          <p className="text-sm text-gray-500 mt-1">{APP_SUBTITLE}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex mb-6 border rounded-lg overflow-hidden">
            <button onClick={() => setTab('login')} className={`flex-1 py-2 text-sm font-medium ${tab === 'login' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600'}`}>Login</button>
            <button onClick={() => setTab('aktivasi')} className={`flex-1 py-2 text-sm font-medium ${tab === 'aktivasi' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600'}`}>Aktivasi Baru</button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Masukkan username" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Masukkan password" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50">{loading ? 'Memproses...' : 'Masuk'}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAktivasi}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" value={form.nama_lengkap} onChange={e => setForm({ ...form, nama_lengkap: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nama lengkap" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Username" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Password" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                    <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ulangi password" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Madrasah</label>
                  <input type="text" value={form.nama_madrasah} onChange={e => setForm({ ...form, nama_madrasah: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nama madrasah/instansi" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nomor HP</label>
                    <input type="text" value={form.nomor_hp} onChange={e => setForm({ ...form, nomor_hp: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nomor HP" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Email (opsional)" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kode Aktivasi</label>
                  <input type="text" value={form.kode_aktivasi} onChange={e => setForm({ ...form, kode_aktivasi: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none font-mono" placeholder="PKMG-XXXX-XXXX" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-2.5 bg-yellow-500 text-white rounded-lg font-medium text-sm hover:bg-yellow-600 disabled:opacity-50">{loading ? 'Memproses...' : 'Aktivasi dan Masuk'}</button>
              </div>
            </form>
          )}

          {msg.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {msg.text}
            </div>
          )}

          {!hasAdmin && tab === 'aktivasi' && (
            <p className="text-xs text-yellow-600 text-center mt-4">Admin belum terdaftar. <button onClick={() => navigate('/setup')} className="underline font-medium">Setup Admin Utama</button></p>
          )}
        </div>
      </div>
    </div>
  )
}