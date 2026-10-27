import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { isPageMetricsDateDisabled, pageMetricsLimits, pageMetricsModes, pageMetricsOptions, pageMetricsPickerDates } from "./pageMetricsOptions";


describe("FT-PM-02 picker options", () => {
  it("lists four required modes, eight metrics and all limits", () => {
    expect(pageMetricsModes).toHaveLength(4);
    expect(pageMetricsOptions).toHaveLength(8);
    expect(Object.values(pageMetricsLimits)).toEqual(["31 день", "16 недель", "12 месяцев", "5 лет"]);
  });
  it.each([
    ["day", "2026-10-05", "2026-10-28"],
    ["week", "2026-10-05", "2026-10-28"],
    ["month", "2026-10-01", "2026-10-28"],
    ["year", "2026-01-01", "2026-10-28"],
  ] as const)("expands %s units and caps today", (mode, dateFrom, dateTo) => {
    expect(pageMetricsPickerDates([dayjs("2026-10-05"), dayjs("2026-10-28")], mode, "2026-10-28")).toEqual({ dateFrom, dateTo });
  });
  it("uses Monday/Sunday even on Sunday, and calendar month/year ends", () => {
    expect(pageMetricsPickerDates([dayjs("2025-12-28"), dayjs("2026-01-01")], "week", "2026-10-28")).toEqual({ dateFrom: "2025-12-22", dateTo: "2026-01-04" });
    expect(pageMetricsPickerDates([dayjs("2024-02-12"), dayjs("2024-02-12")], "month", "2026-10-28")?.dateTo).toBe("2024-02-29");
    expect(pageMetricsPickerDates([dayjs("2024-02-12"), dayjs("2025-02-12")], "year", "2026-10-28")?.dateTo).toBe("2025-12-31");
  });
  it("rejects empty, invalid, reversed and entirely future units", () => {
    expect(pageMetricsPickerDates(null, "day")).toBeUndefined();
    expect(pageMetricsPickerDates([dayjs("bad"), dayjs()], "day")).toBeUndefined();
    expect(pageMetricsPickerDates([dayjs("2026-10-20"), dayjs("2026-10-01")], "day", "2026-10-28")).toBeUndefined();
    expect(pageMetricsPickerDates([dayjs("2026-11-01"), dayjs("2026-11-04")], "month", "2026-10-28")).toBeUndefined();
  });
  it("disables future days/whole units but allows the rest of a current unit", () => {
    expect(isPageMetricsDateDisabled(dayjs("2026-10-29"), "day", "2026-10-28")).toBe(true);
    expect(isPageMetricsDateDisabled(dayjs("2026-11-01"), "week", "2026-10-28")).toBe(false);
    expect(isPageMetricsDateDisabled(dayjs("2026-11-02"), "week", "2026-10-28")).toBe(true);
    expect(isPageMetricsDateDisabled(dayjs("2026-10-31"), "month", "2026-10-28")).toBe(false);
    expect(isPageMetricsDateDisabled(dayjs("2027-01-01"), "year", "2026-10-28")).toBe(true);
  });
});
