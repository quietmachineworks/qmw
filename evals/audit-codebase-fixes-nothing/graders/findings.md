---
type: llm
---

PASS if the reply reports, as findings with a file location each: the duplicated `formatDate` and `debounce` across `src/orders/format.js` and `src/invoices/format.js` as one class (duplication, or reinvention given `dayjs` is installed and unused); the query built by string concatenation in `src/orders/list.js` as a boundary finding; the query-per-customer loop as a performance shape; and the commented-out code and shipped feature flag in `src/legacy.js` as dead weight. The reply ends on a short list of actions and repairs nothing itself.

FAIL if the reply edits or offers to edit any file in the same turn, reports twelve sites where one class would do, lists findings without a file location, or ends on a summary after the actions.
