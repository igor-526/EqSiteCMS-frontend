import React from "react";

export const UsersUserDocumentationView = () => (
  <article className="max-w-5xl mx-auto p-6 space-y-6" data-testid="users-user-docs">
    <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
    <p className="text-gray-700">
      В разделе можно находить пользователей по ФИО, создавать учётные записи и
      изменять назначенные роли. Доступные действия зависят от ваших прав.
    </p>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Создание и редактирование</h2>
      <p>Нажмите «Добавить», заполните обязательные поля и выберите одну или несколько ролей.</p>
      <p>Для редактирования нажмите на строку пользователя. После успешного сохранения список обновится.</p>
    </section>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Безопасность</h2>
      <p>Блокировка, удаление и смена пароля доступны только при наличии соответствующих прав.</p>
    </section>
  </article>
);
