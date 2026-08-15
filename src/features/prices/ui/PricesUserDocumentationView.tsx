import React from "react";
import { PricesTabs, PricesTabsEnum } from "./PricesTabs";

export type PricesUserDocumentationViewProps = {
  activeTab: PricesTabsEnum;
  setActiveTab: (tab: PricesTabsEnum) => void;
};

export const PricesUserDocumentationView: React.FC<
  PricesUserDocumentationViewProps
> = ({ activeTab, setActiveTab }) => {
  return (
    <>
      <PricesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Инструкция по работе с ценами и услугами
          </h1>
          <p className="text-gray-600 mb-8">
            Данная инструкция предназначена для пользователей CMS и описывает,
            как управлять услугами и ценами конюшни через административную
            панель.
          </p>

          {/* 1. Группы услуг */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              1. Группы услуг
            </h2>

            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Группы услуг</strong> — это категории, которые позволяют
                организовать услуги конюшни по тематическим группам. Группы
                услуг представляют собой страницы на сайте, на которых
                располагаются услуги.
              </p>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h3 className="font-semibold mb-2 text-yellow-900">
                  ⚠️ Важно: Редактирование групп услуг
                </h3>
                <p className="text-yellow-800">
                  Группы услуг редактируются только разработчиком сайта, так как
                  они связаны с API и структурой сайта. Если вам нужно создать
                  новую группу услуг, изменить название или описание
                  существующей группы, обратитесь к{" "}
                  <strong>разработчику сайта</strong> (не CMS).
                </p>
                <p className="text-yellow-800 mt-2">
                  В CMS вы можете только <strong>просматривать</strong> список
                  групп услуг, чтобы понимать, к каким группам можно привязать
                  ваши услуги.
                </p>
              </div>

              <p>
                <strong>Примеры групп услуг:</strong> &quot;Абонементы&quot;,
                &quot;Разовые занятия&quot;, &quot;Услуги по уходу за
                лошадьми&quot; и т.д.
              </p>

              <p>
                <strong>Важно:</strong> Одна услуга может принадлежать
                нескольким группам одновременно. Это позволяет гибко
                категоризировать услуги (например, услуга может быть
                одновременно в группах &quot;Абонементы&quot; и &quot;Для
                начинающих&quot;).
              </p>
            </div>
          </section>

          {/* 2. Услуги */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              2. Услуги (Цены)
            </h2>

            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Услуга</strong> — это конкретная ценовая позиция
                конюшни. Каждая услуга имеет название, описание, может быть
                привязана к группам, содержать таблицы с ценами, фотографии и
                HTML-контент страницы.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Основные поля услуги:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Название услуги</strong> (максимум 63 символа) —
                    отображается на сайте
                  </li>
                  <li>
                    <strong>Описание</strong> (максимум 511 символов,
                    опционально) — краткое описание услуги
                  </li>
                  <li>
                    <strong>Группы</strong> — выбор одной или нескольких групп,
                    к которым относится услуга
                  </li>
                  <li>
                    <strong>Путь (slug)</strong> — автоматически генерируется из
                    названия для использования в URL
                  </li>
                  <li>
                    <strong>Таблицы цен</strong> — структурированные данные о
                    ценах и тарифах
                  </li>
                </ul>
              </div>

              {/* 2.1. Создание услуги */}
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  2.1. Создание новой услуги
                </h3>

                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Перейдите на вкладку{" "}
                    <strong>&quot;Цены и услуги&quot;</strong>
                  </li>
                  <li>
                    Нажмите кнопку <strong>&quot;Добавить&quot;</strong> в
                    правом верхнем углу
                  </li>
                  <li>
                    В открывшемся окне заполните:
                    <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                      <li>
                        Выберите одну или несколько <strong>групп услуг</strong>{" "}
                        из выпадающего списка
                      </li>
                      <li>
                        Введите <strong>название услуги</strong> (обязательное
                        поле, максимум 63 символа)
                      </li>
                      <li>
                        Введите <strong>описание</strong> (опционально, максимум
                        511 символов)
                      </li>
                    </ul>
                  </li>
                  <li>
                    Нажмите кнопку <strong>&quot;Добавить&quot;</strong> для
                    сохранения
                  </li>
                </ol>

                <p className="text-blue-800 mt-3">
                  <strong>Примечание:</strong> После создания услуги вы сможете
                  добавить таблицы цен, фотографии и контент страницы, нажав на
                  соответствующую услугу в таблице.
                </p>
              </div>

              {/* 2.2. Редактирование услуги */}
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  2.2. Редактирование услуги
                </h3>

                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Найдите нужную услугу в таблице и{" "}
                    <strong>кликните на неё</strong>
                  </li>
                  <li>
                    В открывшемся окне измените необходимые поля:
                    <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                      <li>Измените привязку к группам услуг</li>
                      <li>Измените название услуги</li>
                      <li>Измените описание услуги</li>
                    </ul>
                  </li>
                  <li>
                    Нажмите кнопку <strong>&quot;Изменить&quot;</strong> для
                    сохранения изменений
                  </li>
                </ol>
              </div>

              {/* 2.3. Удаление услуги */}
              <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-400">
                <h3 className="text-xl font-semibold mb-3 text-red-900">
                  2.3. Удаление услуги
                </h3>

                <ol className="list-decimal list-inside space-y-2 ml-4 text-red-800">
                  <li>
                    Откройте услугу для редактирования (кликните на неё в
                    таблице)
                  </li>
                  <li>
                    Нажмите кнопку <strong>&quot;Удалить&quot;</strong> в нижней
                    части окна
                  </li>
                  <li>Подтвердите удаление в появившемся диалоговом окне</li>
                </ol>

                <p className="text-red-800 mt-3">
                  <strong>⚠️ Внимание:</strong> Удаление услуги необратимо. Все
                  связанные данные (таблицы цен, контент страницы) будут удалены
                  вместе с услугой.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Таблицы цен */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              3. Таблицы цен
            </h2>

            <div className="space-y-6 text-gray-700">
              <p>
                <strong>Таблицы цен</strong> — это гибкий механизм для
                отображения структурированных данных о ценах и услугах. Каждая
                услуга может содержать несколько таблиц, каждая таблица может
                иметь произвольное количество колонок и строк.
              </p>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  3.1. Открытие редактора таблиц
                </h3>

                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>Найдите нужную услугу в таблице</li>
                  <li>
                    В колонке <strong>&quot;Действия&quot;</strong> нажмите
                    кнопку с иконкой <strong>таблицы</strong> (📊)
                  </li>
                  <li>Откроется редактор таблиц цен</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">
                  3.2. Структура таблицы
                </h3>

                <p className="mb-3">Каждая таблица состоит из:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Колонок</strong> — определяют структуру данных
                    (например, &quot;Название пакета&quot;, &quot;Цена&quot;,
                    &quot;Количество занятий&quot;)
                  </li>
                  <li>
                    <strong>Строк</strong> — содержат данные для каждой позиции
                    (например, информация о разных тарифах)
                  </li>
                </ul>

                <div className="bg-white p-4 rounded mt-4">
                  <h4 className="font-semibold mb-2">Параметры колонки:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>
                      <strong>Ключ колонки</strong> — уникальный идентификатор
                      (например, &quot;price&quot;, &quot;lessons&quot;).
                      Устанавливается один раз при создании и не может быть
                      изменен
                    </li>
                    <li>
                      <strong>Название колонки</strong> — отображаемое название
                      (например, &quot;Цена&quot;, &quot;Занятий&quot;)
                    </li>
                    <li>
                      <strong>Аннотация</strong> — подсказка при наведении на
                      заголовок колонки
                    </li>
                    <li>
                      <strong>Форматтеры по умолчанию</strong> — применяются ко
                      всем ячейкам колонки:
                      <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                        <li>Жирный текст</li>
                        <li>Курсив</li>
                        <li>Подчеркнутый текст</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded mt-4">
                  <h4 className="font-semibold mb-2">
                    Параметры ячейки (в строке):
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>
                      <strong>Значение</strong> — текст, отображаемый в ячейке
                      (например, &quot;5000 ₽&quot;, &quot;8 занятий&quot;)
                    </li>
                    <li>
                      <strong>Аннотация</strong> — подсказка при наведении на
                      ячейку
                    </li>
                    <li>
                      <strong>Форматтеры</strong> — форматирование конкретной
                      ячейки (переопределяет форматтеры колонки)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  3.3. Работа с таблицами
                </h3>

                <div className="space-y-4 text-blue-800">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Добавление новой таблицы:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        В редакторе таблиц нажмите кнопку{" "}
                        <strong>&quot;Добавить таблицу&quot;</strong>
                      </li>
                      <li>Создайте первую колонку (см. ниже)</li>
                      <li>Добавьте строки с данными</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Добавление колонки:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        Нажмите кнопку{" "}
                        <strong>&quot;Добавить колонку&quot;</strong> в верхней
                        части таблицы
                      </li>
                      <li>
                        В открывшемся окне заполните:
                        <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                          <li>
                            <strong>Ключ колонки</strong> — уникальный
                            идентификатор (например, &quot;price&quot;)
                          </li>
                          <li>
                            <strong>Название колонки</strong> — отображаемое
                            название (например, &quot;Цена&quot;)
                          </li>
                          <li>
                            <strong>Аннотация</strong> — подсказка (опционально)
                          </li>
                          <li>Выберите форматтеры по умолчанию (если нужно)</li>
                        </ul>
                      </li>
                      <li>
                        Нажмите <strong>&quot;Сохранить&quot;</strong>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      Редактирование колонки:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        Нажмите кнопку{" "}
                        <strong>&quot;Редактировать&quot;</strong> рядом с
                        названием колонки
                      </li>
                      <li>Измените название, аннотацию или форматтеры</li>
                      <li>
                        <strong>Примечание:</strong> Ключ колонки нельзя
                        изменить после создания
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Добавление строки:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        Нажмите кнопку{" "}
                        <strong>&quot;Добавить строку&quot;</strong>
                      </li>
                      <li>
                        Заполните ячейки в новой строке:
                        <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                          <li>
                            Введите <strong>значение</strong> ячейки
                          </li>
                          <li>
                            Добавьте <strong>аннотацию</strong> (опционально)
                          </li>
                          <li>
                            Выберите <strong>форматтеры</strong> для ячейки
                            (если нужно)
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      Редактирование ячейки:
                    </h4>
                    <p className="ml-4">
                      Просто кликните на ячейку в таблице и измените её
                      содержимое прямо в редакторе.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Удаление:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        <strong>Удаление строки:</strong> Нажмите кнопку
                        удаления в колонке &quot;Действия&quot;
                      </li>
                      <li>
                        <strong>Удаление колонки:</strong> Нажмите кнопку
                        удаления рядом с названием колонки
                      </li>
                      <li>
                        <strong>Удаление таблицы:</strong> Нажмите кнопку
                        &quot;Удалить таблицу&quot; в верхней части
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
                <h3 className="text-xl font-semibold mb-3 text-green-900">
                  3.4. Пример использования таблиц
                </h3>

                <p className="text-green-800 mb-3">
                  Таблицы идеально подходят для отображения:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-green-800">
                  <li>Прайс-листов с различными тарифами</li>
                  <li>Сравнения тарифов (базовый, стандартный, премиум)</li>
                  <li>Расписаний занятий с ценами</li>
                  <li>Любых структурированных данных о ценах и услугах</li>
                </ul>

                <div className="bg-white p-4 rounded mt-4">
                  <h4 className="font-semibold mb-2 text-sm">
                    Пример структуры таблицы для абонементов:
                  </h4>
                  <div className="text-xs overflow-x-auto">
                    <table className="border-collapse border border-gray-300 w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2">
                            Название пакета
                          </th>
                          <th className="border border-gray-300 p-2">
                            Занятий
                          </th>
                          <th className="border border-gray-300 p-2">
                            <strong>Цена</strong>
                          </th>
                          <th className="border border-gray-300 p-2">
                            Срок действия
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2">
                            Базовый
                          </td>
                          <td className="border border-gray-300 p-2">4</td>
                          <td className="border border-gray-300 p-2">
                            <strong>3000 ₽</strong>
                          </td>
                          <td className="border border-gray-300 p-2">
                            1 месяц
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2">
                            Стандартный
                          </td>
                          <td className="border border-gray-300 p-2">8</td>
                          <td className="border border-gray-300 p-2">
                            <strong>5000 ₽</strong>
                          </td>
                          <td className="border border-gray-300 p-2">
                            1 месяц
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                <h3 className="text-xl font-semibold mb-3 text-yellow-900">
                  3.5. Важные замечания
                </h3>

                <ul className="list-disc list-inside space-y-2 ml-4 text-yellow-800">
                  <li>
                    <strong>Пустые таблицы автоматически удаляются</strong> при
                    сохранении. Если таблица не содержит колонок или строк, она
                    будет удалена.
                  </li>
                  <li>
                    <strong>Ключ колонки уникален</strong> в рамках одной
                    таблицы. Используйте осмысленные ключи (например,
                    &quot;price&quot;, &quot;lessons&quot;).
                  </li>
                  <li>
                    <strong>Форматтеры колонки</strong> применяются ко всем
                    ячейкам по умолчанию, но могут быть переопределены на уровне
                    ячейки.
                  </li>
                  <li>
                    <strong>Аннотации</strong> помогают пользователям сайта
                    получить дополнительную информацию при наведении курсора.
                  </li>
                  <li>
                    <strong>Множественные таблицы:</strong> Одна услуга может
                    содержать несколько таблиц. Например, одна таблица для
                    абонементов, другая для разовых занятий.
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
                В таблице услуг доступны различные способы поиска и фильтрации
                для быстрого нахождения нужных записей.
              </p>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Доступные фильтры:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>По группам услуг</strong> — выберите одну или
                    несколько групп из выпадающего списка
                  </li>
                  <li>
                    <strong>По названию</strong> — введите часть названия услуги
                    для поиска
                  </li>
                  <li>
                    <strong>По описанию</strong> — введите часть описания для
                    поиска
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold mb-3 text-blue-900">Сортировка</h3>
                <p className="text-blue-800">
                  Нажмите на заголовок колонки{" "}
                  <strong>&quot;Наименование&quot;</strong> для сортировки услуг
                  по названию (по возрастанию или убыванию).
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold mb-3 text-blue-900">Пагинация</h3>
                <p className="text-blue-800">
                  Используйте элементы управления внизу таблицы для перехода
                  между страницами, если услуг больше, чем помещается на одной
                  странице.
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
                  ⚠️ Что нельзя редактировать в CMS:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-red-800">
                  <li>
                    <strong>Группы услуг</strong> — создание, редактирование и
                    удаление групп доступно только разработчику сайта. Для
                    изменений обратитесь к разработчику сайта (не CMS).
                  </li>
                  <li>
                    <strong>Путь (slug)</strong> — автоматически генерируется из
                    названия услуги и не может быть изменен вручную
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                <h3 className="font-semibold mb-3 text-yellow-900">
                  📝 Ограничения по длине:
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-800">
                  <li>
                    <strong>Название услуги:</strong> максимум 63 символа
                  </li>
                  <li>
                    <strong>Описание услуги:</strong> максимум 511 символов
                  </li>
                  <li>
                    <strong>Название группы:</strong> максимум 63 символа
                    (редактируется только разработчиком)
                  </li>
                  <li>
                    <strong>Описание группы:</strong> максимум 511 символов
                    (редактируется только разработчиком)
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold mb-3 text-blue-900">
                  💡 Полезные советы:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Используйте понятные и информативные названия услуг, чтобы
                    их легко было найти
                  </li>
                  <li>
                    Заполняйте описания услуг — это поможет пользователям сайта
                    лучше понять, что включает услуга
                  </li>
                  <li>
                    Привязывайте услуги к соответствующим группам — это улучшит
                    навигацию на сайте
                  </li>
                  <li>
                    Используйте таблицы цен для структурированного отображения
                    тарифов и прайс-листов
                  </li>
                  <li>
                    Добавляйте аннотации в таблицах цен — они помогают
                    пользователям получить дополнительную информацию
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
                Данная инструкция описывает основные возможности работы с ценами
                и услугами в CMS. Если у вас возникли вопросы или вам нужна
                помощь, обратитесь к администратору системы или разработчику
                сайта.
              </p>
              <p className="text-green-800 mt-2">
                Помните: для редактирования групп услуг необходимо обратиться к{" "}
                <strong>разработчику сайта</strong>, так как группы связаны с
                API и структурой сайта.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
