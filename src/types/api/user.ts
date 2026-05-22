import { UUID } from "crypto";

export enum KNOWN_USER_SCOPES {
    SUPERUSER = "SUPERUSER",
    ADMIN = "ADMIN",
    DEVELOPER = "DEVELOPER",
}

export type UserScope = {
    id: UUID;
    scope_name: KNOWN_USER_SCOPES;
    scope_description: string | null;
    created_at: string;
    updated_at: string | null;
};

export type User = {
    id: UUID;
    equestrian_id: UUID;
    username: string;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    created_at: string;
    updated_at: string | null;
    scopes: UserScope[];
};

export type UserProfile = User & {
    equestrian_name: string | null;
};

export type UpdateProfileInDto = {
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
};

export type ChangePasswordInDto = {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
};
