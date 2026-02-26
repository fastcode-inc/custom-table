# Mat Table Ext Audit Report

Date: 2026-02-26  
Scope: `projects/mat-table-ext/src/lib`

## Executive Summary
Not all requested hardening/refactoring items are complete. Several improvements are present (print sanitization, export error handling, tests, partial performance tuning), but important gaps remain (ViewEncapsulation.None usage, production console logs, broad `any` usage, partial input coercion/validation, partial accessibility hardening, and event-listener lifecycle edge case).

---

## Checklist Status

### 1) XSS risk in `printTable()`
**Status:** Partially addressed (good baseline)

**Implemented:**
- Clones print DOM and sanitizes before printing.
- Removes `<script>` nodes and inline `on*` handlers.
- Removes action-column selectors before output.

**Evidence:**
- `projects/mat-table-ext/src/lib/services/table-print.service.ts`
  - `sanitizeTableClone(...)`
  - `removeScriptsAndInlineHandlers(...)`
  - `printTable(...)`
- `projects/mat-table-ext/src/lib/services/table-print.service.spec.ts`
  - test: `sanitizeTableClone should remove scripts, event handlers...`

**Residual risk:**
- Uses `window.document.write(...)` with `outerHTML`; sanitization reduces risk but still relies on HTML string writes.

---

### 2) xlsx/excel library security vulnerabilities
**Status:** Not confirmed as an active ExcelJS vulnerability in current audit output; broader dependency vulnerabilities remain.

**Implemented/Observed:**
- Library uses `exceljs` (not `xlsx`/SheetJS).
- `npm audit --json` reported multiple vulnerabilities (mostly Angular/tooling), not clearly `exceljs` in sampled output.

**Evidence:**
- `package.json` dependency: `exceljs`
- local `npm audit --json` output (terminal)

**Action needed:**
- Run `npm audit` remediation and pin/upgrade vulnerable packages.

---

### 3) `ViewEncapsulation.None` risks
**Status:** Missing

**Evidence:**
- `projects/mat-table-ext/src/lib/components/table-cell-editor/table-cell-editor.component.ts`
  - `encapsulation: ViewEncapsulation.None`

**Action needed:**
- Replace with default encapsulation (or `ShadowDom` if intended and compatible).

---

### 4) Console statements in production code
**Status:** Missing

**Evidence:**
- `projects/mat-table-ext/src/lib/mat-table-ext.component.ts`
  - `console.log('pinRow called:', ...)`
  - several `console.warn(...)`

**Action needed:**
- Remove debug logs or route warnings through a configurable logger.

---

### 5) Memory leak - window event listener
**Status:** Partially addressed

**Implemented:**
- `addEventListener` + `removeEventListener` exist.
- Cleanup in `ngOnDestroy()`.

**Evidence:**
- `projects/mat-table-ext/src/lib/mat-table-ext.component.ts`
  - `attachResizeListener()`
  - `detachResizeListener()`
  - `ngOnDestroy()`

**Gap:**
- Runtime disable-path detach logic appears only inside legacy property-map path (`setPropertyValue`/`setPropertiesMap`) that is likely not in active lifecycle flow.

---

### 6) No `@Input` validation
**Status:** Partially addressed

**Implemented:**
- Validation in `dataSource`, `columns`, `pageSizeOptions` setters.
- String input type checks in `validateInputs(...)`.

**Evidence:**
- `projects/mat-table-ext/src/lib/mat-table-ext.component.ts`
  - setters + `validateInputs(...)`

**Gap:**
- Boolean coercion via `@Input({ transform: booleanAttribute })` is mostly not applied (except `scrollbarH`).

---

### 7) Missing error handling in export functions
**Status:** Implemented at component boundary; partial in service internals

**Implemented:**
- `MatTableExtComponent.exportTable(...)` and `exportToPDF(...)` use `try/catch` and emit `exportError`.

**Evidence:**
- `projects/mat-table-ext/src/lib/mat-table-ext.component.ts`
  - `exportTable(type: string)`
  - `exportToPDF()`

**Gap:**
- `TableExportService.exportTable(...)` lacks top-level `try/catch`; failures bubble up (acceptable if intentionally delegated).

---

### 8) Excessive change detection (performance)
**Status:** Partially addressed

**Implemented:**
- `ChangeDetectionStrategy.OnPush`.
- Dirty-flag model in `ngAfterViewChecked` for deterministic sync.
- Resize listener attached outside Angular zone + debounce timer.

**Evidence:**
- `projects/mat-table-ext/src/lib/mat-table-ext.component.ts`

**Gap:**
- Legacy `setPropertyValue` map path still includes `setTimeout(...)` and may duplicate logic.

---

### 9) Missing accessibility features
**Status:** Partially addressed

**Implemented:**
- Grid role and ARIA attributes present.
- Checkbox labels and tooltips present in many actions.

**Evidence:**
- `projects/mat-table-ext/src/lib/mat-table-ext.component.html`

**Gap:**
- Some labels are generic/non-descriptive (example icon labels), keyboard semantics can be further improved.

---

### 10) Excessive `any` types
**Status:** Missing (not fully addressed)

**Evidence:**
- Multiple `any` usages in main component and export service.
  - `dynamicDisplayedColumns: any[]`
  - row/cell helpers with `row: any`
  - filter callbacks returning/accepting `any`

**Action needed:**
- Introduce strict local interfaces for display columns, row metadata, filter payloads.

---

### 11) Unnecessary public fields
**Status:** Missing/Partial

**Evidence:**
- Main component exposes many mutable fields publicly for internal-only usage.

**Action needed:**
- Convert internal-only fields to `private`/`protected` where template access is not required.

---

### 12) Refactoring and tests
**Status:** Implemented (broadly)

**Implemented:**
- Significant test coverage additions across components, directives, pipes, and services.

**Evidence:**
- 14 `*.spec.ts` files under `projects/mat-table-ext/src/lib`.

**Gap:**
- Missing focused tests for:
  - boolean input coercion coverage across all boolean inputs
  - listener detach behavior when pinning toggles off
  - accessibility label correctness for icon actions

---

## Recommended Next Patch (Priority)
1. Remove `ViewEncapsulation.None` from `table-cell-editor`.
2. Remove/replace production `console.*` logs.
3. Apply boolean coercion (`booleanAttribute`) consistently to boolean inputs.
4. Unify/clean lifecycle paths (`ngOnChanges` vs `setPropertyValue`) and ensure detach on pinning disable.
5. Replace high-frequency `any` with typed interfaces.
6. Add targeted tests for the above.

---

## Notes
- `npm audit` currently reports vulnerabilities in Angular/tooling stack; these should be remediated separately via dependency updates and retesting.
