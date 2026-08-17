# Live CMS QA evidence

Real backend and production Next runtime; no route interception or MSW.
CMS base URL: http://localhost:3001. Backend base URL: http://localhost:8001.
Credentials/cookies are loaded from the smoke credential store and never recorded.

| Flow | Route | Viewport | HTTP | Result | Notes |
|---|---|---|---|---|---|
| login | http://localhost:3001/dashboard | — | — | PASS | — |
| feature-deep-link | /horses | 1440x900 | — | PASS | 1097 ms; overflow=false |
| feature-deep-link | /prices | 1440x900 | — | PASS | 882 ms; overflow=false |
| feature-deep-link | /gallery | 1440x900 | — | PASS | 706 ms; overflow=false |
| feature-deep-link | /news | 1440x900 | — | PASS | 702 ms; overflow=false |
| feature-deep-link | /site-settings | 1440x900 | — | PASS | 769 ms; overflow=false |
| feature-deep-link | /horses | 768x900 | — | PASS | 919 ms; overflow=false |
| feature-deep-link | /prices | 768x900 | — | PASS | 815 ms; overflow=false |
| feature-deep-link | /gallery | 768x900 | — | PASS | 781 ms; overflow=false |
| feature-deep-link | /news | 768x900 | — | PASS | 700 ms; overflow=false |
| feature-deep-link | /site-settings | 768x900 | — | PASS | 684 ms; overflow=false |
| feature-deep-link | /horses | 360x800 | — | PASS | 950 ms; overflow=false |
| feature-deep-link | /prices | 360x800 | — | PASS | 803 ms; overflow=false |
| feature-deep-link | /gallery | 360x800 | — | PASS | 646 ms; overflow=false |
| feature-deep-link | /news | 360x800 | — | PASS | 689 ms; overflow=false |
| feature-deep-link | /site-settings | 360x800 | — | PASS | 701 ms; overflow=false |
| keyboard-focus | — | — | — | PASS | — |
| protected-write-success | — | — | 200 | PASS | — |
| mutation-refresh | — | — | — | PASS | — |
| protected-write-anonymous | — | — | 401 | PASS | — |
| protected-write-scope-denial | — | — | 403 | PASS | isolated authenticated user with an empty scope set |
| scope-fixture-cleanup | — | — | 204 | PASS | — |
| cleanup | — | — | 204 | PASS | — |
| cleanup-refresh | — | — | — | PASS | — |
| logout-anonymous-redirect | http://localhost:3001/login | — | — | PASS | — |
| console-errors-captured | — | — | — | PASS | includes intentional denial requests; count=12 |

Summary: 26/26 PASS.

Modal validation and double-submit remain covered by the blocking Vitest component suite; this live gate adds auth, scope denial, real mutation/refresh/cleanup, feature deep-links and logout.
