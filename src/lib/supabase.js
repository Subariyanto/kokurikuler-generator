import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = url && key ? createClient(url, key) : null

export const getSupabase = () => {
  if (!supabase) throw new Error('Konfigurasi Supabase belum diatur. Silakan isi .env dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.')
  return supabase
}