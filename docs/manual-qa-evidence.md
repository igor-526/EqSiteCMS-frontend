# CMS Manual QA evidence — harden-core-service-architecture

This document records isolated component visual checks. It does not substitute
for the live critical-flow gate; real-backend results are recorded in
[`live-qa-evidence.md`](./live-qa-evidence.md).

Date: 2026-08-16. Runtime: production Next build served on local port 3100;
Playwright Chromium 1234, headless. API responses were intercepted in the
browser only; no live backend or consumer frontend was used.

Command: `node scripts/manual-qa.mjs`.

## Responsive and runtime checks

| viewport | routes | horizontal overflow | console runtime errors |
| --- | --- | --- | --- |
| 1440×900 | login, horses, prices | none | none |
| 768×900 | login, horses, prices | none | none |
| 360×800 | login, horses, prices | none | none |

Keyboard `Tab` reached the Ant Design tabs list (`UL`) at every viewport.
Deep-link `/horses` with mocked authenticated CMS context loaded directly.
With `/auth/me` returning `401`, the same deep-link redirected to `/login` and
rendered the login action. Protected-write `403`, scope visibility, modal close,
validation and double-submit behavior are covered by isolated MSW/Vitest tests;
the manual runner does not mutate a live backend.

The ADMIN fixture intentionally does not expose developer-only documentation
tabs. Scope registry tests cover ADMIN/DEVELOPER/SUPERUSER tab visibility.

No failed responsive, console or auth cases required screenshots. The raw
structured output is reproducible from the checked-in runner.
