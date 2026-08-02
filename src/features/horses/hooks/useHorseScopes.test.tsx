import React from "react";
import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import {
    HORSES_PAGE_SCOPES_ACTIONS,
    useHorsePageActionScopes,
} from "./useHorseScopes";

const userContextState = vi.hoisted(() => ({
    scopes: [] as KNOWN_USER_SCOPES[],
    user: null as null | { username: string },
    loading: false,
}));

vi.mock("@/contexts/UserContext", () => ({
    useUserContext: () => ({
        user: userContextState.user,
        loading: userContextState.loading,
        error: null,
        scopes: userContextState.scopes,
        refreshUser: vi.fn(),
        clearUser: vi.fn(),
    }),
}));

const HorseCreateButton = () => {
    const { hasPermission } = useHorsePageActionScopes();
    return hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE) ? (
        <button type="button">Добавить лошадь</button>
    ) : (
        <button type="button" disabled>
            Добавить лошадь
        </button>
    );
};

describe("useHorsePageActionScopes", () => {
    beforeEach(() => {
        userContextState.scopes = [];
        userContextState.user = null;
        userContextState.loading = false;
    });

    it("reports anonymous users as missing CREATE_HORSE scope", () => {
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE)).toBe(false);
    });

    it("allows CREATE_HORSE when ADMIN scope is present", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE)).toBe(true);
    });

    it("allows CREATE_HORSE when DEVELOPER scope is present", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.DEVELOPER];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE)).toBe(true);
    });

    it("allows CREATE_HORSE when SUPERUSER scope is present", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.SUPERUSER];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE)).toBe(true);
    });

    it("allows UPDATE_HORSE_PEDIGREE with the same admin scopes as UPDATE_HORSE", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE)).toBe(true);
        expect(
            result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_PEDIGREE),
        ).toBe(true);
    });

    it("blocks UPDATE_HORSE_PEDIGREE when user has no scope", () => {
        userContextState.scopes = [];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(
            result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_PEDIGREE),
        ).toBe(false);
    });

    it("blocks DELETE_HORSE when user has no scope", () => {
        userContextState.scopes = [];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.DELETE_HORSE)).toBe(false);
    });

    it("allows DELETE_HORSE for ADMIN", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.DELETE_HORSE)).toBe(true);
    });

    it("SEE_DEVELOPER_DOCS is denied for ADMIN-only users", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(
            result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_DOCS),
        ).toBe(false);
    });

    it("SEE_DEVELOPER_DOCS is allowed for DEVELOPER", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.DEVELOPER];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(
            result.current.hasPermission(HORSES_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_DOCS),
        ).toBe(true);
    });

    it("renders create button as enabled when scope is present", () => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        render(<HorseCreateButton />);
        expect(screen.getByRole("button", { name: "Добавить лошадь" })).toBeEnabled();
    });

    it("renders create button as disabled when scope is missing", () => {
        userContextState.scopes = [];
        render(<HorseCreateButton />);
        expect(screen.getByRole("button", { name: "Добавить лошадь" })).toBeDisabled();
    });

    it.each([
        HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE_DICTIONARY,
        HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_DICTIONARY,
        HORSES_PAGE_SCOPES_ACTIONS.DELETE_HORSE_DICTIONARY,
    ])("allows dictionary action %s for ADMIN", (action) => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(action)).toBe(true);
    });

    it.each([
        HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE_DICTIONARY,
        HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_DICTIONARY,
        HORSES_PAGE_SCOPES_ACTIONS.DELETE_HORSE_DICTIONARY,
    ])("denies dictionary action %s without scope", (action) => {
        userContextState.scopes = [];
        const { result } = renderHook(() => useHorsePageActionScopes());
        expect(result.current.hasPermission(action)).toBe(false);
    });
});
