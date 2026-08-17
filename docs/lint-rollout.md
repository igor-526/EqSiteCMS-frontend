# CMS ESLint rollout

The 401-warning baseline was classified before enabling the blocking gate:

- semantic API-status, permission and request-orchestration findings are fixed and
  enforced in the pilot and feature-wave files listed by `STRICT_FILES`;
- layout-size and legacy presentation findings are outside the approved behavioral
  rollout and are not treated as release signals;
- blanket inline disables are forbidden; semantic pilot/rollout rules are
  promoted to errors through the explicit `STRICT_FILES` scope. The remaining
  legacy warnings stay visible and classified rather than being suppressed.

Rollout order is preserved in `STRICT_FILES`: API status/shared primitives and
horses pilot, then prices, gallery, news and site settings. Each wave is covered by
the feature tests and the full typecheck/build gate.
