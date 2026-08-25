import React from "react";
import { DeveloperDocumentationOverview } from "@/ui/DeveloperDocumentationOverview";

export const UsersDeveloperDocumentationView = () => (
  <article className="max-w-5xl mx-auto p-6 space-y-6" data-testid="users-developer-docs">
    <DeveloperDocumentationOverview title="User Management API">
      <p>CMS API управления пользователями является защищённым и требует сессию USER_MANAGER или SUPERUSER.</p>
    </DeveloperDocumentationOverview>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Контракт ролей</h2>
      <p><code>GET /user-management/roles</code> возвращает справочник ролей. Интерфейс показывает название, сохраняя UUID как value.</p>
      <p><code>POST /user-management/users</code> и <code>PATCH /user-management/users/:id</code> принимают UUID ролей в <code>scope_ids</code>.</p>
    </section>
  </article>
);
