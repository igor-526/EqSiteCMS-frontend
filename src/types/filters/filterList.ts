import type {ReactNode} from "react";
import type {FiltersBaseType, FiltersSetter} from "./filterBase";

export type FilterListDataType = {
    label: string,
    value: string | number,
    key: string
}

export type FilterListPropsType<TFilters extends FiltersBaseType = FiltersBaseType> = {
    filters: TFilters
    setFilters: FiltersSetter<TFilters>,
    filterKey: keyof TFilters & string,
    filterData: FilterListDataType[],
    placeHolder: string,
}

export type GetFilterListElementType = <TFilters extends FiltersBaseType = FiltersBaseType>(
    props: FilterListPropsType<TFilters>
) => ReactNode