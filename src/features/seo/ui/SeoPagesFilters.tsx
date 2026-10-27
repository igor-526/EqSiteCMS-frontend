"use client";

import { useId } from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import ruRU from "antd/locale/ru_RU";
import type { SeoMetricsFilterControls } from "@/types/seoMetricsControls";
import { pageMetricsModes, pageMetricsOptions } from "../services/pageMetricsOptions";
import { useSeoStyles } from "./seoStyles";

const DAY = "day";
const MONTH = "month";
const YEAR = "year";
const WEEK = "week";
const DAYS_IN_WEEK = 7;
const LAST_WEEK_DAY = 6;
const formatWeek = (date: dayjs.Dayjs, today: dayjs.Dayjs) => {
  const monday = date.subtract((date.day() + LAST_WEEK_DAY) % DAYS_IN_WEEK, "day");
  const sunday = monday.add(LAST_WEEK_DAY, "day");
  const end = sunday.isAfter(today, "day") ? today : sunday;
  return `${monday.format("DD.MM.YYYY")} – ${end.format("DD.MM.YYYY")}`;
};

type Props = { table: SeoMetricsFilterControls; ariaLabel?: string };

export function SeoPagesFilters({ table, ariaLabel = "Фильтры метрик страниц" }: Props) {
  const rangeId = useId();
  const { styles } = useSeoStyles();
  const { mode, metric, dateFrom, dateTo } = table.filters;
  const handleDates: NonNullable<React.ComponentProps<typeof DatePicker.RangePicker>["onChange"]> = dates => {
    if (dates?.[0] && dates[1]) table.changeDates([dates[0], dates[1]]);
  };
  const picker = mode === DAY ? "date" : mode;
  const today = dayjs(table.metricsTable?.period.today);
  const format = mode === WEEK ? (date: dayjs.Dayjs) => formatWeek(date, today) : mode === MONTH ? "MMM YYYY" : mode === YEAR ? "YYYY" : "DD.MM.YYYY";
  return (
    <div className={styles.metricsFilters} role="group" aria-label={ariaLabel}>
      <label>Режим<Select aria-label="Режим" value={mode} options={pageMetricsModes} onChange={table.changeMode} allowClear={false} className={styles.modeSelect} /></label>
      <label>Показатель<Select aria-label="Показатель" value={metric} options={pageMetricsOptions} onChange={table.changeMetric} allowClear={false} className={styles.metricSelect} /></label>
      <div className={styles.dateRange}><label htmlFor={`${rangeId}-start`}>Диапазон дат</label><label htmlFor={`${rangeId}-end`} className={styles.srOnly}>Конец диапазона дат</label><DatePicker.RangePicker id={{ start: `${rangeId}-start`, end: `${rangeId}-end` }} locale={ruRU.DatePicker} picker={picker} format={format} allowClear={false}
        value={dateFrom && dateTo ? [dayjs(dateFrom).locale("ru"), dayjs(dateTo).locale("ru")] : null} disabledDate={table.disabledDate} onChange={handleDates} /></div>
    </div>
  );
}
