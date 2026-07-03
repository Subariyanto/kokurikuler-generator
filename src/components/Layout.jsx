import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_NAME, MENU } from '../lib/constants'
import { canAccess } from '../lib/utils'
import { Menu, X, Settings, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPath = location.pathname.replace(/\/$/, '') || '/'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const visibleMenu = MENU.filter(m => {
    if (m.divider) return true
    if (!m.roles || m.roles.length === 0) return true
    return canAccess(user?.role, m.roles)
  })

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden no-print" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar fixed md:relative z-50 w-64 bg-green-800 text-white flex flex-col h-full overflow-y-auto ${sidebarOpen ? 'open' : ''} no-print`}>
        <div className="p-4 border-b border-green-700">
          <h1 className="text-sm font-bold leading-tight">{APP_NAME}</h1>
          <p className="text-[10px] text-green-300 mt-1">{user?.role || 'User'}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {visibleMenu.map((menu, idx) => {
            if (menu.divider) return <div key={`divider-${idx}`} className="border-t border-green-700 my-2" />
            const active = currentPath === `/${menu.id}` || (menu.id === 'dashboard' && currentPath === '/')
            return (
              <button
                key={menu.id}
                onClick={() => { navigate(`/${menu.id}`); setSidebarOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${active ? 'bg-green-700 text-white font-semibold' : 'text-green-100 hover:bg-green-700/50'}`}
              >
                <span className="text-lg">{menu.icon}</span>
                <span className="truncate">{menu.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-green-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-green-100 hover:bg-green-700/50">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
        <div className="p-3 border-t border-green-700 text-xs text-green-300">
          v1.0 • Kemenag 2025
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between border-b no-print">
          <button className="md:hidden p-1 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="hidden md:block text-sm text-gray-500 font-medium">Perencanaan Kokurikuler Madrasah Generator</div>
          <button onClick={() => navigate('/pengaturan')} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
              {user?.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-medium text-gray-700 text-xs">{user?.nama_lengkap || 'User'}</div>
              <div className="text-[10px] text-gray-400">{user?.role || '-'}</div>
            </div>
            <Settings size={14} className="text-gray-400" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}