import apiFetch from "./client";
import { ChangePasswordInDto, UpdateProfileInDto, User, UserProfile } from "@/types/api/user";
import { ApiResult } from "@/types/api/api";

export const getUserInfo = async (): Promise<ApiResult<User>> => {
    return await apiFetch<User>("/auth/me");
};

export const getMyProfile = async (): Promise<ApiResult<UserProfile>> => {
    return await apiFetch<UserProfile>("/users/me");
};

export const updateProfile = async (data: UpdateProfileInDto): Promise<ApiResult<UserProfile>> => {
    return await apiFetch<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const changePassword = async (data: ChangePasswordInDto): Promise<ApiResult<null>> => {
    return await apiFetch<null>("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};
