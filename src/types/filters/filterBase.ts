import type { Dispatch, SetStateAction } from "react";

export type FiltersBaseType = Record<string, unknown>;

export type FiltersSetter<TFilters extends FiltersBaseType = FiltersBaseType> =
    Dispatch<SetStateAction<TFilters>>;