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
    username: string;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    created_at: string;
    updated_at: string | null;
    scopes: UserScope[];
};
