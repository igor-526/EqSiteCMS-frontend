import React from "react";
import { NewsTabs, NewsTabsEnum } from "./NewsTabs";

export type NewsDeveloperDocumentationViewProps = {
    activeTab: NewsTabsEnum;
    setActiveTab: (tab: NewsTabsEnum) => void;
};

export const NewsDeveloperDocumentationView: React.FC<NewsDeveloperDocumentationViewProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <>
            <NewsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">
                        Документация API для работы с новостями
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Данная документация предназначена для разработчиков сайта конюшни,
                        использующих публичный API для получения новостей. Все публичные методы
                        требуют наличия заголовка аутентификации сервиса.
                    </p>

                    {/* 1. Аутентификация */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            1. Аутентификация
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Публичный API новостей использует аутентификацию по ключу сервиса.
                                Для каждого запроса необходимо передавать заголовок:
                            </p>
                            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
                                {`X-Equestrian-Service-Key: <ваш_ключ_сервиса>`}
                            </pre>
                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-yellow-800">
                                    <strong>Без ключа:</strong> Запрос вернёт HTTP 400 (Bad Request).
                                    Ключ сервиса предоставляется администратором CMS.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. GET /api/news */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            2. Получить список новостей
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">
                                GET /api/news
                            </p>
                            <p>
                                Возвращает список только <strong>опубликованных</strong> и{" "}
                                <strong>не удалённых</strong> новостей, отсортированных по дате
                                публикации (новые первыми).
                            </p>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-3">Параметры запроса:</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">page</code> (integer,
                                        опционально, по умолчанию 1) — номер страницы
                                    </li>
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">limit</code> (integer,
                                        опционально, по умолчанию 25) — количество записей на странице
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <strong>Формат ответа (HTTP 200):</strong>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "items": [
    {
      "id": "uuid",
      "name": "Открытие нового манежа",
      "snippet": "Мы рады сообщить об открытии...",
      "published_at": "2026-05-01T10:00:00Z",
      "photos": [
        {
          "id": "uuid",
          "url": "https://example.com/media/photo.jpg",
          "is_main": true
        }
      ]
    }
  ],
  "total": 42
}`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 3. GET /api/news/{id} */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            3. Получить новость по ID
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p className="font-mono text-sm bg-gray-800 text-green-400 p-3 rounded">
                                {`GET /api/news/{id}`}
                            </p>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-3">Параметры пути:</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">id</code> (UUID) —
                                        уникальный идентификатор новости
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <strong>Формат ответа (HTTP 200):</strong>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto text-xs">
{`{
  "id": "uuid",
  "name": "Открытие нового манежа",
  "snippet": "Мы рады сообщить об открытии...",
  "published_at": "2026-05-01T10:00:00Z",
  "photos": [...]
}`}
                                </pre>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                <p className="text-red-800">
                                    <strong>HTTP 404:</strong> Возвращается если новость не найдена,
                                    удалена (<code>is_deleted = true</code>) или ещё не опубликована
                                    (<code>published_at &gt; сейчас</code>).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Структура NewsPublicOutDto */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            4. Структура NewsPublicOutDto
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Все публичные endpoint-ы возвращают объект{" "}
                                <code className="bg-gray-100 px-1 rounded">NewsPublicOutDto</code>.
                                Этот объект содержит только публичные поля:
                            </p>
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">id</code> (UUID) —
                                        уникальный идентификатор новости
                                    </li>
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">name</code> (string) —
                                        название новости (максимум 63 символа)
                                    </li>
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">snippet</code>{" "}
                                        (string | null) — краткое описание (максимум 255 символов,
                                        может быть null)
                                    </li>
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">published_at</code>{" "}
                                        (ISO 8601 datetime) — дата и время публикации
                                    </li>
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">photos</code> (array) —
                                        массив фотографий (см. раздел 5)
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                <p className="text-red-800">
                                    <strong>Явно отсутствуют поля:</strong>{" "}
                                    <code>content</code>, <code>is_deleted</code>,{" "}
                                    <code>deleted_at</code> — эти поля доступны только в
                                    CMS-endpoint&apos;е и не передаются потребителям.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Структура фотографии */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            5. Структура фотографии
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Каждая фотография в массиве{" "}
                                <code className="bg-gray-100 px-1 rounded">photos</code> содержит:
                            </p>
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">id</code> (UUID) —
                                        уникальный идентификатор фотографии
                                    </li>
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">url</code> (string) —
                                        полный URL для отображения фотографии
                                    </li>
                                    <li>
                                        <code className="bg-gray-200 px-1 rounded">is_main</code>{" "}
                                        (boolean) — является ли фотография главной (обложкой) для
                                        данной новости
                                    </li>
                                </ul>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Главная фотография (<code>is_main: true</code>) всегда идёт первой в
                                массиве.
                            </p>
                        </div>
                    </section>

                    {/* 6. Примеры запросов */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            6. Примеры запросов
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">
                                    Пример 1: Получить список новостей (curl)
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`curl -X GET "https://api.example.com/api/news?page=1&limit=10" \\
  -H "X-Equestrian-Service-Key: your_service_key"`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">
                                    Пример 2: Получить новость по ID (JavaScript fetch)
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`const newsId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(\`/api/news/\${newsId}\`, {
  headers: {
    'X-Equestrian-Service-Key': 'your_service_key',
  },
});

if (response.status === 404) {
  console.log('Новость не найдена или недоступна');
  return;
}

const news = await response.json();
console.log(news.name, news.snippet, news.published_at);`}
                                </pre>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">
                                    Пример 3: Пагинация новостей (JavaScript fetch)
                                </h3>
                                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`const page = 2;
const limit = 10;
const response = await fetch(
  \`/api/news?page=\${page}&limit=\${limit}\`,
  {
    headers: {
      'X-Equestrian-Service-Key': 'your_service_key',
    },
  }
);
const data = await response.json();
// data.items — массив новостей
// data.total — общее количество новостей`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 7. Примечания */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            7. Примечания
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                                <h3 className="font-semibold mb-3 text-yellow-900">
                                    CMS endpoint недоступен для потребителей
                                </h3>
                                <p className="text-yellow-800">
                                    Endpoint <code className="bg-yellow-100 px-1 rounded">GET /api/news-cms</code>{" "}
                                    является защищённым и предназначен исключительно для CMS-администраторов.
                                    Он возвращает все новости включая удалённые и неопубликованные.
                                    Использовать его в сайте-потребителе запрещено — он вернёт HTTP 401.
                                </p>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="font-semibold mb-3 text-blue-900">
                                    Фильтрация на стороне бэкенда
                                </h3>
                                <p className="text-blue-800">
                                    Публичный endpoint <code>GET /api/news</code> автоматически
                                    фильтрует новости: возвращаются только те, у которых{" "}
                                    <code>is_deleted = false</code> И{" "}
                                    <code>published_at &le; сейчас</code>. Сортировка фиксированная —
                                    по дате публикации (новые первыми). Дополнительная фильтрация
                                    на клиенте не требуется.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};
