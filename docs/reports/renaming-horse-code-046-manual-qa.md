# Manual QA evidence: renaming-horse-code-046

Дата: 2026-08-17

## Автоматизированное evidence

- CMS DTO сохраняет raw nullable `pedigree_name`; frontend не выполняет public fallback.
- Компонентные тесты подтверждают значение и `null` (`—`) в колонке, loading, empty и error states.
- Тесты формы подтверждают create, edit, clear-to-null, omitted при неизменённом поле, double-submit guard и field error state.
- API-boundary тесты через MSW подтверждают success, `null`, validation/generic/401/403 без live backend calls.
- Существующие horse tests подтверждают scopes и pagination через `limit/offset`, включая reset `offset=0`.

## Визуальная проверка

Шаги design для desktop 1440×900, tablet 768×1024 и mobile 390×844 не выполнены: в текущей среде не доступен управляемый браузер (`No browser is available`). Поэтому responsive layout, реальная cookie-сессия и Network projection не отмечены как passed и требуют повторения Quality Gate или человеком в запущенном окружении.

Screenshots отсутствуют, поскольку browser session не была доступна.
