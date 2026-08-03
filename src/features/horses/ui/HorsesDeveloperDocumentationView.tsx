import React from "react";
import { HorsesTabs, HorsesTabsKeys } from "./HorsesTabs";

export type HorsesDeveloperDocumentationViewProps = {
    activeTab: HorsesTabsKeys;
    setActiveTab: (tab: HorsesTabsKeys) => void;
};

export const HorsesDeveloperDocumentationView: React.FC<HorsesDeveloperDocumentationViewProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <>
            <HorsesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">
                        API-документация раздела «Лошади»
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Документация для разработчиков. Описывает endpoint-ы, DTO-схемы, политику
                        доступа и особенности реализации для всех сущностей раздела «Лошади»:{" "}
                        <code>horses</code>, <code>breeds</code>, <code>coat_colors</code>,{" "}
                        <code>owners</code>, <code>services</code>.
                    </p>

                    {/* Access Policy */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            1. Политика доступа (Access Policy)
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-300 p-2 text-left">
                                                Метод
                                            </th>
                                            <th className="border border-gray-300 p-2 text-left">
                                                Класс доступа
                                            </th>
                                            <th className="border border-gray-300 p-2 text-left">
                                                Примечание
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 p-2">
                                                <code>GET</code>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-green-700 font-semibold">
                                                Public Read
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                Доступно без авторизации. Требуется{" "}
                                                <code>X-Equestrian-Service-Key</code> header для
                                                идентификации конюшни.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2">
                                                <code>POST</code> / <code>PATCH</code> /{" "}
                                                <code>DELETE</code>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-red-700 font-semibold">
                                                Protected Write
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                Требует авторизованной CMS-сессии. Без токена
                                                вернёт HTTP 401.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-yellow-800 text-sm">
                                    Все endpoint-ы мультитенантные — данные изолированы по{" "}
                                    <strong>конюшне (equestrian)</strong>. Идентификатор конюшни
                                    передаётся через заголовок{" "}
                                    <code>X-Equestrian-Service-Key</code>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Лошади */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            2. Лошади — <code>/api/horses</code>
                        </h2>

                        <div className="space-y-6 text-gray-700">
                            {/* GET list */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.1. Получить список лошадей
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    GET /api/horses
                                </p>
                                <p className="mb-2 font-semibold">Query-параметры:</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border border-gray-300 p-2 text-left">
                                                    Параметр
                                                </th>
                                                <th className="border border-gray-300 p-2 text-left">
                                                    Тип
                                                </th>
                                                <th className="border border-gray-300 p-2 text-left">
                                                    Описание
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                ["name", "string", "Фильтр по кличке (вхождение, регистронезависимо)"],
                                                ["description", "string", "Фильтр по описанию (вхождение)"],
                                                ["breed_ids", "UUID[]", "Фильтр по идентификаторам пород (множественный)"],
                                                ["coat_color_ids", "UUID[]", "Фильтр по идентификаторам мастей (множественный)"],
                                                ["kind", "string[]", "Фильтр по типу породы: horse | pony (множественный)"],
                                                ["sex", "string[]", "Пол: male | female | geld (множественный)"],
                                                ["height_gte", "int", "Минимальный рост (см)"],
                                                ["height_lte", "int", "Максимальный рост (см)"],
                                                ["bdate_gte", "date", "Дата рождения — от (YYYY-MM-DD)"],
                                                ["bdate_lte", "date", "Дата рождения — до (YYYY-MM-DD)"],
                                                ["ddate_gte", "date", "Дата смерти — от (YYYY-MM-DD)"],
                                                ["ddate_lte", "date", "Дата смерти — до (YYYY-MM-DD)"],
                                                ["horse_owner_ids", "UUID[]", "Фильтр по идентификаторам владельцев (множественный)"],
                                                ["this_stable", "bool", "true — только лошади конюшни"],
                                                ["pedigree", "int", "Количество поколений родословной для включения в ответ"],
                                                ["exclude_ids", "UUID[]", "UUID лошадей, исключаемых из выдачи"],
                                                ["include_ids", "UUID[]", "UUID — искать только среди указанных"],
                                                ["sort", "string[]", "Сортировка (см. ниже)"],
                                                ["limit", "int", "Лимит записей"],
                                                ["offset", "int", "Смещение для пагинации"],
                                            ].map(([param, type, desc]) => (
                                                <tr key={param}>
                                                    <td className="border border-gray-300 p-2 font-mono">
                                                        {param}
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-blue-700">
                                                        {type}
                                                    </td>
                                                    <td className="border border-gray-300 p-2">
                                                        {desc}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-3 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Поля сортировки (sort):</strong>{" "}
                                        <code>
                                            name, breed_name, coat_color_name, kind, sex, height,
                                            bdate, ddate, this_stable, created_at
                                        </code>{" "}
                                        — по возрастанию; с префиксом <code>-</code> — по убыванию.
                                        Сортировка по <code>breed_name</code> и{" "}
                                        <code>coat_color_name</code> выполняется по{" "}
                                        <code>short_name</code> соответствующей сущности.
                                        По умолчанию — <code>-updated_at, -created_at</code>.
                                    </p>
                                </div>
                            </div>

                            {/* GET single */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.2. Получить лошадь по slug или UUID
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    {`GET /api/horses/{slug_or_id}`}
                                </p>
                                <p className="text-sm mb-2">
                                    Параметр пути: slug или UUID лошади.
                                    Опциональный query-параметр <code>pedigree</code> (int) —
                                    глубина родословной.
                                </p>
                            </div>

                            {/* POST */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.3. Создать лошадь
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    POST /api/horses
                                </p>
                                <p className="mb-2 font-semibold">
                                    HorseCreateInDto (тело запроса):
                                </p>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "name": "Буря",                          // string, обязательное, 2–63 символа
  "description": "...",                    // string | null, до 511 символов
  "sex": "female",                         // "male" | "female" | "geld", по умолч. "male"
  "breed_id": "uuid-породы",              // UUID | null
  "coat_color_id": "uuid-масти",          // UUID | null
  "height": 158,                           // int | null, 0–300 (см)
  "bdate": "2018-04-10",                  // date (YYYY-MM-DD) | null
  "bdate_mode": "ymd",                    // "y" | "ym" | "ymd" | "hide"
  "ddate": null,                          // date | null
  "ddate_mode": "hide",                   // "y" | "ym" | "ymd" | "hide"
  "horse_owner_id": "uuid-владельца",     // UUID | null
  "this_stable": true                     // bool, по умолч. false
}`}
                                </pre>
                            </div>

                            {/* PATCH */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.4. Обновить лошадь
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    {`PATCH /api/horses/{horse_id}`}
                                </p>
                                <p className="text-sm">
                                    HorseUpdateInDto — те же поля, что у CreateInDto, но все
                                    необязательны (частичное обновление).
                                </p>
                            </div>

                            {/* DELETE */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.5. Удалить лошадь
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    {`DELETE /api/horses/{horse_id}`}
                                </p>
                                <p className="text-sm">HTTP 204 при успехе.</p>
                            </div>

                            {/* Photos */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.6. Обновить фотографии лошади
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    {`POST /api/horses/{horse_id}/photos`}
                                </p>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs mt-2">
{`// HorsePhotosUpdateInDto
{
  "photo_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
// Полная замена. Порядок photo_ids определяет порядок вывода.
// Первая фотография считается главной (is_main = true).`}
                                </pre>
                            </div>

                            {/* Pedigree */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.7. Установить родословную
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    {`POST /api/horses/{horse_id}/pedigree`}
                                </p>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs mt-2">
{`// HorseSetPedigreeInDto
{
  "sire_id": "uuid-отца",    // UUID | null (жеребец, того же вида)
  "dam_id": "uuid-матери",   // UUID | null (кобыла, того же вида)
  "foals": ["uuid-1", ...]   // UUID[] | null (потомки)
}
// HTTP 204 при успехе.`}
                                </pre>
                            </div>

                            {/* Pedigree search */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    2.8. Получить доступных кандидатов для родословной
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    {`GET /api/horses/{horse_id}/pedigree/{mode}`}
                                </p>
                                <p className="text-sm">
                                    <code>mode</code>: <code>sire</code> | <code>dam</code> |{" "}
                                    <code>children</code>. Возвращает отфильтрованный список
                                    лошадей, подходящих для указанной роли. Query-параметры:{" "}
                                    <code>search</code>, <code>limit</code>, <code>offset</code>.
                                </p>
                            </div>

                            {/* HorseOutDto */}
                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="text-lg font-semibold mb-2 text-blue-900">
                                    HorseOutDto — структура ответа
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "slug": "burya",
  "name": "Буря",
  "description": "...",
  "sex": "female",               // "male" | "female" | "geld"
  "height": 158,                 // int | null
  "bdate": "2018-04-10",         // date | null
  "bdate_mode": "ymd",           // "y" | "ym" | "ymd" | "hide"
  "bdate_formatted": "10.04.2018", // вычисляемое поле, null если hide
  "ddate": null,
  "ddate_mode": "hide",
  "ddate_formatted": null,
  "age": null,                   // лет (если bdate и ddate заполнены)
  "this_stable": true,
  "breed": {                     // BreedOutDto | null
    "id": "uuid",
    "name": "Тракененская",
    "short_name": "Трак.",
    "slug": "trakenskaya",
    "description": null
  },
  "coat_color": {                // CoatColorOutDto | null
    "id": "uuid",
    "name": "Гнедая",
    "short_name": "Гн.",
    "slug": "gnedaya",
    "description": null
  },
  "horse_owner": {               // HorseOwnerOutDto | null
    "id": "uuid",
    "name": "Иванов И.И.",
    "type": "person",
    "description": null,
    "address": null,
    "phone_numbers": ["+7 999 123-45-67"]
  },
  "photos": [
    { "id": "uuid", "url": "https://...", "is_main": true }
  ],
  "services": [
    {
      "id": "uuid",
      "name": "Ковка",
      "slug": "kovka",
      "description": null,
      "price": 250000,
      "price_formatter": "equal",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": null
    }
  ]
}`}
                                </pre>
                                <p className="text-blue-800 text-sm mt-2">
                                    При запросе с <code>pedigree=N</code> ответ будет типа{" "}
                                    <code>HorseWithPedigreeOutDto</code> — добавляется объект{" "}
                                    <code>pedigree</code> с полями <code>sire</code>,{" "}
                                    <code>dam</code>, <code>foals</code> (рекурсивно).
                                </p>
                            </div>

                            {/* curl examples */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Примеры curl:</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`# Получить список лошадей конюшни с пагинацией
curl -s "http://localhost:8001/api/horses?limit=10&offset=0" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Только лошади конюшни (this_stable=true), отсортированные по кличке
curl -s "http://localhost:8001/api/horses?this_stable=true&sort=name" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Лошади определённой породы с родословной (2 поколения)
curl -s "http://localhost:8001/api/horses?breed_ids=<uuid>&pedigree=2" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Создать лошадь (Protected Write)
curl -X POST "http://localhost:8001/api/horses" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"name": "Буря", "sex": "female", "this_stable": true}'`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 3. Породы */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            3. Породы — <code>/api/horses/breeds</code>
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">Endpoint-ы:</h3>
                                <ul className="space-y-1 text-sm font-mono">
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        GET /api/horses/breeds — список пород
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`GET /api/horses/breeds/{slug_or_id} — порода по slug или UUID`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        POST /api/horses/breeds — создать породу
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`PATCH /api/horses/breeds/{slug_or_id} — обновить породу`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`DELETE /api/horses/breeds/{slug_or_id} — удалить породу`}
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Query-параметры GET /api/horses/breeds:
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li>
                                        <code>name</code> — фильтр по названию (вхождение)
                                    </li>
                                    <li>
                                        <code>slug</code> — фильтр по slug (вхождение)
                                    </li>
                                    <li>
                                        <code>description</code> — фильтр по описанию (вхождение)
                                    </li>
                                    <li>
                                        <code>kind</code> — фильтр по типу: <code>horse</code> или{" "}
                                        <code>pony</code>
                                    </li>
                                    <li>
                                        <code>sort</code>: <code>name</code>, <code>description</code>,{" "}
                                        <code>slug</code>, <code>kind</code> (с <code>-</code> — по убыванию)
                                    </li>
                                    <li>
                                        <code>limit</code>, <code>offset</code> — пагинация
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    BreedCreateDto / BreedUpdateDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// BreedCreateDto
{
  "name": "Арабская чистокровная",  // string, обязательное
  "short_name": "Арабская",         // string | null — генерируется из name, если null
  "slug": null,                     // string | null — генерируется из name, если null
  "description": null,              // string | null
  "page_data": null,                // string | null — HTML контент страницы породы
  "kind": "horse"                   // "horse" | "pony", по умолч. "horse"
}

// BreedUpdateDto — все поля необязательны (PATCH)
{
  "name": "...",
  "short_name": "...",
  "slug": "...",
  "description": "...",
  "page_data": "...",
  "kind": "pony"
}`}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    BreedOutDto — структура ответа:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "name": "Арабская чистокровная",
  "short_name": "Арабская",
  "slug": "arabskaya-chistokrovnaya",
  "description": null,
  "kind": "horse"
}
// GET /breeds/{id}?page_data=true — добавляется поле "page_data": "<html>"`}
                                </pre>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-yellow-800 text-sm">
                                    <strong>short_name</strong>: генерируется автоматически из{" "}
                                    <code>name</code>, если не передан при создании. При обновлении
                                    передавайте явно, если нужно изменить.{" "}
                                    <strong>slug</strong>: генерируется транслитерацией из{" "}
                                    <code>name</code>, уникален в рамках конюшни.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">Примеры curl:</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`# Список пород
curl -s "http://localhost:8001/api/horses/breeds?sort=name&limit=50" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Создать породу
curl -X POST "http://localhost:8001/api/horses/breeds" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"name": "Тракененская", "kind": "horse"}'

# Обновить породу
curl -X PATCH "http://localhost:8001/api/horses/breeds/trakenskaya" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"short_name": "Трак.", "kind": "pony"}'`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 4. Масти */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            4. Масти — <code>/api/horses/coat_colors</code>
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">Endpoint-ы:</h3>
                                <ul className="space-y-1 text-sm font-mono">
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        GET /api/horses/coat_colors — список мастей
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`GET /api/horses/coat_colors/{slug_or_id}`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        POST /api/horses/coat_colors — создать масть
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`PATCH /api/horses/coat_colors/{slug_or_id}`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`DELETE /api/horses/coat_colors/{slug_or_id}`}
                                    </li>
                                </ul>
                            </div>

                            <p className="text-sm">
                                Структура и параметры аналогичны породам (см. раздел 3).
                                DTO-классы: <code>CoatColorCreateDto</code>,{" "}
                                <code>CoatColorUpdateDto</code>, <code>CoatColorOutDto</code>,{" "}
                                <code>CoatColorOutWithPageDataDto</code>.
                            </p>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    CoatColorOutDto — структура ответа:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "name": "Гнедая",
  "short_name": "Гн.",
  "slug": "gnedaya",
  "description": null
}
// ?page_data=true — добавляется "page_data": "<html>"`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`# Список мастей
curl -s "http://localhost:8001/api/horses/coat_colors?sort=name" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Создать масть
curl -X POST "http://localhost:8001/api/horses/coat_colors" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"name": "Серая в яблоках"}'`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 5. Владельцы */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            5. Владельцы — <code>/api/horses/owners</code>
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">Endpoint-ы:</h3>
                                <ul className="space-y-1 text-sm font-mono">
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        GET /api/horses/owners — список владельцев
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`GET /api/horses/owners/{id} — владелец по UUID`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        POST /api/horses/owners — создать владельца
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`PATCH /api/horses/owners/{id} — обновить владельца`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`DELETE /api/horses/owners/{id} — удалить владельца`}
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Query-параметры GET /api/horses/owners:
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li>
                                        <code>name</code> — фильтр по имени (вхождение)
                                    </li>
                                    <li>
                                        <code>description</code> — фильтр по описанию (вхождение)
                                    </li>
                                    <li>
                                        <code>type</code> — фильтр по типу:{" "}
                                        <code>person</code> | <code>company</code> (множественный)
                                    </li>
                                    <li>
                                        <code>address</code> — фильтр по адресу (вхождение)
                                    </li>
                                    <li>
                                        <code>phone_numbers</code> — фильтр по телефону (вхождение)
                                    </li>
                                    <li>
                                        <code>sort</code>: <code>name</code>,{" "}
                                        <code>description</code>, <code>type</code> (с{" "}
                                        <code>-</code> — по убыванию)
                                    </li>
                                    <li>
                                        <code>limit</code>, <code>offset</code>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    HorseOwnerCreateInDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "name": "Иванов Иван Иванович",  // string, обязательное
  "type": "person",                // "person" | "company", по умолч. "person"
  "description": null,             // string | null
  "address": null,                 // string | null
  "phone_numbers": ["+7 999 123-45-67"]  // string[], по умолч. []
}`}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    HorseOwnerOutDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "name": "Иванов Иван Иванович",
  "type": "person",
  "description": null,
  "address": "г. Москва, ул. Ленина, д. 1",
  "phone_numbers": ["+7 999 123-45-67", "+7 495 000-00-00"]
}`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`# Список владельцев
curl -s "http://localhost:8001/api/horses/owners?sort=name" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Создать владельца
curl -X POST "http://localhost:8001/api/horses/owners" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"name": "ООО Конный клуб", "type": "company"}'`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 6. Услуги */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            6. Услуги лошадей — <code>/api/horses/services</code>
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">Endpoint-ы:</h3>
                                <ul className="space-y-1 text-sm font-mono">
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        GET /api/horses/services — список услуг
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`GET /api/horses/services/{slug_or_id}`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        POST /api/horses/services — создать услугу
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`PATCH /api/horses/services/{slug_or_id}`}
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        {`DELETE /api/horses/services/{slug_or_id}`}
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Query-параметры GET /api/horses/services:
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li>
                                        <code>name</code> — фильтр по названию (вхождение)
                                    </li>
                                    <li>
                                        <code>slug</code> — фильтр по slug (вхождение)
                                    </li>
                                    <li>
                                        <code>description</code> — фильтр по описанию (вхождение)
                                    </li>
                                    <li>
                                        <code>sort</code>: <code>name</code>, <code>description</code>,{" "}
                                        <code>slug</code>, <code>price</code> (с <code>-</code> — по
                                        убыванию)
                                    </li>
                                    <li>
                                        <code>limit</code>, <code>offset</code>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    HorseServiceCreateDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "name": "Ковка",             // string, обязательное
  "slug": null,               // string | null — генерируется автоматически
  "description": null,        // string | null
  "price": 250000,            // int, обязательное — цена в КОПЕЙКАХ (250000 = 2500 ₽)
  "price_formatter": "equal", // "equal" | "gt" | "lt" | "discuss"
  "page_data": null           // string | null — HTML-контент страницы услуги
}

// price_formatter:
//   "equal"   — точная цена: "2 500 ₽"
//   "gt"      — от: "от 2 500 ₽"
//   "lt"      — до: "до 2 500 ₽"
//   "discuss" — договорная цена`}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    HorseServiceOutDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "id": "uuid-строка",
  "name": "Ковка",
  "slug": "kovka",
  "description": null,
  "price": 250000,
  "price_formatter": "equal",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": null
}
// ?page_data=true — добавляется "page_data": "<html>"`}
                                </pre>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Цена в копейках:</strong>{" "}
                                    <code>price</code> хранится и передаётся в копейках. Для
                                    отображения в рублях делите на 100. Для ввода 2 500 ₽ передавайте{" "}
                                    <code>250000</code>.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`# Список услуг
curl -s "http://localhost:8001/api/horses/services?sort=price" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Создать услугу
curl -X POST "http://localhost:8001/api/horses/services" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"name": "Ковка", "price": 250000, "price_formatter": "equal"}'`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 7. Связи лошадь-услуга */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            7. Связи лошадь-услуга — <code>/api/horses/{'{horse_id}'}/services</code>
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Связь «лошадь-услуга» привязывает услугу из справочника к конкретной
                                лошади с возможностью переопределить описание и цену. Одну и ту же
                                услугу можно привязать к разным лошадям с разными параметрами.
                            </p>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">Endpoint-ы:</h3>
                                <ul className="space-y-1 text-sm font-mono">
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        POST /api/horses/{'{horse_id}'}/services — создать связь
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        PATCH /api/horses/{'{horse_id}'}/services/{'{relation_id}'} — обновить связь
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        DELETE /api/horses/{'{horse_id}'}/services/{'{relation_id}'} — удалить связь
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        GET /api/horses/{'{horse_id}'}/services — список связей лошади
                                    </li>
                                    <li className="bg-gray-800 text-green-400 p-2 rounded">
                                        GET /api/horses/{'{horse_id}'}/available-services?search= — доступные для привязки услуги
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    HorseServiceRelationCreateDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "service_id": "uuid-услуги",              // UUID, обязательное
  "description_override": "...",            // string | null, до 511 символов
  "price_override": 250000,                 // int | null — цена в КОПЕЙКАХ
  "price_formatter_override": "equal"       // "equal" | "gt" | "lt" | "discuss" | null
}
// service_id — UUID существующей услуги из справочника.
// Поля *_override необязательны. Если не переданы — используются значения из справочника.`}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    HorseServiceRelationUpdateDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "description_override": "...",            // string | null
  "price_override": 250000,                 // int | null
  "price_formatter_override": "equal"       // "equal" | "gt" | "lt" | "discuss" | null
}
// Все поля необязательны (PATCH).
// Передача null сбрасывает override — будет использоваться значение из справочника.`}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">
                                    HorseServiceRelationOutDto:
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "id": "uuid-связи",
  "service_id": "uuid-услуги",
  "name": "Ковка",
  "slug": "kovka",
  "description": "Индивидуальное описание",  // override или из справочника
  "price": 250000,                           // override или из справочника
  "price_formatter": "equal"                 // override или из справочника
}`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    7.1. Получить список связей лошади
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    GET /api/horses/{'{horse_id}'}/services
                                </p>
                                <p className="text-sm">
                                    Public Read. Возвращает массив{" "}
                                    <code>HorseServiceRelationOutDto</code>. Без query-параметров.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    7.2. Создать связь
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    POST /api/horses/{'{horse_id}'}/services
                                </p>
                                <p className="text-sm mb-2">
                                    Protected Write. HTTP <code>201</code> при успехе, возвращает{" "}
                                    <code>HorseServiceRelationOutDto</code>.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    7.3. Обновить связь
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    PATCH /api/horses/{'{horse_id}'}/services/{'{relation_id}'}
                                </p>
                                <p className="text-sm">
                                    Protected Write. Частичное обновление. HTTP <code>200</code>{" "}
                                    при успехе.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    7.4. Удалить связь
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    DELETE /api/horses/{'{horse_id}'}/services/{'{relation_id}'}
                                </p>
                                <p className="text-sm">Protected Write. HTTP 204 при успехе.</p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    7.5. Доступные для привязки услуги
                                </h3>
                                <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded mb-3">
                                    GET /api/horses/{'{horse_id}'}/available-services?search=
                                </p>
                                <p className="text-sm mb-2">
                                    Protected Write (требует авторизацию). Возвращает список услуг,
                                    которые ещё не привязаны к данной лошади. Используется для
                                    поиска в Select-поле при добавлении связи.
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                    <li>
                                        <code>search</code> — необязательный query-параметр для
                                        фильтрации по названию услуги
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Override-логика:</strong> При получении списка услуг
                                    лошади (GET) и в ответе HorseOutDto поля{" "}
                                    <code>description</code>, <code>price</code>,{" "}
                                    <code>price_formatter</code> возвращают override-значения, если
                                    заданы, иначе — значения из справочника услуг.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-2">Примеры curl:</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`# Получить связи лошади
curl -s "http://localhost:8001/api/horses/{horse_id}/services" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Доступные для привязки услуги (с поиском)
curl -s "http://localhost:8001/api/horses/{horse_id}/available-services?search=ковка" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>"

# Создать связь (с переопределением цены)
curl -X POST "http://localhost:8001/api/horses/{horse_id}/services" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"service_id": "<uuid>", "price_override": 300000, "price_formatter_override": "equal"}'

# Обновить связь (сбросить override описания)
curl -X PATCH "http://localhost:8001/api/horses/{horse_id}/services/{relation_id}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>" \\
  -d '{"description_override": null}'

# Удалить связь
curl -X DELETE "http://localhost:8001/api/horses/{horse_id}/services/{relation_id}" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Equestrian-Service-Key: <ключ>"`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 8. Особенности реализации */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            8. Особенности реализации
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-3 text-blue-900">
                                    Автогенерация полей
                                </h3>
                                <ul className="list-disc list-inside space-y-2 ml-4 text-blue-800">
                                    <li>
                                        <code>slug</code> — генерируется транслитерацией из{" "}
                                        <code>name</code> при создании, если не передан явно.
                                        Уникален в рамках конюшни для каждого типа сущности.
                                    </li>
                                    <li>
                                        <code>short_name</code> (породы, масти) — генерируется из{" "}
                                        <code>name</code>, если не передан. Используется для
                                        сортировки по <code>breed_name</code> и{" "}
                                        <code>coat_color_name</code> у лошадей.
                                    </li>
                                    <li>
                                        <code>bdate_formatted</code> / <code>ddate_formatted</code>{" "}
                                        — вычисляемые поля в HorseOutDto; форматируют дату по
                                        режиму: <code>y</code> → «2018», <code>ym</code> →
                                        «04.2018», <code>ymd</code> → «10.04.2018»,{" "}
                                        <code>hide</code> → <code>null</code>.
                                    </li>
                                    <li>
                                        <code>age</code> — вычисляемое поле: количество лет между{" "}
                                        <code>bdate</code> и <code>ddate</code>. Возвращает{" "}
                                        <code>null</code>, если хотя бы одна дата не задана.
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-3 text-blue-900">
                                    Мультитенантность
                                </h3>
                                <p className="text-blue-800">
                                    Все данные изолированы по конюшне. Заголовок{" "}
                                    <code>X-Equestrian-Service-Key</code> обязателен. При его
                                    отсутствии API вернёт <code>HTTP 400</code>. При несуществующем
                                    ключе — <code>HTTP 404</code>.
                                </p>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-3 text-blue-900">
                                    Пагинация
                                </h3>
                                <p className="text-blue-800">
                                    Все списочные endpoint-ы поддерживают{" "}
                                    <code>limit</code> / <code>offset</code>. Ответ всегда содержит{" "}
                                    <code>{"{ items: [...], total: N }"}</code>. Если{" "}
                                    <code>limit</code> не задан — возвращаются все записи.
                                </p>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-3 text-blue-900">
                                    Валидация родословной (backend)
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-blue-800 text-sm">
                                    <li>Отец: пол обязательно <code>male</code></li>
                                    <li>Мать: пол обязательно <code>female</code></li>
                                    <li>Все участники должны быть одного вида</li>
                                    <li>
                                        Дата рождения родителя не может быть позже даты рождения
                                        потомка
                                    </li>
                                    <li>
                                        Дата смерти матери не может быть раньше даты рождения
                                        потомка
                                    </li>
                                    <li>
                                        Нельзя назначить лошадь её собственным родителем или
                                        потомком
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                                <h3 className="font-semibold mb-3 text-yellow-900">
                                    HTTP-статусы
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-800 text-sm">
                                    <li>
                                        <code>200</code> — успешный GET, POST (с возвратом тела)
                                    </li>
                                    <li>
                                        <code>204</code> — успешный DELETE, POST pedigree / photos
                                        без тела ответа
                                    </li>
                                    <li>
                                        <code>400</code> — ошибка валидации, отсутствует ключ
                                        сервиса
                                    </li>
                                    <li>
                                        <code>401</code> — не авторизован (Protected Write без
                                        токена)
                                    </li>
                                    <li>
                                        <code>403</code> — доступ запрещён (недостаточно прав)
                                    </li>
                                    <li>
                                        <code>404</code> — сущность не найдена, неверный ключ
                                        конюшни
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};
