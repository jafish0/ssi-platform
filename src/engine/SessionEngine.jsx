import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { callEdgeFunction } from '../lib/api.js'
import { resolveTokenPath } from '../lib/tokens.js'

const SessionContext = createContext(null)

// Returns true if the given exit rule matches the response value of a choice item.
// Rule shapes supported:
//   { selected: 'optionId' }              — single-select match
//   { selected: ['optionId', ...] }       — multi-select must include any of these
//   { any_of: ['optionId', ...] }         — alias for the multi-select case
function matchesExitRule(rule, responseValue) {
  if (!rule) return false
  const sel = responseValue?.selected
  if (rule.selected !== undefined) {
    if (Array.isArray(rule.selected)) {
      const arr = Array.isArray(sel) ? sel : [sel]
      return rule.selected.some((s) => arr.includes(s))
    }
    if (Array.isArray(sel)) return sel.includes(rule.selected)
    return sel === rule.selected
  }
  if (Array.isArray(rule.any_of)) {
    const arr = Array.isArray(sel) ? sel : [sel]
    return rule.any_of.some((s) => arr.includes(s))
  }
  return false
}

function normalizeSnapshot(snapshot) {
  // The snapshot_json is expected to look like:
  //   { sections: [{ id, type, title, order_index, items: [{ id, type, content_json, token_key, order_index, is_required }] }, ...] }
  // We tolerate sections being either a flat array or wrapped in { sections: [...] }.
  if (!snapshot) return []
  const raw = Array.isArray(snapshot)
    ? snapshot
    : Array.isArray(snapshot.sections)
      ? snapshot.sections
      : []
  // Sort sections and items by order_index defensively
  return raw
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((section) => ({
      id: section.id,
      type: section.type || 'activity',
      title: section.title || '',
      config_json: section.config_json || {},
      order_index: section.order_index ?? 0,
      items: (section.items || [])
        .slice()
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((item) => ({
          id: item.id,
          type: item.type,
          content_json: item.content_json || {},
          token_key: item.token_key || null,
          order_index: item.order_index ?? 0,
          is_required: item.is_required !== false,
        })),
    }))
}

export function SessionProvider({ sessionId, children }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sections, setSections] = useState([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [responses, setResponses] = useState({}) // keyed by token_key
  const [responsesByItemId, setResponsesByItemId] = useState({}) // keyed by item.id
  const [sessionMeta, setSessionMeta] = useState(null) // { status, current_section }
  const [completed, setCompleted] = useState(false)
  const [exitInfo, setExitInfo] = useState(null) // { title, message } when an exit_on rule fires

  // Avoid spurious progress updates when sections haven't actually changed.
  const lastSyncedSectionRef = useRef(-1)

  // ---- bootstrap: load snapshot + responses ----
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      callEdgeFunction('get-version-snapshot', { session_id: sessionId }),
      callEdgeFunction('get-session-responses', { session_id: sessionId }),
    ])
      .then(([snap, resp]) => {
        if (cancelled) return
        const normalized = normalizeSnapshot(snap?.snapshot)
        setSections(normalized)
        setResponses(resp?.responses || {})
        setResponsesByItemId(resp?.responsesByItemId || {})
        setSessionMeta(snap?.session || null)

        if (snap?.session?.status === 'completed') {
          setCompleted(true)
        } else {
          // Resume: jump to the section the server last recorded
          const resumeSection = Math.min(
            Math.max(snap?.session?.current_section ?? 0, 0),
            Math.max(normalized.length - 1, 0),
          )
          setCurrentSectionIndex(resumeSection)
          setCurrentItemIndex(0)
          lastSyncedSectionRef.current = resumeSection
        }
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('SessionProvider bootstrap failed', err)
        setError(err)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId])

  // ---- derived ----
  const totalSections = sections.length
  const currentSection = sections[currentSectionIndex] || null
  const currentItems = currentSection?.items || []
  const currentItem = currentItems[currentItemIndex] || null
  const isFirstItem = currentSectionIndex === 0 && currentItemIndex === 0
  const isLastItem =
    currentSectionIndex === totalSections - 1 &&
    currentItemIndex === Math.max(0, currentItems.length - 1)

  const progressFraction = useMemo(() => {
    if (!totalSections) return 0
    return Math.min(1, currentSectionIndex / totalSections)
  }, [currentSectionIndex, totalSections])

  // ---- helpers ----
  const resolveToken = useCallback(
    (path) => resolveTokenPath(path, responses),
    [responses],
  )

  const syncSectionProgress = useCallback(
    async (newIndex, status) => {
      if (!sessionId) return
      try {
        await callEdgeFunction('update-session-progress', {
          session_id: sessionId,
          current_section: newIndex,
          ...(status ? { status } : {}),
        })
      } catch (err) {
        console.error('update-session-progress failed', err)
      }
    },
    [sessionId],
  )

  const saveResponse = useCallback(
    async (itemId, tokenKey, responseValue) => {
      // Optimistic local update
      setResponsesByItemId((prev) => ({ ...prev, [itemId]: responseValue }))
      if (tokenKey) {
        setResponses((prev) => ({ ...prev, [tokenKey]: responseValue }))
      }
      try {
        await callEdgeFunction('save-response', {
          session_id: sessionId,
          item_id: itemId,
          response_value: responseValue,
        })
      } catch (err) {
        console.error('save-response failed', err)
        throw err
      }

      // Hard-branch exit support: a `choice` item may declare exit_on rules in
      // its content_json. If the saved selection matches, end the session here
      // with a custom message (no further items rendered).
      const item = currentItem
      if (item && item.id === itemId && item.type === 'choice') {
        const rules = item.content_json?.exit_on
        const ruleArr = Array.isArray(rules) ? rules : rules ? [rules] : []
        for (const rule of ruleArr) {
          if (!rule) continue
          const match = matchesExitRule(rule, responseValue)
          if (match) {
            setExitInfo({
              title: rule.title || 'Thanks for stopping by',
              message: rule.message || '',
            })
            setCompleted(true)
            try {
              await callEdgeFunction('update-session-progress', {
                session_id: sessionId,
                current_section: currentSectionIndex,
                status: 'completed',
              })
            } catch (err) {
              console.error('exit progress update failed', err)
            }
            return { exited: true }
          }
        }
      }
      return { exited: false }
    },
    [sessionId, currentItem, currentSectionIndex],
  )

  const completeSession = useCallback(async () => {
    setCompleted(true)
    await syncSectionProgress(currentSectionIndex, 'completed')
  }, [currentSectionIndex, syncSectionProgress])

  const goNext = useCallback(() => {
    if (!currentSection) return
    if (currentItemIndex < currentItems.length - 1) {
      setCurrentItemIndex((i) => i + 1)
      return
    }
    // End of section
    if (currentSectionIndex < totalSections - 1) {
      const nextSection = currentSectionIndex + 1
      setCurrentSectionIndex(nextSection)
      setCurrentItemIndex(0)
      if (lastSyncedSectionRef.current !== nextSection) {
        lastSyncedSectionRef.current = nextSection
        syncSectionProgress(nextSection)
      }
      return
    }
    // End of intervention
    completeSession()
  }, [
    currentSection,
    currentItemIndex,
    currentItems.length,
    currentSectionIndex,
    totalSections,
    syncSectionProgress,
    completeSession,
  ])

  const goBack = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((i) => i - 1)
      return
    }
    if (currentSectionIndex > 0) {
      const prevSection = currentSectionIndex - 1
      const prevItems = sections[prevSection]?.items || []
      setCurrentSectionIndex(prevSection)
      setCurrentItemIndex(Math.max(0, prevItems.length - 1))
    }
  }, [currentItemIndex, currentSectionIndex, sections])

  const value = useMemo(
    () => ({
      // state
      sections,
      currentSection,
      currentItem,
      currentSectionIndex,
      currentItemIndex,
      progressFraction,
      isFirstItem,
      isLastItem,
      loading,
      error,
      completed,
      exitInfo,
      sessionMeta,
      sessionId,
      // navigation
      goNext,
      goBack,
      // responses
      responses,
      responsesByItemId,
      saveResponse,
      resolveToken,
      // session
      completeSession,
    }),
    [
      sections,
      currentSection,
      currentItem,
      currentSectionIndex,
      currentItemIndex,
      progressFraction,
      isFirstItem,
      isLastItem,
      loading,
      error,
      completed,
      exitInfo,
      sessionMeta,
      sessionId,
      goNext,
      goBack,
      responses,
      responsesByItemId,
      saveResponse,
      resolveToken,
      completeSession,
    ],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>')
  return ctx
}
