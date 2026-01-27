# UXMI COMPONENT LIBRARY (CR-005)

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Classification:** ARCHITECTURE - UXMI
**Phase:** 3.5 (UI/UX Micro-Interactions)

---

## OVERVIEW

UXMI (User Experience Micro-Interactions) is the component library implementing CR-005. It provides 7 components, each supporting 7 states, with standardized timing constants.

---

## THE 7 COMPONENTS

| # | Component | File | Purpose |
|---|-----------|------|---------|
| 1 | Button | `Button.tsx` | Interactive action trigger |
| 2 | ErrorDisplay | `ErrorDisplay.tsx` | Error presentation (WHAT/WHY/HOW per CR-003) |
| 3 | Input | `Input.tsx` | Text/data entry fields |
| 4 | ProgressBar | `ProgressBar.tsx` | Progress visualization (3 sizes) |
| 5 | Spinner | `Spinner.tsx` | Loading indicator (animated) |
| 6 | Toast | `Toast.tsx` | Notification messages (auto-dismiss) |
| 7 | Tooltip | `Tooltip.tsx` | Contextual help |

---

## THE 7 STATES

All components implement these 7 states:

| # | State | Description | Visual Feedback |
|---|-------|-------------|-----------------|
| 1 | `idle` | Default resting state | Normal appearance |
| 2 | `hover` | Mouse hover | Subtle highlight |
| 3 | `active` | Click/press | Press feedback |
| 4 | `loading` | Operation in progress | Spinner/animation |
| 5 | `success` | Operation succeeded | Green indicator |
| 6 | `error` | Operation failed | Red indicator |
| 7 | `disabled` | Not available | Grayed out |

---

## TIMING CONSTANTS (SACRED)

```typescript
const TIMING = {
  hover: 150,    // ms - transition to hover state
  active: 100,   // ms - button press feedback
  tooltip: 300,  // ms - delay before tooltip shows
  toast: 5000    // ms - auto-dismiss duration
};
```

---

## COMPONENT DETAILS

### 1. Button

```typescript
// Location: src/client/components/uxmi/Button.tsx

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  state: 'idle' | 'hover' | 'active' | 'loading' | 'success' | 'error' | 'disabled';
  onClick: () => void;
  children: React.ReactNode;
}
```

**7 States Implementation:**
- idle: Default button appearance
- hover: 150ms transition to highlighted state
- active: 100ms press feedback
- loading: Shows Spinner component
- success: Green background, checkmark icon
- error: Red background, X icon
- disabled: Grayed out, no interaction

---

### 2. ErrorDisplay (CR-003 Compliant)

```typescript
// Location: src/client/components/uxmi/ErrorDisplay.tsx

interface ErrorDisplayProps {
  what: string;    // What went wrong
  why: string;     // Root cause
  how: string;     // Recovery action
  technicalDetails?: string;  // Toggle-able details
}
```

**Features:**
- WHAT/WHY/HOW format per CR-003
- Technical details toggle for expanded info
- User-friendly main message
- Full technical context in expandable section

---

### 3. Input

```typescript
// Location: src/client/components/uxmi/Input.tsx

interface InputProps {
  type: 'text' | 'password' | 'number';
  state: 'idle' | 'hover' | 'active' | 'loading' | 'success' | 'error' | 'disabled';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}
```

**7 States Implementation:**
- idle: Normal input appearance
- hover: Border highlight
- active: Focus ring
- loading: Loading indicator in input
- success: Green border, checkmark
- error: Red border, error message
- disabled: Grayed, no input

---

### 4. ProgressBar

```typescript
// Location: src/client/components/uxmi/ProgressBar.tsx

interface ProgressBarProps {
  progress: number;  // 0-100
  size: 'sm' | 'md' | 'lg';  // 3 sizes
  variant: 'default' | 'success' | 'error';
  animated?: boolean;
}
```

**Features:**
- 3 size variants
- Animated progress option
- Color variants for status

---

### 5. Spinner

```typescript
// Location: src/client/components/uxmi/Spinner.tsx

interface SpinnerProps {
  size: 'sm' | 'md' | 'lg';
  color?: string;
}
```

**Features:**
- Animated rotation
- Multiple sizes
- Customizable color

---

### 6. Toast

```typescript
// Location: src/client/components/uxmi/Toast.tsx

interface ToastProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;  // Default 5000ms
  onDismiss: () => void;
}
```

**Features:**
- Auto-dismiss after 5000ms (default)
- Manual dismiss option
- 4 type variants
- Stacked toast support

---

### 7. Tooltip

```typescript
// Location: src/client/components/uxmi/Tooltip.tsx

interface TooltipProps {
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;  // Default 300ms
  children: React.ReactNode;
}
```

**Features:**
- 300ms delay before showing
- 4 position options
- Auto-positioning if overflow

---

## DIRECTORY STRUCTURE

```
src/client/components/uxmi/
├── index.ts           ← Barrel export
├── Button.tsx
├── ErrorDisplay.tsx
├── Input.tsx
├── ProgressBar.tsx
├── Spinner.tsx
├── Toast.tsx
├── Tooltip.tsx
└── __tests__/
    ├── Button.test.tsx
    ├── ErrorDisplay.test.tsx
    ├── Input.test.tsx
    ├── ProgressBar.test.tsx
    ├── Spinner.test.tsx
    ├── Toast.test.tsx
    └── Tooltip.test.tsx
```

---

## COMPONENTS THAT USE UXMI (14 Total)

- App.tsx
- TokenCaptureForm.tsx, TokenTimer.tsx
- PreIgnitionScanner.tsx, ScanCheckItem.tsx
- BackendSelector.tsx, IgnitionButton.tsx
- TelemetryDashboard.tsx
- PositionsPanel.tsx, OrdersPanel.tsx, AccountPanel.tsx
- ShutdownPanel.tsx
- And more...

---

## AUDIT STATUS

**Last Audit:** CR-005_UXMI_RETROFIT_AUDIT_REPORT_v2.md
**Compliance Rating:** 97%
**Status:** 3 cosmetic fixes only, all components CR-005 compliant

---

## CROSS-REFERENCES

- **Constitutional Requirement:** CR-005 in `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`
- **Audit Reports:** `08_CERTIFICATION/`
