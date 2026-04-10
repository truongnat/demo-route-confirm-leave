"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

/**
 * Intercept navigation away from an edit page to show a discard-changes
 * dialog. Unified for in-page Back button and browser back button.
 *
 * Two implementations, picked at runtime:
 *
 *  1. Navigation API (Chrome/Edge ≥102). Clean, reliable: we listen to
 *     the "navigate" event, cancel traverse-back with preventDefault(),
 *     and never touch pushState. No dummy entries, no stack churn, no
 *     dedup bugs with consecutive same-URL entries.
 *
 *  2. Fallback popstate + dummy pushState (Firefox / older Safari).
 *     The historic trick: push a dummy on mount, re-push on popstate,
 *     pop everything on confirm. Has known edge cases when many same-URL
 *     entries accumulate — that's exactly what Navigation API avoids.
 *
 * In both paths confirmLeave() ultimately calls `window.history.back()`
 * (fallback: `router.replace(backHref)`) so the user always lands on the
 * previous page without us having to math out how deep the stack is.
 */
export function useUnsavedChanges(backHref: string) {
  const router = useRouter()
  const [showDialog, setShowDialog] = React.useState(false)
  const cleanupRef = React.useRef<(() => void) | null>(null)
  // When true, the next traverse/popstate is our OWN confirmed navigation
  // — let it through instead of reopening the dialog.
  const leavingRef = React.useRef(false)

  React.useEffect(() => {
    const nav = (window as unknown as { navigation?: NavigationApi }).navigation

    if (nav && typeof nav.addEventListener === "function") {
      // ---------- Navigation API path ----------
      const onNavigate = (e: NavigateEvent) => {
        if (leavingRef.current) return
        if (e.navigationType !== "traverse") return
        // Only intercept BACK traversals, not forward.
        const curIdx = nav.currentEntry?.index ?? -1
        const destIdx = e.destination?.index ?? -1
        if (destIdx >= curIdx) return
        if (!e.cancelable) return
        e.preventDefault()
        setShowDialog(true)
      }
      nav.addEventListener("navigate", onNavigate)
      cleanupRef.current = () => nav.removeEventListener("navigate", onNavigate)
    } else {
      // ---------- Fallback: popstate + dummy pushState ----------
      window.history.pushState(
        { ...(window.history.state ?? {}) },
        "",
        window.location.href,
      )

      const onPopState = () => {
        if (leavingRef.current) return
        window.history.pushState(
          { ...(window.history.state ?? {}) },
          "",
          window.location.href,
        )
        setShowDialog(true)
      }
      window.addEventListener("popstate", onPopState)
      cleanupRef.current = () =>
        window.removeEventListener("popstate", onPopState)
    }

    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [])

  function confirmLeave() {
    setShowDialog(false)
    leavingRef.current = true
    cleanupRef.current?.()
    cleanupRef.current = null

    // Prefer a real history back so the forward/back stack stays coherent.
    // If there's no prior entry (fresh tab), fall back to explicit replace.
    if (window.history.length > 1) {
      window.history.back()
      // Safety net: if after a tick we're still on the edit URL (browser
      // ignored the back, or we were at the very start of the stack),
      // navigate explicitly.
      const editPath = window.location.pathname
      window.setTimeout(() => {
        if (window.location.pathname === editPath) {
          router.replace(backHref)
        }
      }, 120)
    } else {
      router.replace(backHref)
    }
  }

  function requestLeave() {
    setShowDialog(true)
  }

  return { showDialog, setShowDialog, confirmLeave, requestLeave }
}

// ----- Minimal Navigation API typings (TS lib lacks them in some setups) -----
type NavigationApi = {
  currentEntry?: { index: number }
  addEventListener: (type: "navigate", cb: (e: NavigateEvent) => void) => void
  removeEventListener: (
    type: "navigate",
    cb: (e: NavigateEvent) => void,
  ) => void
}
type NavigateEvent = Event & {
  navigationType: "push" | "replace" | "reload" | "traverse"
  destination?: { index: number; url: string }
  cancelable: boolean
  preventDefault: () => void
}
