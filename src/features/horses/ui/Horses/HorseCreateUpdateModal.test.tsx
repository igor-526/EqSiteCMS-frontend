import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorseCreateUpdateModal } from "./HorseCreateUpdateModal";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { UUID } from "crypto";
import type { HorseOutDto } from "@/types/api/horses";

const userContextState = vi.hoisted(() => ({
  scopes: [] as KNOWN_USER_SCOPES[],
  user: null as null | { username: string },
}));

vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({
    user: userContextState.user,
    loading: false,
    error: null,
    scopes: userContextState.scopes,
    refreshUser: vi.fn(),
    clearUser: vi.fn(),
  }),
}));

const selectedHorse: HorseOutDto = {
  id: "00000000-0000-4000-8000-000000000001" as UUID,
  slug: "bucefalus",
  name: "Буцефал",
  pedigree_name: "Родословная",
  description: "Конь Александра",
  breed: { id: "b1" as UUID, name: "Арабская", slug: "arab" },
  coat_color: { id: "c1" as UUID, name: "Гнедая", slug: "bay" },
  height: 160,
  sex: "male",
  bdate: null,
  ddate: null,
  bdate_mode: "hide",
  ddate_mode: "hide",
  bdate_formatted: null,
  ddate_formatted: null,
  age: null,
  horse_owner: { id: "o1" as UUID, name: "Иван Петров" },
  photos: [],
  this_stable: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
};

const breedOptions = [{ label: "Арабская", value: "b1" }];
const coatColorOptions = [{ label: "Гнедая", value: "c1" }];
const ownerOptions = [{ label: "Иван Петров", value: "o1" }];
const noop = vi.fn();

const renderModal = (
  open = true,
  horse: HorseOutDto | null = null,
  overrides: Partial<React.ComponentProps<typeof HorseCreateUpdateModal>> = {},
) => {
  return renderWithCmsProviders(
    <HorseCreateUpdateModal
      open={open}
      onClose={noop}
      selectedHorse={horse}
      onCreate={vi.fn().mockResolvedValue(true)}
      onUpdate={vi.fn().mockResolvedValue(true)}
      onDelete={vi.fn().mockResolvedValue(true)}
      validationErrors={{}}
      onResetValidation={noop}
      breedOptions={breedOptions}
      coatColorOptions={coatColorOptions}
      ownerOptions={ownerOptions}
      {...overrides}
    />,
  );
};

beforeEach(() => {
  userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
  userContextState.user = { username: "admin" };
});

describe("HorseCreateUpdateModal", () => {
  it("renders 'Добавить лошадь' title when no horse selected", () => {
    renderModal(true, null);
    expect(screen.getByText("Добавить лошадь")).toBeInTheDocument();
  });

  it("renders 'Редактировать лошадь' title when horse is selected", () => {
    renderModal(true, selectedHorse);
    expect(screen.getByText("Редактировать лошадь")).toBeInTheDocument();
  });

  it("initializes exact pedigree name for edit", () => {
    renderModal(true, selectedHorse);
    expect(screen.getByLabelText("Кличка в родословной")).toHaveValue(
      "Родословная",
    );
    expect(screen.getByLabelText("Кличка в родословной")).toHaveAttribute(
      "maxlength",
      "63",
    );
  });

  it("submits an exact pedigree name on create", async () => {
    const onCreate = vi.fn().mockResolvedValue(true);
    renderModal(true, null, { onCreate });
    await userEvent.type(screen.getByLabelText("Кличка *"), "Буран");
    await userEvent.type(
      screen.getByLabelText("Кличка в родословной"),
      " Родословная №Я ",
    );
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ pedigree_name: " Родословная №Я " }),
    );
  });

  it("shows an empty URL path on create and submits the typed slug", async () => {
    const onCreate = vi.fn().mockResolvedValue(true);
    renderModal(true, null, { onCreate });
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );
    expect(slugInput).toHaveValue("");
    expect(slugInput).toHaveAttribute("maxlength", "63");

    await userEvent.type(screen.getByLabelText("Кличка *"), "Буран");
    await userEvent.type(slugInput, "my-horse-url");
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "my-horse-url" }),
    );
  });

  it("prefills and submits a changed slug on edit", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );
    expect(slugInput).toHaveValue("bucefalus");

    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, "new-bucefalus");
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({ slug: "new-bucefalus" }),
    );
  });
});

describe("HorseCreateUpdateModal slug synchronization", () => {
  it("keeps the prefilled slug when name and slug are untouched", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });

    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({ name: "Буцефал", slug: "bucefalus" }),
    );
  });

  it("requests slug regeneration when the name changes first", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    const nameInput = screen.getByLabelText("Кличка *");
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Александр");
    expect(slugInput).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({ name: "Александр", slug: "" }),
    );
  });

  it("submits a manual slug entered after changing the name", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );

    await userEvent.clear(screen.getByLabelText("Кличка *"));
    await userEvent.type(screen.getByLabelText("Кличка *"), "Александр");
    await userEvent.type(slugInput, "alexander-manual");
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({
        name: "Александр",
        slug: "alexander-manual",
      }),
    );
  });

  it("preserves a manual slug when the name changes afterwards", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );

    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, "alexander-manual");
    await userEvent.clear(screen.getByLabelText("Кличка *"));
    await userEvent.type(screen.getByLabelText("Кличка *"), "Александр");
    expect(slugInput).toHaveValue("alexander-manual");
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({
        name: "Александр",
        slug: "alexander-manual",
      }),
    );
  });

  it("preserves an explicitly cleared slug when the name changes afterwards", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );

    await userEvent.clear(slugInput);
    await userEvent.clear(screen.getByLabelText("Кличка *"));
    await userEvent.type(screen.getByLabelText("Кличка *"), "Александр");
    expect(slugInput).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({ name: "Александр", slug: "" }),
    );
  });

  it("resets manual slug precedence after close and reopen", async () => {
    const { rerender } = renderModal(true, selectedHorse);
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );
    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, "session-manual");

    rerender(
      <HorseCreateUpdateModal
        open={false}
        onClose={noop}
        selectedHorse={selectedHorse}
        onCreate={vi.fn().mockResolvedValue(true)}
        onUpdate={vi.fn().mockResolvedValue(true)}
        onDelete={vi.fn().mockResolvedValue(true)}
        validationErrors={{}}
        onResetValidation={noop}
        breedOptions={breedOptions}
        coatColorOptions={coatColorOptions}
        ownerOptions={ownerOptions}
      />,
    );
    rerender(
      <HorseCreateUpdateModal
        open
        onClose={noop}
        selectedHorse={selectedHorse}
        onCreate={vi.fn().mockResolvedValue(true)}
        onUpdate={vi.fn().mockResolvedValue(true)}
        onDelete={vi.fn().mockResolvedValue(true)}
        validationErrors={{}}
        onResetValidation={noop}
        breedOptions={breedOptions}
        coatColorOptions={coatColorOptions}
        ownerOptions={ownerOptions}
      />,
    );

    expect(
      screen.getByLabelText("Путь URL (генерируется автоматически)"),
    ).toHaveValue("bucefalus");
    await userEvent.type(screen.getByLabelText("Кличка *"), " новый");
    expect(
      screen.getByLabelText("Путь URL (генерируется автоматически)"),
    ).toHaveValue("");
  });

  it("submits an empty slug to request backend regeneration", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    await userEvent.clear(
      screen.getByLabelText("Путь URL (генерируется автоматически)"),
    );
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({ slug: "" }),
    );
  });

  it("keeps slug state and shows its backend field error", () => {
    renderModal(true, selectedHorse, {
      validationErrors: { slug: ["Этот путь URL уже занят"] },
    });
    expect(
      screen.getByLabelText("Путь URL (генерируется автоматически)"),
    ).toHaveValue("bucefalus");
    expect(screen.getByText("Этот путь URL уже занят")).toBeInTheDocument();
  });

  it("keeps edited name and slug while showing a backend slug error", async () => {
    const props = {
      onUpdate: vi.fn().mockResolvedValue(false),
      validationErrors: {},
    };
    const { rerender } = renderModal(true, selectedHorse, props);
    const nameInput = screen.getByLabelText("Кличка *");
    const slugInput = screen.getByLabelText(
      "Путь URL (генерируется автоматически)",
    );
    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, "occupied-slug");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Новая кличка");
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    rerender(
      <HorseCreateUpdateModal
        open
        onClose={noop}
        selectedHorse={selectedHorse}
        onCreate={vi.fn().mockResolvedValue(true)}
        onUpdate={props.onUpdate}
        onDelete={vi.fn().mockResolvedValue(true)}
        validationErrors={{ slug: ["Этот путь URL уже занят"] }}
        onResetValidation={noop}
        breedOptions={breedOptions}
        coatColorOptions={coatColorOptions}
        ownerOptions={ownerOptions}
      />,
    );

    expect(nameInput).toHaveValue("Новая кличка");
    expect(slugInput).toHaveValue("occupied-slug");
    expect(screen.getByText("Этот путь URL уже занят")).toBeInTheDocument();
  });

  it("guards a name and slug update against double submit", async () => {
    let resolveMutation: ((value: boolean) => void) | undefined;
    const onUpdate = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveMutation = resolve;
        }),
    );
    renderModal(true, selectedHorse, { onUpdate });
    await userEvent.clear(screen.getByLabelText("Кличка *"));
    await userEvent.type(screen.getByLabelText("Кличка *"), "Александр");
    const submit = screen.getByRole("button", { name: /Изменить/ });
    await userEvent.dblClick(submit);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({ name: "Александр", slug: "" }),
    );
    expect(submit).toBeDisabled();
    resolveMutation?.(true);
    await waitFor(() => expect(submit).not.toBeDisabled());
  });
});

describe("HorseCreateUpdateModal existing behavior", () => {
  it("submits null when an existing pedigree name is cleared", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    await userEvent.clear(screen.getByLabelText("Кличка в родословной"));
    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));
    expect(onUpdate).toHaveBeenCalledWith(
      selectedHorse.id,
      expect.objectContaining({ pedigree_name: null }),
    );
  });

  it("omits an unchanged pedigree name from an update payload", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });

    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][1]).not.toHaveProperty("pedigree_name");
  });

  it("guards against double submit while a mutation is pending", async () => {
    let resolveMutation: ((value: boolean) => void) | undefined;
    const onCreate = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveMutation = resolve;
        }),
    );
    renderModal(true, null, { onCreate });
    await userEvent.type(screen.getByLabelText("Кличка *"), "Буран");
    await userEvent.type(
      screen.getByLabelText("Путь URL (генерируется автоматически)"),
      "buran",
    );
    const submit = screen.getByRole("button", { name: /Добавить/ });
    await userEvent.dblClick(submit);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();
    resolveMutation?.(true);
    await waitFor(() => expect(submit).not.toBeDisabled());
  });

  it("keeps pedigree name state and surfaces backend field validation", () => {
    renderModal(true, selectedHorse, {
      validationErrors: {
        pedigree_name: ["Некорректная кличка в родословной"],
      },
    });
    expect(screen.getByLabelText("Кличка в родословной")).toHaveValue(
      "Родословная",
    );
    expect(
      screen.getByText("Некорректная кличка в родословной"),
    ).toBeInTheDocument();
  });

  it("hides protected create and update actions without a write scope", () => {
    userContextState.scopes = [];
    const { rerender } = renderModal(true, null);
    expect(
      screen.queryByRole("button", { name: /Добавить/ }),
    ).not.toBeInTheDocument();
    rerender(<></>);

    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });
    expect(
      screen.queryByRole("button", { name: /Изменить/ }),
    ).not.toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // Design regression: section headers must NOT be h5-level titles (too dark)
  it("section headers are Text elements, not Title h5 (design regression)", () => {
    renderModal(true, selectedHorse);
    // h5 elements should NOT exist (Title level={5} renders as h5)
    const h5Elements = document.querySelectorAll("h5");
    expect(h5Elements.length).toBe(0);
    // Section labels should still render as text
    expect(screen.getByText("Основные данные")).toBeInTheDocument();
    expect(screen.getByText("Дополнительно")).toBeInTheDocument();
    expect(screen.getByText("Даты")).toBeInTheDocument();
    expect(screen.getByText("Владелец")).toBeInTheDocument();
  });

  // Bug 2 regression: loading prop is passed through to selects
  it("breed Select receives loading prop when breedOptionsLoading=true", () => {
    renderModal(true, selectedHorse, { breedOptionsLoading: true });
    // AntD Select renders a loading indicator when loading=true
    // The ant-select-loading class is added to the select element
    const loadingSelects = document.querySelectorAll(".ant-select-loading");
    expect(loadingSelects.length).toBeGreaterThan(0);
  });

  it("coat color Select receives loading prop when coatColorOptionsLoading=true", () => {
    renderModal(true, selectedHorse, { coatColorOptionsLoading: true });
    const loadingSelects = document.querySelectorAll(".ant-select-loading");
    expect(loadingSelects.length).toBeGreaterThan(0);
  });

  it("owner Select receives loading prop when ownerOptionsLoading=true", () => {
    renderModal(true, selectedHorse, { ownerOptionsLoading: true });
    const loadingSelects = document.querySelectorAll(".ant-select-loading");
    expect(loadingSelects.length).toBeGreaterThan(0);
  });

  it("does not render modal body when closed", () => {
    renderModal(false, null);
    expect(screen.queryByText("Основные данные")).not.toBeInTheDocument();
  });

  it("does not render horse type selector", () => {
    renderModal(true, selectedHorse);
    expect(screen.queryByText("Тип")).not.toBeInTheDocument();
  });

  it("submits create payload without kind", async () => {
    const onCreate = vi.fn().mockResolvedValue(true);
    renderModal(true, null, { onCreate });

    await userEvent.type(screen.getByLabelText("Кличка *"), "Буран");
    await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0][0]).toMatchObject({ name: "Буран" });
    expect(onCreate.mock.calls[0][0]).not.toHaveProperty("kind");
  });

  it("submits update payload without kind", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    renderModal(true, selectedHorse, { onUpdate });

    await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][1]).not.toHaveProperty("kind");
  });
});
