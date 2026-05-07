import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, FileText, KeyRound, LogOut, Menu, X, FlaskConical, Users, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

function NavItem({ to, icon: Icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        'flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-2xl text-[15px] font-medium transition-colors ' +
        (isActive
          ? 'bg-amber-100 text-amber-900'
          : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900')
      }
    >
      <Icon size={20} strokeWidth={1.5} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function AdminLayout({ children, title }) {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = role === 'admin'

  function handleSignOut() {
    signOut()
  }

  const sidebar = (
    <nav className="flex flex-col h-full p-4">
      <div className="px-2 pb-5 border-b border-slate-200 mb-4">
        <div className="text-[16px] font-bold text-slate-800">SSI Platform</div>
        <div className="text-[12px] text-slate-500 mt-0.5">Researcher portal</div>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <NavItem
          to="/admin/dashboard"
          icon={Home}
          label="Dashboard"
          onNavigate={() => setMobileOpen(false)}
        />
        {isAdmin && (
          <NavItem
            to="/admin/interventions"
            icon={FileText}
            label="Interventions"
            onNavigate={() => setMobileOpen(false)}
          />
        )}
        <NavItem
          to="/admin/codes"
          icon={KeyRound}
          label="Access Codes"
          onNavigate={() => setMobileOpen(false)}
        />
        {isAdmin && (
          <NavItem
            to="/admin/exports"
            icon={Download}
            label="Data export"
            onNavigate={() => setMobileOpen(false)}
          />
        )}
        {isAdmin && (
          <NavItem
            to="/admin/team"
            icon={Users}
            label="Team"
            onNavigate={() => setMobileOpen(false)}
          />
        )}
        {isAdmin && (
          <NavItem
            to="/admin/testing"
            icon={FlaskConical}
            label="Testing"
            onNavigate={() => setMobileOpen(false)}
          />
        )}
      </div>

      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-2xl text-[15px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-amber-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-[240px] bg-white border-r border-slate-200 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-[260px] bg-white h-full shadow-card">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-slate-600 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-2xl text-slate-700 hover:bg-amber-50"
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
              {title && (
                <h1 className="text-[18px] sm:text-[22px] font-semibold text-slate-800 truncate">
                  {title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-[13px] text-slate-700 truncate max-w-[220px]">
                  {user?.email}
                </div>
                <div className="text-[12px] text-slate-500 capitalize">{role || '—'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-semibold text-[14px]">
                {(user?.email || '?').slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
