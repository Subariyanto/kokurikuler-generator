import { createContext, useContext, useState, useEffect } from 'react'
import { getSupabase } from '../lib/supabase'
import { verifyPassword, hashPassword, generateKodeAktivasi } from '../lib/utils'

const AuthContext = createContext(null)

const STORAGE_KEY = 'kokurikuler_gen_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch { }
    setLoading(false)
  }, [])

  function saveUser(u) {
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  async function login(username, password) {
    const sb = getSupabase()
    const { data, error } = await sb.from('profiles').select('*').eq('username', username).single()
    if (error || !data) throw new Error('Username tidak ditemukan.')
    if (data.status_user === 'Tidak Aktif') throw new Error('Akun dinonaktifkan. Hubungi Admin.')
    if (!verifyPassword(password, data.password_hash)) throw new Error('Password salah.')
    const u = { id: data.id, nama_lengkap: data.nama_lengkap, username: data.username, role: data.role, nama_madrasah: data.nama_madrasah, nomor_hp: data.nomor_hp, email: data.email, password_hash: data.password_hash }
    saveUser(u)
    await sb.from('profiles').update({ terakhir_login: new Date().toISOString() }).eq('id', data.id)
  }

  async function aktivasi(form) {
    const sb = getSupabase()
    // Check activation code
    const { data: code, error: codeErr } = await sb.from('activation_codes').select('*').eq('kode', form.kode_aktivasi).single()
    if (codeErr || !code) throw new Error('Kode aktivasi tidak ditemukan.')
    if (code.status !== 'Aktif') throw new Error('Kode aktivasi sudah tidak aktif.')
    if (code.tanggal_kedaluwarsa && new Date(code.tanggal_kedaluwarsa) < new Date()) throw new Error('Kode aktivasi sudah kedaluwarsa.')
    if (code.jenis_penggunaan === 'Sekali Pakai' && code.jumlah_terpakai >= 1) throw new Error('Kode aktivasi sudah digunakan.')
    if (code.jenis_penggunaan === 'Bisa Dipakai Beberapa Kali' && code.jumlah_terpakai >= (code.batas_maksimal_penggunaan || 1)) throw new Error('Batas penggunaan kode aktivasi sudah tercapai.')

    // Check username uniqueness
    const { data: existing } = await sb.from('profiles').select('id').eq('username', form.username).single()
    if (existing) throw new Error('Username sudah digunakan.')

    // Create profile
    const { data: profile, error: insertErr } = await sb.from('profiles').insert({
      nama_lengkap: form.nama_lengkap,
      username: form.username,
      password_hash: hashPassword(form.password),
      role: 'Koordinator Kokurikuler',
      nama_madrasah: form.nama_madrasah || '',
      nomor_hp: form.nomor_hp || '',
      email: form.email || '',
      status_user: 'Aktif',
      created_at: new Date().toISOString(),
    }).select().single()

    if (insertErr) throw new Error(insertErr.message)

    // Record usage
    await sb.from('activation_code_usage').insert({
      activation_code_id: code.id,
      kode: code.kode,
      user_id: profile.id,
      nama_user: form.nama_lengkap,
      created_at: new Date().toISOString(),
    })
    await sb.from('activation_codes').update({ jumlah_terpakai: (code.jumlah_terpakai || 0) + 1 }).eq('id', code.id)

    const u = { id: profile.id, nama_lengkap: profile.nama_lengkap, username: profile.username, role: profile.role, nama_madrasah: profile.nama_madrasah, nomor_hp: profile.nomor_hp, email: profile.email, password_hash: profile.password_hash }
    saveUser(u)
  }

  async function setupAdmin(form) {
    const sb = getSupabase()
    const { count } = await sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'Admin')
    if (count > 0) throw new Error('Admin sudah ada.')
    const { data: existing } = await sb.from('profiles').select('id').eq('username', form.username).single()
    if (existing) throw new Error('Username sudah digunakan.')

    const { data: profile, error } = await sb.from('profiles').insert({
      nama_lengkap: form.nama_lengkap,
      username: form.username,
      password_hash: hashPassword(form.password),
      role: 'Admin',
      nama_madrasah: form.nama_madrasah || '',
      nomor_hp: form.nomor_hp || '',
      status_user: 'Aktif',
      created_at: new Date().toISOString(),
    }).select().single()

    if (error) throw new Error(error.message)
    const u = { id: profile.id, nama_lengkap: profile.nama_lengkap, username: profile.username, role: profile.role, nama_madrasah: profile.nama_madrasah, nomor_hp: profile.nomor_hp, email: profile.email, password_hash: profile.password_hash }
    saveUser(u)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, setupAdmin, aktivasi, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}