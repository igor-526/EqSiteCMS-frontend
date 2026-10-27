import dayjs, { type Dayjs } from "dayjs";
import type { MetricsMode, PageMetric } from "@/types/api/metricsTable";

export const pageMetricsModes: { value: MetricsMode; label: string }[] = [
  { value: "day", label: "по дням" }, { value: "week", label: "по неделям" },
  { value: "month", label: "по месяцам" }, { value: "year", label: "по годам" },
];
export const pageMetricsOptions: { value: PageMetric; label: string }[] = [
  { value: "visits", label: "Визиты" }, { value: "users", label: "Посетители" },
  { value: "pageviews", label: "Просмотры" }, { value: "bounces", label: "Отказы" },
  { value: "bounce_rate", label: "Доля отказов" }, { value: "page_depth", label: "Глубина просмотра" },
  { value: "avg_visit_duration_seconds", label: "Время на сайте" },
  { value: "visit_duration_seconds", label: "Суммарное время визитов" },
];
export const pageMetricsLimits: Record<MetricsMode, string> = {
  day: "31 день", week: "16 недель", month: "12 месяцев", year: "5 лет",
};

const WEEK_MODE = "week";
const DAYS_IN_WEEK = 7;
const LAST_WEEK_DAY = 6;

// Monday-based weeks are independent of the browser/Dayjs locale.
const unitStart = (date: Dayjs, mode: MetricsMode) => mode === WEEK_MODE
  ? date.startOf("day").subtract((date.day() + LAST_WEEK_DAY) % DAYS_IN_WEEK, "day") : date.startOf(mode);

export function isPageMetricsDateDisabled(date: Dayjs, mode: MetricsMode, today = dayjs().format("YYYY-MM-DD")) {
  return unitStart(date, mode).isAfter(dayjs(today), "day");
}

export function pageMetricsPickerDates(range: readonly [Dayjs, Dayjs] | null, mode: MetricsMode, today = dayjs().format("YYYY-MM-DD")) {
  if (!range || range.some(date => !date.isValid() || isPageMetricsDateDisabled(date, mode, today))) return;
  const start = unitStart(range[0], mode);
  const end = mode === WEEK_MODE ? unitStart(range[1], mode).add(LAST_WEEK_DAY, "day") : range[1].endOf(mode);
  if (start.isAfter(end, "day")) return;
  return { dateFrom: start.format("YYYY-MM-DD"), dateTo: (end.isAfter(dayjs(today), "day") ? dayjs(today) : end).format("YYYY-MM-DD") };
}
