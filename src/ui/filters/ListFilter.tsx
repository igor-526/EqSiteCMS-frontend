import { Select } from "antd";
import type {FilterListPropsType} from "@/types/filters/filterList";
import type {FiltersBaseType} from "@/types/filters/filterBase";

export const ListFilter = <TFilters extends FiltersBaseType = FiltersBaseType>({
    filters,
    setFilters,
    filterKey,
    filterData,
    placeHolder="Выберите"
}: FilterListPropsType<TFilters>) => {
    // Нормализуем значение: преобразуем string в массив, null/undefined в undefined
    const normalizedValue = (() => {
        const val = filters[filterKey];
        if (Array.isArray(val)) return val;
        if (val === null || val === undefined) return undefined;
        // Если строка, преобразуем в массив
        return [val];
    })() as string[] | undefined;

    return (
        <Select
            mode="multiple"
            allowClear
            style={{ marginBottom: 8, display: 'block' }}
            placeholder={placeHolder}
            value={normalizedValue}
            onChange={(e) => {
                setFilters((prevState) => ({
                    ...prevState,
                    [filterKey]: e
                }))}}
            options={filterData}
        />
    )
}