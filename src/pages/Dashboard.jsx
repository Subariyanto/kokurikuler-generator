import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSupabase } from '../lib/supabase'
import { PageHeader, StatCard, LoadingSpinner } from '../components/UI'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      const sb = getSupabase()
      const [rencana, guru, murid] = await Promise.all([
        sb.from('perencanaan_kokurikuler').select('jenis_kokurikuler, jenjang, tema_kegiatan'),
        sb.from('guru').select('id', { count: 'exact', head: true }),
        sb.from('murid').select('id', { count: 'exact', head: true }),
      ])

      const lintas = rencana.data?.filter(r => r.jenis_kokurikuler?.includes('Lintas Disiplin')).length || 0
      const g7kaih = rencana.data?.filter(r => r.jenis_kokurikuler?.includes('G7KAIH')).length || 0
      const kkbc = rencana.data?.filter(r => r.jenis_kokurikuler?.includes('KKBC')).length || 0

      setStats({
        totalRencana: rencana.data?.length || 0,
        totalGuru: guru.count || 0,
        totalMurid: murid.count || 0,
        lintas, g7kaih, kkbc,
        jenjang: rencana.data || [],
      })
    } catch { }
    setLoading(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Selamat datang, ${user.nama_lengkap}`} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Perencanaan" value={stats?.totalRencana || 0} icon="📋" color="green" />
        <StatCard label="Guru" value={stats?.totalGuru || 0} icon="👥" color="blue" />
        <StatCard label="Murid" value={stats?.totalMurid || 0} icon="🎓" color="purple" />
        <StatCard label="Lintas Disiplin" value={stats?.lintas || 0} icon="📚" color="yellow" />
        <StatCard label="G7KAIH" value={stats?.g7kaih || 0} icon="❤️" color="red" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Jumlah Kegiatan berdasarkan Jenis</h3>
          <div className="space-y-2">
            <Bar label="Lintas Disiplin" value={stats?.lintas || 0} total={stats?.totalRencana || 1} color="bg-blue-500" />
            <Bar label="G7KAIH" value={stats?.g7kaih || 0} total={stats?.totalRencana || 1} color="bg-green-500" />
            <Bar label="KKBC" value={stats?.kkbc || 0} total={stats?.totalRencana || 1} color="bg-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Rekap berdasarkan Jenjang</h3>
          {['RA', 'MI', 'MTs', 'MA', 'MAK'].map(j => {
            const count = stats?.jenjang?.filter(r => r.jenjang === j).length || 0
            return <Bar key={j} label={j} value={count} total={stats?.totalRencana || 1} color="bg-purple-500" />
          })}
        </div>
      </div>
    </div>
  )
}

function Bar({ label, value, total, color }) {
  const pct = Math.round((value / Math.max(total, 1)) * 100)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-gray-600">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className="w-8 text-right font-medium">{value}</span>
    </div>
  )
}