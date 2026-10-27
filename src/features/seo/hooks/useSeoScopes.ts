"use client";

import { useCallback } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { KNOWN_USER_SCOPES } from "@/types/api/user";

// Local action registry, not a new backend scope or role.
export enum SEO_ACTIONS {
  VIEW = "view",
  START_PARSE = "start_parse",
  GET_AUTH_LINK = "get_auth_link",
  EXCHANGE_AUTH_CODE = "exchange_auth_code",
  LIST_ACCOUNTS = "list_accounts",
  UNLINK_ACCOUNT = "unlink_account",
  LIST_COUNTERS = "list_counters",
  GET_CONNECTION = "get_connection",
  BIND_COUNTER = "bind_counter",
  UNLINK_COUNTER = "unlink_counter",
  LIST_PAGES = "list_pages",
  LIST_QUERIES = "list_queries",
  LIST_NORMALIZATION = "list_normalization",
  CREATE_NORMALIZATION = "create_normalization",
  DELETE_NORMALIZATION = "delete_normalization",
}

export const seoScopesRegistry: Record<SEO_ACTIONS, readonly KNOWN_USER_SCOPES[]> = {
  [SEO_ACTIONS.START_PARSE]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.VIEW]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.GET_AUTH_LINK]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.EXCHANGE_AUTH_CODE]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.LIST_ACCOUNTS]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.UNLINK_ACCOUNT]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.LIST_COUNTERS]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.GET_CONNECTION]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.BIND_COUNTER]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.UNLINK_COUNTER]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.LIST_PAGES]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.LIST_QUERIES]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.LIST_NORMALIZATION]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.CREATE_NORMALIZATION]: [KNOWN_USER_SCOPES.ADMIN],
  [SEO_ACTIONS.DELETE_NORMALIZATION]: [KNOWN_USER_SCOPES.ADMIN],
};

export const useSeoScopes = () => {
  const { scopes } = useUserContext();
  const hasPermission = useCallback(
    (action: SEO_ACTIONS) =>
      seoScopesRegistry[action].some((role) => scopes.includes(role)),
    [scopes],
  );
  return { hasPermission };
};
