# Báo cáo kỹ thuật: Unsaved Changes Navigation Guard

> Chặn điều hướng rời trang edit (cả UI back button lẫn browser back button) và hiện dialog "Discard unsaved changes?" trong Next.js App Router.

---

## 1. Bài toán

Trên các trang edit (ví dụ `/todo/1/edit`, `/blog/1/edit`), khi user bấm **browser back button** hoặc **UI back button** trong page, cần:

1. Hiện dialog xác nhận "Discard unsaved changes?".
2. User **confirm** → thật sự điều hướng về trang trước đó (detail).
3. User **cancel** → ở lại trang edit, URL không đổi, không có side effect.

Ràng buộc thêm:

- Luồng `list → detail → edit`: sau khi confirm từ edit phải về `detail`. Từ `detail` back tiếp phải về `list` như bình thường.
- Không để user rơi vào loop `detail ↔ edit`.
- Không để user bị văng ra ngoài app (`about:blank`).
- Không để stack history phình to với hàng chục entry trùng URL.
- Hoạt động đồng nhất giữa React StrictMode (dev) và production build.
- Dialog phải hiện **mỗi lần** user back, kể cả sau nhiều round back/forward liên tiếp.

## 2. Các kỹ thuật cũ và tại sao thất bại

Trước khi đi tới giải pháp cuối, đã thử và loại bỏ các kỹ thuật sau đây. Mỗi kỹ thuật đều có bug thực tế phát hiện trong quá trình debug.

### 2.1. Kỹ thuật A — Dummy pushState + `history.forward()`

**Ý tưởng:** Push 1 dummy trên mount. Khi popstate fire, gọi `history.forward()` để quay lại dummy, sau đó show dialog. Confirm thì gọi `history.go(-2)`.

**Vấn đề:**

- React StrictMode (dev) chạy effect 2 lần → push 2 dummy → `go(-2)` nhảy sai vị trí.
- `history.forward()` và Next.js App Router cùng listen `popstate` → race condition, forward không commit đúng thời điểm.
- Ghi `history.state = null` phá state nội bộ của Next.js (router tree, scroll restoration).

### 2.2. Kỹ thuật B — Dummy + marker `__uc` trong `history.state`

**Ý tưởng:** Dùng marker `{ __uc: true }` trong `history.state` để dedupe push qua StrictMode, tránh push 2 dummy.

**Vấn đề:**

- `history.state` **persist theo từng entry** trong session. Khi user navigate đi rồi quay lại edit (qua forward button hoặc Link click), entry đó vẫn còn marker `__uc` từ lần mount trước → hook **skip push dummy** → back không được intercept đúng → dialog không hiện.
- Sau vài round back/forward, `window.navigation.entries()` cho thấy stack phình to với hàng chục entry `/edit` trùng lặp.

Bằng chứng từ debug session:

```
47: "http://localhost:3000/todo/1/edit"
48: "http://localhost:3000/todo/1/edit"
49: "http://localhost:3000/todo/1/edit"
```

### 2.3. Kỹ thuật C — `history.go(-(pushedRef + 1))`

**Ý tưởng:** Dùng `React.useRef` để đếm chính xác số dummy đã push (sống qua StrictMode). Confirm thì `history.go(-stepsBack)`.

**Vấn đề:**

- Khi stack đã bị bẩn do nhiều round test/thao tác trước đó, `go(-n)` có thể **overshoot ra ngoài app**, về `about:blank`.
- Khi Chrome thấy nhiều entry liên tiếp cùng URL `/todo/1/edit`, có trường hợp nó **silently swallow** click back — không fire popstate → dialog không hiện mặc dù nút back vẫn sáng.

### 2.4. Kỹ thuật D — `router.push(backHref)`

**Ý tưởng:** Confirm leave thì gọi `router.push('/todo/1')` thay vì `history.go`.

**Vấn đề:**

- `router.push` tạo entry mới chứ không pop entry `edit` và `dummy` khỏi stack. Sau khi confirm về detail, forward button vẫn thấy entry cũ → bấm forward rơi lại vào edit → loop.
- Stack sau confirm trở thành `[..., detail, edit, dummy, detail']` → bấm back từ `detail'` rớt lại vào `dummy`/`edit`.

## 3. Giải pháp cuối: Navigation API + fallback popstate

**Ý tưởng cốt lõi:** Không cần dummy pushState nếu browser hỗ trợ Navigation API. Dùng Navigation API làm primary, fallback về popstate + dummy pushState cho browser khác.

### 3.1. Navigation API là gì?

API chuẩn Web Platform mới (Chrome/Edge ≥102; tới thời điểm cutoff, Safari và Firefox chưa hỗ trợ). API này cho phép:

- Listen sự kiện `navigate` trên `window.navigation` — fire mỗi khi có navigation thuộc loại bất kỳ (bấm link, back/forward, pushState, replaceState, reload).
- Phân loại navigation qua `e.navigationType`: `"push"` | `"replace"` | `"reload"` | `"traverse"`.
- **Cancel navigation** bằng `e.preventDefault()` khi `e.cancelable === true`.
- So sánh `e.destination.index` với `nav.currentEntry.index` để phân biệt back vs forward.

So với `popstate`, Navigation API có lợi thế:

| Tiêu chí | `popstate` | Navigation API |
|---|---|---|
| Fire trước navigation (để cancel) | ❌ (fire sau) | ✅ (fire trước, có thể `preventDefault`) |
| Phân biệt push / replace / traverse | ❌ | ✅ |
| Phân biệt back vs forward | ❌ (phải tự track index) | ✅ (so sánh `destination.index`) |
| Cần dummy pushState để chặn | ✅ | ❌ |

### 3.2. Luồng với Navigation API

```
Mount edit page:
  └─ addEventListener('navigate', onNavigate)

User bấm browser back:
  └─ 'navigate' event fire với navigationType='traverse'
     └─ destIdx < curIdx → đây là back thật sự
        └─ e.preventDefault() → Chrome huỷ navigation, URL bar không đổi
           └─ setShowDialog(true)

User confirm leave:
  └─ leavingRef.current = true (để onNavigate bỏ qua event kế tiếp)
     └─ removeEventListener('navigate', onNavigate)
     └─ history.back() → lần này không ai chặn, browser pop thật sự về detail ✓
     └─ Sau 120ms verify: nếu vẫn còn ở URL edit → router.replace(backHref) cứu

User cancel leave:
  └─ setShowDialog(false)
  └─ Không làm gì thêm, user vẫn ở edit, URL không đổi ✓
```

### 3.3. Vì sao ưu việt so với các kỹ thuật trước

1. **Không pushState, không dummy** → stack sạch, không phình to, không có entry trùng URL liên tiếp.
2. **Không bị Chrome swallow** vì không có chuỗi same-URL entries — đây là root cause của bug trong mục 2.3.
3. **Không đụng `history.state`** → Next.js App Router hoạt động bình thường (router tree, scroll restoration, soft navigation).
4. **StrictMode-safe** — effect chạy 2 lần trong dev vẫn idempotent, chỉ add/remove listener, không push gì.
5. **`confirmLeave` đơn giản** — chỉ cần `history.back()`, không cần tính `-n`, không cần quản lý `pushedRef`.

### 3.4. Fallback cho Firefox/Safari cũ

Feature-detect `window.navigation`:

```ts
const nav = (window as any).navigation
if (nav && typeof nav.addEventListener === 'function') {
  // Navigation API path
} else {
  // Fallback: popstate + dummy pushState cổ điển
}
```

Fallback chấp nhận edge case đã biết của popstate approach vì:

- Browser chính cho demo là Chromium-based.
- Firefox/Safari user ít khi thao tác edge case back nhiều round liên tiếp.
- Nếu thực sự cần cho Safari/Firefox ổn định 100%, phải implement thêm layer track index bằng `sessionStorage` — overkill cho phạm vi hiện tại.

### 3.5. Các safeguard quan trọng

| Safeguard | Mục đích | Không có thì sao |
|---|---|---|
| `leavingRef` | Đánh dấu "lần navigation kế tiếp là chủ động của mình" → `onNavigate` không chặn lại khi `confirmLeave` gọi `history.back()` | Confirm → `history.back()` fire navigate event → hook chặn lại → dialog reopen → loop vô tận |
| `destIdx >= curIdx` skip | Chỉ intercept back, cho phép forward và navigation push bình thường | User bấm forward cũng bị chặn, click Link cũng bị chặn |
| `e.cancelable` check | Một số traverse event không cancelable (cross-origin, unload forced) — nếu không check sẽ throw | Console error, có thể crash hook |
| `navigationType === 'traverse'` check | Chỉ chặn back/forward, không chặn click Link sang trang khác (`navigationType === 'push'`) | Click Link ra khỏi edit cũng bị chặn và show dialog |
| `history.length > 1` check | Tab mới mở thẳng vào URL edit → không có entry trước → fallback `router.replace` | `history.back()` không làm gì, user stuck ở edit |
| 120ms verify timer sau `history.back()` | Safety net: nếu `history.back()` bị browser từ chối hoặc race condition, auto `router.replace(backHref)` | User stuck ở edit sau khi confirm |
| Spread `{ ...window.history.state }` khi pushState | Giữ nguyên state nội bộ của Next.js router | Phá router tree, scroll restoration, soft navigation |

### 3.6. Sơ đồ state machine

```
         ┌────────────────┐
         │  Edit page     │
         │  mounted       │
         └───────┬────────┘
                 │ addEventListener('navigate' hoặc 'popstate')
                 ▼
         ┌────────────────┐
         │  Listening     │◄────────┐
         └───┬────────┬───┘         │
  browser    │        │  UI         │
  back       │        │  back       │
             ▼        ▼             │
         ┌────────────────┐         │
         │ Dialog shown   │         │
         └───┬────────┬───┘         │
      cancel │        │ confirm     │
             │        │             │
             └────────┼─────────────┘
                      │
                      ▼
         ┌─────────────────────┐
         │ leavingRef = true   │
         │ remove listener     │
         │ history.back()      │
         └────────┬────────────┘
                  │
         ┌────────▼────────┐
         │  120ms verify   │
         └───┬─────────┬───┘
    on edit  │         │ on prev page
             ▼         ▼
    router.replace   Done ✓
    (backHref)
```

## 4. Code implementation

### 4.1. Hook `hooks/use-unsaved-changes.ts`

```ts
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export function useUnsavedChanges(backHref: string) {
  const router = useRouter()
  const [showDialog, setShowDialog] = React.useState(false)
  const cleanupRef = React.useRef<(() => void) | null>(null)
  const leavingRef = React.useRef(false)

  React.useEffect(() => {
    const nav = (window as unknown as { navigation?: NavigationApi }).navigation

    if (nav && typeof nav.addEventListener === "function") {
      // ---------- Navigation API path ----------
      const onNavigate = (e: NavigateEvent) => {
        if (leavingRef.current) return
        if (e.navigationType !== "traverse") return
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

    if (window.history.length > 1) {
      window.history.back()
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

// ----- Minimal Navigation API typings -----
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
```

### 4.2. Sử dụng trong page

```tsx
// app/(dashboard)/todo/[id]/edit/page.tsx
const { showDialog, setShowDialog, confirmLeave, requestLeave } =
  useUnsavedChanges(`/todo/${id}`)
```

Dialog wire vào `AlertDialog`:

```tsx
<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
      <AlertDialogDescription>
        You have unsaved changes. If you go back now, all edits will be lost.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Stay on page</AlertDialogCancel>
      <AlertDialogAction onClick={confirmLeave}>
        Leave without saving
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

UI back button:

```tsx
<Button onClick={() => requestLeave()}>
  <ArrowLeft /> Back to detail
</Button>
```

## 5. Các pitfall tuyệt đối tránh

Đây là những bug đã thực sự gặp trong quá trình debug. Không bao giờ lặp lại:

1. **KHÔNG dedupe pushState qua marker trong `history.state`.** Per-entry state persist qua navigation, marker cũ sẽ làm mount mới skip push, phá stack math.

2. **KHÔNG dùng `history.forward()` trong popstate handler.** Race với popstate handler của Next.js App Router, gây drift vị trí stack.

3. **KHÔNG gọi `history.pushState(null, ...)`.** Luôn spread state hiện có: `{ ...(window.history.state ?? {}) }`. Pass `null` sẽ phá Next.js router tree và scroll restoration.

4. **KHÔNG dùng `history.go(-(pushedRef + 1))` làm chiến lược confirm chính.** Ref-based counting không bền khi stack bị churn bởi nhiều round mount/unmount. Dùng `history.back()` + safety-net replace.

5. **KHÔNG dùng `router.push(backHref)` trong confirm.** Nó tạo forward entry loop lại về edit. Dùng `history.back()` hoặc `router.replace`.

6. **KHÔNG push dummy entry khi Navigation API đã available.** Same-URL consecutive entries chính là thứ làm Chrome silently swallow click back.

7. **KHÔNG attach listener mà không có `leavingRef` guard.** Khi `confirmLeave` gọi `history.back()`, browser fire `navigate`/`popstate` thêm một lần nữa. Không có guard thì dialog reopen loop.

8. **KHÔNG quên React StrictMode.** Dev chạy effect 2 lần. Navigation API path naturally idempotent (chỉ add/remove listener). Popstate fallback push 2 lần — chấp nhận trong dev hoặc track bằng ref. Không bao giờ rely vào single push count.

## 6. Testing checklist

Luôn test trong **incognito tab** để đảm bảo stack history sạch. Entry cũ tích luỹ từ các lần test trước đó sẽ che giấu bug.

1. ✅ `list → detail → edit`, browser back → dialog → confirm → land đúng detail.
2. ✅ Cùng flow, browser back → dialog → cancel → vẫn ở edit, URL không đổi.
3. ✅ UI Back button → dialog → confirm → land đúng detail.
4. ✅ Sau confirm (đang ở detail), back tiếp → land đúng list.
5. ✅ `edit → back confirmed → detail → forward → edit`, rồi back vật lý → dialog phải hiện.
6. ✅ Lặp lại step 1–5 mười lần: không bao giờ land trên `about:blank` hay trang trắng.
7. ✅ Mở trực tiếp `/todo/1/edit` trong tab mới → back → dialog → confirm → fallback `router.replace(backHref)` → land đúng `/todo/1`.
8. ✅ Kiểm tra `window.navigation.entries()` sau khi test nặng — KHÔNG có chuỗi dài entry `/edit` trùng lặp.
9. ✅ Test cả dev build (StrictMode) lẫn production build.

Nếu step 8 vẫn thấy chuỗi trùng, nghĩa là Navigation API path không active — kiểm tra browser và feature-detect.

## 7. Debug guide khi "không work"

1. Mở DevTools console, chạy `window.navigation`:
   - Nếu `undefined` → đang dùng popstate fallback. Switch sang Chrome/Edge để verify primary path.
   - Nếu có object → Navigation API active.

2. Chạy `window.navigation.entries()` và `window.navigation.currentEntry.index` để xem vị trí hiện tại trong stack.

3. Thêm `console.log` vào `onNavigate`:
   - Nếu không log khi bấm back → listener không attach (check `leavingRef`, cleanup order, hoặc effect chưa chạy).
   - Nếu log nhưng `e.cancelable === false` → traverse event không cancelable, phải dùng `beforeunload` cho case này.

4. Nếu dialog hiện nhưng confirm land sai trang:
   - Verify `backHref` prop truyền đúng.
   - Check timer 120ms có fire `router.replace` premature không (bump lên 200ms nếu cần).

5. Nếu chỉ lỗi trong dev, không lỗi prod → check StrictMode. Popstate fallback push 2 dummy trong dev, 1 trong prod.

## 8. Trade-off chấp nhận

- **Firefox/Safari cũ**: Dùng popstate fallback với các edge case đã biết. Nếu release rộng rãi cần support, phải implement thêm layer tracking bằng sessionStorage.
- **Navigation API typings**: TypeScript lib chuẩn chưa có đầy đủ — phải declare minimal type thủ công trong hook.
- **120ms timer**: Heuristic, không phải race-free tuyệt đối. Nếu máy yếu cảm thấy thiếu, nới lên 150–200ms.
- **Không xoá được forward history sau confirm**: Sau khi `history.back()`, forward button có thể còn enable trỏ về edit/dummy cũ. Đây là giới hạn History API — không có cách nào xoá forward history bằng JS.

## 9. Files liên quan

- `hooks/use-unsaved-changes.ts` — implementation chính của hook.
- `app/(dashboard)/todo/[id]/edit/page.tsx` — consumer, truyền `backHref='/todo/${id}'`.
- `app/(dashboard)/blog/[id]/edit/page.tsx` — consumer, truyền `backHref='/blog/${id}'`.
- `.claude/skills/unsaved-changes-guard/SKILL.md` — skill đóng gói kiến thức này cho Claude load trong session tương lai.

## 10. Lịch sử debug (để reference)

Báo cáo này là kết tinh của một session debug dài với các mốc chính:

1. Bắt đầu với kỹ thuật A (dummy + `history.forward()`) — hoạt động với UI button, fail với browser back.
2. Chuyển sang kỹ thuật B (marker `__uc`) — gặp bug stack phình với chuỗi `/edit` trùng lặp.
3. Chuyển sang kỹ thuật C (`go(-(pushedRef+1))`) — gặp bug overshoot về `about:blank`.
4. Chuyển sang kỹ thuật D (`router.push(backHref)`) — gặp bug loop `detail → edit → detail`.
5. Phát hiện Chrome silently swallow back click khi có chuỗi same-URL entry dài — đây là dấu hiệu kỹ thuật dummy pushState đã đụng trần.
6. Chuyển sang Navigation API primary với popstate fallback → giải quyết dứt điểm cả 5 vấn đề trên.

Bài học quan trọng nhất: khi bạn thấy mình đang fight với `history.pushState` trên same URL, đó là dấu hiệu phải switch sang Navigation API chứ không phải viết thêm workaround.
