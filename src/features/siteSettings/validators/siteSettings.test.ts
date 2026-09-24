import { describe, expect, it } from "vitest";
import {
  siteSettingCreateSchema,
  siteSettingUpdateSchema,
} from "./siteSettings";
import {
  SiteSettingType,
  type SiteSettingsCreateInDto,
  type SiteSettingsUpdateInDto,
  type SiteSettingOutDto,
} from "@/types/api/siteSettings";

const validCreatePayload = {
  key: "site.title",
  name: "Заголовок",
  type: SiteSettingType.string,
  value: "Иннолово",
};

describe("siteSettingCreateSchema", () => {
  it("accepts a valid payload without description", () => {
    const result = siteSettingCreateSchema.safeParse(validCreatePayload);
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("description");
  });

  it("strips an extraneous description field instead of failing validation", () => {
    const result = siteSettingCreateSchema.safeParse({
      ...validCreatePayload,
      description: "Легаси описание",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("description");
    expect(result.data).toEqual(validCreatePayload);
  });

  it("still reports validation errors for base fields (empty/edge input)", () => {
    const result = siteSettingCreateSchema.safeParse({
      ...validCreatePayload,
      key: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("siteSettingUpdateSchema", () => {
  it("accepts a partial payload without description", () => {
    const result = siteSettingUpdateSchema.safeParse({ name: "Новое имя" });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("description");
  });

  it("strips an extraneous description field on update as well", () => {
    const result = siteSettingUpdateSchema.safeParse({
      name: "Новое имя",
      description: "Легаси описание",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("description");
    expect(result.data).toEqual({ name: "Новое имя" });
  });
});

describe("SiteSetting DTO types (compile-time contract)", () => {
  it("do not accept a description property", () => {
    // @ts-expect-error description was removed from the create DTO
    const invalidCreate: SiteSettingsCreateInDto = { ...validCreatePayload, description: "x" };
    // @ts-expect-error description was removed from the update DTO
    const invalidUpdate: SiteSettingsUpdateInDto = { name: "n", description: "x" };
    const invalidOut: SiteSettingOutDto = {
      id: "00000000-0000-4000-8000-000000000301" as never,
      key: "site.title",
      name: "Заголовок",
      type: SiteSettingType.string,
      value: "Иннолово",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: null,
      // @ts-expect-error description was removed from the out DTO
      description: "x",
    };

    // Keep the compile-time-only assertions from being reported as unused.
    expect(invalidCreate).toBeDefined();
    expect(invalidUpdate).toBeDefined();
    expect(invalidOut).toBeDefined();
  });
});
