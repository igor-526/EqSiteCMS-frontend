import React from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { ChangePasswordForm } from "./ChangePasswordForm";
import type { PasswordFormState } from "../hooks/usePasswordForm";

const emptyFormState: PasswordFormState = {
  current_password: "",
  new_password: "",
  confirm_new_password: "",
};

function renderPasswordForm(
  overrides?: Partial<{
    formState: PasswordFormState;
    passwordStrength: number;
    strengthLabel: string;
    strengthColor: string;
    saving: boolean;
    setField: (field: keyof PasswordFormState, value: string) => void;
    changePassword: () => Promise<void>;
    clear: () => void;
  }>,
) {
  const props = {
    formState: emptyFormState,
    passwordStrength: 0,
    strengthLabel: "",
    strengthColor: "",
    saving: false,
    setField: vi.fn(),
    changePassword: vi.fn(),
    clear: vi.fn(),
    ...overrides,
  };
  return {
    ...renderWithCmsProviders(<ChangePasswordForm {...props} />),
    props,
  };
}

describe("ChangePasswordForm", () => {
  it("renders empty form with all three fields", () => {
    renderPasswordForm();
    expect(screen.getByLabelText("Текущий пароль")).toBeInTheDocument();
    expect(screen.getByLabelText("Новый пароль")).toBeInTheDocument();
    expect(screen.getByLabelText("Повторите новый пароль")).toBeInTheDocument();
  });

  it("renders strength bars (4 bars visible)", () => {
    renderPasswordForm();
    // 4 strength bars rendered by aria-label pattern
    const bars = screen.getAllByLabelText(/strength-bar-/);
    expect(bars).toHaveLength(4);
  });

  it("shows strength label when passwordStrength > 0", () => {
    renderPasswordForm({
      passwordStrength: 2,
      strengthLabel: "Средний",
      strengthColor: "orange",
    });
    expect(screen.getByText("Средний")).toBeInTheDocument();
  });

  it("clicking Clear calls clear callback", async () => {
    const clearFn = vi.fn();
    renderPasswordForm({ clear: clearFn });
    await userEvent.click(screen.getByRole("button", { name: /Очистить/i }));
    expect(clearFn).toHaveBeenCalled();
  });

  it("clicking Change Password calls changePassword callback", async () => {
    const changePasswordFn = vi.fn();
    renderPasswordForm({ changePassword: changePasswordFn });
    await userEvent.click(
      screen.getByRole("button", { name: /Сменить пароль/i }),
    );
    expect(changePasswordFn).toHaveBeenCalled();
  });
});
