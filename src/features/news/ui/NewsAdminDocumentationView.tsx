import React from "react";
import { NewsTabs, NewsTabsEnum } from "./NewsTabs";

export type NewsAdminDocumentationViewProps = {
    activeTab: NewsTabsEnum;
    setActiveTab: (tab: NewsTabsEnum) => void;
};

export const NewsAdminDocumentationView: React.FC<NewsAdminDocumentationViewProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <>
            <NewsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">
                        Инструкция по работе с новостями
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Данная инструкция предназначена для администраторов CMS и описывает,
                        как управлять новостями конюшни через административную панель.
                    </p>

                    {/* 1. Управление новостями */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            1. Управление новостями
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                В разделе <strong>&quot;Новости&quot;</strong> вы можете создавать,
                                редактировать и удалять новости конюшни. Все новости отображаются
                                в таблице с информацией о названии, сниппете, дате публикации и статусе.
                            </p>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                                    1.1. Создание новости
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                                    <li>Нажмите кнопку <strong>&quot;Добавить&quot;</strong> в правом верхнем углу страницы</li>
                                    <li>Заполните поля формы: название, сниппет (необязательно), дату публикации</li>
                                    <li>Нажмите <strong>&quot;Добавить&quot;</strong> для сохранения</li>
                                    <li>После создания откройте новость, чтобы добавить HTML-содержимое и фотографии</li>
                                </ol>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                                    1.2. Редактирование новости
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                                    <li>Кликните на строку новости в таблице, чтобы открыть форму редактирования</li>
                                    <li>Измените необходимые поля</li>
                                    <li>Нажмите <strong>&quot;Изменить&quot;</strong> для сохранения изменений</li>
                                </ol>
                            </div>

                            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-400">
                                <h3 className="text-xl font-semibold mb-3 text-red-900">
                                    1.3. Удаление новости (Soft Delete)
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 ml-4 text-red-800">
                                    <li>Откройте форму редактирования новости (кликните на строку в таблице)</li>
                                    <li>Нажмите кнопку <strong>&quot;Удалить&quot;</strong></li>
                                    <li>Подтвердите удаление в диалоговом окне</li>
                                </ol>
                                <p className="text-red-800 mt-3">
                                    <strong>Важно:</strong> Удаление является мягким (soft delete) — запись
                                    физически не удаляется из базы данных, а помечается как удалённая.
                                    Удалённые новости не отображаются на сайте, но видны в CMS
                                    (статус &quot;Удалено&quot;).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Статусы новостей */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            2. Статусы новостей
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Каждая новость имеет один из трёх статусов, который определяется
                                автоматически на основе полей <code className="bg-gray-100 px-1 rounded">is_deleted</code> и{" "}
                                <code className="bg-gray-100 px-1 rounded">published_at</code>:
                            </p>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-900 mb-2">
                                    Опубликовано (зелёный)
                                </h3>
                                <p className="text-green-800">
                                    Условие: новость не удалена (<code>is_deleted = false</code>) И
                                    дата публикации в прошлом или настоящем (
                                    <code>published_at &le; сейчас</code>
                                    ). Такие новости отображаются на сайте.
                                </p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">
                                    Запланировано (синий)
                                </h3>
                                <p className="text-blue-800">
                                    Условие: новость не удалена (<code>is_deleted = false</code>) И
                                    дата публикации в будущем (
                                    <code>published_at &gt; сейчас</code>
                                    ). Такие новости ещё не отображаются на сайте — они появятся
                                    автоматически в указанное время.
                                </p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-red-900 mb-2">
                                    Удалено (красный)
                                </h3>
                                <p className="text-red-800">
                                    Условие: новость помечена как удалённая (
                                    <code>is_deleted = true</code>). Такие новости не отображаются
                                    на сайте, но доступны для просмотра в CMS.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Поля новости */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            3. Поля новости
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="bg-gray-50 p-5 rounded-lg">
                                <ul className="space-y-3">
                                    <li>
                                        <strong>Название (name)</strong> — обязательное поле, максимум 63 символа.
                                        Отображается как заголовок новости на сайте.
                                    </li>
                                    <li>
                                        <strong>Сниппет (snippet)</strong> — необязательное поле, максимум 255 символов.
                                        Краткое описание, отображается в списке новостей.{" "}
                                        <em>
                                            Если не заполнено — автоматически генерируется из содержимого
                                            (HTML теги удаляются, берутся первые 255 символов текста).
                                        </em>
                                    </li>
                                    <li>
                                        <strong>Дата публикации (published_at)</strong> — обязательное поле.
                                        Определяет, когда новость станет видимой на сайте. Можно установить
                                        дату в будущем, чтобы запланировать публикацию.
                                    </li>
                                    <li>
                                        <strong>Содержимое (content)</strong> — HTML-контент новости.
                                        Редактируется через встроенный HTML-редактор. Заполняется после
                                        создания новости через кнопку &quot;Редактировать HTML&quot;.
                                    </li>
                                    <li>
                                        <strong>Фотографии (photos)</strong> — фотографии из галереи,
                                        прикреплённые к новости. Одна из фотографий может быть назначена
                                        главной.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 4. HTML-редактор */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            4. HTML-редактор
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Для редактирования основного содержимого новости используется
                                встроенный HTML-редактор на базе TipTap.
                            </p>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                                    Как открыть редактор
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                                    <li>Откройте форму редактирования новости (кликните на строку в таблице)</li>
                                    <li>Нажмите кнопку <strong>&quot;Редактировать HTML&quot;</strong></li>
                                    <li>В открывшемся редакторе внесите изменения</li>
                                    <li>Нажмите <strong>&quot;Сохранить&quot;</strong></li>
                                </ol>
                            </div>

                            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-400">
                                <h3 className="text-xl font-semibold mb-3 text-yellow-900">
                                    Ограничения безопасности
                                </h3>
                                <ul className="list-disc list-inside space-y-2 ml-4 text-yellow-800">
                                    <li>
                                        <strong>JavaScript запрещён:</strong> Нельзя добавлять{" "}
                                        <code>&lt;script&gt;</code> теги или{" "}
                                        <code>javascript:</code> ссылки
                                    </li>
                                    <li>
                                        <strong>Inline-обработчики событий запрещены:</strong> Нельзя
                                        использовать атрибуты вида <code>onclick=</code>,{" "}
                                        <code>onerror=</code> и т.д.
                                    </li>
                                    <li>
                                        Разрешён только безопасный HTML: параграфы, заголовки, таблицы,
                                        ссылки, изображения, форматирование текста
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 5. Фотографии */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            5. Фотографии
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                К каждой новости можно прикрепить одну или несколько фотографий
                                из галереи CMS.
                            </p>

                            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                                    Управление фотографиями
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 ml-4 text-blue-800">
                                    <li>
                                        Нажмите кнопку с иконкой фотографии в колонке{" "}
                                        <strong>&quot;Действия&quot;</strong> в таблице, или кнопку{" "}
                                        <strong>&quot;Управление фото&quot;</strong> в форме редактирования
                                    </li>
                                    <li>В открывшемся окне выберите фотографии из галереи</li>
                                    <li>
                                        Для назначения главной фотографии нажмите на иконку звезды рядом
                                        с фотографией
                                    </li>
                                    <li>
                                        Для удаления фотографии из новости нажмите на иконку минуса
                                    </li>
                                </ol>
                                <p className="text-blue-800 mt-3">
                                    <strong>Главная фотография</strong> отображается как обложка новости
                                    в списке и в детальном просмотре на сайте.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 6. Фильтры и поиск */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            6. Фильтры и поиск
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                В таблице новостей доступны несколько инструментов фильтрации для
                                быстрого нахождения нужных записей.
                            </p>

                            <div className="bg-gray-50 p-5 rounded-lg">
                                <h3 className="font-semibold mb-3">Доступные фильтры:</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>
                                        <strong>По наименованию</strong> — текстовый поиск по названию
                                        новости (регистронезависимый)
                                    </li>
                                    <li>
                                        <strong>По сниппету</strong> — текстовый поиск по краткому
                                        описанию
                                    </li>
                                    <li>
                                        <strong>По дате публикации</strong> — выбор диапазона дат
                                        (от/до)
                                    </li>
                                    <li>
                                        <strong>По статусу</strong> — выбор одного или нескольких
                                        статусов: Опубликовано, Запланировано, Удалено
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                <p className="text-blue-800">
                                    <strong>Совет:</strong> Используйте кнопку{" "}
                                    <strong>&quot;Сбросить&quot;</strong> для сброса всех активных
                                    фильтров и возврата к полному списку новостей.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};
