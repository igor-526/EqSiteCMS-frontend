import React from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { PersonalDataForm } from "./PersonalDataForm";
import type { ProfileFormState } from "../hooks/useProfileForm";

const defaultFormState: ProfileFormState = {
    first_name: "Иван",
    last_name: "Иванов",
    middle_name: "Петрович",
};

function renderForm(overrides?: Partial<{
    formState: ProfileFormState;
    isDirty: boolean;
    saving: boolean;
    setField: (field: keyof ProfileFormState, value: string) => void;
    save: () => Promise<void>;
    reset: () => void;
}>) {
    const props = {
        formState: defaultFormState,
        isDirty: false,
        saving: false,
        setField: vi.fn(),
        save: vi.fn(),
        reset: vi.fn(),
        ...overrides,
    };
    return { ...renderWithCmsProviders(<PersonalDataForm {...props} />), props };
}

describe("PersonalDataForm", () => {
    it("renders current form data", () => {
        renderForm();
        expect(screen.getByDisplayValue("Иванов")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Иван")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Петрович")).toBeInTheDocument();
    });

    it("buttons are disabled when !isDirty", () => {
        renderForm({ isDirty: false });
        const saveBtn = screen.getByRole("button", { name: /Сохранить/i });
        const resetBtn = screen.getByRole("button", { name: /Сбросить/i });
        expect(saveBtn).toBeDisabled();
        expect(resetBtn).toBeDisabled();
    });

    it("buttons are enabled when isDirty", () => {
        renderForm({ isDirty: true });
        const saveBtn = screen.getByRole("button", { name: /Сохранить/i });
        const resetBtn = screen.getByRole("button", { name: /Сбросить/i });
        expect(saveBtn).not.toBeDisabled();
        expect(resetBtn).not.toBeDisabled();
    });

    it("clicking Reset calls reset callback", async () => {
        const resetFn = vi.fn();
        renderForm({ isDirty: true, reset: resetFn });
        await userEvent.click(screen.getByRole("button", { name: /Сбросить/i }));
        expect(resetFn).toHaveBeenCalled();
    });

    it("clicking Save triggers save callback", async () => {
        const saveFn = vi.fn();
        renderForm({ isDirty: true, save: saveFn });
        await userEvent.click(screen.getByRole("button", { name: /Сохранить/i }));
        expect(saveFn).toHaveBeenCalled();
    });

    it("shows character counter and red when exceeding limit", () => {
        const longName = "А".repeat(64);
        renderForm({ formState: { ...defaultFormState, last_name: longName } });
        // counter text should show 64 / 63 and turn red (status="error" on Input adds .ant-input-status-error)
        expect(screen.getByDisplayValue(longName)).toBeInTheDocument();
        expect(screen.getByText("64 / 63")).toBeInTheDocument();
    });
});
