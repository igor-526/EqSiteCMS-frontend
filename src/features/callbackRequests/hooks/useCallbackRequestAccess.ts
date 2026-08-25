import { useUserContext } from "@/contexts/UserContext";
import { KNOWN_USER_SCOPES } from "@/types/api/user";

export const hasCallbackRequestAccess = (scopes: KNOWN_USER_SCOPES[]) =>
  scopes.includes(KNOWN_USER_SCOPES.ADMIN) || scopes.includes(KNOWN_USER_SCOPES.SUPERUSER);

export const useCallbackRequestAccess = () => {
  const { scopes } = useUserContext();
  return { canRead: hasCallbackRequestAccess(scopes), canMutate: hasCallbackRequestAccess(scopes) };
};
