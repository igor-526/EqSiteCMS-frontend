import {type ReactNode} from "react";
import { Dayjs } from 'dayjs';
import type {FiltersBaseType, FiltersSetter} from "./filterBase";

export type FilterDateRangePropsType<TFilters extends FiltersBaseType = FiltersBaseType> = {
    setFilters: FiltersSetter<TFilters>,
    dateRange: DateRangeType | null,
    setDateRange: (dr: DateRangeType | null) => void,
    filterKeyFrom: string,
    filterKeyTo: string,
}

export type GetFilterDateRangeElementType = <TFilters extends FiltersBaseType = FiltersBaseType>(
    props: FilterDateRangePropsType<TFilters>
) => ReactNode

export type DateRangeType = {
    0: Dayjs | null,
    1: Dayjs | null,
}