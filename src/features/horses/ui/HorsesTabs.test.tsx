import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { HorsesTabs, HorsesTabsKeys } from "./HorsesTabs";

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

describe("HorsesTabs", () => {
  const noop = vi.fn();

  beforeEach(() => {
    userContextState.scopes = [];
    userContextState.user = null;
  });

  it("renders Лошади as the first tab", () => {
    render(
      <HorsesTabs activeTab={HorsesTabsKeys.HORSES} setActiveTab={noop} />,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveTextContent("Лошади");
  });

  it("renders all base tabs for admin: Лошади, Породы, Масти, Владельцы, Услуги", () => {
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
    render(
      <HorsesTabs activeTab={HorsesTabsKeys.HORSES} setActiveTab={noop} />,
    );
    expect(screen.getByRole("tab", { name: "Лошади" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Породы" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Масти" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Владельцы" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Услуги" })).toBeInTheDocument();
  });

  it("hides Инструкция tab for users without SEE_USER_DOCS scope", () => {
    userContextState.scopes = []; // no scope
    render(
      <HorsesTabs activeTab={HorsesTabsKeys.HORSES} setActiveTab={noop} />,
    );
    expect(
      screen.queryByRole("tab", { name: "Инструкция" }),
    ).not.toBeInTheDocument();
  });

  it("shows Инструкция tab for ADMIN users", () => {
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
    render(
      <HorsesTabs activeTab={HorsesTabsKeys.HORSES} setActiveTab={noop} />,
    );
    expect(screen.getByRole("tab", { name: "Инструкция" })).toBeInTheDocument();
  });

  it("hides Документация tab for ADMIN-only users (developer-docs requires DEVELOPER or SUPERUSER)", () => {
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
    render(
      <HorsesTabs activeTab={HorsesTabsKeys.HORSES} setActiveTab={noop} />,
    );
    expect(
      screen.queryByRole("tab", { name: "Документация" }),
    ).not.toBeInTheDocument();
  });

  it("shows Документация tab for DEVELOPER users", () => {
    userContextState.scopes = [KNOWN_USER_SCOPES.DEVELOPER];
    render(
      <HorsesTabs activeTab={HorsesTabsKeys.HORSES} setActiveTab={noop} />,
    );
    expect(
      screen.getByRole("tab", { name: "Документация" }),
    ).toBeInTheDocument();
  });
});
