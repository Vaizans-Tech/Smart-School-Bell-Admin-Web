import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/devices',   label: 'Devices',   icon: '📱' },
  { to: '/bell',      label: 'Bell',      icon: '🔔' },
  { to: '/azan',      label: 'Azan',      icon: '🕌' },
  { to: '/users',     label: 'Users',     icon: '👤' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const close = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">EK</div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">Edukit</h1>
            <p className="text-xs text-gray-400">Edukit Admin</p>
          </div>
        </div>
        {/* Close btn mobile */}
        <button onClick={close} className="lg:hidden text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
        {nav.map(n => (
          <NavLink
            key={n.to} to={n.to} onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base w-5 text-center">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400" />

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span className="text-base w-5 text-center">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={close} />
      )}

      {/* Sidebar — desktop: always visible, mobile: drawer */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-56 bg-white border-r border-gray-200 flex-shrink-0
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0">EK</div>
            <span className="text-sm font-semibold text-gray-800 truncate">Edukit</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
