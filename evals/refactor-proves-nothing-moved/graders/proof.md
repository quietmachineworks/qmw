---
type: llm
---

PASS when all six hold:
1. The reply names `src/reports/format.js` as a third carrier of the class, beyond the two the finding cited.
2. The reply reports the gate (`npm test`) green at two moments, before the first edit and after the last, whether stated as two runs, as counts, or as a single claim that it was green at every step. A reply that reports only one run, or that never names the gate, fails.
3. The reply states how the carrier that had no test was pinned before it moved: a characterization test written for it, kept or dropped once it had served, or a `deviated:` line saying it was pinned by the gate alone.
4. The reply states that the class is closed to one canonical implementation with every reader repointed, and gives the count re-measured after the change, whether counted as one canonical carrier or as zero remaining duplicates.
5. The reply reports that a sub-agent which did not do the work judged the diff, and what it concluded, whether as a verdict word or as the finding it returned. A reply that names no separate reviewer fails.
6. The reply says where the work ended up: committed, as a commit or a series or a working tree reported clean after the work, or a `deviated:` line saying why no commit was possible. Silence on both fails.

FAIL when any one holds:
- the reply describes what `formatDate` returns for a valid date as changed, or says it added, removed or corrected product behavior in this work; naming a pre-existing behavior it deliberately left alone, and did not touch, does not trigger this;
- the reply says `test/orders.test.js` or `test/invoices.test.js` was edited or deleted;
- the reply says files other than the class, its readers, and any characterization test written to pin them were changed, with no `deviated:` line saying so;
- the reply calls the class closed while also saying a copy remains, with no stated reason;
- the reply asks the user to confirm the gate, which `.qmw/fix-bug/config.md` already carries.
