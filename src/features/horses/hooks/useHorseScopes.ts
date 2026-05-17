import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { useUserContext } from "@/contexts/UserContext";
import { useCallback } from "react";

export enum HORSES_PAGE_SCOPES_ACTIONS {
    CREATE_HORSE = "CREATE_HORSE",
    UPDATE_HORSE = "UPDATE_HORSE",
    UPDATE_HORSE_PEDIGREE = "UPDATE_HORSE_PEDIGREE",
    DELETE_HORSE = "DELETE_HORSE",
    SEE_USER_DOCS = "SEE_USER_DOCS",
    SEE_DEVELOPER_DOCS = "SEE_DEVELOPER_DOCS",
}

export const horsesPageScopesRegistry: Record<HORSES_PAGE_SCOPES_ACTIONS, KNOWN_USER_SCOPES[]> = {
    [HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.ADMIN,
        KNOWN_USER_SCOPES.DEVELOPER,
    ],
    [HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.ADMIN,
        KNOWN_USER_SCOPES.DEVELOPER,
    ],
    [HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_PEDIGREE]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.ADMIN,
        KNOWN_USER_SCOPES.DEVELOPER,
    ],
    [HORSES_PAGE_SCOPES_ACTIONS.DELETE_HORSE]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.ADMIN,
        KNOWN_USER_SCOPES.DEVELOPER,
    ],
    [HORSES_PAGE_SCOPES_ACTIONS.SEE_USER_DOCS]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.ADMIN,
    ],
    [HORSES_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_DOCS]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.DEVELOPER,
    ],
};

export const useHorsePageActionScopes = () => {
    const { scopes } = useUserContext();

    const hasPermission = useCallback(
        (action: HORSES_PAGE_SCOPES_ACTIONS) => {
            return horsesPageScopesRegistry[action].some((scope) => scopes.includes(scope));
        },
        [scopes],
    );

    return { hasPermission };
};
