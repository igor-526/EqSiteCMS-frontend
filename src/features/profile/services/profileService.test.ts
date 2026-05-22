import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { fetchMyProfile, saveProfile, saveNewPassword } from "./profileService";
import type { UUID } from "crypto";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;

const userId = "00000000-0000-4000-8000-000000000010" as UUID;
const equestrianId = "00000000-0000-4000-8000-000000000011" as UUID;

const mockProfile = {
    id: userId,
    equestrian_id: equestrianId,
    username: "cms-admin",
    first_name: "Иван",
    last_name: "Иванов",
    middle_name: null,
    equestrian_name: "Конюшня Звезда",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: null,
    scopes: [],
};

describe("profileService", () => {
    it("fetchMyProfile returns UserProfile on success", async () => {
        server.use(
            http.get(apiUrl("/users/me"), () => HttpResponse.json(mockProfile)),
        );
        const result = await fetchMyProfile();
        expect(result.status).toBe("ok");
        if (result.status === "ok") {
            expect(result.data?.equestrian_name).toBe("Конюшня Звезда");
            expect(result.data?.username).toBe("cms-admin");
        }
    });

    it("saveProfile returns updated UserProfile on success", async () => {
        const payload = { first_name: "Алексей", last_name: "Иванов", middle_name: null };
        const updated = { ...mockProfile, first_name: "Алексей" };
        server.use(
            http.patch(apiUrl("/users/me"), () => HttpResponse.json(updated)),
        );
        const result = await saveProfile(payload);
        expect(result.status).toBe("ok");
        if (result.status === "ok") {
            expect(result.data?.first_name).toBe("Алексей");
        }
    });

    it("saveNewPassword returns null on 204", async () => {
        server.use(
            http.patch(apiUrl("/users/me/password"), () => new HttpResponse(null, { status: 204 })),
        );
        const result = await saveNewPassword({
            current_password: "OldPass1!",
            new_password: "NewPass123!",
            confirm_new_password: "NewPass123!",
        });
        expect(result.status).toBe("ok");
        if (result.status === "ok") {
            expect(result.data).toBeNull();
        }
    });
});
