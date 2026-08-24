import { useCallback } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { KNOWN_USER_SCOPES } from "@/types/api/user";

export enum GALLERY_ACTIONS {
  UPLOAD = "upload",
  REMOVE = "remove",
}

export const galleryScopesRegistry: Record<
  GALLERY_ACTIONS,
  KNOWN_USER_SCOPES[]
> = {
  [GALLERY_ACTIONS.UPLOAD]: [
    KNOWN_USER_SCOPES.SUPERUSER,
    KNOWN_USER_SCOPES.ADMIN,
    KNOWN_USER_SCOPES.DEVELOPER,
  ],
  [GALLERY_ACTIONS.REMOVE]: [
    KNOWN_USER_SCOPES.SUPERUSER,
    KNOWN_USER_SCOPES.ADMIN,
    KNOWN_USER_SCOPES.DEVELOPER,
  ],
};

export function useGalleryScopes() {
  const { scopes } = useUserContext();
  const hasPermission = useCallback(
    (action: GALLERY_ACTIONS) =>
      galleryScopesRegistry[action].some((scope) => scopes.includes(scope)),
    [scopes],
  );

  return { hasPermission };
}
