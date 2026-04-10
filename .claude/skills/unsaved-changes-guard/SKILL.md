---
name: unsaved-changes-guard
description: Implement or debug a "discard unsaved changes?" confirm dialog that intercepts both browser back button and in-page Back/Cancel buttons on Next.js App Router edit pages. Use when the user needs navigation guards on create/edit forms, when browser back is not firing the dialog, when history stack gets polluted with duplicate edit entries, or when history.go/router.push causes overshoot into about:blank or navigation loops. Applies specifically to Next.js 13+ App Router with the "use client" directive.
---

# Unsaved Changes Navigation Guard (Next.js App Router)

## When to use this skill

Trigger this skill when the user asks to:

- Add a "discard unsaved changes?" confirm dialog to a create/edit page.
- Block browser back button and show a confirm dialog before leaving.
- Fix a broken navigation guard that works with UI buttons but fails on browser back (or vice versa).
- Debug any of these symptoms:
  - Browser back does nothing even though the button is enabled
  - Dialog shows, confirm navigates to the wrong page
  - Clicking back multiple times eventually escapes the app into `about:blank`
  - `window.navigation.entries()` shows many consecutive same-URL `/edit` entries
  - Forward button enabled after confirm and forward returns to the edit page
  - React StrictMode (dev) produces different behavior from production

## Core rule: prefer Navigation API, fallback to popstate

There are two viable approaches. Always implement BOTH with runtime feature detection — don't pick only one.

### Approach 1 (primary): Navigation API

Supported on Chromium (Chrome/Edge ≥102). Cleanest and most reliable because it does NOT touch `history.pushState` at all.

```ts
const nav = (window as any).navigation
if (nav) {
  const onNavigate = (e: any) => {
    if (leavingRef.current) return
    if (e.navigationType !== 'traverse') return            // only back/forward
    if (e.destination.index >= nav.currentEntry.index) return // only BACK
    if (!e.cancelable) return
    e.preventDefault()                                      // cancel navigation
    setShowDialog(true)
  }
  nav.addEventListener('navigate', onNavigate)
}
```

Key points:
- Do NOT push any dummy entries.
- `navigationType === 'traverse'` filters out user-initiated push navigation (clicking Links).
- `destination.index < currentEntry.index` means going back; `>=` means forward.
- `e.preventDefault()` only works when `e.cancelable` is true.

### Approach 2 (fallback): popstate + dummy pushState

For Firefox / older Safari. Classic technique but has known edge cases (see "Pitfalls").

```ts
window.history.pushState({ ...window.history.state }, '', window.location.href)
const onPopState = () => {
  if (leavingRef.current) return
  window.history.pushState({ ...window.history.state }, '', window.location.href)
  setShowDialog(true)
}
window.addEventListener('popstate', onPopState)
```

Key points:
- ALWAYS spread `window.history.state` to preserve Next.js's router state. Never pass `null`.
- On popstate, re-push a dummy so the net count is unchanged and the URL bar stays on edit.
- Do NOT use `history.forward()` — it races with Next's own popstate handler.

## Unified confirmLeave

Regardless of which path is active, confirm uses the same logic:

```ts
function confirmLeave() {
  setShowDialog(false)
  leavingRef.current = true                  // suppress our own next event
  cleanupRef.current?.()                     // remove guard listener
  cleanupRef.current = null

  if (window.history.length > 1) {
    window.history.back()
    const editPath = window.location.pathname
    setTimeout(() => {
      if (window.location.pathname === editPath) {
        router.replace(backHref)             // safety fallback
      }
    }, 120)
  } else {
    router.replace(backHref)                 // fresh tab, nothing to pop
  }
}
```

The `backHref` parameter is REQUIRED. It's the detail page URL the hook should fall back to if `history.back()` can't resolve (fresh tab load, corrupted stack, browser ignored the back).

## Required hook shape

```ts
export function useUnsavedChanges(backHref: string) {
  const router = useRouter()  // from 'next/navigation'
  const [showDialog, setShowDialog] = React.useState(false)
  const cleanupRef = React.useRef<(() => void) | null>(null)
  const leavingRef = React.useRef(false)

  React.useEffect(() => {
    // feature-detect → Navigation API OR popstate
    // set cleanupRef
    return () => { cleanupRef.current?.(); cleanupRef.current = null }
  }, [])

  function confirmLeave() { /* see above */ }
  function requestLeave() { setShowDialog(true) }

  return { showDialog, setShowDialog, confirmLeave, requestLeave }
}
```

Usage in page:

```tsx
const { showDialog, setShowDialog, confirmLeave, requestLeave } =
  useUnsavedChanges(`/todo/${id}`)
```

Pair with an `AlertDialog` whose `onAction` calls `confirmLeave` and wire in-page Back buttons to call `requestLeave()`.

## Pitfalls — do NOT do these

1. **Do NOT dedupe pushState via a marker in `history.state`.** Per-entry state persists across forward/back navigation. A stale marker from a previous mount will cause the current mount to skip its push, breaking the stack math.

2. **Do NOT use `history.forward()` on popstate.** It races with Next.js App Router's own popstate handler and causes the stack position to drift.

3. **Do NOT call `history.pushState(null, ...)`.** Always spread the existing state: `{ ...(window.history.state ?? {}) }`. Passing `null` breaks Next.js router tree and scroll restoration.

4. **Do NOT rely on `history.go(-(pushedRef + 1))` as the confirm strategy.** Ref-based counting breaks when the stack has been churned by multiple mount/unmount cycles. Use `history.back()` + safety-net replace instead.

5. **Do NOT use `router.push(backHref)` on confirm.** It creates a new forward entry that loops back to edit. Use `history.back()` or `router.replace`.

6. **Do NOT push dummy entries when Navigation API is available.** Same-URL consecutive entries are exactly what causes Chrome to silently swallow subsequent back clicks.

7. **Do NOT attach the listener without a `leavingRef` guard.** When confirmLeave calls `history.back()`, the browser fires `navigate`/`popstate` one more time. Without the guard, the dialog reopens in a loop.

8. **Do NOT forget StrictMode.** In dev, effects run twice. The Navigation API path is naturally idempotent (only add/remove listener). The popstate fallback pushes twice — accept this in dev only, or track via ref. Never rely on a single push count.

## Testing checklist

Always test in an INCOGNITO TAB to ensure a clean history stack. Accumulated entries from prior manual tests will mask bugs.

1. `list → detail → edit`, browser back → dialog → confirm → lands on detail ✓
2. Same flow, browser back → dialog → cancel → stays on edit, URL unchanged ✓
3. In-page Back button → dialog → confirm → lands on detail ✓
4. After confirm (on detail), back again → lands on list ✓
5. `edit → back confirmed → detail → forward → edit` (via browser forward), then back → dialog must show ✓
6. Repeat steps 1–5 ten times: should never land on `about:blank` or blank page ✓
7. Open `/todo/1/edit` directly in a new tab → back → dialog → confirm → falls back to `router.replace(backHref)` → lands on `/todo/1` ✓
8. Check `window.navigation.entries()` after heavy testing — should NOT show long chains of duplicate `/edit` entries ✓
9. Test in both dev (StrictMode on) and production build ✓

If step 8 shows duplicate chains, the Navigation API path is not active — either the browser doesn't support it, or the feature-detect is wrong.

## How to debug when it "doesn't work"

1. Open DevTools console, run `window.navigation` — if `undefined`, you're on the popstate fallback; switch to Chrome to verify the primary path.
2. Run `window.navigation.entries()` and note the current index. Confirm `currentEntry.index` matches where you are.
3. Add `console.log` inside the `onNavigate` handler. If no log fires on back click, the listener is not attached (check `leavingRef` and cleanup order).
4. If log fires but dialog doesn't appear, check `e.cancelable` — some traverse events are not cancelable and must be handled with `beforeunload`.
5. If dialog appears but confirm lands on the wrong page, verify `backHref` is correct and the 120ms safety-net isn't firing prematurely (bump to 200ms if needed).

## Reference implementation

See `hooks/use-unsaved-changes.ts` in this repo for the canonical implementation that this skill codifies. Any new edit page should import that hook and pass the correct `backHref`, not reinvent the logic.
