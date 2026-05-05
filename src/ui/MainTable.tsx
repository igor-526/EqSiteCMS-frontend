import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, TableColumnType } from "antd";
import type { TableProps } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { createStyles } from 'antd-style';

type RecordType = Record<PropertyKey, unknown>;

export type MainTableProps = {
    сolumns: TableColumnType<RecordType>[],
    data: RecordType[],
    loading: boolean,
    filtersElements?: React.ReactNode,
    onRow?: TableProps<RecordType>['onRow'],
    expandable?: TableProps<RecordType>['expandable'],
    onSortChange?: (sort: string[]) => void,
    currentSort?: string[],
}

export const MainTable: React.FC<MainTableProps> = ({
    сolumns = [],
    data = [],
    loading = true,
    filtersElements = undefined,
    onRow = undefined,
    expandable = undefined,
    onSortChange = undefined,
    currentSort = undefined,
}) => {
    const useStyle = createStyles(({ css, token }) => {
        // @ts-expect-error - token is not typed
        const { antCls } = token;
        return {
            customTable: css`
                ${antCls}-table {
                    ${antCls}-table-container {
                        ${antCls}-table-body,
                        ${antCls}-table-content {
                            scrollbar-width: thin;
                            scrollbar-color: #eaeaea transparent;
                            scrollbar-gutter: stable;
                        }
                    }
                }
            `,
        };
    });
    const { styles } = useStyle();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const filtersRef = useRef<HTMLDivElement | null>(null);
    const [tableHeight, setTableHeight] = useState<number>(400);

    useEffect(() => {
        const updateTableHeight = () => {
            if (containerRef.current && filtersRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect()
                const filtersRect = filtersRef.current.getBoundingClientRect()
                const newHeight = containerRect.height - filtersRect.height - 50
                setTableHeight(Math.max(200, newHeight))
            }
        };

        updateTableHeight();
        window.addEventListener('resize', updateTableHeight);

        return () => window.removeEventListener('resize', updateTableHeight);
    }, []);

    const sortOrderMap = useMemo(() => {
        const map: Record<string, 'ascend' | 'descend' | null> = {};
        if (currentSort) {
            currentSort.forEach((sortField) => {
                if (sortField.startsWith('-')) {
                    const field = sortField.slice(1);
                    map[field] = 'descend';
                } else {
                    map[sortField] = 'ascend';
                }
            });
        }
        return map;
    }, [currentSort]);

    const columnsWithSort = useMemo(() => {
        return сolumns.map((column) => {
            const columnKey = column.key as string;
            const updatedColumn = { ...column };
            
            // Отключаем подсказки сортировки
            if (column.sorter) {
                updatedColumn.showSorterTooltip = false;
            }
            
            // Устанавливаем текущий порядок сортировки или сбрасываем его
            if (columnKey && sortOrderMap[columnKey] !== undefined) {
                updatedColumn.sortOrder = sortOrderMap[columnKey];
            } else if (column.sorter) {
                // Явно сбрасываем sortOrder, если сортировка отсутствует
                updatedColumn.sortOrder = undefined;
            }
            
            return updatedColumn;
        });
    }, [сolumns, sortOrderMap]);

    const handleTableChange = (
        _pagination: unknown,
        _filters: unknown,
        sorter: SorterResult<RecordType> | SorterResult<RecordType>[]
    ) => {
        if (!onSortChange) return;

        const sorters = Array.isArray(sorter) ? sorter : [sorter];
        const sortArray: string[] = [];

        sorters.forEach((s) => {
            if (s.field && s.order) {
                const field = String(s.field);
                const sortValue = s.order === 'descend' ? `-${field}` : field;
                sortArray.push(sortValue);
            }
        });

        onSortChange(sortArray);
    };

    // Ключ для принудительного обновления таблицы при изменении сортировки
    const tableKey = useMemo(() => {
        return currentSort && currentSort.length > 0 ? currentSort.join(',') : 'no-sort';
    }, [currentSort]);

    return (
        <div className="h-full overflow-y-hidden" ref={containerRef}>
            {filtersElements &&
                <div ref={filtersRef} className="flex mb-3 justify-between flex-wrap">{filtersElements}</div>}
            <Table
                key={tableKey}
                className={styles.customTable}
                columns={columnsWithSort}
                dataSource={data}
                loading={loading}
                scroll={{ y: tableHeight }}
                pagination={false}
                size="small"
                onRow={onRow}
                expandable={expandable}
                onChange={handleTableChange}
            />
        </div>
    )
}
