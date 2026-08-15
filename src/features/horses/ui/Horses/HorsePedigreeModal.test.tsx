import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { HorseOutDto, HorseWithPedigreeOutDto } from "@/types/api/horses";
import type { UUID } from "crypto";
import { HorsePedigreeModal } from "./HorsePedigreeModal";

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

const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix}` as UUID;

const makeHorse = (overrides: Partial<HorseOutDto> = {}): HorseOutDto => ({
  id: uuid("000000000001"),
  slug: "atlas",
  name: "Atlas",
  code: null,
  description: null,
  breed: {
    id: uuid("000000000101"),
    name: "Thoroughbred",
    short_name: "TB",
    slug: "tb",
  },
  coat_color: {
    id: uuid("000000000102"),
    name: "Гнедая",
    short_name: "Гн.",
    slug: "bay",
  },
  height: null,
  sex: "male",
  bdate: "2018-05-20",
  ddate: null,
  bdate_mode: "ymd",
  ddate_mode: "hide",
  bdate_formatted: "20.05.2018",
  ddate_formatted: null,
  age: 8,
  horse_owner: null,
  photos: [],
  this_stable: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  ...overrides,
});

const makePedigreeHorse = (
  overrides: Partial<HorseWithPedigreeOutDto> = {},
): HorseWithPedigreeOutDto => ({
  ...makeHorse(),
  pedigree: {
    sire: makeHorse({
      id: uuid("000000000002"),
      name: "Thunder",
      sex: "male",
      bdate_formatted: null,
      bdate: "2010-01-01",
      bdate_mode: "y",
    }),
    dam: makeHorse({
      id: uuid("000000000003"),
      name: "Stella",
      sex: "female",
    }),
    foals: [
      makeHorse({
        id: uuid("000000000004"),
        name: "Foal Star",
        sex: "female",
        bdate_formatted: "2022",
      }),
    ],
  },
  ...overrides,
});

describe("HorsePedigreeModal", () => {
  beforeEach(() => {
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
  });

  it("renders full pedigree layout without global save button", () => {
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/Родословная — Atlas \(♂\)/)).toBeInTheDocument();
    expect(screen.getByText("Родители")).toBeInTheDocument();
    expect(screen.getByText("Отец")).toBeInTheDocument();
    expect(screen.getByText("Выбранная")).toBeInTheDocument();
    expect(screen.getByText("Мать")).toBeInTheDocument();
    expect(screen.getByText("Потомство")).toBeInTheDocument();
    expect(screen.getByText("Thunder ♂")).toBeInTheDocument();
    expect(screen.getByText("Stella ♀")).toBeInTheDocument();
    expect(screen.getByText("Foal Star ♀")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Сохранить" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("pedigree-connection-line")).toHaveLength(2);
  });

  it("renders geld marker in parentheses in modal title", () => {
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse({ sex: "geld", name: "Merin" })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/Родословная — Merin \(♂м\)/)).toBeInTheDocument();
  });

  it("renders missing parent slots and empty foals state", () => {
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse({
          pedigree: { sire: null, dam: null, foals: [] },
        })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Не указан")).toBeInTheDocument();
    expect(screen.getByText("Не указана")).toBeInTheDocument();
    expect(screen.getByText("Потомство отсутствует")).toBeInTheDocument();
    expect(
      screen.getByText("У этой лошади пока нет зарегистрированных потомков."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ Добавить потомка/i }),
    ).toBeInTheDocument();
  });

  it("hides remove and go actions for missing parent slot", async () => {
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse({
          pedigree: { sire: null, dam: null, foals: [] },
        })}
        onClose={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "Действия" })[0],
    );
    expect(await screen.findByText("Заменить связь")).toBeInTheDocument();
    expect(screen.queryByText("Удалить связь")).not.toBeInTheDocument();
    expect(screen.queryByText("Перейти")).not.toBeInTheDocument();
    expect(screen.queryByText("Редактировать")).not.toBeInTheDocument();
  });

  it("disables mutation actions when scope is missing", async () => {
    userContextState.scopes = [];
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/доступна только для просмотра/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ Добавить потомка/i }),
    ).toBeDisabled();
    await userEvent.click(
      screen.getAllByRole("button", { name: "Действия" })[0],
    );
    await waitFor(() =>
      expect(screen.getByText("Удалить связь").closest("li")).toHaveClass(
        "ant-dropdown-menu-item-disabled",
      ),
    );
    expect(screen.getByText("Заменить связь").closest("li")).toHaveClass(
      "ant-dropdown-menu-item-disabled",
    );
  });

  it("calls onClose when footer close button is clicked", async () => {
    const onClose = vi.fn();
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse()}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /закрыть/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls edit handler from filled relation edit menu", async () => {
    const onEditHorse = vi.fn();
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse()}
        onClose={vi.fn()}
        onEditHorse={onEditHorse}
      />,
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "Действия" })[0],
    );
    await userEvent.click(await screen.findByText("Редактировать"));

    expect(onEditHorse).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Thunder", slug: "atlas" }),
    );
  });

  it("calls pedigree handler from filled relation go menu", async () => {
    const onOpenHorsePedigree = vi.fn();
    renderWithCmsProviders(
      <HorsePedigreeModal
        open={true}
        selectedHorse={makePedigreeHorse()}
        onClose={vi.fn()}
        onOpenHorsePedigree={onOpenHorsePedigree}
      />,
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "Действия" })[0],
    );
    await userEvent.click(await screen.findByText("Перейти"));

    expect(onOpenHorsePedigree).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Thunder", slug: "atlas" }),
    );
  });
});
