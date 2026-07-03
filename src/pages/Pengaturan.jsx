import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, ConfirmModal } from '../components/UI'
import { verifyPassword, hashPassword } from '../lib/utils'
import { Save, AlertTriangle, Key, User } from 'lucide-react'

export default function Pengaturan() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState({
    nama_lengkap: user.nama_lengkap || '',
    nomor_hp: user.nomor_hp || '',
    email: user.email || '',
  })
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [showPassForm, setShowPassForm] = useState(false)

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const sb = getSupabase()
      const { error } = await sb.from('profiles').update({
        nama_lengkap: profile.nama_lengkap,
        nomor_hp: profile.nomor_hp,
        email: profile.email,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
      if (error) throw new Error(error.message)
      setUser({ ...user, ...profile })
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    setSaving(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setMessage(null)
    if (password.newPass !== password.confirm) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak sama.' })
      return
    }
    if (password.newPass.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' })
      return
    }

    try {
      // Verify current password
      if (!verifyPassword(password.current, user.password_hash)) {
        setMessage({ type: 'error', text: 'Password saat ini salah.' })
        return
      }

      const sb = getSupabase()
      const newHash = hashPassword(password.newPass)
      const { error } = await sb.from('profiles').update({
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
      if (error) throw new Error(error.message)
      setPassword({ current: '', newPass: '', confirm: '' })
      setShowPassForm(false)
      setMessage({ type: 'success', text: 'Password berhasil diubah.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleResetData() {
    if (resetConfirmText !== 'RESET') {
      setMessage({ type: 'error', text: 'Ketik RESET untuk konfirmasi.' })
      return
    }
    try {
      const sb = getSupabase()
      const tables = ['analisis_madrasah', 'bank_tema', 'catatan_pengawas', 'evaluasi', 'guru', 'murid', 'perencanaan_kokurikuler', 'tim_kokurikuler', 'activation_codes', 'activation_code_usage']
      for (const table of tables) {
        await sb.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      }
      setShowResetConfirm(false)
      setResetConfirmText('')
      setMessage({ type: 'success', text: 'Semua data berhasil direset. Data user tetap dipertahankan.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Kelola profil dan pengaturan akun" />

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-green-600" />
            <h3 className="font-semibold text-gray-800">Profil</h3>
          </div>
          <form onSubmit={handleSaveProfile}>
            <div className="space-y-3">
              <FInput label="Nama Lengkap" value={profile.nama_lengkap} onChange={e => setProfile({ ...profile, nama_lengkap: e.target.value })} />
              <FInput label="Nomor HP" value={profile.nomor_hp} onChange={e => setProfile({ ...profile, nomor_hp: e.target.value })} />
              <FInput label="Email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
              <FInput label="Username" value={user.username || ''} disabled />
              <FInput label="Role" value={user.role || ''} disabled />
            </div>
            <div className="mt-4">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700 disabled:opacity-50">
                <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-yellow-600" />
            <h3 className="font-semibold text-gray-800">Ubah Password</h3>
          </div>
          {!showPassForm ? (
            <button onClick={() => setShowPassForm(true)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              Ubah Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="space-y-3">
                <FInput label="Password Saat Ini" type="password" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} required />
                <FInput label="Password Baru" type="password" value={password.newPass} onChange={e => setPassword({ ...password, newPass: e.target.value })} required />
                <FInput label="Konfirmasi Password Baru" type="password" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} required />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-yellow-700">
                  <Save size={14} /> Simpan Password
                </button>
                <button type="button" onClick={() => { setShowPassForm(false); setPassword({ current: '', newPass: '', confirm: '' }) }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Reset Data (Admin Only) */}
      {user.role === 'Admin' && (
        <div className="mt-6 bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-semibold text-red-800">Reset Data (Admin Only)</h3>
          </div>
          <p className="text-sm text-red-600 mb-3">
            Menghapus SEMUA data (perencanaan, guru, murid, evaluasi, tim, analisis, kode aktivasi). Data user/login tetap dipertahankan. Tindakan ini TIDAK DAPAT DIBATALKAN.
          </p>
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-red-700">
              <AlertTriangle size={14} /> Reset Semua Data
            </button>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Ketik <strong>RESET</strong> untuk konfirmasi:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={e => setResetConfirmText(e.target.value)}
                  placeholder="RESET"
                  className="px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
                <button onClick={handleResetData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  Hapus Semua
                </button>
                <button onClick={() => { setShowResetConfirm(false); setResetConfirmText('') }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FInput({ label, value, onChange, type = 'text', disabled = false, required = false }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} disabled={disabled} required={required} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none ${disabled ? 'bg-gray-100 text-gray-500' : ''}`} />
    </div>
  )
}