import React from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithCmsProviders } from "@/test/render";
import { ProfileHeader } from "./ProfileHeader";
import { KNOWN_USER_SCOPES, type UserProfile } from "@/types/api/user";
import type { UUID } from "crypto";

const userId = "00000000-0000-4000-8000-000000000010" as UUID;
const equestrianId = "00000000-0000-4000-8000-000000000011" as UUID;
const scopeId1 = "00000000-0000-4000-8000-000000000001" as UUID;
const scopeId2 = "00000000-0000-4000-8000-000000000002" as UUID;

const fullProfile: UserProfile = {
    id: userId,
    equestrian_id: equestrianId,
    username: "cms-admin",
    first_name: "Иван",
    last_name: "Иванов",
    middle_name: "Петрович",
    equestrian_name: "Конюшня Звезда",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: null,
    scopes: [
        {
            id: scopeId1,
            scope_name: KNOWN_USER_SCOPES.ADMIN,
            scope_description: null,
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: null,
        },
        {
            id: scopeId2,
            scope_name: KNOWN_USER_SCOPES.DEVELOPER,
            scope_description: null,
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: null,
        },
    ],
};

const noNameProfile: UserProfile = {
    ...fullProfile,
    first_name: null,
    last_name: null,
    middle_name: null,
};

const superuserProfile: UserProfile = {
    ...fullProfile,
    scopes: [
        {
            id: scopeId1,
            scope_name: KNOWN_USER_SCOPES.SUPERUSER,
            scope_description: null,
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: null,
        },
    ],
};

describe("ProfileHeader", () => {
    it("renders full data — ФИО, equestrian_name, username, date, scopes", () => {
        renderWithCmsProviders(<ProfileHeader profile={fullProfile} />);

        expect(screen.getByText("Иванов Иван Петрович")).toBeInTheDocument();
        expect(screen.getByText(/Конюшня Звезда/)).toBeInTheDocument();
        expect(screen.getByText(/@cms-admin/)).toBeInTheDocument();
        expect(screen.getByText(/Зарегистрирован 01\.05\.2026/)).toBeInTheDocument();
        // Avatar letter
        expect(screen.getByText("C")).toBeInTheDocument();
        // Scopes
        expect(screen.getByText("ADMIN")).toBeInTheDocument();
        expect(screen.getByText("DEVELOPER")).toBeInTheDocument();
    });

    it("renders username fallback when no ФИО", () => {
        renderWithCmsProviders(<ProfileHeader profile={noNameProfile} />);
        // username as display name
        expect(screen.getByText("cms-admin")).toBeInTheDocument();
    });

    it("SUPERUSER tag has red color, ADMIN purple, DEVELOPER blue", () => {
        renderWithCmsProviders(<ProfileHeader profile={fullProfile} />);
        const adminTag = screen.getByText("ADMIN").closest(".ant-tag");
        const developerTag = screen.getByText("DEVELOPER").closest(".ant-tag");
        expect(adminTag).toHaveClass("ant-tag-purple");
        expect(developerTag).toHaveClass("ant-tag-blue");

        // Test superuser tag
        renderWithCmsProviders(<ProfileHeader profile={superuserProfile} />);
        const superuserTag = screen.getAllByText("SUPERUSER")[0].closest(".ant-tag");
        expect(superuserTag).toHaveClass("ant-tag-red");
    });
});
