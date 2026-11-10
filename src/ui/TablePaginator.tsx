import { Pagination } from "antd";
import type {
  FiltersBaseType,
  FiltersSetter,
} from "@/types/filters/filterBase";
import { PAGE_SIZES } from "@/lib/constants";

export type TablePaginatorProps<
  TFilters extends FiltersBaseType = FiltersBaseType,
> = {
  filters: TFilters;
  setFilters: FiltersSetter<TFilters>;
  total: number;
  pageSizeOptions?: readonly number[];
};

export const TablePaginator = <
  TFilters extends FiltersBaseType = FiltersBaseType,
>({
  filters,
  setFilters,
  total,
  pageSizeOptions = PAGE_SIZES,
}: TablePaginatorProps<TFilters>) => {
  const currentPage =
    Math.floor((filters.offset as number) / (filters.limit as number)) + 1;

  const handleShowSizeChange = (current: number, size: number) => {
    setFilters((prevState) => ({
      ...prevState,
      limit: size,
      offset: (current - 1) * size,
    }));
  };

  const handleChange = (current: number, size: number) => {
    setFilters((prevState) => ({
      ...prevState,
      limit: size,
      offset: (current - 1) * size,
    }));
  };

  return (
    <Pagination
      current={currentPage}
      total={total}
      showSizeChanger={true}
      pageSize={filters.limit as number}
      pageSizeOptions={[...pageSizeOptions]}
      onShowSizeChange={handleShowSizeChange}
      onChange={handleChange}
    />
  );
};
