/**
 * useLibraryProgress — privacy-first localStorage hook for the Library.
 *
 * Tracks which articles the user has marked as read and which they have
 * bookmarked, entirely on-device. No network, no account, no backend.
 * Matches the ManaTuner privacy contract: "nothing leaves your browser".
 *
 * Storage key: `manatuner-library-progress-v1`
 * Schema:
 *   {
 *     reads:     string[]  // article ids flagged read
 *     bookmarks: string[]  // article ids flagged bookmark
 *   }
 *
 * Cross-tab sync: the hook listens to the `storage` event so marking an
 * article read on one tab updates every other open Library tab live.
 *
 * @version 1.0 (2026-04-18)
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'manatuner-library-progress-v1'

interface ProgressState {
  reads: string[]
  bookmarks: string[]
}

const EMPTY: ProgressState = { reads: [], bookmarks: [] }

function readFromStorage(): ProgressState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      reads: Array.isArray(parsed.reads) ? parsed.reads : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
    }
  } catch {
    return EMPTY
  }
}

function writeToStorage(state: ProgressState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded or storage unavailable — fail silently, privacy-first UX
  }
}

export interface LibraryProgressApi {
  readIds: Set<string>
  bookmarkIds: Set<string>
  readCount: number
  bookmarkCount: number
  isRead: (id: string) => boolean
  isBookmarked: (id: string) => boolean
  toggleRead: (id: string) => void
  toggleBookmark: (id: string) => void
  reset: () => void
}

export function useLibraryProgress(): LibraryProgressApi {
  const [state, setState] = useState<ProgressState>(() => readFromStorage())

  // Persist on every mutation
  useEffect(() => {
    writeToStorage(state)
  }, [state])

  // Cross-tab sync — if another tab updates localStorage, reflect here
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setState(readFromStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const readIds = useMemo(() => new Set(state.reads), [state.reads])
  const bookmarkIds = useMemo(() => new Set(state.bookmarks), [state.bookmarks])

  const toggleRead = useCallback((id: string) => {
    setState((prev) => {
      const next = new Set(prev.reads)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...prev, reads: Array.from(next) }
    })
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setState((prev) => {
      const next = new Set(prev.bookmarks)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...prev, bookmarks: Array.from(next) }
    })
  }, [])

  const reset = useCallback(() => {
    setState(EMPTY)
  }, [])

  const isRead = useCallback((id: string) => readIds.has(id), [readIds])
  const isBookmarked = useCallback((id: string) => bookmarkIds.has(id), [bookmarkIds])

  return {
    readIds,
    bookmarkIds,
    readCount: state.reads.length,
    bookmarkCount: state.bookmarks.length,
    isRead,
    isBookmarked,
    toggleRead,
    toggleBookmark,
    reset,
  }
}
