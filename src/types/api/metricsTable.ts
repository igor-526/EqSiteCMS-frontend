export type MetricsMode = "day" | "week" | "month" | "year";
export type PageMetric = "visits" | "users" | "pageviews" | "bounces" | "bounce_rate"
  | "page_depth" | "avg_visit_duration_seconds" | "visit_duration_seconds";

export type MetricsPeriodOutDto = {
  mode: MetricsMode;
  date_from: string;
  date_to: string;
  requested_date_from: string | null;
  requested_date_to: string | null;
  defaulted: boolean;
  adjusted: boolean;
  clamped: boolean;
  today: string;
};
export type MetricsCellOutDto = { text: string; value: number | null; hint?: string | null };
export type MetricsColumnOutDto = {
  key: string;
  title: string;
  hint: string | null;
  sortable: boolean;
  value_type: string;
  align: "left" | "right";
  empty_text: string;
  values: Record<string, MetricsCellOutDto>;
};
export type MetricsTableOutDto = {
  version: number;
  row_key: string;
  period: MetricsPeriodOutDto;
  metric: { key: PageMetric; title: string; value_type: string };
  ordering: string | null;
  columns: MetricsColumnOutDto[];
};
