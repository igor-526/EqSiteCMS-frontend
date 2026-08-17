import React from "react";
import { HorsesTabs, HorsesTabsKeys } from "./HorsesTabs";

export type HorsesUserDocumentationViewProps = {
  activeTab: HorsesTabsKeys;
  setActiveTab: (tab: HorsesTabsKeys) => void;
};

export const HorsesUserDocumentationView: React.FC<
  HorsesUserDocumentationViewProps
> = ({ activeTab, setActiveTab }) => {
  return (
    <>
      <HorsesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Инструкция по работе с разделом «Лошади»
          </h1>
          <p className="text-gray-600 mb-8">
            Данная инструкция предназначена для администраторов CMS и описывает,
            как управлять лошадьми, группами пород, породами, мастями,
            владельцами и услугами через административную панель.
          </p>

          {/* 1. Лошади */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              1. Лошади
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                На вкладке <strong>«Лошади»</strong> отображается список всех
                лошадей конюшни с фильтрами, сортировкой и пагинацией. Каждая
                запись содержит кличку, породу, масть, вид, пол и статус
                принадлежности конюшне.
              </p>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  1.1. Добавление лошади
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Нажмите кнопку <strong>«Добавить»</strong> в правом верхнем
                    углу вкладки
                  </li>
                  <li>
                    Заполните поля формы (обязательное поле — только{" "}
                    <strong>Кличка</strong>)
                  </li>
                  <li>
                    Нажмите <strong>«Добавить»</strong> для сохранения
                  </li>
                  <li>
                    После создания откройте карточку лошади для добавления
                    фотографий и настройки родословной
                  </li>
                </ol>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Поля формы лошади:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Кличка</strong> — обязательное поле, от 2 до 63
                    символов. Отображается на сайте.
                  </li>
                  <li>
                    <strong>Кличка в родословной</strong> — необязательное поле
                    до 63 символов. Пустое значение в CMS показывается как «—» и
                    может быть очищено при редактировании.
                  </li>
                  <li>
                    <strong>Описание</strong> — необязательное поле, до 511
                    символов. Краткое описание лошади.
                  </li>
                  <li>
                    <strong>Вид</strong> — лошадь (<code>horse</code>) или пони
                    (<code>pony</code>). По умолчанию — лошадь.
                  </li>
                  <li>
                    <strong>Пол</strong> — жеребец (<code>male</code>), кобыла (
                    <code>female</code>) или мерин (<code>geld</code>). По
                    умолчанию — жеребец.
                  </li>
                  <li>
                    <strong>Порода</strong> — выбор из справочника пород. Поле
                    не обязательное.
                  </li>
                  <li>
                    <strong>Масть</strong> — выбор из справочника мастей. Поле
                    не обязательное.
                  </li>
                  <li>
                    <strong>Рост (см)</strong> — целое число от 0 до 300,
                    необязательное.
                  </li>
                  <li>
                    <strong>Дата рождения</strong> — не может быть в будущем и
                    не может быть позже даты смерти.
                  </li>
                  <li>
                    <strong>Режим отображения даты рождения</strong> — управляет
                    видимостью даты: скрыть (<code>hide</code>), только год (
                    <code>y</code>), год и месяц (<code>ym</code>), полная дата
                    (<code>ymd</code>). По умолчанию — скрыть.
                  </li>
                  <li>
                    <strong>Дата смерти</strong> — не может быть в будущем. При
                    заполнении лошадь считается умершей.
                  </li>
                  <li>
                    <strong>Режим отображения даты смерти</strong> — аналогично
                    дате рождения.
                  </li>
                  <li>
                    <strong>Владелец</strong> — выбор из справочника владельцев.
                    Необязательное поле.
                  </li>
                  <li>
                    <strong>Наша конюшня</strong> — флаг, указывающий что лошадь
                    находится на постоянном постое. Отображается в фильтре «Наша
                    конюшня».
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  1.2. Редактирование лошади
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Кликните на строку лошади в таблице — откроется форма
                    редактирования
                  </li>
                  <li>Измените необходимые поля</li>
                  <li>
                    Нажмите <strong>«Изменить»</strong> для сохранения
                  </li>
                </ol>
              </div>

              <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-400">
                <h3 className="text-xl font-semibold mb-3 text-red-900">
                  1.3. Удаление лошади
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-red-800">
                  <li>
                    Откройте форму редактирования (кликните на строку в таблице)
                  </li>
                  <li>
                    Нажмите кнопку <strong>«Удалить»</strong>
                  </li>
                  <li>Подтвердите удаление в диалоговом окне</li>
                </ol>
                <p className="text-red-800 mt-3">
                  <strong>Важно:</strong> Удаление необратимо.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Фотографии */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              2. Фотографии лошади
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                К каждой лошади можно прикрепить фотографии из галереи CMS. Одна
                из фотографий может быть назначена главной (обложкой).
              </p>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  Управление фотографиями
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    В таблице лошадей нажмите иконку фотографии в колонке{" "}
                    <strong>«Действия»</strong>
                  </li>
                  <li>В открывшемся окне выберите фотографии из галереи</li>
                  <li>
                    Для назначения главной фотографии нажмите иконку звезды
                    рядом с нужной фотографией
                  </li>
                  <li>
                    Для удаления фотографии из карточки лошади нажмите иконку
                    минуса
                  </li>
                </ol>
                <p className="text-blue-800 mt-3">
                  <strong>Примечание:</strong> Замена списка фотографий —
                  полная. При сохранении список фотографий полностью заменяется
                  указанным. Сами файлы в галерее не удаляются.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Родословная */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              3. Родословная лошади
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Каждой лошади можно указать отца (sire), мать (dam) и потомков
                (foals). Система проверяет корректность связей: вид, пол и даты
                должны быть согласованы.
              </p>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  Как настроить родословную
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    В таблице лошадей нажмите иконку родословной в колонке{" "}
                    <strong>«Действия»</strong>
                  </li>
                  <li>
                    В открывшемся окне выберите отца, мать и/или потомков из
                    списка лошадей
                  </li>
                  <li>
                    Нажмите <strong>«Сохранить»</strong>
                  </li>
                </ol>
              </div>
              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                <h3 className="font-semibold mb-3 text-yellow-900">
                  Ограничения при настройке родословной
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-yellow-800">
                  <li>Отец должен быть мужского пола (жеребец)</li>
                  <li>Мать должна быть женского пола (кобыла)</li>
                  <li>
                    Вид (лошадь/пони) должен совпадать для всех участников
                    родословной
                  </li>
                  <li>
                    Дата рождения отца/матери не может быть позже даты рождения
                    целевой лошади
                  </li>
                  <li>
                    Дата рождения потомков не может быть раньше даты рождения
                    родителя
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Фильтры и поиск */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              4. Фильтры и поиск по лошадям
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Доступные фильтры:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>По кличке</strong> — текстовый поиск
                    (регистронезависимый, поиск по вхождению)
                  </li>
                  <li>
                    <strong>По описанию</strong> — текстовый поиск
                  </li>
                  <li>
                    <strong>По породе</strong> — выбор одной или нескольких
                    пород из справочника
                  </li>
                  <li>
                    <strong>По масти</strong> — выбор одной или нескольких
                    мастей из справочника
                  </li>
                  <li>
                    <strong>По виду</strong> — лошадь, пони (множественный
                    выбор)
                  </li>
                  <li>
                    <strong>По полу</strong> — жеребец, кобыла, мерин
                    (множественный выбор)
                  </li>
                  <li>
                    <strong>По росту</strong> — диапазон (от/до), в сантиметрах
                  </li>
                  <li>
                    <strong>По дате рождения</strong> — диапазон (от/до)
                  </li>
                  <li>
                    <strong>По дате смерти</strong> — диапазон (от/до)
                  </li>
                  <li>
                    <strong>По владельцу</strong> — выбор одного или нескольких
                    владельцев
                  </li>
                  <li>
                    <strong>Наша конюшня</strong> — показать только лошадей,
                    находящихся на постое (флаг)
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Сортировка:</h3>
                <p className="mb-2">
                  Нажмите на заголовок колонки для переключения сортировки. По
                  умолчанию — сортировка по дате обновления (новые записи
                  первыми). Доступна сортировка по: кличке, породе, масти, виду,
                  полу, росту, дате рождения, дате смерти, статусу «наша
                  конюшня».
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-blue-800">
                  <strong>Совет:</strong> Используйте кнопку{" "}
                  <strong>«Сбросить»</strong> для очистки всех фильтров.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Группы пород */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              5. Группы пород
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Вкладка <strong>«Группы пород»</strong> — это справочник для
                объединения родственных пород. Таблица содержит колонки
                <strong> «Наименование»</strong>, <strong>«Путь URL»</strong> и
                <strong> «Действия»</strong>.
              </p>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Работа со списком:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>поиск выполняется по наименованию и пути URL;</li>
                  <li>заголовки колонок включают сортировку;</li>
                  <li>переход между страницами выполняется пагинацией;</li>
                  <li>
                    кнопка <strong>«Добавить»</strong> создаёт группу, клик по
                    строке открывает изменение, а действие удаления требует
                    подтверждения.
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold mb-2 text-blue-900">
                  Страница группы
                </h3>
                <p className="text-blue-800">
                  Действие <strong>Page Editor</strong> открывает редактор
                  содержимого страницы группы. Для групп пород управление
                  фотографиями не предусмотрено.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-yellow-800">
                  Write-действия доступны только при наличии нужных прав:
                  недоступные элементы скрыты или отключены. Ошибка создания,
                  изменения или удаления показывается пользователю и не
                  считается успешной операцией.
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <p className="text-red-800">
                  <strong>Важно:</strong> удаление группы не удаляет породы.
                  Связь у связанных пород очищается, и в колонке «Группа» для
                  них отображается «—».
                </p>
              </div>
            </div>
          </section>

          {/* 6. Породы */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              6. Породы
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                На вкладке <strong>«Породы»</strong> ведётся справочник пород
                лошадей. Породы используются при создании и редактировании
                лошадей.
              </p>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Поля породы:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Название</strong> — обязательное поле. Полное
                    название породы (например, «Арабская чистокровная»).
                  </li>
                  <li>
                    <strong>Короткое название (short_name)</strong> —
                    необязательное при вводе, но генерируется автоматически из
                    названия, если не задано. Используется в таблице и
                    сортировке.
                  </li>
                  <li>
                    <strong>Slug</strong> — URL-идентификатор, генерируется
                    автоматически из названия. Можно задать вручную.
                  </li>
                  <li>
                    <strong>Описание</strong> — необязательное поле.
                  </li>
                  <li>
                    <strong>Группа</strong> — необязательная связь со
                    справочником групп пород. Группу можно назначить при
                    создании или изменении породы либо явно очистить.
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Группа в таблице пород:</h3>
                <p>
                  Колонка <strong>«Группа»</strong> показывает наименование или
                  «—», если связь отсутствует. В фильтре можно выбрать сразу
                  несколько групп (multi-select), а сортировка по колонке
                  выполняется по имени группы.
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  Создание породы
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Перейдите на вкладку <strong>«Породы»</strong>
                  </li>
                  <li>
                    Нажмите <strong>«Добавить»</strong>
                  </li>
                  <li>
                    Введите название. Короткое название и slug генерируются
                    автоматически
                  </li>
                  <li>
                    Нажмите <strong>«Добавить»</strong>
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-yellow-800">
                  <strong>Важно:</strong> При удалении породы лошади,
                  привязанные к ней, не удаляются — у них просто сбросится поле
                  породы.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Масти */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              7. Масти
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                На вкладке <strong>«Масти»</strong> ведётся справочник мастей
                лошадей. Структура и управление — аналогичны породам.
              </p>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Поля масти:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Название</strong> — обязательное (например,
                    «Гнедая», «Серая»)
                  </li>
                  <li>
                    <strong>Короткое название</strong> — генерируется
                    автоматически, если не задано
                  </li>
                  <li>
                    <strong>Slug</strong> — генерируется автоматически
                  </li>
                  <li>
                    <strong>Описание</strong> — необязательное
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-yellow-800">
                  <strong>Важно:</strong> При удалении масти лошади, привязанные
                  к ней, не удаляются — у них сбросится поле масти.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Владельцы */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              8. Владельцы
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                На вкладке <strong>«Владельцы»</strong> ведётся справочник
                владельцев лошадей — физических лиц и организаций.
              </p>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Поля владельца:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Имя</strong> — обязательное поле. ФИО физлица или
                    название компании.
                  </li>
                  <li>
                    <strong>Тип</strong> — физическое лицо (<code>person</code>)
                    или организация (<code>company</code>). По умолчанию —
                    физлицо.
                  </li>
                  <li>
                    <strong>Описание</strong> — необязательное поле.
                  </li>
                  <li>
                    <strong>Адрес</strong> — необязательное поле.
                  </li>
                  <li>
                    <strong>Телефоны</strong> — список телефонных номеров. Можно
                    добавить несколько номеров.
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  Создание владельца
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Перейдите на вкладку <strong>«Владельцы»</strong>
                  </li>
                  <li>
                    Нажмите <strong>«Добавить»</strong>
                  </li>
                  <li>Заполните обязательное поле «Имя» и прочие данные</li>
                  <li>
                    Нажмите <strong>«Добавить»</strong>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Фильтры по владельцам:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>По имени (текстовый поиск)</li>
                  <li>По описанию (текстовый поиск)</li>
                  <li>По типу (физлицо / компания)</li>
                  <li>По адресу (текстовый поиск)</li>
                  <li>По номеру телефона (текстовый поиск)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 9. Услуги */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              9. Услуги лошадей
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                На вкладке <strong>«Услуги»</strong> ведётся справочник услуг,
                оказываемых лошадям (например: «Ковка», «Ветеринарный осмотр»,
                «Случка»). Услуги можно привязывать к конкретным лошадям через
                карточку лошади.
              </p>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Поля услуги:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Название</strong> — обязательное поле.
                  </li>
                  <li>
                    <strong>Slug</strong> — URL-идентификатор, генерируется
                    автоматически из названия. Можно задать вручную.
                  </li>
                  <li>
                    <strong>Описание</strong> — необязательное поле.
                  </li>
                  <li>
                    <strong>Цена</strong> — обязательное поле, указывается в
                    копейках (например, 500000 = 5000 рублей).
                  </li>
                  <li>
                    <strong>Формат цены</strong> — определяет отображение цены
                    на сайте:
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>
                        <code>equal</code> — точная цена («5000 ₽»)
                      </li>
                      <li>
                        <code>gt</code> — «от» («от 5000 ₽»)
                      </li>
                      <li>
                        <code>lt</code> — «до» («до 5000 ₽»)
                      </li>
                      <li>
                        <code>discuss</code> — «договорная»
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  Создание услуги
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Перейдите на вкладку <strong>«Услуги»</strong>
                  </li>
                  <li>
                    Нажмите <strong>«Добавить»</strong>
                  </li>
                  <li>
                    Введите название и цену (в копейках), выберите формат
                    отображения цены
                  </li>
                  <li>
                    Нажмите <strong>«Добавить»</strong>
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-yellow-800">
                  <strong>Формат цены:</strong> Цена хранится в{" "}
                  <strong>копейках</strong>. Для отображения «5 000 ₽» введите
                  500000. Для «1 200 ₽» — 120000.
                </p>
              </div>
            </div>
          </section>
          <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
            <h3 className="font-semibold mb-3 text-green-900">
              Права доступа к услугам
            </h3>
            <div className="space-y-3 text-green-800 text-sm">
              <p>
                Услуги являются <strong>справочником разработчика</strong>,
                поэтому их создание и удаление доступно только пользователям с
                ролью <code>DEVELOPER</code> или <code>SUPERUSER</code>.
              </p>
              <p>
                <strong>Администраторы</strong> (<code>ADMIN</code>) могут:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Просматривать список услуг</li>
                <li>Изменять описание услуги</li>
                <li>Изменять URL (slug) услуги</li>
                <li>Изменять цену и формат отображения цены</li>
              </ul>
              <p>
                <strong>Администраторы НЕ могут:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Создавать новые услуги</li>
                <li>Удалять услуги</li>
                <li>Изменять наименование услуги</li>
              </ul>
              <p>
                Если вам нужно добавить новую услугу или изменить её название,
                обратитесь к разработчику.
              </p>
            </div>
          </div>

          {/* 10. Услуги лошади */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              10. Услуги лошади
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                К каждой лошади можно привязать услуги из справочника. Привязка
                позволяет указать индивидуальные описание и цену для конкретной
                лошади, отличающиеся от значений в справочнике услуг.
              </p>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  10.1. Просмотр привязанных услуг
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    В таблице лошадей нажмите кнопку <strong>«Услуги»</strong> в
                    колонке <strong>«Действия»</strong>
                  </li>
                  <li>
                    Откроется боковая панель (Drawer) с таблицей привязанных к
                    лошади услуг
                  </li>
                  <li>
                    Таблица отображает <strong>наименование</strong> и{" "}
                    <strong>цену</strong> каждой услуги
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  10.2. Добавление услуги к лошади
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>
                    Откройте Drawer услуг лошади (кнопка{" "}
                    <strong>«Услуги»</strong> в таблице)
                  </li>
                  <li>
                    Нажмите кнопку <strong>«Добавить»</strong> в верхней части
                    панели
                  </li>
                  <li>
                    В открывшейся форме выберите услугу из выпадающего списка с
                    поиском — начните вводить название услуги
                  </li>
                  <li>
                    При необходимости включите{" "}
                    <strong>«Переопределить описание»</strong> и укажите
                    индивидуальное описание для этой лошади
                  </li>
                  <li>
                    При необходимости включите{" "}
                    <strong>«Переопределить цену»</strong>, выберите формат цены
                    и укажите цену
                  </li>
                  <li>
                    Нажмите <strong>«Добавить»</strong>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold mb-3">Поля переопределения:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Переопределить описание</strong> — необязательное
                    поле. Если указано, на сайте вместо описания из справочника
                    услуг будет отображаться это значение.
                  </li>
                  <li>
                    <strong>Переопределить цену</strong> — необязательное поле.
                    Если указано, на сайте вместо цены из справочника будет
                    отображаться индивидуальная цена. Включает выбор формата
                    цены (равно / от / до / договорная) и ввод суммы.
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  10.3. Редактирование связи
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                  <li>В Drawer кликните на строку услуги в таблице</li>
                  <li>
                    Откроется форма редактирования — можно изменить описание и
                    цену переопределения
                  </li>
                  <li>
                    Нажмите <strong>«Изменить»</strong> для сохранения
                  </li>
                </ol>
              </div>

              <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-400">
                <h3 className="text-xl font-semibold mb-3 text-red-900">
                  10.4. Удаление связи
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-red-800">
                  <li>В Drawer кликните на строки услуги в таблице</li>
                  <li>
                    Нажмите кнопку <strong>«Удалить»</strong> в форме
                    редактирования
                  </li>
                  <li>Подтвердите удаление в диалоговом окне</li>
                </ol>
                <p className="text-red-800 mt-3">
                  <strong>Примечание:</strong> Удаление связи не удаляет саму
                  услугу из справочника — только связь между лошадью и услугой.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Типичные ошибки */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              11. Типичные ошибки и советы
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-400">
                <h3 className="font-semibold mb-3 text-red-900">
                  Частые ошибки:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-red-800">
                  <li>
                    <strong>Дата рождения позже даты смерти</strong> — система
                    не сохранит лошадь. Исправьте даты.
                  </li>
                  <li>
                    <strong>Дата в будущем</strong> — поля bdate и ddate не
                    могут содержать будущие даты.
                  </li>
                  <li>
                    <strong>Отец — не жеребец</strong> — при настройке
                    родословной отец обязан иметь пол «жеребец».
                  </li>
                  <li>
                    <strong>Мать — не кобыла</strong> — при настройке
                    родословной мать обязана иметь пол «кобыла».
                  </li>
                  <li>
                    <strong>Разные виды в родословной</strong> — лошадь и пони
                    не могут быть в одной родословной.
                  </li>
                  <li>
                    <strong>Цена услуги</strong> — указывается в копейках, а не
                    в рублях. При вводе 5000 на сайте отобразится «50 ₽».
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
                <h3 className="font-semibold mb-3 text-green-900">Советы:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-green-800">
                  <li>
                    Перед добавлением лошади убедитесь, что её порода и масть
                    уже есть в справочниках.
                  </li>
                  <li>
                    Используйте режим отображения дат <code>hide</code>, если
                    дата известна приблизительно — это позволит хранить точную
                    дату, не показывая её на сайте.
                  </li>
                  <li>
                    Флаг «Наша конюшня» удобен для быстрой фильтрации активного
                    поголовья.
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

<div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-400">
  <h3 className="font-semibold mb-3 text-purple-900">
    Использование услуг для фильтрации лошадей
  </h3>
  <div className="space-y-3 text-purple-800 text-sm">
    <p>
      Услуги также используются для{" "}
      <strong>фильтрации лошадей на публичном сайте</strong>. Посетители сайта
      могут отфильтровать лошадей по доступным услугам (например, показать
      только лошадей, доступных для разведения).
    </p>
    <p>
      Поэтому важно, чтобы наименования услуг были понятными и точными — они
      напрямую отображаются на сайте.
    </p>
  </div>
</div>;
