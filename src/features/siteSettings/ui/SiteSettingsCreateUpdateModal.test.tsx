import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  SiteSettingsCreateUpdateModal,
  type SiteSettingsCreateUpdateModalProps,
} from "./SiteSettingsCreateUpdateModal";
import { SiteSettingOutDto, SiteSettingType } from "@/types/api/siteSettings";
import type { UUID } from "crypto";

const siteSetting: SiteSettingOutDto = {
  id: "00000000-0000-4000-8000-000000000301" as UUID,
  key: "site.title",
  name: "Заголовок",
  type: SiteSettingType.string,
  value: "Иннолово",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
};

const buildProps = (
  overrides: Partial<SiteSettingsCreateUpdateModalProps> = {},
): SiteSettingsCreateUpdateModalProps => ({
  open: true,
  onClose: vi.fn(),
  selectedSiteSetting: null,
  onCreate: vi.fn(),
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  validationErrors: {},
  onResetValidation: vi.fn(),
  ...overrides,
});

describe("SiteSettingsCreateUpdateModal", () => {
  it("does not render a description field for create or update", () => {
    const { rerender } = render(
      <SiteSettingsCreateUpdateModal {...buildProps()} />,
    );
    expect(screen.queryByText(/Описание/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Описание/i)).not.toBeInTheDocument();

    rerender(
      <SiteSettingsCreateUpdateModal
        {...buildProps({ selectedSiteSetting: siteSetting })}
      />,
    );
    expect(screen.queryByText(/Описание/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Описание/i)).not.toBeInTheDocument();
  });

  it("submits a create payload without description", () => {
    const onCreate = vi.fn();
    render(<SiteSettingsCreateUpdateModal {...buildProps({ onCreate })} />);

    fireEvent.change(screen.getByLabelText("Ключ для API"), {
      target: { value: "site.title" },
    });
    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Заголовок" },
    });
    fireEvent.change(screen.getByLabelText("Значение"), {
      target: { value: "Иннолово" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    expect(onCreate).toHaveBeenCalledWith({
      key: "site.title",
      name: "Заголовок",
      type: SiteSettingType.string,
      value: "Иннолово",
    });
    expect(onCreate.mock.calls[0][0]).not.toHaveProperty("description");
  });

  it("submits an update payload without description for the selected setting", () => {
    const onUpdate = vi.fn();
    render(
      <SiteSettingsCreateUpdateModal
        {...buildProps({ selectedSiteSetting: siteSetting, onUpdate })}
      />,
    );

    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Новый заголовок" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(siteSetting.id, {
      key: siteSetting.key,
      name: "Новый заголовок",
      type: siteSetting.type,
      value: siteSetting.value,
    });
    expect(onUpdate.mock.calls[0][1]).not.toHaveProperty("description");
  });

  it("renders validation errors for the remaining fields only", () => {
    render(
      <SiteSettingsCreateUpdateModal
        {...buildProps({
          validationErrors: { key: ["Ключ должно быть заполнен"] },
        })}
      />,
    );

    expect(screen.getByText("Ключ должно быть заполнен")).toBeInTheDocument();
  });

  it("exposes guarded delete and close for a selected setting", () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    render(
      <SiteSettingsCreateUpdateModal
        {...buildProps({ selectedSiteSetting: siteSetting, onDelete, onClose })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Удалить/ }));
    fireEvent.click(screen.getByRole("button", { name: "Да" }));
    expect(onDelete).toHaveBeenCalledWith(siteSetting.id);

    fireEvent.click(screen.getByRole("button", { name: /Закрыть/ }));
    expect(onClose).toHaveBeenCalled();
  });
});
