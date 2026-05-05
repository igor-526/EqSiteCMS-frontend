import React from "react";
import { SiteSettingsTabs } from "./SiteSettingsTabs";

export type SiteSettingsDeveloperDocumentationViewProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

export const SiteSettingsDeveloperDocumentationView: React.FC<SiteSettingsDeveloperDocumentationViewProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <>
            <SiteSettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">Документация API для работы с настройками сайта</h1>
                    <p className="text-gray-600 mb-8">
                        Данная документация предназначена для разработчиков сайта, использующих API для получения и управления настройками сайта.
                        Все методы API работают с аутентификацией (требуется авторизация).
                    </p>

                    {/* 1. Настройки сайта */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">1. Настройки сайта (Site Settings)</h2>
                        
                        <div className="space-y-4 text-gray-700">
                            <p>
                                <strong>Настройки сайта</strong> — это система для хранения и управления статичной информацией, 
                                которую API отдает на фронтенд сайта. Каждая настройка имеет ключ, значение, человекочитаемое название, 
                                описание и тип данных.
                            </p>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Структура настройки:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><code className="bg-gray-200 px-1 rounded">id</code> (UUID) - Уникальный идентификатор настройки</li>
                                    <li><code className="bg-gray-200 px-1 rounded">key</code> (string) - Уникальный ключ для фильтрации и получения настройки через API (максимум 63 символа, уникальный)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">value</code> (string) - Значение настройки (хранится как текст, но преобразуется в нужный тип при чтении)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">name</code> (string) - Человекочитаемое название настройки (максимум 63 символа, уникальный)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">description</code> (string | null) - Описание настройки (максимум 511 символов, опционально)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">type</code> (string) - Тип данных, к которому нужно преобразовать значение при чтении (см. раздел 2)</li>
                                    <li><code className="bg-gray-200 px-1 rounded">created_at</code> (ISO datetime) - Дата создания</li>
                                    <li><code className="bg-gray-200 px-1 rounded">updated_at</code> (ISO datetime | null) - Дата последнего обновления</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-2 text-blue-900">Как работает на бэкенде:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-blue-800">
                                    <li>Настройки хранятся в базе данных PostgreSQL в таблице <code className="bg-blue-100 px-1 rounded">site_settings</code></li>
                                    <li>Значение всегда хранится как строка (TEXT) в поле <code className="bg-blue-100 px-1 rounded">value</code></li>
                                    <li>Тип хранится как строка (VARCHAR(10)) в поле <code className="bg-blue-100 px-1 rounded">type</code></li>
                                    <li>Ключ (<code className="bg-blue-100 px-1 rounded">key</code>) и название (<code className="bg-blue-100 px-1 rounded">name</code>) должны быть уникальными</li>
                                    <li>При создании и обновлении значение валидируется в соответствии с типом</li>
                                    <li>При чтении через API значение должно быть преобразовано на стороне клиента в соответствии с типом</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 2. Типы данных */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">2. Типы данных</h2>
                        
                        <div className="space-y-6 text-gray-700">
                            <p>
                                Каждая настройка имеет тип, который определяет, как значение должно быть преобразовано при чтении через API. 
                                Значение всегда хранится как строка в базе данных, но при использовании на фронтенде должно быть преобразовано в соответствующий тип.
                            </p>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">2.1. Доступные типы</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">string</code> — Строка</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Любая строка</li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">&quot;Моя Конюшня&quot;</code></li>
                                            <li><strong>Преобразование:</strong> Использовать как строку без изменений</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">number</code> — Целое число</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Строка, содержащая целое число</li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">&quot;42&quot;</code></li>
                                            <li><strong>Преобразование:</strong> <code className="bg-gray-200 px-1 rounded">parseInt(value, 10)</code> или <code className="bg-gray-200 px-1 rounded">Number(value)</code></li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">float</code> — Число с плавающей точкой</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Строка, содержащая десятичное число</li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">&quot;3.14&quot;</code></li>
                                            <li><strong>Преобразование:</strong> <code className="bg-gray-200 px-1 rounded">parseFloat(value)</code> или <code className="bg-gray-200 px-1 rounded">Number(value)</code></li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">boolean</code> — Булево значение</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Строка <code className="bg-gray-200 px-1 rounded">&quot;true&quot;</code> или <code className="bg-gray-200 px-1 rounded">&quot;false&quot;</code></li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">&quot;true&quot;</code></li>
                                            <li><strong>Преобразование:</strong> <code className="bg-gray-200 px-1 rounded">value === &quot;true&quot;</code> или <code className="bg-gray-200 px-1 rounded">JSON.parse(value)</code></li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">object</code> — JSON объект</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Строка, содержащая валидный JSON</li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">{`"{\"key\": \"value\", \"number\": 42}"`}</code></li>
                                            <li><strong>Преобразование:</strong> <code className="bg-gray-200 px-1 rounded">JSON.parse(value)</code></li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">date</code> — Дата</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Строка в формате <code className="bg-gray-200 px-1 rounded">YYYY-MM-DD</code></li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">&quot;2024-01-15&quot;</code></li>
                                            <li><strong>Преобразование:</strong> <code className="bg-gray-200 px-1 rounded">new Date(value)</code> или использовать библиотеку для работы с датами</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">time</code> — Время</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Строка в формате <code className="bg-gray-200 px-1 rounded">HH:MM</code></li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">&quot;14:30&quot;</code></li>
                                            <li><strong>Преобразование:</strong> Парсинг строки или использование библиотеки для работы со временем</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2"><code className="bg-gray-200 px-1 rounded">datetime</code> — Дата и время</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                            <li><strong>Формат хранения:</strong> Строка в формате <code className="bg-gray-200 px-1 rounded">YYYY-MM-DD HH:MM</code></li>
                                            <li><strong>Пример значения:</strong> <code className="bg-gray-200 px-1 rounded">&quot;2024-01-15 14:30&quot;</code></li>
                                            <li><strong>Преобразование:</strong> <code className="bg-gray-200 px-1 rounded">new Date(value)</code> или использовать библиотеку для работы с датами</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                                <h3 className="text-xl font-semibold mb-3 text-yellow-900">2.2. Валидация значений</h3>
                                <p className="text-yellow-800 mb-2">
                                    При создании и обновлении настроек значения валидируются на бэкенде:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-800">
                                    <li><strong>number:</strong> Должно быть целым числом</li>
                                    <li><strong>float:</strong> Должно быть числом с плавающей точкой</li>
                                    <li><strong>boolean:</strong> Принимает значения: &quot;true&quot;, &quot;false&quot;, &quot;1&quot;, &quot;0&quot;, &quot;yes&quot;, &quot;no&quot;, &quot;on&quot;, &quot;off&quot; (нормализуется к &quot;true&quot;/&quot;false&quot;)</li>
                                    <li><strong>object:</strong> Должен быть валидным JSON</li>
                                    <li><strong>date:</strong> Должен соответствовать формату YYYY-MM-DD</li>
                                    <li><strong>time:</strong> Должен соответствовать формату HH:MM</li>
                                    <li><strong>datetime:</strong> Должен соответствовать формату YYYY-MM-DD HH:MM</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. GET методы и фильтры */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">3. GET методы API и фильтры</h2>
                        
                        <div className="space-y-6">
                            {/* Получить список настроек */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">3.1. Получить список настроек</h3>
                                <p className="mb-3 font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">GET /api/site_settings</p>
                                
                                <div className="space-y-3">
                                    <div>
                                        <strong>Параметры запроса (query parameters):</strong>
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                            <li><code className="bg-gray-200 px-1 rounded">key</code> (array, опционально) - Фильтр по ключам. Можно передать массив ключей для множественной фильтрации</li>
                                            <li><code className="bg-gray-200 px-1 rounded">name</code> (string, опционально) - Фильтр по названию. Поиск по вхождению подстроки (регистронезависимый)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">value</code> (string, опционально) - Фильтр по значению. Поиск по вхождению подстроки (регистронезависимый)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">description</code> (string, опционально) - Фильтр по описанию. Поиск по вхождению подстроки (регистронезависимый)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">type</code> (array, опционально) - Фильтр по типу. Можно передать массив типов для множественной фильтрации. Возможные значения: <code className="bg-gray-200 px-1 rounded">[&quot;string&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;number&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;float&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;boolean&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;object&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;date&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;time&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;datetime&quot;]</code></li>
                                            <li><code className="bg-gray-200 px-1 rounded">sort</code> (array, опционально) - Сортировка. Возможные значения: <code className="bg-gray-200 px-1 rounded">[&quot;key&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;name&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;type&quot;]</code> (по возрастанию), <code className="bg-gray-200 px-1 rounded">[&quot;-key&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;-name&quot;]</code>, <code className="bg-gray-200 px-1 rounded">[&quot;-type&quot;]</code> (по убыванию). Можно передать несколько значений</li>
                                            <li><code className="bg-gray-200 px-1 rounded">limit</code> (integer, опционально) - Количество записей на странице (для пагинации, работает только с <code className="bg-gray-200 px-1 rounded">full=true</code>)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">offset</code> (integer, опционально) - Смещение для пагинации (сколько записей пропустить, работает только с <code className="bg-gray-200 px-1 rounded">full=true</code>)</li>
                                            <li><code className="bg-gray-200 px-1 rounded">full</code> (boolean, опционально, по умолчанию false) - Если <code className="bg-gray-200 px-1 rounded">true</code>, возвращает полный список с пагинацией. Если <code className="bg-gray-200 px-1 rounded">false</code>, возвращает только <code className="bg-gray-200 px-1 rounded">key</code>, <code className="bg-gray-200 px-1 rounded">value</code>, <code className="bg-gray-200 px-1 rounded">type</code> без пагинации</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <strong>Формат ответа (full=false, по умолчанию):</strong>
                                        <p className="text-sm text-gray-600 mb-2">Возвращается массив объектов с полями <code className="bg-gray-200 px-1 rounded">key</code>, <code className="bg-gray-200 px-1 rounded">value</code>, <code className="bg-gray-200 px-1 rounded">type</code>:</p>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`[
  {
    "key": "site_name",
    "value": "Моя Конюшня",
    "type": "string"
  },
  {
    "key": "site_phone",
    "value": "+7 (999) 123-45-67",
    "type": "string"
  }
]`}
                                        </pre>
                                    </div>

                                    <div>
                                        <strong>Формат ответа (full=true):</strong>
                                        <p className="text-sm text-gray-600 mb-2">Возвращается объект с пагинацией и полными данными:</p>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "items": [
    {
      "id": "uuid",
      "key": "site_name",
      "value": "Моя Конюшня",
      "name": "Название сайта",
      "description": "Основное название сайта",
      "type": "string",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 10
}`}
                                        </pre>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                        <p className="text-blue-800 text-sm">
                                            <strong>Важно:</strong> По умолчанию (<code className="bg-blue-100 px-1 rounded">full=false</code>) метод возвращает упрощенный список 
                                            без пагинации, что удобно для получения всех настроек сразу. Для получения полных данных с пагинацией используйте <code className="bg-blue-100 px-1 rounded">full=true</code>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Получить настройку по ID */}
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">3.2. Получить настройку по ID</h3>
                                <p className="mb-3 font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">GET /api/site_settings/{`{id}`}</p>
                                
                                <div className="space-y-3">
                                    <p><strong>Параметры пути:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li><code className="bg-gray-200 px-1 rounded">id</code> (UUID) - Идентификатор настройки</li>
                                    </ul>

                                    <div>
                                        <strong>Формат ответа:</strong>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "key": "site_name",
  "value": "Моя Конюшня",
  "name": "Название сайта",
  "description": "Основное название сайта",
  "type": "string",
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
                                <h3 className="text-lg font-semibold mb-3">Пример 1: Получить все настройки (упрощенный формат)</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/site_settings

Ответ:
[
  {
    "key": "site_name",
    "value": "Моя Конюшня",
    "type": "string"
  },
  {
    "key": "site_phone",
    "value": "+7 (999) 123-45-67",
    "type": "string"
  },
  {
    "key": "site_email",
    "value": "info@horsestable.ru",
    "type": "string"
  }
]`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 2: Получить настройки по ключам</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/site_settings?key=site_name&key=site_phone

Ответ:
[
  {
    "key": "site_name",
    "value": "Моя Конюшня",
    "type": "string"
  },
  {
    "key": "site_phone",
    "value": "+7 (999) 123-45-67",
    "type": "string"
  }
]`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 3: Получить полный список с пагинацией</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/site_settings?full=true&limit=10&offset=0&sort=key

Ответ:
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "key": "site_name",
      "value": "Моя Конюшня",
      "name": "Название сайта",
      "description": "Основное название сайта",
      "type": "string",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": null
    }
  ],
  "total": 25
}`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Пример 4: Фильтрация по типу</h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`GET /api/site_settings?type=boolean&type=number

Ответ:
[
  {
    "key": "site_enabled",
    "value": "true",
    "type": "boolean"
  },
  {
    "key": "max_visitors",
    "value": "100",
    "type": "number"
  }
]`}
                                </pre>
                            </div>

                        </div>
                    </section>

                    {/* 5. TypeScript типы */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">5. TypeScript типы</h2>
                        
                        <div className="space-y-6 text-gray-700">
                            <p>
                                Для работы с API настроек сайта в TypeScript можно использовать следующие типы:
                            </p>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">5.1. Типы данных</h3>
                                
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// Тип настройки
enum SiteSettingType {
  string = 'string',
  number = 'number',
  float = 'float',
  boolean = 'boolean',
  object = 'object',
  date = 'date',
  time = 'time',
  datetime = 'datetime',
}

// Полная настройка
type SiteSettingOutDto = {
  id: string; // UUID
  key: string;
  value: string;
  name: string;
  description: string | null;
  type: SiteSettingType;
  created_at: string; // ISO datetime
  updated_at: string | null; // ISO datetime
};

// Упрощенная настройка (для списка без full=true)
type SiteSettingSimpleOutDto = {
  key: string;
  value: string;
  type: SiteSettingType;
};

// Параметры запроса списка
type SiteSettingListQueryParams = {
  key?: string | string[];
  name?: string;
  description?: string;
  type?: SiteSettingType[];
  sort?: ('key' | 'name' | 'type' | '-key' | '-name' | '-type')[];
  limit?: number;
  offset?: number;
  full?: boolean;
};`}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="text-xl font-semibold mb-3 text-blue-900">5.2. Пример использования</h3>
                                
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// Получение всех настроек
const response = await fetch('/api/site_settings');
const settings: SiteSettingSimpleOutDto[] = await response.json();

// Преобразование значений в нужные типы
const siteName = settings.find(s => s.key === 'site_name')?.value; // string
const maxVisitors = parseInt(
  settings.find(s => s.key === 'max_visitors')?.value || '0',
  10
); // number
const isEnabled = settings.find(s => s.key === 'site_enabled')?.value === 'true'; // boolean
const socialLinks = JSON.parse(
  settings.find(s => s.key === 'site_social_links')?.value || '{}'
); // object

// Получение полного списка с пагинацией
const fullResponse = await fetch('/api/site_settings?full=true&limit=10&offset=0');
const paginated: {
  items: SiteSettingOutDto[];
  total: number;
} = await fullResponse.json();

// Получение настройки по ID
const settingResponse = await fetch('/api/site_settings/{id}');
const setting: SiteSettingOutDto = await settingResponse.json();`}
                                </pre>
                            </div>

                            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                                <h3 className="text-xl font-semibold mb-3 text-yellow-900">5.3. Функция для преобразования значений</h3>
                                
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`function parseSettingValue(value: string, type: SiteSettingType): any {
  switch (type) {
    case SiteSettingType.string:
      return value;
    case SiteSettingType.number:
      return parseInt(value, 10);
    case SiteSettingType.float:
      return parseFloat(value);
    case SiteSettingType.boolean:
      return value === 'true';
    case SiteSettingType.object:
      return JSON.parse(value);
    case SiteSettingType.date:
      return new Date(value);
    case SiteSettingType.time:
      return value; // или парсинг времени
    case SiteSettingType.datetime:
      return new Date(value);
    default:
      return value;
  }
}

// Использование
const setting = settings.find(s => s.key === 'max_visitors');
if (setting) {
  const parsedValue = parseSettingValue(setting.value, setting.type);
  console.log(parsedValue); // number
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
                                Данная документация описывает все доступные GET методы API для работы с настройками сайта. 
                                Все методы работают только на чтение (GET запросы) и требуют аутентификации. Помните, что значения всегда хранятся как строки и должны быть 
                                преобразованы на стороне клиента в соответствии с типом настройки. Используйте фильтры и параметры 
                                запросов для получения именно тех данных, которые вам нужны.
                            </p>
                            <p className="text-green-800 mt-2">
                                По умолчанию метод получения списка (<code className="bg-green-100 px-1 rounded">GET /api/site_settings</code>) 
                                возвращает упрощенный формат без пагинации. Для получения полных данных с пагинацией используйте параметр 
                                <code className="bg-green-100 px-1 rounded">full=true</code>.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};
