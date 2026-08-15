import React from "react";
import { SiteSettingsTabs } from "./SiteSettingsTabs";

export type SiteSettingsUserDocumentationViewProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const SiteSettingsUserDocumentationView: React.FC<
  SiteSettingsUserDocumentationViewProps
> = ({ activeTab, setActiveTab }) => {
  return (
    <>
      <SiteSettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Инструкция по работе с настройками сайта
          </h1>
          <p className="text-gray-600 mb-8">
            Данная инструкция предназначена для пользователей CMS и описывает,
            как управлять настройками сайта через административную панель.
          </p>

          {/* 1. Что такое настройки сайта */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              1. Что такое настройки сайта
            </h2>

            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Настройки сайта</strong> — это система для хранения и
                управления статичной информацией, которую API будет отдавать на
                фронтенд сайта. Настройки позволяют централизованно управлять
                контентом, который должен быть доступен через API без
                необходимости изменять код.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Структура настройки:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Ключ (key)</strong> — уникальный идентификатор для
                    фильтрации и получения настройки через API (например,
                    &quot;site_name&quot;, &quot;site_description&quot;)
                  </li>
                  <li>
                    <strong>Наименование</strong> — человекочитаемое название
                    настройки для удобства работы в CMS (например,
                    &quot;Название сайта&quot;)
                  </li>
                  <li>
                    <strong>Описание</strong> — дополнительная информация о
                    назначении настройки (опционально)
                  </li>
                  <li>
                    <strong>Тип</strong> — тип данных, к которому нужно
                    преобразовать значение при чтении через API (строка, число,
                    булево, объект JSON, дата и т.д.)
                  </li>
                  <li>
                    <strong>Значение</strong> — само значение настройки, которое
                    будет возвращаться через API
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold mb-2 text-blue-900">
                  Примеры использования:
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-blue-800">
                  <li>Название сайта, описание сайта</li>
                  <li>Контактная информация (телефон, email, адрес)</li>
                  <li>Настройки социальных сетей (ссылки на профили)</li>
                  <li>Тексты для различных разделов сайта</li>
                  <li>
                    Любая другая статичная информация, которая должна быть
                    доступна через API
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Права доступа */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              2. Права доступа
            </h2>

            <div className="space-y-4 text-gray-700">
              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                <h3 className="font-semibold mb-3 text-yellow-900">
                  ⚠️ Важно: Разграничение прав
                </h3>
                <div className="space-y-3 text-yellow-800">
                  <div>
                    <strong>Администратор (ADMIN):</strong>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                      <li>
                        Может изменять только <strong>значение</strong>{" "}
                        настройки
                      </li>
                      <li>
                        Не может изменять ключ, наименование, описание и тип
                      </li>
                      <li>Не может создавать новые настройки</li>
                      <li>Не может удалять настройки</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Разработчик (DEVELOPER):</strong>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                      <li>
                        Может изменять все поля настройки (ключ, наименование,
                        описание, тип, значение)
                      </li>
                      <li>Может создавать новые настройки</li>
                      <li>Может удалять настройки</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p>
                Такое разграничение прав позволяет администраторам обновлять
                контент сайта, не рискуя нарушить работу API или структуру
                данных. Структурные изменения (создание новых настроек,
                изменение ключей и типов) доступны только разработчикам.
              </p>
            </div>
          </section>

          {/* 3. Редактирование значения настройки */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              3. Редактирование значения настройки
            </h2>

            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  3.1. Как изменить значение настройки
                </h3>

                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Перейдите на вкладку{" "}
                    <strong>&quot;Настройки сайта&quot;</strong>
                  </li>
                  <li>
                    Найдите нужную настройку в таблице (можно использовать
                    фильтры для поиска)
                  </li>
                  <li>
                    <strong>Кликните на настройку</strong> в таблице
                  </li>
                  <li>
                    В открывшемся окне вы увидите все поля настройки, но для
                    администратора доступно для редактирования только поле{" "}
                    <strong>&quot;Значение&quot;</strong>
                  </li>
                  <li>
                    Измените значение в соответствии с типом настройки:
                    <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                      <li>
                        <strong>Строка</strong> — введите текст
                      </li>
                      <li>
                        <strong>Число</strong> — введите целое число
                      </li>
                      <li>
                        <strong>Число с плавающей точкой</strong> — введите
                        десятичное число
                      </li>
                      <li>
                        <strong>Булево</strong> — переключите переключатель
                        (Да/Нет)
                      </li>
                      <li>
                        <strong>Объект JSON</strong> — введите JSON объект
                        (например,{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          {'{"key": "value"}'}
                        </code>
                        )
                      </li>
                      <li>
                        <strong>Дата</strong> — выберите дату в формате
                        YYYY-MM-DD
                      </li>
                      <li>
                        <strong>Время</strong> — выберите время в формате HH:MM
                      </li>
                      <li>
                        <strong>Дата и время</strong> — выберите дату и время в
                        формате YYYY-MM-DD HH:MM
                      </li>
                    </ul>
                  </li>
                  <li>
                    Нажмите кнопку <strong>&quot;Изменить&quot;</strong> для
                    сохранения
                  </li>
                </ol>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
                <h3 className="text-xl font-semibold mb-3 text-green-900">
                  3.2. Важные замечания при редактировании
                </h3>

                <ul className="list-disc list-inside space-y-2 ml-4 text-green-800">
                  <li>
                    <strong>Тип данных:</strong> Убедитесь, что вводимое
                    значение соответствует типу настройки. Например, для типа
                    &quot;Число&quot; нельзя ввести текст.
                  </li>
                  <li>
                    <strong>JSON объекты:</strong> При работе с типом
                    &quot;Объект JSON&quot; убедитесь, что JSON валидный.
                    Неправильный JSON может привести к ошибкам при чтении через
                    API.
                  </li>
                  <li>
                    <strong>Форматы дат и времени:</strong> Соблюдайте указанные
                    форматы. Система автоматически преобразует введенные данные
                    в нужный формат.
                  </li>
                  <li>
                    <strong>Изменения вступают в силу сразу:</strong> После
                    сохранения изменения сразу доступны через API.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Поиск и фильтрация */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              4. Поиск и фильтрация
            </h2>

            <div className="space-y-4 text-gray-700">
              <p>
                В таблице настроек доступны различные способы поиска и
                фильтрации для быстрого нахождения нужных записей.
              </p>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Доступные фильтры:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>По ключу (key)</strong> — поиск по уникальному
                    идентификатору настройки
                  </li>
                  <li>
                    <strong>По наименованию</strong> — поиск по
                    человекочитаемому названию
                  </li>
                  <li>
                    <strong>По описанию</strong> — поиск по описанию настройки
                  </li>
                  <li>
                    <strong>По типу</strong> — фильтрация по типу данных (можно
                    выбрать несколько типов)
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold mb-3 text-blue-900">Сортировка</h3>
                <p className="text-blue-800">
                  Нажмите на заголовки колонок <strong>&quot;Key&quot;</strong>,{" "}
                  <strong>&quot;Наименование&quot;</strong>
                  или <strong>&quot;Тип&quot;</strong> для сортировки настроек
                  (по возрастанию или убыванию).
                </p>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                <h3 className="font-semibold mb-3 text-yellow-900">
                  Сброс фильтров
                </h3>
                <p className="text-yellow-800">
                  Нажмите кнопку <strong>&quot;Сбросить&quot;</strong> в правом
                  верхнем углу, чтобы очистить все примененные фильтры и
                  вернуться к полному списку.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Ограничения и важные замечания */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              5. Ограничения и важные замечания
            </h2>

            <div className="space-y-4 text-gray-700">
              <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-400">
                <h3 className="font-semibold mb-3 text-red-900">
                  ⚠️ Что нельзя делать администратору:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-red-800">
                  <li>
                    <strong>Изменять ключ (key)</strong> — ключ используется в
                    API, его изменение может нарушить работу сайта
                  </li>
                  <li>
                    <strong>Изменять наименование</strong> — это может привести
                    к путанице
                  </li>
                  <li>
                    <strong>Изменять описание</strong> — описание помогает
                    понять назначение настройки
                  </li>
                  <li>
                    <strong>Изменять тип</strong> — изменение типа может
                    привести к ошибкам при преобразовании значения
                  </li>
                  <li>
                    <strong>Создавать новые настройки</strong> — для создания
                    новых настроек обратитесь к разработчику
                  </li>
                  <li>
                    <strong>Удалять настройки</strong> — удаление настроек может
                    нарушить работу сайта
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold mb-3 text-blue-900">
                  💡 Полезные советы:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Используйте фильтры для быстрого поиска нужных настроек
                  </li>
                  <li>
                    Перед изменением значения убедитесь, что вы понимаете
                    назначение настройки (читайте описание)
                  </li>
                  <li>
                    При работе с JSON объектами проверяйте валидность JSON перед
                    сохранением
                  </li>
                  <li>
                    Если вам нужна новая настройка или изменение структуры
                    существующей, обратитесь к разработчику
                  </li>
                  <li>
                    Сохраняйте резервные копии важных значений перед их
                    изменением
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                <h3 className="font-semibold mb-3 text-yellow-900">
                  📝 Ограничения по длине:
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-800">
                  <li>
                    <strong>Ключ (key):</strong> максимум 63 символа
                  </li>
                  <li>
                    <strong>Наименование:</strong> максимум 63 символа
                  </li>
                  <li>
                    <strong>Описание:</strong> максимум 511 символов
                  </li>
                  <li>
                    <strong>Значение:</strong> неограниченно (хранится как
                    текст)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Заключение */}
          <section className="mb-8">
            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
              <h2 className="text-xl font-semibold mb-3 text-green-900">
                Заключение
              </h2>
              <p className="text-green-800">
                Данная инструкция описывает основные возможности работы с
                настройками сайта в CMS для администраторов. Помните, что вы
                можете изменять только значения настроек. Для создания новых
                настроек, изменения структуры или удаления обратитесь к
                разработчику сайта.
              </p>
              <p className="text-green-800 mt-2">
                Если у вас возникли вопросы или вам нужна помощь, обратитесь к
                администратору системы или разработчику сайта.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
