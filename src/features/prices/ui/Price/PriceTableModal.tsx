import { TableType, TableColumn, TableRow, TableCellFormatter } from "@/types/api/table";
import { 
    CloseOutlined, 
    SaveOutlined, 
    DeleteOutlined, 
    EditOutlined, 
    PlusOutlined
} from "@ant-design/icons";
import { 
    Button, 
    Modal, 
    Tabs, 
    Table, 
    Input, 
    Popconfirm, 
    Space, 
    Checkbox
} from "antd";
import React, { useState, useEffect } from "react";

const formatFormatterLabel = (formatter: TableCellFormatter): string => {
    const labels: Record<TableCellFormatter, string> = {
        'text_bold': 'Жирный',
        'text_italic': 'Курсив',
        'text_underline': 'Подчеркнутый'
    };
    return labels[formatter] || formatter.replace('text_', '');
};

export type PriceTableModalProps = {
    open: boolean;
    onClose: () => void;
    tableData: TableType[];
    onSave: (tableData: TableType[]) => void;
    loading: boolean;
};

export const PriceTableModal: React.FC<PriceTableModalProps> = ({
    open,
    onClose,
    onSave,
    tableData,
    loading,
}) => {
    const [tables, setTables] = useState<TableType[]>([]);
    const [activeTableIndex, setActiveTableIndex] = useState<number>(0);
    const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
    const [columnModalVisible, setColumnModalVisible] = useState(false);
    const [editingColumn, setEditingColumn] = useState<Partial<TableColumn> | null>(null);

    // Инициализация данных при открытии модального окна
    useEffect(() => {
        if (open) {
            setTables(JSON.parse(JSON.stringify(tableData)) || []);
            setActiveTableIndex(0);
        }
    }, [open, tableData]);

    const handleAddTable = () => {
        const newTable: TableType = {
            columns: [],
            rows: []
        };
        const updated = [...tables, newTable];
        setTables(updated);
        setActiveTableIndex(updated.length - 1);
    };

    const handleDeleteTable = (index: number) => {
        const updated = tables.filter((_, i) => i !== index);
        setTables(updated);
        if (updated.length > 0) {
            setActiveTableIndex(Math.min(activeTableIndex, updated.length - 1));
        } else {
            setActiveTableIndex(0);
        }
    };

    const handleAddColumn = () => {
        setEditingColumnIndex(null);
        setEditingColumn({
            key: `column_${Date.now()}`,
            title: '',
            annotation: '',
            cell_formatter: []
        });
        setColumnModalVisible(true);
    };

    const handleEditColumn = (columnIndex: number) => {
        setEditingColumnIndex(columnIndex);
        setEditingColumn({ ...tables[activeTableIndex].columns[columnIndex] });
        setColumnModalVisible(true);
    };

    const handleSaveColumn = () => {
        if (!editingColumn || !editingColumn.key || !editingColumn.title) {
            return;
        }

        const updated = [...tables];
        const table = updated[activeTableIndex];
        
        if (editingColumnIndex !== null) {
            // Редактирование существующей колонки
            const oldKey = table.columns[editingColumnIndex].key;
            const newKey = editingColumn.key;
            
            table.columns[editingColumnIndex] = {
                key: editingColumn.key,
                title: editingColumn.title,
                annotation: editingColumn.annotation || '',
                cell_formatter: editingColumn.cell_formatter || []
            };

            // Если ключ изменился, обновляем ячейки
            if (oldKey !== newKey) {
                table.rows.forEach(row => {
                    if (row.cells[oldKey]) {
                        row.cells[newKey] = row.cells[oldKey];
                        delete row.cells[oldKey];
                    }
                });
            }
        } else {
            // Добавление новой колонки
            table.columns.push({
                key: editingColumn.key,
                title: editingColumn.title,
                annotation: editingColumn.annotation || '',
                cell_formatter: editingColumn.cell_formatter || []
            });

            // Инициализируем ячейки для новой колонки во всех существующих строках
            if (editingColumn.key) {
                table.rows.forEach(row => {
                    if (!row.cells[editingColumn.key!]) {
                        row.cells[editingColumn.key!] = {
                            value: '',
                            annotation: '',
                            cell_formatter: []
                        };
                    }
                });
            }
        }

        setTables(updated);
        setColumnModalVisible(false);
        setEditingColumn(null);
        setEditingColumnIndex(null);
    };

    const handleDeleteColumn = (columnIndex: number) => {
        const updated = [...tables];
        const table = updated[activeTableIndex];
        const columnKey = table.columns[columnIndex].key;
        
        // Удаляем колонку
        table.columns.splice(columnIndex, 1);
        
        // Удаляем ячейки этой колонки из всех строк
        table.rows.forEach(row => {
            delete row.cells[columnKey];
        });

        setTables(updated);
    };

    const handleAddRow = () => {
        const updated = [...tables];
        const table = updated[activeTableIndex];
        const newRow: TableRow = {
            cells: {}
        };
        
        // Инициализируем ячейки для всех колонок
        table.columns.forEach(column => {
            newRow.cells[column.key] = {
                value: '',
                annotation: '',
                cell_formatter: []
            };
        });

        table.rows.push(newRow);
        setTables(updated);
    };

    const handleDeleteRow = (rowIndex: number) => {
        const updated = [...tables];
        updated[activeTableIndex].rows.splice(rowIndex, 1);
        setTables(updated);
    };

    const handleCellChange = (rowIndex: number, columnKey: string, field: 'value' | 'annotation', newValue: string) => {
        const updated = [...tables];
        const cell = updated[activeTableIndex].rows[rowIndex].cells[columnKey];
        if (cell) {
            cell[field] = newValue;
            setTables(updated);
        }
    };

    const handleCellFormatterChange = (rowIndex: number, columnKey: string, formatter: TableCellFormatter, checked: boolean) => {
        const updated = [...tables];
        const cell = updated[activeTableIndex].rows[rowIndex].cells[columnKey];
        if (cell) {
            if (checked) {
                if (!cell.cell_formatter.includes(formatter)) {
                    cell.cell_formatter.push(formatter);
                }
            } else {
                cell.cell_formatter = cell.cell_formatter.filter(f => f !== formatter);
            }
            setTables(updated);
        }
    };

    const isTableEmpty = (table: TableType): boolean => {
        // Таблица пустая, если нет колонок
        if (table.columns.length === 0) {
            return true;
        }
        
        // Таблица пустая, если нет строк
        if (table.rows.length === 0) {
            return true;
        }
        
        // Проверяем, есть ли хотя бы одна строка с непустыми данными
        const hasNonEmptyRow = table.rows.some(row => {
            // Проверяем, есть ли хотя бы одна ячейка с непустым значением
            return table.columns.some(column => {
                const cell = row.cells[column.key];
                return cell && cell.value.trim() !== '';
            });
        });
        
        // Если нет ни одной строки с данными, таблица пустая
        return !hasNonEmptyRow;
    };

    const filterEmptyTables = (tablesToFilter: TableType[]): TableType[] => {
        return tablesToFilter.filter(table => !isTableEmpty(table));
    };

    const handleSave = () => {
        // Удаляем пустые таблицы перед сохранением
        const filteredTables = filterEmptyTables(tables);
        onSave(filteredTables);
    };

    const renderTableEditor = (table: TableType, tableIndex: number) => {
        const tableColumns = [
            ...table.columns.map((col, colIndex) => ({
                title: (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{col.title}</span>
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditColumn(colIndex)}
                            title="Редактировать колонку"
                        />
                        <Popconfirm
                            title="Удалить колонку"
                            description="Вы уверены, что хотите удалить эту колонку?"
                            okText="Да"
                            cancelText="Нет"
                            onConfirm={() => handleDeleteColumn(colIndex)}
                        >
                            <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                title="Удалить колонку"
                            />
                        </Popconfirm>
                    </div>
                ),
                dataIndex: col.key,
                key: col.key,
                width: 200,
                render: (_: unknown, record: TableRow, rowIndex: number) => {
                    const cell = record.cells[col.key];
                    if (!cell) {
                        // Если ячейки нет, создаем её
                        const updated = [...tables];
                        if (!updated[activeTableIndex].rows[rowIndex].cells[col.key]) {
                            updated[activeTableIndex].rows[rowIndex].cells[col.key] = {
                                value: '',
                                annotation: '',
                                cell_formatter: []
                            };
                            setTables(updated);
                        }
                        return null;
                    }
                    
                    return (
                        <div className="flex flex-col gap-2 p-2 border rounded">
                            <Input
                                value={cell.value}
                                onChange={(e) => handleCellChange(rowIndex, col.key, 'value', e.target.value)}
                                placeholder="Значение"
                                size="small"
                            />
                            <Input
                                size="small"
                                value={cell.annotation}
                                onChange={(e) => handleCellChange(rowIndex, col.key, 'annotation', e.target.value)}
                                placeholder="Аннотация"
                            />
                            <Space size="small" wrap>
                                {(['text_bold', 'text_italic', 'text_underline'] as TableCellFormatter[]).map(formatter => (
                                    <Checkbox
                                        key={formatter}
                                        checked={cell.cell_formatter.includes(formatter)}
                                        onChange={(e) => handleCellFormatterChange(rowIndex, col.key, formatter, e.target.checked)}
                                    >
                                        {formatFormatterLabel(formatter)}
                                    </Checkbox>
                                ))}
                            </Space>
                        </div>
                    );
                }
            })),
            {
                title: 'Действия',
                key: 'actions',
                width: 100,
                fixed: 'right' as const,
                render: (_: unknown, __: TableRow, rowIndex: number) => (
                    <Popconfirm
                        title="Удалить строку"
                        description="Вы уверены, что хотите удалить эту строку?"
                        okText="Да"
                        cancelText="Нет"
                        onConfirm={() => handleDeleteRow(rowIndex)}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                )
            }
        ];

        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Таблица {tableIndex + 1}</h3>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddColumn}
                        >
                            Добавить колонку
                        </Button>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleAddRow}
                        >
                            Добавить строку
                        </Button>
                        <Popconfirm
                            title="Удалить таблицу"
                            description="Вы уверены, что хотите удалить эту таблицу?"
                            okText="Да"
                            cancelText="Нет"
                            onConfirm={() => handleDeleteTable(tableIndex)}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                            >
                                Удалить таблицу
                            </Button>
                        </Popconfirm>
                    </Space>
                </div>

                {table.columns.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 border rounded">
                        <p className="mb-4">Нет колонок в таблице</p>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddColumn}
                        >
                            Добавить первую колонку
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            dataSource={table.rows.map((row, idx) => ({ ...row, key: idx }))}
                            columns={tableColumns}
                            pagination={false}
                            size="small"
                            scroll={{ x: 'max-content' }}
                        />
                    </div>
                )}
            </div>
        );
    };

    const footer = [
        <Button key="back" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>,
        <Button
            key="save"
            type="primary"
            onClick={handleSave}
        >
            <SaveOutlined />Сохранить
        </Button>
    ];

    return (
        <>
            <Modal
                open={open}
                title="Редактировать таблицы цен"
                onCancel={onClose}
                footer={footer}
                width="90%"
                style={{ top: 20 }}
            >
                <div className="mb-4">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddTable}
                    >
                        Добавить таблицу
                    </Button>
                </div>

                {tables.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 border rounded">
                        <p className="mb-4">Нет таблиц. Добавьте первую таблицу.</p>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddTable}
                        >
                            Добавить таблицу
                        </Button>
                    </div>
                ) : (
                    <Tabs
                        activeKey={activeTableIndex.toString()}
                        onChange={(key) => setActiveTableIndex(parseInt(key))}
                        items={tables.map((table, index) => ({
                            key: index.toString(),
                            label: `Таблица ${index + 1}`,
                            children: renderTableEditor(table, index)
                        }))}
                    />
                )}
            </Modal>

            {/* Модальное окно для редактирования колонки */}
            <Modal
                title={editingColumnIndex !== null ? "Редактировать колонку" : "Добавить колонку"}
                open={columnModalVisible}
                onOk={handleSaveColumn}
                onCancel={() => {
                    setColumnModalVisible(false);
                    setEditingColumn(null);
                    setEditingColumnIndex(null);
                }}
                okText="Сохранить"
                cancelText="Отмена"
                loading={loading}
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-2 font-medium">Ключ колонки</label>
                        <Input
                            value={editingColumn?.key || ''}
                            onChange={(e) => setEditingColumn({ ...editingColumn, key: e.target.value })}
                            disabled={editingColumnIndex !== null}
                            placeholder="Уникальный ключ колонки"
                        />
                        {editingColumnIndex === null && (
                            <p className="text-xs text-gray-500 mt-1">
                                Ключ должен быть уникальным и не может быть изменен после создания
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Название колонки</label>
                        <Input
                            value={editingColumn?.title || ''}
                            onChange={(e) => setEditingColumn({ ...editingColumn, title: e.target.value })}
                            placeholder="Название колонки"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Аннотация</label>
                        <Input
                            value={editingColumn?.annotation || ''}
                            onChange={(e) => setEditingColumn({ ...editingColumn, annotation: e.target.value })}
                            placeholder="Аннотация при наведении"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Форматтеры колонки по умолчанию</label>
                        <Space direction="vertical">
                            {(['text_bold', 'text_italic', 'text_underline'] as TableCellFormatter[]).map(formatter => (
                                <Checkbox
                                    key={formatter}
                                    checked={editingColumn?.cell_formatter?.includes(formatter) || false}
                                    onChange={(e) => {
                                        const formatters = editingColumn?.cell_formatter || [];
                                        if (e.target.checked) {
                                            setEditingColumn({ ...editingColumn, cell_formatter: [...formatters, formatter] });
                                        } else {
                                            setEditingColumn({ ...editingColumn, cell_formatter: formatters.filter(f => f !== formatter) });
                                        }
                                    }}
                                >
                                    {formatFormatterLabel(formatter)}
                                </Checkbox>
                            ))}
                        </Space>
                        <p className="text-xs text-gray-500 mt-1">
                            Эти форматтеры будут применены по умолчанию к новым ячейкам в этой колонке
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
};



