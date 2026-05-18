import React from "react";
import { screen } from "@testing-library/react";
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

describe("HorseCreateUpdateModal", () => {
    beforeEach(() => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        userContextState.user = { username: "admin" };
    });

    it("renders 'Добавить лошадь' title when no horse selected", () => {
        renderModal(true, null);
        expect(screen.getByText("Добавить лошадь")).toBeInTheDocument();
    });

    it("renders 'Редактировать лошадь' title when horse is selected", () => {
        renderModal(true, selectedHorse);
        expect(screen.getByText("Редактировать лошадь")).toBeInTheDocument();
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
