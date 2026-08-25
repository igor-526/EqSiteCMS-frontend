import { describe, expect, it } from "vitest";
import { DEFAULT_CALLBACK_QUERY, isAllowedPhoneRegex, mergeCallbackQuery, normalizeCallbackQuery } from "./useCallbackRequests";

describe("callback request query", () => {
  it("defines initial pagination, default spam and stable sort", () => {
    expect(DEFAULT_CALLBACK_QUERY).toEqual({ limit: 25, offset: 0, is_spam: [false], sort_by: "status", direction: "asc" });
  });
  it("trims searches and clears empty filters", () => {
    expect(normalizeCallbackQuery({ limit: 10, offset: 25, name: "  Анна ", phone: "", status: [] })).toEqual({ limit: 10, offset: 25, name: "Анна" });
  });
  it("allows phone regex syntax and digits but rejects letters", () => {
    expect(isAllowedPhoneRegex("^\\+7[0-9 ()-]+$")).toBe(true);
    expect(isAllowedPhoneRegex("phone7")).toBe(false);
    expect(isAllowedPhoneRegex("телефон")).toBe(false);
  });
  it("resets offset for filter/search/sort and page-size changes", () => {
    const page = { ...DEFAULT_CALLBACK_QUERY, offset: 75 };
    expect(mergeCallbackQuery(page, { name: "Анна" }).offset).toBe(0);
    expect(mergeCallbackQuery(page, { sort_by: "created_at", direction: "desc" }).offset).toBe(0);
    expect(mergeCallbackQuery(page, { limit: 50 }).offset).toBe(0);
  });
  it("keeps explicitly calculated offset on page changes", () => {
    expect(mergeCallbackQuery(DEFAULT_CALLBACK_QUERY, { offset: 50 }, false).offset).toBe(50);
  });
});
