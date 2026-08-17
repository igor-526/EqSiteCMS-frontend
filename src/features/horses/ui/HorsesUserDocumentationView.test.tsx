import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HorsesTabsKeys } from "./HorsesTabs";
import { HorsesUserDocumentationView } from "./HorsesUserDocumentationView";

vi.mock("./HorsesTabs", async (importOriginal) => {
  const original = await importOriginal<typeof import("./HorsesTabs")>();
  return { ...original, HorsesTabs: () => <nav>Horse tabs</nav> };
});

const renderView = () =>
  render(
    <HorsesUserDocumentationView
      activeTab={HorsesTabsKeys.USER_DOCS}
      setActiveTab={vi.fn()}
    />,
  );

describe("HorsesUserDocumentationView", () => {
  it("lists breed groups in the overview and places them before breeds", () => {
    const { container } = renderView();
    expect(
      screen.getByText(/лошадьми, группами пород, породами/),
    ).toBeVisible();
    const headings = Array.from(
      container.querySelectorAll("h2"),
      (node) => node.textContent,
    );
    expect(headings.indexOf("5. Группы пород")).toBeLessThan(
      headings.indexOf("6. Породы"),
    );
  });

  it("documents the group table, CRUD, Page Editor and list controls", () => {
    renderView();
    expect(screen.getByText(/«Наименование»/).parentElement).toHaveTextContent(
      "Путь URL",
    );
    expect(screen.getByText(/поиск выполняется/)).toBeVisible();
    expect(
      screen.getByText(/заголовки колонок включают сортировку/),
    ).toBeVisible();
    expect(
      screen.getByText(/переход между страницами выполняется пагинацией/),
    ).toBeVisible();
    const addButton = screen
      .getAllByText("«Добавить»")
      .find((element) =>
        element.closest("li")?.textContent?.includes("создаёт группу"),
      );
    expect(addButton?.closest("li")).toHaveTextContent("изменение");
    expect(screen.getByText(/Page Editor/).parentElement).toHaveTextContent(
      "управление фотографиями не предусмотрено",
    );
    expect(screen.getByText(/Write-действия доступны/)).toHaveTextContent(
      "Ошибка",
    );
  });

  it("documents assignment, clearing, multi-select, sorting and safe deletion", () => {
    renderView();
    expect(screen.getByText(/Группу можно назначить/)).toHaveTextContent(
      "явно очистить",
    );
    expect(screen.getByText(/В фильтре можно выбрать/)).toHaveTextContent(
      "multi-select",
    );
    expect(screen.getByText(/В фильтре можно выбрать/)).toHaveTextContent(
      "по имени группы",
    );
    expect(
      screen.getByText(/удаление группы не удаляет породы/),
    ).toHaveTextContent("«—»");
  });
});
