import { useCallback, useEffect, useMemo, useState } from 'react'
import { Send, RefreshCw, Mail, Clock, CheckCircle2 } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import { callAuthedEdgeFunction } from '../lib/api.js'

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function StatusBadge({ admin }) {
  if (admin.is_pending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium bg-ctac-teal-100 text-ctac-teal-800">
        <Clock size={12} strokeWidth={2} />
        Pending
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium bg-emerald-100 text-emerald-800">
      <CheckCircle2 size={12} strokeWidth={2} />
      Active
    </span>
  )
}

export default function AdminTeamPage() {
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [admins, setAdmins] = useState([])
  const [listError, setListError] = useState(null)

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setListError(null)
    callAuthedEdgeFunction('list-admins', {})
      .then((data) => {
        if (cancelled) return
        setAdmins(data?.admins || [])
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        setListError(err.message || 'Could not load admins.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const { active, pending } = useMemo(() => {
    return {
      active: admins.filter((a) => !a.is_pending),
      pending: admins.filter((a) => a.is_pending),
    }
  }, [admins])

  const refresh = useCallback(() => setReloadKey((k) => k + 1), [])

  async function handleInvite(e) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !EMAIL_RX.test(trimmed)) {
      setFormError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      await callAuthedEdgeFunction('invite-admin', { email: trimmed })
      setFormSuccess(`Invitation sent to ${trimmed}.`)
      setEmail('')
      refresh()
    } catch (err) {
      setFormError(err.message || 'Could not send invitation.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout title="Team">
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <h2 className="text-[18px] font-semibold text-slate-800 mb-1">Invite an admin</h2>
        <p className="text-[14px] text-slate-600 mb-4">
          Send an email invitation. The recipient will set their own password
          when they accept.
        </p>
        <form onSubmit={handleInvite} className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[260px]">
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@uky.edu"
              disabled={submitting}
              className="w-full text-[15px] px-4 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
          >
            <Send size={14} strokeWidth={2} />
            {submitting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
        {formError && (
          <div
            role="alert"
            className="mt-3 text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2"
          >
            {formError}
          </div>
        )}
        {formSuccess && (
          <div
            role="status"
            className="mt-3 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 flex items-center gap-2"
          >
            <Mail size={14} strokeWidth={2} />
            {formSuccess}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-[16px] font-semibold text-slate-800">
            Admins{' '}
            <span className="text-[13px] font-normal text-slate-500">
              ({admins.length})
            </span>
          </h2>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1 text-[13px] text-ctac-teal-700 hover:text-ctac-teal-900"
          >
            <RefreshCw size={14} strokeWidth={1.5} />
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : listError ? (
          <div className="p-8 text-center text-rose-600 text-[14px]">{listError}</div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-[14px]">No admins yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-ctac-teal-50 text-left text-[12px] uppercase tracking-wide text-ctac-teal-800">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Granted</th>
                  <th className="px-4 py-3 whitespace-nowrap">Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {[...active, ...pending].map((a) => (
                  <tr key={a.user_id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-800">
                      {a.email}
                      {a.is_self && (
                        <span className="ml-2 text-[12px] text-slate-500">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge admin={a} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {fmtDate(a.granted_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {a.is_pending ? (
                        <span className="text-slate-400 italic">never</span>
                      ) : (
                        fmtDate(a.last_sign_in_at)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
