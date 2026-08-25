import type { ApiPaginationType, ApiCreatedUpdatedAtType } from "./api";

export type CallbackRequestStatusOutDto = { id: number; name: string; color: string };

export type CallbackRequestOutDto = ApiCreatedUpdatedAtType & {
  id: string;
  name: string | null;
  phone: string;
  comment: string | null;
  status: number;
  is_spam: boolean;
  notifications_delivered: boolean;
};

export type CallbackRequestsQuery = ApiPaginationType & {
  created_at_from?: string;
  created_at_to?: string;
  status?: number[];
  is_spam?: boolean[];
  name?: string;
  phone?: string;
  comment?: string;
  sort_by?: "created_at" | "status";
  direction?: "asc" | "desc";
};

export type CallbackRequestStatusUpdateInDto = { status: number };
export type CallbackRequestSpamUpdateInDto = { is_spam: boolean };
