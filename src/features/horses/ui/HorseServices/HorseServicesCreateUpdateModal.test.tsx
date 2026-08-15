import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import type { HorseServiceOutDto } from "@/types/api/horseServices";
import type { UUID } from "crypto";
import { HorseServicesCreateUpdateModal } from "./HorseServicesCreateUpdateModal";
import { PriceFormatter } from "@/types/api/prices";

const service: HorseServiceOutDto = {
  id: "00000000-0000-4000-8000-000000000301" as UUID,
  name: "Разведение",
  description: "Услуга разведения",
  slug: "razvedenie",
  price: 10000,
  price_formatter: PriceFormatter.equal,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
};

const renderModal = (
  selectedHorseService: HorseServiceOutDto | null,
  overrides = {},
) =>
  renderWithCmsProviders(
    <HorseServicesCreateUpdateModal
      open
      onClose={vi.fn()}
      selectedHorseService={selectedHorseService}
      onCreate={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
      validationErrors={{}}
      onResetValidation={vi.fn()}
      canMutate
      canDelete
      canUpdateName
      {...overrides}
    />,
  );

describe("HorseServicesCreateUpdateModal", () => {
  describe("Create button visibility", () => {
    it("shows create button for DEVELOPER", () => {
      renderModal(null, { canMutate: true });
      expect(
        screen.getByRole("button", { name: /Добавить/ }),
      ).toBeInTheDocument();
    });

    it("hides create button for ADMIN", () => {
      renderModal(null, { canMutate: false });
      expect(
        screen.queryByRole("button", { name: /Добавить/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Delete button visibility", () => {
    it("shows delete button for DEVELOPER", () => {
      renderModal(service, { canDelete: true });
      expect(
        screen.getByRole("button", { name: /Удалить/ }),
      ).toBeInTheDocument();
    });

    it("hides delete button for ADMIN", () => {
      renderModal(service, { canDelete: false });
      expect(
        screen.queryByRole("button", { name: /Удалить/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Name field state", () => {
    it("enables name field for DEVELOPER", () => {
      renderModal(service, { canUpdateName: true });
      const nameInput = screen.getByLabelText("Наименование услуги");
      expect(nameInput).not.toBeDisabled();
    });

    it("disables name field for ADMIN", () => {
      renderModal(service, { canUpdateName: false });
      const nameInput = screen.getByLabelText("Наименование услуги");
      expect(nameInput).toBeDisabled();
    });
  });

  describe("Update button visibility", () => {
    it("shows update button for DEVELOPER", () => {
      renderModal(service, { canMutate: true });
      expect(
        screen.getByRole("button", { name: /Изменить/ }),
      ).toBeInTheDocument();
    });

    it("shows update button for ADMIN", () => {
      renderModal(service, { canMutate: true, canUpdateName: false });
      expect(
        screen.getByRole("button", { name: /Изменить/ }),
      ).toBeInTheDocument();
    });

    it("hides update button for ADMIN without update permission", () => {
      renderModal(service, { canMutate: false });
      expect(
        screen.queryByRole("button", { name: /Изменить/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Form submission", () => {
    it("submits create form data", async () => {
      const onCreate = vi.fn();
      renderModal(null, { onCreate, canMutate: true });

      await userEvent.type(
        screen.getByLabelText("Наименование услуги"),
        "Новая услуга",
      );
      await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Новая услуга" }),
      );
    });

    it("submits update form data", async () => {
      const onUpdate = vi.fn();
      renderModal(service, { onUpdate, canMutate: true, canUpdateName: true });

      await userEvent.clear(screen.getByLabelText("Наименование услуги"));
      await userEvent.type(
        screen.getByLabelText("Наименование услуги"),
        "Обновленная услуга",
      );
      await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

      expect(onUpdate).toHaveBeenCalledWith(
        service.id,
        expect.objectContaining({ name: "Обновленная услуга" }),
      );
    });
  });

  describe("Field disabling for ADMIN", () => {
    it("enables description field for ADMIN", () => {
      renderModal(service, { canMutate: true, canUpdateName: false });
      const descriptionInput = screen.getByLabelText("Описание услуги");
      expect(descriptionInput).not.toBeDisabled();
    });

    it("enables slug field for ADMIN", () => {
      renderModal(service, { canMutate: true, canUpdateName: false });
      const slugInput = screen.getByLabelText(
        "Путь в URL (генерируется автоматически)",
      );
      expect(slugInput).not.toBeDisabled();
    });

    it("enables price field for ADMIN", () => {
      renderModal(service, { canMutate: true, canUpdateName: false });
      const priceInput = screen.getByLabelText("Цена услуги по умолчанию");
      expect(priceInput).not.toBeDisabled();
    });

    it("disables description field when cannot mutate", () => {
      renderModal(service, { canMutate: false });
      const descriptionInput = screen.getByLabelText("Описание услуги");
      expect(descriptionInput).toBeDisabled();
    });
  });
});
