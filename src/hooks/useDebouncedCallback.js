import { useEffect, useRef } from 'react'

// Returns a function that, when invoked, calls `fn` after `delay` ms of
// inactivity. Subsequent calls reset the timer.
export function useDebouncedCallback(fn, delay = 500) {
  const fnRef = useRef(fn)
  const timerRef = useRef(null)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (...args) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      fnRef.current(...args)
    }, delay)
  }
}
