import StubLayout from './StubLayout.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AdminStubLayout({ title, children }) {
  const { user, role, signOut } = useAuth()
  return (
    <StubLayout title={title}>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-[14px] text-slate-700">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-medium">Signed in</div>
            <div className="text-slate-600 break-all">{user?.email}</div>
            <div className="text-slate-500 text-[13px]">
              Role: <span className="font-mono">{role || 'unknown'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[48px] text-[14px]"
          >
            Sign out
          </button>
        </div>
      </div>
      {children}
    </StubLayout>
  )
}
