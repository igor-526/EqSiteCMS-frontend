import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorseBreedCreateUpdateModal } from "./HorseBreedsCreateUpdateModal";
import type { HorseBreedOutDto } from "@/types/api/horseBreeds";
import type { UUID } from "crypto";

const breed: HorseBreedOutDto = {
  id: "00000000-0000-4000-8000-000000000101" as UUID,
  name: "Уэльская",
  short_name: "Уэл.",
  slug: "welsh",
  description: null,
  kind: "pony",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  group: null,
};
const groupId = "00000000-0000-4000-8000-000000000201" as UUID;
const groupOptions = [{ label: "Верховые", value: groupId }];

const noop = vi.fn();

const renderModal = (
  selectedHorseBreed: HorseBreedOutDto | null = null,
  overrides: Partial<
    React.ComponentProps<typeof HorseBreedCreateUpdateModal>
  > = {},
) =>
  renderWithCmsProviders(
    <HorseBreedCreateUpdateModal
      open
      onClose={noop}
      selectedHorseBreed={selectedHorseBreed}
      onCreate={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
      validationErrors={{}}
      onResetValidation={noop}
      canMutate
      canDelete
      {...overrides}
    />,
  );

describe("HorseBreedCreateUpdateModal", () => {
  beforeEach(() => {
    noop.mockClear();
  });

  it("defaults create kind to horse and includes it in payload", async () => {
    const onCreate = vi.fn();
    renderModal(null, { onCreate });

    await userEvent.type(
      screen.getByLabelText("Наименование породы"),
      "Арабская",
    );
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0][0]).toMatchObject({
      name: "Арабская",
      kind: "horse",
    });
  });

  it("uses selected breed kind for update payload", async () => {
    const onUpdate = vi.fn();
    renderModal(breed, { onUpdate });

    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][1]).toMatchObject({
      kind: "pony",
      short_name: "Уэл.",
    });
  });

  it("assigns a group on create and clears an existing group with explicit null", async () => {
    const onCreate = vi.fn();
    const { unmount } = renderModal(null, { onCreate, groupOptions });
    await userEvent.type(screen.getByLabelText("Наименование породы"), "Арабская");
    await userEvent.click(screen.getByRole("combobox", { name: "Группа" }));
    await userEvent.click(screen.getByText("Верховые"));
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ breed_group_id: groupId }));
    unmount();

    const onUpdate = vi.fn();
    renderModal({ ...breed, group: { id: groupId, name: "Верховые", slug: "riding" } }, { onUpdate, groupOptions });
    await userEvent.click(document.querySelector(".ant-select-clear") as HTMLElement);
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));
    expect(onUpdate).toHaveBeenCalledWith(breed.id, expect.objectContaining({ breed_group_id: null }));
  });

  it("surfaces group options error without breaking the form", () => {
    renderModal(null, { groupOptionsError: "Не удалось загрузить группы" });
    expect(screen.getByRole("alert")).toHaveTextContent("Не удалось загрузить группы");
    expect(screen.getByRole("combobox", { name: "Группа" })).toBeInTheDocument();
  });

  it("submits empty and 63-character short names and displays field errors", async () => {
    const onCreate = vi.fn();
    const { unmount } = renderModal(null, { onCreate });
    await userEvent.type(
      screen.getByLabelText("Наименование породы"),
      "Арабская",
    );
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
    expect(onCreate.mock.calls[0][0]).toMatchObject({ short_name: "" });
    unmount();

    const value = "а".repeat(63);
    const secondCreate = vi.fn();
    renderModal(null, {
      onCreate: secondCreate,
      validationErrors: { short_name: ["Ошибка поля"] },
    });
    await userEvent.type(screen.getByLabelText("Короткое наименование"), value);
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    expect(screen.getByText("Ошибка поля")).toBeInTheDocument();
  });

  it("renders type selector options", async () => {
    renderModal();

    await userEvent.click(screen.getByText("Лошадь"));

    expect(screen.getByText("Пони")).toBeInTheDocument();
  });

  it("guards create from double submit", async () => {
    let resolveSubmit: (() => void) | undefined;
    const onCreate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    renderModal(null, { onCreate });
    await userEvent.type(
      screen.getByLabelText("Наименование породы"),
      "Арабская",
    );
    const submit = screen.getByRole("button", { name: /Добавить/ });
    await userEvent.dblClick(submit);
    expect(onCreate).toHaveBeenCalledTimes(1);
    resolveSubmit?.();
  });

  it("renders a name-only backend error without reading a missing description error", () => {
    renderModal(null, { validationErrors: { name: ["Укажите наименование"] } });

    expect(screen.getByText("Укажите наименование")).toBeInTheDocument();
    expect(screen.getByText("0/511")).toBeInTheDocument();
  });

  it("renders only description errors beside the description field", () => {
    renderModal(null, {
      validationErrors: {
        name: ["Ошибка имени"],
        description: ["Описание слишком длинное", "Исправьте описание"],
      },
    });

    expect(screen.getByText(/Описание слишком длинное/)).toHaveTextContent(
      "Описание слишком длинное Исправьте описание",
    );
  });

  it("submits empty optional slug and description unchanged", async () => {
    const onCreate = vi.fn();
    renderModal(null, { onCreate });

    await userEvent.type(
      screen.getByLabelText("Наименование породы"),
      "Арабская",
    );
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "", description: "" }),
    );
  });

  it("retains entered values while validation or generic backend errors are surfaced", async () => {
    const onCreate = vi.fn().mockResolvedValue(false);
    const { rerender } = renderModal(null, { onCreate });
    await userEvent.type(
      screen.getByLabelText("Наименование породы"),
      "Сохранённое имя",
    );
    await userEvent.type(
      screen.getByLabelText("Описание породы"),
      "Сохранённое описание",
    );
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    rerender(
      <HorseBreedCreateUpdateModal
        open
        onClose={noop}
        selectedHorseBreed={null}
        onCreate={onCreate}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        validationErrors={{ name: ["Backend validation"] }}
        onResetValidation={noop}
        canMutate
        canDelete
      />,
    );
    expect(screen.getByDisplayValue("Сохранённое имя")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Сохранённое описание"),
    ).toBeInTheDocument();
    expect(screen.getByText("Backend validation")).toBeInTheDocument();
  });

  it("hides and guards Protected Write controls without dictionary scope", () => {
    const onCreate = vi.fn();
    renderModal(null, { onCreate, canMutate: false });
    expect(
      screen.queryByRole("button", { name: /Добавить/ }),
    ).not.toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("hides update and delete controls without dictionary scope", () => {
    renderModal(breed, { canMutate: false, canDelete: false });
    expect(
      screen.queryByRole("button", { name: /Изменить/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Удалить/ }),
    ).not.toBeInTheDocument();
  });
});
