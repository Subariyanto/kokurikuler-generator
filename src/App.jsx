import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'
import { canAccess } from './lib/utils'
import Layout from './components/Layout'
import Login from './pages/Login'
import SetupAdmin from './pages/SetupAdmin'
import Dashboard from './pages/Dashboard'
import Madrasah from './pages/Madrasah'
import Guru from './pages/Guru'
import Murid from './pages/Murid'
import TimKokurikuler from './pages/TimKokurikuler'
import AnalisisMadrasah from './pages/AnalisisMadrasah'
import Generator from './pages/Generator'
import BankTema from './pages/BankTema'
import BankG7KAIH from './pages/BankG7KAIH'
import BankKKBC from './pages/BankKKBC'
import Asesmen from './pages/Asesmen'
import Pelaporan from './pages/Pelaporan'
import Evaluasi from './pages/Evaluasi'
import Arsip from './pages/Arsip'
import CatatanPengawas from './pages/CatatanPengawas'
import KodeAktivasi from './pages/KodeAktivasi'
import ManajemenUser from './pages/ManajemenUser'
import Pengaturan from './pages/Pengaturan'
import PreviewCetak from './pages/PreviewCetak'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !canAccess(user.role, roles)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<SetupAdmin />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="madrasah" element={<Madrasah />} />
          <Route path="guru" element={<Guru />} />
          <Route path="murid" element={<Murid />} />
          <Route path="tim" element={<TimKokurikuler />} />
          <Route path="analisis" element={<AnalisisMadrasah />} />
          <Route path="generator" element={<Generator />} />
          <Route path="generator/:id" element={<Generator />} />
          <Route path="bank-tema" element={<BankTema />} />
          <Route path="bank-g7kaih" element={<BankG7KAIH />} />
          <Route path="bank-kkbc" element={<BankKKBC />} />
          <Route path="asesmen" element={<Asesmen />} />
          <Route path="pelaporan" element={<Pelaporan />} />
          <Route path="evaluasi" element={<Evaluasi />} />
          <Route path="arsip" element={<Arsip />} />
          <Route path="catatan" element={<CatatanPengawas />} />
          <Route path="kode-aktivasi" element={<ProtectedRoute roles={['Admin']}><KodeAktivasi /></ProtectedRoute>} />
          <Route path="manajemen-user" element={<ProtectedRoute roles={['Admin']}><ManajemenUser /></ProtectedRoute>} />
          <Route path="pengaturan" element={<Pengaturan />} />
          <Route path="preview/:id" element={<PreviewCetak />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}