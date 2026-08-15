import { getMyProfile, updateProfile, changePassword } from "@/api/user";
import type {
  ChangePasswordInDto,
  UpdateProfileInDto,
  UserProfile,
} from "@/types/api/user";
import type { ApiResult } from "@/types/api/api";

export const fetchMyProfile = async (): Promise<ApiResult<UserProfile>> => {
  return await getMyProfile();
};

export const saveProfile = async (
  data: UpdateProfileInDto,
): Promise<ApiResult<UserProfile>> => {
  return await updateProfile(data);
};

export const saveNewPassword = async (
  data: ChangePasswordInDto,
): Promise<ApiResult<null>> => {
  return await changePassword(data);
};
