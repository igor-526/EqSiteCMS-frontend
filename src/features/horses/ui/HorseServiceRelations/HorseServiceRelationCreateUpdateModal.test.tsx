import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorseServiceRelationCreateUpdateModal } from "./HorseServiceRelationCreateUpdateModal";
import type {
  HorseServiceRelationAvailableServiceDto,
  HorseServiceRelationOutDto,
} from "@/types/api/horseServiceRelations";
import { PriceFormatter } from "@/types/api/prices";
import type { UUID } from "crypto";

const noop = vi.fn();

const relation: HorseServiceRelationOutDto = {
  id: "00000000-0000-4000-8000-000000000001" as UUID,
  horse_id: "00000000-0000-4000-8000-000000000002" as UUID,
  service_id: "00000000-0000-4000-8000-000000000003" as UUID,
  name: "Ковка",
  slug: "horseshoeing",
  description: null,
  price: 5000,
  price_formatter: PriceFormatter.equal,
};

const availableService: HorseServiceRelationAvailableServiceDto = {
  id: "00000000-0000-4000-8000-000000000003" as UUID,
  name: "Ковка",
  slug: "horseshoeing",
  description: "Стандартная ковка",
  price: 5000,
  price_formatter: PriceFormatter.equal,
};

const renderModal = (
  selectedRelation: HorseServiceRelationOutDto | null = null,
  overrides: Partial<
    React.ComponentProps<typeof HorseServiceRelationCreateUpdateModal>
  > = {},
) =>
  renderWithCmsProviders(
    <HorseServiceRelationCreateUpdateModal
      open
      onClose={noop}
      selectedRelation={selectedRelation}
      availableServices={[]}
      availableServicesLoading={false}
      onSearchServices={vi.fn()}
      onCreate={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
      validationErrors={{}}
      onResetValidation={noop}
      {...overrides}
    />,
  );

describe("HorseServiceRelationCreateUpdateModal", () => {
  beforeEach(() => {
    noop.mockClear();
  });

  it("renders create title", () => {
    renderModal(null);
    expect(screen.getByText("Добавить услугу к лошади")).toBeInTheDocument();
  });

  it("renders edit title", () => {
    renderModal(relation);
    expect(screen.getByText("Изменить связь с услугой")).toBeInTheDocument();
  });

  it("renders available services select in create mode", () => {
    renderModal(null, { availableServices: [availableService] });
    expect(
      screen.getByText("Начните вводить название услуги"),
    ).toBeInTheDocument();
  });

  it("renders service name disabled in edit mode", () => {
    renderModal(relation);
    expect(screen.getByDisplayValue("Ковка")).toBeDisabled();
  });

  it("calls onCreate with service_id on submit", async () => {
    const onCreate = vi.fn();
    renderModal(null, {
      availableServices: [availableService],
      onCreate,
    });

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText("Ковка"));
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0][0]).toMatchObject({
      service_id: availableService.id,
      description_override: availableService.description,
      price_override: availableService.price,
      price_formatter_override: availableService.price_formatter,
    });
  });

  it("replaces inherited values when another service is selected", async () => {
    const onCreate = vi.fn();
    const second = {
      ...availableService,
      id: "00000000-0000-4000-8000-000000000004" as UUID,
      name: "Постой",
      description: "Денник и кормление",
      price: 12000,
      price_formatter: PriceFormatter.gt,
    };
    renderModal(null, {
      availableServices: [availableService, second],
      onCreate,
    });
    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText("Ковка"));
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText("Постой"));
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
    expect(onCreate).toHaveBeenCalledWith({
      service_id: second.id,
      description_override: second.description,
      price_override: second.price,
      price_formatter_override: second.price_formatter,
    });
  });

  it("sends explicit nulls when inherited nullable values are cleared", async () => {
    const onCreate = vi.fn();
    renderModal(null, { availableServices: [availableService], onCreate });
    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText("Ковка"));
    await userEvent.clear(screen.getByDisplayValue("Стандартная ковка"));
    await userEvent.clear(screen.getByDisplayValue("5000"));
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
    expect(onCreate).toHaveBeenCalledWith({
      service_id: availableService.id,
      description_override: null,
      price_override: null,
      price_formatter_override: null,
    });
  });

  it("calls onUpdate with relation id on submit", async () => {
    const onUpdate = vi.fn();
    renderModal(relation, { onUpdate });

    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0]).toBe(relation.id);
  });

  it("calls onDelete after popconfirm", async () => {
    const onDelete = vi.fn();
    renderModal(relation, { onDelete });

    await userEvent.click(screen.getByRole("button", { name: /Удалить/ }));
    await userEvent.click(screen.getByRole("button", { name: "Да" }));

    expect(onDelete).toHaveBeenCalledWith(relation.id);
  });

  it("displays validation errors", () => {
    renderModal(null, {
      validationErrors: { service_id: ["Выберите услугу"] },
    });
    expect(screen.getByText("Выберите услугу")).toBeInTheDocument();
  });

  it("resets validation on open", () => {
    const onResetValidation = vi.fn();
    renderModal(null, { onResetValidation });
    expect(onResetValidation).toHaveBeenCalled();
  });

  it("includes description override in create data", async () => {
    const onCreate = vi.fn();
    renderModal(null, {
      availableServices: [availableService],
      onCreate,
    });

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText("Ковка"));

    const descriptionField = screen.getByPlaceholderText("Стандартная ковка");
    await userEvent.clear(descriptionField);
    await userEvent.type(descriptionField, "Индивидуальное описание");

    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    expect(onCreate.mock.calls[0][0]).toMatchObject({
      description_override: "Индивидуальное описание",
    });
  });

  it("includes price override in update data", async () => {
    const onUpdate = vi.fn();
    renderModal(relation, { onUpdate });

    const priceInput = await screen.findByPlaceholderText("5000 ₽");
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, "7000");

    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate.mock.calls[0][1]).toMatchObject({
      price_override: 7000,
      price_formatter_override: PriceFormatter.equal,
    });
  });

  it("disables add button when no service selected", () => {
    renderModal(null);
    expect(screen.getByRole("button", { name: /Добавить/ })).toBeDisabled();
  });

  it("disables buttons when submitting", () => {
    renderModal(relation, { submitting: true });
    expect(screen.getByRole("button", { name: /Изменить/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Удалить/ })).toBeDisabled();
  });

  it("disables add button when submitting in create mode", () => {
    renderModal(null, {
      availableServices: [availableService],
      submitting: true,
    });
    expect(screen.getByRole("button", { name: /Добавить/ })).toBeDisabled();
  });

  it("disables submit button when submitting is true even with service selected", async () => {
    const onCreate = vi.fn();
    renderModal(null, {
      availableServices: [availableService],
      onCreate,
      submitting: true,
    });

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText("Ковка"));

    const submit = screen.getByRole("button", { name: /Добавить/ });
    expect(submit).toBeDisabled();
    await userEvent.click(submit);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("renders description and price fields always visible", () => {
    renderModal(relation);
    expect(screen.getByText("Описание")).toBeInTheDocument();
    expect(screen.getByText("Цена")).toBeInTheDocument();
  });
});
