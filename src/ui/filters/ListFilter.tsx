import { useCallback } from "react";
import { Select } from "antd";
import type {FilterListPropsType} from "@/types/filters/filterList";
import type {FiltersBaseType} from "@/types/filters/filterBase";
import { useFilterStyles } from "./filter.styles";

export const ListFilter = <TFilters extends FiltersBaseType = FiltersBaseType>({
    filters,
    setFilters,
    filterKey,
    filterData,
    placeHolder="Выберите"
}: FilterListPropsType<TFilters>) => {
    const { styles } = useFilterStyles();

    const normalizedValue = (() => {
        const val = filters[filterKey];
        if (Array.isArray(val)) return val;
        if (val === null || val === undefined) return undefined;
        return [val];
    })() as string[] | undefined;

    const handleChange = useCallback(
        (selected: string[]) => {
            setFilters((prevState) => ({
                ...prevState,
                [filterKey]: selected,
            }));
        },
        [filterKey, setFilters],
    );

    return (
        <Select
            mode="multiple"
            allowClear
            className={styles.fieldSpacing}
            placeholder={placeHolder}
            value={normalizedValue}
            onChange={handleChange}
            options={filterData}
        />
    );
};
