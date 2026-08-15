import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { PriceEditModal } from "./PriceEditModal";
import type { PriceEditModalProps, PriceEditModalMode } from "./PriceEditModal";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { UUID } from "crypto";
import type { PriceOutDto } from "@/types/api/prices";

const userContextState = vi.hoisted(() => ({
  scopes: [] as KNOWN_USER_SCOPES[],
}));

vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({
    user: { username: "admin" },
    loading: false,
    error: null,
    scopes: userContextState.scopes,
    refreshUser: vi.fn(),
    clearUser: vi.fn(),
  }),
}));

const priceId = "00000000-0000-4000-8000-000000000001" as UUID;
const groupId = "00000000-0000-4000-8000-000000000010" as UUID;

const makePrice = (overrides: Partial<PriceOutDto> = {}): PriceOutDto => ({
  id: priceId,
  name: "Тест услуга",
  slug: "test-service",
  description: "Описание",
  photos: [],
  groups: [],
  price_tables: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  ...overrides,
});

const baseProps: PriceEditModalProps = {
  open: true,
  onClose: vi.fn(),
  mode: "create" as PriceEditModalMode,
  selectedPrice: null,
  templatePrice: null,
  priceDetail: null,
  priceDetailLoading: false,
  onCreate: vi.fn().mockResolvedValue(true),
  onUpdate: vi.fn().mockResolvedValue(true),
  onDelete: vi.fn().mockResolvedValue(true),
  validationErrors: {} as Record<string, string[]>,
  onResetValidation: vi.fn(),
  priceGroupsOptions: [{ key: "g1", label: "Основные", value: groupId }],
};

const renderModal = (overrides: Partial<PriceEditModalProps> = {}) =>
  renderWithCmsProviders(<PriceEditModal {...baseProps} {...overrides} />);

describe("PriceEditModal", () => {
  beforeEach(() => {
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
    vi.clearAllMocks();
    vi.mocked(baseProps.onCreate).mockResolvedValue(true);
    vi.mocked(baseProps.onUpdate).mockResolvedValue(true);
  });

  describe("Заголовки", () => {
    it("create mode → 'Добавить услугу'", () => {
      renderModal({ mode: "create" });
      expect(screen.getByText("Добавить услугу")).toBeInTheDocument();
    });

    it("update mode → 'Редактировать услугу'", () => {
      const price = makePrice();
      renderModal({ mode: "update", selectedPrice: price, priceDetail: price });
      expect(screen.getByText("Редактировать услугу")).toBeInTheDocument();
    });

    it("duplicate mode → 'Добавить услугу (дубль)'", () => {
      renderModal({ mode: "duplicate", templatePrice: makePrice() });
      expect(screen.getByText("Добавить услугу (дубль)")).toBeInTheDocument();
    });
  });

  describe("Dirty badge", () => {
    it("duplicate mode всегда показывает 'Несохранённые изменения'", () => {
      renderModal({ mode: "duplicate", templatePrice: makePrice() });
      expect(screen.getByText("Несохранённые изменения")).toBeInTheDocument();
    });

    it("create mode без изменений не показывает dirty badge", () => {
      renderModal({ mode: "create" });
      expect(
        screen.queryByText("Несохранённые изменения"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Счётчик символов", () => {
    it("показывает 0/63 для пустого поля названия в create mode", () => {
      renderModal({ mode: "create" });
      expect(screen.getByText("0/63")).toBeInTheDocument();
    });

    it("обновляет счётчик после ввода текста", async () => {
      renderModal({ mode: "create" });
      const input = screen.getByPlaceholderText("Название услуги");
      await userEvent.type(input, "Привет");
      expect(screen.getByText("6/63")).toBeInTheDocument();
    });
  });

  describe("Кнопка сохранения", () => {
    it("'Добавить' disabled в create mode без изменений", () => {
      renderModal({ mode: "create" });
      expect(screen.getByText("Добавить").closest("button")).toBeDisabled();
    });

    it("'Добавить' активна после ввода названия", async () => {
      renderModal({ mode: "create" });
      const input = screen.getByPlaceholderText("Название услуги");
      await userEvent.type(input, "Новая услуга");
      expect(screen.getByText("Добавить").closest("button")).not.toBeDisabled();
    });

    it("кнопка сохранения disabled при наличии ошибок валидации", () => {
      renderModal({
        mode: "create",
        validationErrors: { name: ["Обязательное поле"] },
      });
      expect(screen.getByText("Добавить").closest("button")).toBeDisabled();
    });

    it("в duplicate mode 'Добавить' активна (isDirty=true всегда)", () => {
      renderModal({ mode: "duplicate", templatePrice: makePrice() });
      expect(screen.getByText("Добавить").closest("button")).not.toBeDisabled();
    });
  });

  describe("Ошибки валидации", () => {
    it("показывает текст ошибки для поля name", () => {
      renderModal({ validationErrors: { name: ["Обязательное поле"] } });
      expect(screen.getByText("Обязательное поле")).toBeInTheDocument();
    });
  });

  describe("Закрытие с подтверждением", () => {
    it("Закрыть без изменений вызывает onClose напрямую", async () => {
      const onClose = vi.fn();
      renderModal({ mode: "create", onClose });
      await userEvent.click(screen.getByText("Закрыть").closest("button")!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Закрыть при dirty state открывает диалог подтверждения", async () => {
      renderModal({ mode: "duplicate", templatePrice: makePrice() });
      await userEvent.click(screen.getByText("Закрыть").closest("button")!);
      expect(screen.getByText("Закрыть без сохранения?")).toBeInTheDocument();
    });
  });

  describe("Submit", () => {
    it("update mode: вызывает onUpdate с id и новыми данными", async () => {
      const onUpdate = vi.fn().mockResolvedValue(true);
      const price = makePrice();
      renderModal({
        mode: "update",
        selectedPrice: price,
        priceDetail: price,
        onUpdate,
      });
      const input = screen.getByPlaceholderText("Название услуги");
      await userEvent.clear(input);
      await userEvent.type(input, "Обновлённая услуга");
      await userEvent.click(screen.getByText("Сохранить").closest("button")!);
      expect(onUpdate).toHaveBeenCalledWith(
        priceId,
        expect.objectContaining({ name: "Обновлённая услуга" }),
      );
    });

    it("duplicate mode: вызывает onCreate, не onUpdate", async () => {
      const onCreate = vi.fn().mockResolvedValue(true);
      const onUpdate = vi.fn();
      renderModal({
        mode: "duplicate",
        templatePrice: makePrice(),
        onCreate,
        onUpdate,
      });
      await userEvent.click(screen.getByText("Добавить").closest("button")!);
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Предзаполнение в duplicate mode", () => {
    it("берёт name из templatePrice", () => {
      const price = makePrice({ name: "Шаблонная услуга" });
      renderModal({
        mode: "duplicate",
        templatePrice: price,
        priceDetail: null,
      });
      expect(screen.getByDisplayValue("Шаблонная услуга")).toBeInTheDocument();
    });
  });

  describe("Управление таблицами", () => {
    it("клик на 'Добавить таблицу' (alert) создаёт вкладку 'Таблица 1'", async () => {
      renderModal({ mode: "create" });
      // Alert button has no icon — its role name is exactly "Добавить таблицу"
      await userEvent.click(
        screen.getByRole("button", { name: "Добавить таблицу" }),
      );
      expect(screen.getByText("Таблица 1")).toBeInTheDocument();
    });

    it("клик на '+ Колонка' показывает inline-панель, а не новый Modal", async () => {
      renderModal({ mode: "create" });
      await userEvent.click(
        screen.getByRole("button", { name: "Добавить таблицу" }),
      );
      await userEvent.click(screen.getByText("+ Колонка").closest("button")!);
      expect(screen.getByText("Ключ колонки")).toBeInTheDocument();
      // Inline-панель — не отдельный диалог, только один role=dialog (основной модал)
      const dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(1);
    });
  });

  describe("Scope guards", () => {
    it("update mode + нет PRICE_DELETE → кнопка 'Удалить услугу' не рендерится", () => {
      userContextState.scopes = [];
      const price = makePrice();
      renderModal({ mode: "update", selectedPrice: price, priceDetail: price });
      expect(screen.queryByText("Удалить услугу")).not.toBeInTheDocument();
    });

    it("update mode + есть PRICE_DELETE → кнопка 'Удалить услугу' рендерится", () => {
      userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
      const price = makePrice();
      renderModal({ mode: "update", selectedPrice: price, priceDetail: price });
      expect(screen.getByText("Удалить услугу")).toBeInTheDocument();
    });

    it("create mode + нет PRICE_CREATE → кнопка 'Добавить' не рендерится", () => {
      userContextState.scopes = [];
      renderModal({ mode: "create" });
      expect(screen.queryByText("Добавить")).not.toBeInTheDocument();
    });
  });
});
