# notification-service-ui-051 — Live Manual QA

Дата: 2026-08-18

## Статус

`PASS` — F-26..F-37 выполнены на production Next.js build, real backend и PostgreSQL через Playwright 1.62.1 + `/usr/bin/google-chrome-stable`.

Frontend: `http://localhost:3001`. Backend: `http://localhost:8001`. Credentials загружались из mode-0600 descriptor и source store; значения не выводились и не сохранялись в evidence.

## Результаты

- anonymous `/notifications` перенаправлен на `/login`, protected content не появился;
- SUPERUSER и ADMIN видят sidebar/title/tabs и callback/email switch;
- DEVELOPER и USER_MANAGER видят empty state и не имеют switch; live mutation возвращает `403`;
- missing email показывает create без change/delete;
- create: client validation, warning, pending guard, ровно один POST при double click, unconfirmed red state и refetch — PASS;
- change: новый адрес снова unconfirmed; controlled backend `400` сохраняет modal и draft — PASS;
- delete: разные confirmed/unconfirmed тексты, cancel, controlled `500` с сохранением dialog, success refresh — PASS;
- confirmation: invalid `400`, send `202`, немедленный confirm `200`, reuse `409`, expired `410` — PASS;
- confirmation token читался из тестовой PostgreSQL только в process memory, в evidence заменён на `<masked>`, после flow переменные уничтожены завершением процесса;
- settings live PATCH `200` меняет checked только после response; исходное состояние восстановлено;
- controlled `400/401/403/500/timeout` сохраняют прежний checked и показывают ошибку;
- desktop `1440×900`, tablet `768×1024`, mobile `375×812`: document width равен viewport width, overlap/горизонтальной обрезки нет;
- browser requests к private notification/email services: `0`; profile/sidebar regression визуально не обнаружен.

Итого: `28/28 PASS`.

## Evidence

- screenshots: `docs/reports/notification-service-ui-051-live-screenshots/`;
- error screenshots: `setting-400-error.png`, `setting-401-error.png`, `setting-403-error.png`, `setting-500-error.png`, `setting-timeout-error.png`, `delete-error-preserved.png`;
- responsive screenshots: `admin-desktop.png`, `admin-tablet.png`, `admin-mobile.png`;
- role screenshots: `superuser-desktop.png`, `admin-desktop.png`, `developer-desktop.png`, `user_manager-desktop.png`;
- repeatable runner: `scripts/notification-live-manual-qa.mjs`;
- sanitized runtime results/network statuses were stored in `/tmp/notification-service-ui-051-live-results.json`; request secrets and confirmation codes отсутствуют.

## Cleanup

- notification setting ADMIN восстановлен в исходное состояние;
- созданные QA email удалены через owner UI; active `qa-051%@example.com` rows отсутствуют;
- temporary credential descriptor удалён после QA;
- локальный production frontend остановлен, штатный frontend container восстановлен.
