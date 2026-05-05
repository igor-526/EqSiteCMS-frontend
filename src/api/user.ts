import apiFetch from "./client";
import { User } from "@/types/api/user";
import { ApiResult } from "@/types/api/api";

export const getUserInfo = async (): Promise<ApiResult<User>> => {
    return await apiFetch<User>("/auth/me");
};
