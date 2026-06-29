import { Link, useLocation } from 'react-router-dom'

const ALL_ROUTES = [
  { path: '/', label: 'Code Entry (real)' },
  { path: '/session/demo-session-id', label: 'Delivery Shell (real)' },
  { path: '/session/demo-session-id/step', label: 'Delivery Step (stub)' },
  { path: '/admin', label: 'Admin Login (real)' },
  { path: '/admin/dashboard', label: 'Researcher Dashboard (stub)' },
  { path: '/admin/interventions', label: 'Intervention List (stub)' },
  { path: '/admin/interventions/demo-intervention-id', label: 'Builder (stub)' },
  { path: '/admin/codes', label: 'Access Code Management (stub)' },
]

export default function StubLayout({ title, children }) {
  const location = useLocation()
  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-[28px] font-bold leading-tight mb-1">{title}</h1>
        <p className="text-[13px] text-slate-500 font-mono mb-4 break-all">
          {location.pathname}
        </p>
        <p className="text-[14px] text-slate-500 mb-6">
          Phase 0 stub — placeholder so routing can be tested before real
          content is built.
        </p>

        {children && <div className="mb-6">{children}</div>}

        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-[14px] font-semibold text-slate-600 uppercase tracking-wide mb-3">
            Jump to
          </h2>
          <ul className="space-y-2">
            {ALL_ROUTES.map((r) => {
              const isCurrent = r.path === location.pathname
              return (
                <li key={r.path}>
                  <Link
                    to={r.path}
                    className={
                      'block text-[14px] py-1 transition-colors ' +
                      (isCurrent
                        ? 'text-slate-400 cursor-default pointer-events-none'
                        : 'text-ctac-teal-700 hover:text-ctac-teal-900 hover:underline')
                    }
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {r.label}
                    <span className="text-slate-400 ml-2 font-mono">
                      {r.path}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </main>
  )
}
