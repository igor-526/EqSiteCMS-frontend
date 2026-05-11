import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { useUserContext } from "@/contexts/UserContext";
import { useCallback } from "react";

export enum NEWS_PAGE_SCOPES_ACTIONS {
    SEE_ADMIN_INSTRUCTIONS = "SEE_ADMIN_INSTRUCTIONS",
    SEE_DEVELOPER_DOCS = "SEE_DEVELOPER_DOCS",
}

export const newsPageScopesRegistry: Record<NEWS_PAGE_SCOPES_ACTIONS, KNOWN_USER_SCOPES[]> = {
    [NEWS_PAGE_SCOPES_ACTIONS.SEE_ADMIN_INSTRUCTIONS]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.ADMIN,
    ],
    [NEWS_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_DOCS]: [
        KNOWN_USER_SCOPES.SUPERUSER,
        KNOWN_USER_SCOPES.DEVELOPER,
    ],
};

export const useNewsPageActionScopes = () => {
    const { scopes } = useUserContext();

    const hasPermission = useCallback(
        (action: NEWS_PAGE_SCOPES_ACTIONS) => {
            return newsPageScopesRegistry[action].some((scope) => scopes.includes(scope));
        },
        [scopes],
    );

    return { hasPermission };
};
