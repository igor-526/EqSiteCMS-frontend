import {Pagination} from "antd";
import type {FiltersBaseType, FiltersSetter} from "@/types/filters/filterBase";

export type TablePaginatorProps<TFilters extends FiltersBaseType = FiltersBaseType> = {
    filters: TFilters,
    setFilters: FiltersSetter<TFilters>,
    total: number
}

export const TablePaginator = <TFilters extends FiltersBaseType = FiltersBaseType>({
    filters,
    setFilters,
    total
}: TablePaginatorProps<TFilters>) => {
    const currentPage = Math.floor((filters.offset as number) / (filters.limit as number)) + 1;

    return (
        <Pagination
            current={currentPage}
            total={total}
            showSizeChanger={true}
            pageSize={filters.limit as number}
            pageSizeOptions={[10, 25, 50, 100]}
            onShowSizeChange={(current, size) => {
                setFilters((prevState) => ({
                    ...prevState,
                    limit: size,
                    offset: (current - 1) * size
                }))
            }}
            onChange = {(current, size) => {
                setFilters((prevState) => ({
                    ...prevState,
                    limit: size,
                    offset: (current - 1) * size
                }))
            }}
        />
    )
}