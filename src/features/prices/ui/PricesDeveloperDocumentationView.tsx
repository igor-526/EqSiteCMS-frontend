import React from "react";
import { PricesTabs, PricesTabsEnum } from "./PricesTabs";

export type PricesDeveloperDocumentationViewProps = {
    activeTab: PricesTabsEnum;
    setActiveTab: (tab: PricesTabsEnum) => void;
};

export const PricesDeveloperDocumentationView: React.FC<PricesDeveloperDocumentationViewProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <>
            <PricesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">Документация API для работы с ценами</h1>
                    <p className="text-gray-600 mb-8">
                        Данная документация предназначена для разработчиков сайта конюшни, использующих API для получения информации о ценах и услугах.
                        Все методы API работают только на чтение (GET запросы).
                    </p>

                    {/* 1. Группы услуг */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">1. Группы услуг (Price Groups)</h2>
                        
                        <div className="space-y-4 text-gray-700">
                            <p>
                                <strong>Группы услуг</strong> — это категории, которые позволяют организовать услуги конюшни по тематическим группам.
                                Например: &quot;Абонементы&quot;, &quot;Разовые занятия&quot;, &quot;Услуги по уходу за лошадьми&quot; и т.д.
                            </p>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Структура группы услуг:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><code className="bg-gray-200 px-1 rounded">id</code> (UUID) - Уникальный идентификатор группы</li>
                                    <li><code className="bg-gray-200 px-1 rounded">name</code> (string) - Название группы (максимум 63 символа)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">description</code> (string | null) - Описание группы (максимум 511 символов, опционально)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">created_at</code> (ISO datetime) - Дата создания</li>
                                    <li><code className="bg-gray-200 px-1 rounded">updated_at</code> (ISO datetime | null) - Дата последнего обновления</li>
                                </ul>
                            </div>

                            <p>
                                <strong>Важно:</strong> Одна услуга может принадлежать нескольким группам одновременно. 
                                Это позволяет гибко категоризировать услуги (например, услуга может быть одновременно в группах &quot;Абонементы&quot; и &quot;Для начинающих&quot;).
                            </p>
                        </div>
                    </section>

                    {/* 2. Услуги (Prices) */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">2. Услуги (Prices)</h2>
                        
                        <div className="space-y-4 text-gray-700">
                            <p>
                                <strong>Услуга</strong> — это конкретная ценовая позиция конюшни. Каждая услуга имеет название, описание, 
                                может быть привязана к группам, иметь фотографии и содержать таблицы с ценами.
                            </p>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Структура услуги:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><code className="bg-gray-200 px-1 rounded">id</code> (UUID) - Уникальный идентификатор услуги</li>
                                    <li><code className="bg-gray-200 px-1 rounded">name</code> (string) - Название услуги (максимум 63 символа)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">slug</code> (string) - URL-дружественный идентификатор для использования в ссылках (максимум 63 символа)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">description</code> (string | null) - Краткое описание услуги (максимум 511 символов)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">photos</code> (array) - Массив фотографий услуги (см. структуру ниже)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">groups</code> (array) - Массив групп, к которым принадлежит услуга</li>
                                    <li><code className="bg-gray-200 px-1 rounded">page_data</code> (string | null) - HTML-контент страницы услуги (доступен только при запросе конкретной услуги с параметром <code className="bg-gray-200 px-1 rounded">page_data=true</code>)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">price_tables</code> (array) - Массив таблиц с ценами (всегда включен в ответ)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">created_at</code> (ISO datetime) - Дата создания</li>
                                    <li><code className="bg-gray-200 px-1 rounded">updated_at</code> (ISO datetime | null) - Дата последнего обновления</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">Как работает на бэкенде:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-blue-800">
                                    <li>Услуги хранятся в базе данных PostgreSQL в таблице <code className="bg-blue-100 px-1 rounded">prices</code></li>
                                    <li>Связь с группами реализована через промежуточную таблицу <code className="bg-blue-100 px-1 rounded">price_groups_relations</code> (many-to-many)</li>
                                    <li>Связь с фотографиями реализована через таблицу <code className="bg-blue-100 px-1 rounded">price_photos</code> (many-to-many с флагом <code className="bg-blue-100 px-1 rounded">is_main</code>)</li>
                                    <li>Таблицы цен хранятся в формате JSONB в поле <code className="bg-blue-100 px-1 rounded">price_tables</code></li>
                                    <li>HTML-контент страницы хранится в поле <code className="bg-blue-100 px-1 rounded">page_data</code> (тип TEXT)</li>
                                    <li>Slug генерируется автоматически из названия услуги (транслитерация + нижний регистр)</li>
                                    <li>Фотографии сортируются так, что главная фотография (is_main=true) всегда идет первой</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Структура фотографии в услуге:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><code className="bg-gray-200 px-1 rounded">id</code> (UUID) - Идентификатор фотографии</li>
                                    <li><code className="bg-gray-200 px-1 rounded">url</code> (string) - Полный URL фотографии</li>
                                    <li><code className="bg-gray-200 px-1 rounded">is_main</code> (boolean) - Является ли фотография главной</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Структура группы в услуге:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><code className="bg-gray-200 px-1 rounded">id</code> (UUID) - Идентификатор группы</li>
                                    <li><code className="bg-gray-200 px-1 rounded">name</code> (string) - Название группы</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. GET методы и фильтры */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">3. GET методы API и фильтры</h2>
                        
                        <div className="space-y-6">
                            {/* Группы услуг */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">3.1. Получить список групп услуг</h3>
                                <p className="mb-3 font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">GET /api/prices/groups</p>
                                
                                <div className="space-y-3">
                                    <div>
                                        <strong>Параметры запроса (query parameters):</strong>
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                            <li><code className="bg-gray-200 px-1 rounded">name</code> (string, опционально) - Фильтр по названию. Поиск по вхождению подстроки (регистронезависимый)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">description</code> (string, опционально) - Фильтр по описанию. Поиск по вхождению подстроки (регистронезависимый)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">sort</code> (array, опционально) - Сортировка. Возможные значения: <code className="bg-gray-200 px-1 rounded">[&quot;name&quot;]</code> (по возрастанию), <code className="bg-gray-200 px-1 rounded">[&quot;-name&quot;]</code> (по убыванию). Можно передать несколько значений</li>
                                            <li><code className="bg-gray-200 px-1 rounded">limit</code> (integer, опционально) - Количество записей на странице (для пагинации)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">offset</code> (integer, опционально) - Смещение для пагинации (сколько записей пропустить)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <strong>Формат ответа:</strong>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "items": [
    {
      "id": "uuid",
      "name": "Абонементы",
      "description": "Группа абонементных услуг",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 10
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">3.2. Получить группу услуг по ID</h3>
                                <p className="mb-3 font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">GET /api/prices/groups/{`{id}`}</p>
                                
                                <div className="space-y-3">
                                    <p><strong>Параметры пути:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li><code className="bg-gray-200 px-1 rounded">id</code> (UUID) - Идентификатор группы</li>
                                    </ul>

                                    <div>
                                        <strong>Формат ответа:</strong>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "name": "Абонементы",
  "description": "Группа абонементных услуг",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Услуги */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">3.3. Получить список услуг</h3>
                                <p className="mb-3 font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">GET /api/prices</p>
                                
                                <div className="space-y-3">
                                    <div>
                                        <strong>Параметры запроса (query parameters):</strong>
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                            <li><code className="bg-gray-200 px-1 rounded">name</code> (string | array, опционально) - Фильтр по названию. Можно передать одно значение или массив для поиска по нескольким названиям. Поиск по вхождению подстроки (регистронезависимый)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">description</code> (string, опционально) - Фильтр по описанию. Поиск по вхождению подстроки (регистронезависимый)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">groups</code> (string | array, опционально) - Фильтр по группам. Можно передать название группы (строкой) или массив названий. Фильтрует услуги, которые принадлежат группам с указанными названиями (полное совпадение названия)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">sort</code> (array, опционально) - Сортировка. Возможные значения: <code className="bg-gray-200 px-1 rounded">[&quot;name&quot;]</code> (по возрастанию), <code className="bg-gray-200 px-1 rounded">[&quot;-name&quot;]</code> (по убыванию)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">limit</code> (integer, опционально) - Количество записей на странице</li>
                                            <li><code className="bg-gray-200 px-1 rounded">offset</code> (integer, опционально) - Смещение для пагинации</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <strong>Формат ответа:</strong>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "items": [
    {
      "id": "uuid",
      "name": "Абонемент на месяц",
      "slug": "abonement-na-mesyac",
      "description": "Абонемент включает 8 занятий",
      "photos": [
        {
          "id": "uuid",
          "url": "https://example.com/media/photo.jpg",
          "is_main": true
        }
      ],
      "groups": [
        {
          "id": "uuid",
          "name": "Абонементы"
        }
      ],
      "price_tables": [
        {
          "columns": [...],
          "rows": [...]
        }
      ],
      "page_data": "<div></div>",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 25
}`}
                                        </pre>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                        <p className="text-blue-800 text-sm">
                                            <strong>Важно:</strong> В ответе всегда включаются поля <code className="bg-blue-100 px-1 rounded">price_tables</code> и <code className="bg-blue-100 px-1 rounded">page_data</code>. 
                                            Поле <code className="bg-blue-100 px-1 rounded">price_tables</code> содержит массив таблиц цен услуги (может быть пустым массивом <code className="bg-blue-100 px-1 rounded">[]</code>, если таблиц нет, или содержать реальные таблицы). 
                                            Поле <code className="bg-blue-100 px-1 rounded">page_data</code> содержит HTML-контент страницы услуги из базы данных (по умолчанию <code className="bg-blue-100 px-1 rounded">&lt;div&gt;&lt;/div&gt;</code>, если контент не задан). 
                                            Структура таблиц описана в разделе 5.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">3.4. Получить услугу по slug или ID</h3>
                                <p className="mb-3 font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">GET /api/prices/{`{slug_or_id}`}</p>
                                
                                <div className="space-y-3">
                                    <p><strong>Параметры пути:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li><code className="bg-gray-200 px-1 rounded">slug_or_id</code> (string) - Slug услуги (например, &quot;abonement-na-mesyac&quot;) или UUID</li>
                                    </ul>

                                    <div>
                                        <strong>Параметры запроса (query parameters):</strong>
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                            <li><code className="bg-gray-200 px-1 rounded">page_data</code> (boolean, опционально, по умолчанию false) - Параметр для обратной совместимости (не влияет на ответ, так как <code className="bg-gray-200 px-1 rounded">page_data</code> всегда включен в ответ)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <strong>Формат ответа:</strong>
                                        <p className="text-sm text-gray-600 mb-2">Ответ всегда включает <code className="bg-gray-200 px-1 rounded">price_tables</code> и <code className="bg-gray-200 px-1 rounded">page_data</code>. Поле <code className="bg-gray-200 px-1 rounded">page_data</code> содержит HTML-контент страницы услуги из базы данных (по умолчанию <code className="bg-gray-200 px-1 rounded">&lt;div&gt;&lt;/div&gt;</code>, если контент не задан). Структура таблиц описана в разделе 5.</p>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "name": "Абонемент на месяц",
  "slug": "abonement-na-mesyac",
  "description": "Абонемент включает 8 занятий",
  "photos": [...],
  "groups": [...],
  "price_tables": [...],
  "page_data": "<div><h1>Подробное описание услуги</h1><p>...</p></div>",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Примеры запросов */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">4. Примеры запросов</h2>
                        
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 1: Получить все группы услуг с сортировкой по названию</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/prices/groups?sort=name&limit=50

Ответ:
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Абонементы",
      "description": "Группа абонементных услуг",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": null
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Разовые занятия",
      "description": null,
      "created_at": "2024-01-02T00:00:00",
      "updated_at": null
    }
  ],
  "total": 2
}`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 2: Получить услуги из конкретной группы</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/prices?groups=Абонементы&sort=name

Ответ:
{
  "items": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "name": "Абонемент на месяц",
      "slug": "abonement-na-mesyac",
      "description": "Абонемент включает 8 занятий",
      "photos": [
        {
          "id": "423e4567-e89b-12d3-a456-426614174003",
          "url": "https://example.com/media/abonement.jpg",
          "is_main": true
        }
      ],
      "groups": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Абонементы"
        }
      ],
      "price_tables": [
        {
          "columns": [...],
          "rows": [...]
        }
      ],
      "page_data": "<div></div>",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": null
    }
  ],
  "total": 1
}

Примечание: price_tables всегда включены в ответ (может быть пустым массивом [] или содержать таблицы)`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 3: Получить услугу по slug с полными данными</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/prices/abonement-na-mesyac

Ответ всегда включает:
- Все базовые поля услуги
- price_tables (массив таблиц с ценами, всегда включен)
- page_data (HTML-контент страницы, всегда включен)

Примечание: price_tables и page_data всегда включены в ответ для этого метода, независимо от параметров запроса`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 4: Поиск услуг по названию с пагинацией</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/prices?name=абонемент&limit=10&offset=0&sort=-name

Ответ:
{
  "items": [...], // до 10 услуг, содержащих "абонемент" в названии
  "total": 15     // общее количество найденных услуг
}`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 5: Получить услуги из нескольких групп</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/prices?groups=Абонементы&groups=Разовые занятия

Или в JavaScript:
const groupNames = ["Абонементы", "Разовые занятия"];
const params = new URLSearchParams();
groupNames.forEach(name => params.append('groups', name));
fetch(\`/api/prices?\${params.toString()}\`);`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 5. Таблицы цен */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">5. Таблицы цен (price_tables)</h2>
                        
                        <div className="space-y-6 text-gray-700">
                            <p>
                                <strong>Таблицы цен</strong> — это гибкий механизм для отображения структурированных данных о ценах и услугах. 
                                Каждая услуга может содержать несколько таблиц, каждая таблица может иметь произвольное количество колонок и строк.
                            </p>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="text-xl font-semibold mb-3 text-blue-900">5.1. Общая структура</h3>
                                
                                <p className="mb-3">
                                    Поле <code className="bg-blue-100 px-1 rounded">price_tables</code> — это массив объектов таблиц. 
                                    Каждая таблица имеет следующую структуру:
                                </p>

                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs mb-4">
{`{
  "price_tables": [
    {
      "columns": [...],  // массив колонок
      "rows": [...]      // массив строк
    }
  ]
}`}
                                </pre>

                                <p className="text-blue-800">
                                    <strong>Важно:</strong> Пустые таблицы (без колонок или без строк) автоматически удаляются при сохранении.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">5.2. Структура колонки (TableColumn)</h3>
                                
                                <p className="mb-3">Колонка определяет структуру данных в таблице:</p>

                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs mb-4">
{`{
  "key": "price",                    // Уникальный ключ колонки (используется для связи с ячейками)
  "title": "Цена",                   // Отображаемое название колонки
  "annotation": "Цена в рублях",     // Подсказка при наведении
  "cell_formatter": ["text_bold"]    // Форматтеры по умолчанию для ячеек этой колонки
}`}
                                </pre>

                                <div className="space-y-2 mt-4">
                                    <div>
                                        <strong>Поля колонки:</strong>
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                            <li><code className="bg-gray-200 px-1 rounded">key</code> (string, обязательное) - Уникальный ключ колонки. Используется для связи ячеек строк с колонками. Должен быть уникальным в рамках одной таблицы.</li>
                                            <li><code className="bg-gray-200 px-1 rounded">title</code> (string, обязательное) - Название колонки, которое отображается пользователю (например, &quot;Цена&quot;, &quot;Количество занятий&quot;, &quot;Срок действия&quot;).</li>
                                            <li><code className="bg-gray-200 px-1 rounded">annotation</code> (string, обязательное) - Текст подсказки, который показывается при наведении на заголовок колонки. Может быть пустой строкой.</li>
                                            <li><code className="bg-gray-200 px-1 rounded">cell_formatter</code> (array, опционально, по умолчанию []) - Массив форматтеров, которые применяются по умолчанию ко всем ячейкам этой колонки. Возможные значения: <code className="bg-gray-200 px-1 rounded">&quot;text_bold&quot;</code>, <code className="bg-gray-200 px-1 rounded">&quot;text_italic&quot;</code>, <code className="bg-gray-200 px-1 rounded">&quot;text_underline&quot;</code>.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">5.3. Структура строки (TableRow)</h3>
                                
                                <p className="mb-3">Строка содержит ячейки, связанные с колонками по ключам:</p>

                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs mb-4">
{`{
  "cells": {
    "price": {              // ключ соответствует key колонки
      "value": "5000",
      "annotation": "Цена за месяц",
      "cell_formatter": ["text_bold"]
    },
    "lessons": {
      "value": "8",
      "annotation": "Количество занятий",
      "cell_formatter": []
    }
  }
}`}
                                </pre>

                                <p className="text-sm text-gray-600 mt-3">
                                    <strong>Важно:</strong> Ключи в объекте <code className="bg-gray-200 px-1 rounded">cells</code> должны соответствовать ключам колонок (<code className="bg-gray-200 px-1 rounded">key</code>). 
                                    Если для какой-то колонки нет ячейки в строке, эта ячейка считается пустой.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">5.4. Структура ячейки (TableCell)</h3>
                                
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs mb-4">
{`{
  "value": "5000",                    // Значение ячейки (строка)
  "annotation": "Цена за месяц",      // Подсказка при наведении на ячейку
  "cell_formatter": ["text_bold"]     // Форматтеры для отображения значения
}`}
                                </pre>

                                <div className="space-y-2 mt-4">
                                    <div>
                                        <strong>Поля ячейки:</strong>
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                            <li><code className="bg-gray-200 px-1 rounded">value</code> (string, обязательное) - Значение ячейки. Может содержать любой текст (например, &quot;5000&quot;, &quot;8 занятий&quot;, &quot;1 месяц&quot;).</li>
                                            <li><code className="bg-gray-200 px-1 rounded">annotation</code> (string, обязательное) - Текст подсказки при наведении на ячейку. Может быть пустой строкой.</li>
                                            <li><code className="bg-gray-200 px-1 rounded">cell_formatter</code> (array, опционально, по умолчанию []) - Массив форматтеров для отображения значения. Переопределяет форматтеры колонки для конкретной ячейки. Возможные значения:
                                                <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                                                    <li><code className="bg-gray-200 px-1 rounded">&quot;text_bold&quot;</code> - Жирный текст</li>
                                                    <li><code className="bg-gray-200 px-1 rounded">&quot;text_italic&quot;</code> - Курсив</li>
                                                    <li><code className="bg-gray-200 px-1 rounded">&quot;text_underline&quot;</code> - Подчеркнутый текст</li>
                                                </ul>
                                                Можно комбинировать несколько форматтеров: <code className="bg-gray-200 px-1 rounded">[&quot;text_bold&quot;, &quot;text_italic&quot;]</code>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">5.5. Полный пример таблицы</h3>
                                
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs mb-4">
{`{
  "price_tables": [
    {
      "columns": [
        {
          "key": "package_name",
          "title": "Название пакета",
          "annotation": "Название абонемента",
          "cell_formatter": []
        },
        {
          "key": "lessons",
          "title": "Занятий",
          "annotation": "Количество занятий в абонементе",
          "cell_formatter": []
        },
        {
          "key": "price",
          "title": "Цена",
          "annotation": "Стоимость в рублях",
          "cell_formatter": ["text_bold"]
        },
        {
          "key": "validity",
          "title": "Срок действия",
          "annotation": "Период действия абонемента",
          "cell_formatter": []
        }
      ],
      "rows": [
        {
          "cells": {
            "package_name": {
              "value": "Базовый",
              "annotation": "Базовый абонемент",
              "cell_formatter": []
            },
            "lessons": {
              "value": "4",
              "annotation": "4 занятия",
              "cell_formatter": []
            },
            "price": {
              "value": "3000 ₽",
              "annotation": "Три тысячи рублей",
              "cell_formatter": ["text_bold"]
            },
            "validity": {
              "value": "1 месяц",
              "annotation": "Действует 30 дней",
              "cell_formatter": []
            }
          }
        },
        {
          "cells": {
            "package_name": {
              "value": "Стандартный",
              "annotation": "Стандартный абонемент",
              "cell_formatter": []
            },
            "lessons": {
              "value": "8",
              "annotation": "8 занятий",
              "cell_formatter": []
            },
            "price": {
              "value": "5000 ₽",
              "annotation": "Пять тысяч рублей",
              "cell_formatter": ["text_bold"]
            },
            "validity": {
              "value": "1 месяц",
              "annotation": "Действует 30 дней",
              "cell_formatter": []
            }
          }
        },
        {
          "cells": {
            "package_name": {
              "value": "Премиум",
              "annotation": "Премиум абонемент",
              "cell_formatter": []
            },
            "lessons": {
              "value": "12",
              "annotation": "12 занятий",
              "cell_formatter": []
            },
            "price": {
              "value": "7000 ₽",
              "annotation": "Семь тысяч рублей",
              "cell_formatter": ["text_bold", "text_italic"]
            },
            "validity": {
              "value": "2 месяца",
              "annotation": "Действует 60 дней",
              "cell_formatter": []
            }
          }
        }
      ]
    }
  ]
}`}
                                </pre>
                            </div>

                            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                                <h3 className="text-xl font-semibold mb-3 text-yellow-900">5.6. Рекомендации по использованию таблиц</h3>
                                
                                <ul className="list-disc list-inside space-y-2 ml-4 text-yellow-800">
                                    <li><strong>Используйте таблицы для структурированных данных:</strong> Таблицы идеально подходят для отображения прайс-листов, сравнения тарифов, расписаний занятий и т.д.</li>
                                    <li><strong>Уникальные ключи колонок:</strong> Ключи колонок должны быть уникальными в рамках одной таблицы. Используйте осмысленные ключи (например, &quot;price&quot;, &quot;lessons&quot;, &quot;duration&quot;), а не случайные строки.</li>
                                    <li><strong>Форматтеры:</strong> Используйте форматтеры для выделения важной информации (например, цены можно выделить жирным). Форматтеры колонки применяются ко всем ячейкам по умолчанию, но могут быть переопределены на уровне ячейки.</li>
                                    <li><strong>Аннотации:</strong> Используйте аннотации для предоставления дополнительной информации пользователям при наведении курсора.</li>
                                    <li><strong>Множественные таблицы:</strong> Одна услуга может содержать несколько таблиц. Например, одна таблица для абонементов, другая для разовых занятий.</li>
                                    <li><strong>Обработка пустых значений:</strong> Если ячейка отсутствует в строке, обрабатывайте это как пустое значение. Всегда проверяйте наличие ключа в объекте <code className="bg-yellow-100 px-1 rounded">cells</code> перед использованием.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">5.7. Пример обработки таблиц на фронтенде (JavaScript)</h3>
                                
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// Получение услуги (таблицы всегда включены)
const response = await fetch('/api/prices/abonement-na-mesyac?page_data=true');
const price = await response.json();

// Обработка таблиц
if (price.price_tables && price.price_tables.length > 0) {
  price.price_tables.forEach((table, tableIndex) => {
    console.log(\`Таблица \${tableIndex + 1}\`);
    
    // Вывод заголовков колонок
    const headers = table.columns.map(col => col.title);
    console.log('Заголовки:', headers);
    
    // Обработка строк
    table.rows.forEach((row, rowIndex) => {
      console.log(\`Строка \${rowIndex + 1}:\`);
      
      table.columns.forEach(column => {
        const cell = row.cells[column.key];
        if (cell) {
          let value = cell.value;
          
          // Применение форматтеров
          if (cell.cell_formatter.includes('text_bold')) {
            value = \`<strong>\${value}</strong>\`;
          }
          if (cell.cell_formatter.includes('text_italic')) {
            value = \`<em>\${value}</em>\`;
          }
          if (cell.cell_formatter.includes('text_underline')) {
            value = \`<u>\${value}</u>\`;
          }
          
          console.log(\`  \${column.title}: \${value}\`);
          if (cell.annotation) {
            console.log(\`    (подсказка: \${cell.annotation})\`);
          }
        } else {
          console.log(\`  \${column.title}: (пусто)\`);
        }
      });
    });
  });
}`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* Заключение */}
                    <section className="mb-8">
                        <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
                            <h2 className="text-xl font-semibold mb-3 text-green-900">Заключение</h2>
                            <p className="text-green-800">
                                Данная документация описывает все доступные GET методы API для работы с ценами и услугами конюшни. 
                                Все методы возвращают данные в формате JSON. Используйте фильтры и параметры запросов для получения 
                                именно тех данных, которые вам нужны. Помните, что <code className="bg-green-100 px-1 rounded">price_tables</code> и <code className="bg-green-100 px-1 rounded">page_data</code> всегда включены в ответ 
                                для методов получения списка услуг (<code className="bg-green-100 px-1 rounded">GET /api/prices</code>) и получения услуги по slug/ID (<code className="bg-green-100 px-1 rounded">GET /api/prices/{`{slug_or_id}`}</code>).
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};



