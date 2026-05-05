import { DeleteOutlined, DownOutlined, FileImageOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Dropdown, MenuProps, Select, SelectProps, Spin } from "antd";
import { UUID } from "crypto";
import React from "react";

export type GalleryFiltersProps = {
    onOpenAddPhotosModal: () => void;
    onOpenSetBatchHorsesModal: () => void;
    onOpenSetBatchPricesModal: () => void;
    onOpenDeletePhotosBatchModal: () => void;
    onResetFilters: () => void;
    selectedPhotosBatchCount: number;
    selectAllCheckboxChecked: boolean;
    selectAllCheckboxIndeterminate: boolean;
    setSelectAllCheckboxChecked: (checked: boolean) => void;
    pricesFilterValues: UUID[];
    setPricesFilterValues: (values: UUID[]) => void;
    pricesFilterOptions: SelectProps['options'];
    setPricesFilterSearchValue: (value: string) => void;
    pricesFilterLoading: boolean;
    horsesFilterValues: UUID[];
    setHorsesFilterValues: (values: UUID[]) => void;
    horsesFilterOptions: SelectProps['options'];
    setHorsesFilterSearchValue: (value: string) => void;
    horsesFilterLoading: boolean;
};

export const GalleryFilters: React.FC<GalleryFiltersProps> = ({
    onOpenAddPhotosModal,
    onOpenSetBatchHorsesModal,
    onOpenSetBatchPricesModal,
    onOpenDeletePhotosBatchModal,
    onResetFilters,
    selectedPhotosBatchCount,
    selectAllCheckboxChecked,
    selectAllCheckboxIndeterminate,
    setSelectAllCheckboxChecked,
    pricesFilterOptions,
    setPricesFilterSearchValue,
    pricesFilterValues,
    setPricesFilterValues,
    pricesFilterLoading,
    horsesFilterOptions,
    setHorsesFilterSearchValue,
    horsesFilterValues,
    setHorsesFilterValues,
    horsesFilterLoading,
}) => {
    const batchActionsMenu: MenuProps['items'] = [
        {
            label: 'Установить услуги',
            key: 'services',
            icon: <FileImageOutlined />,
            onClick: () => {
                onOpenSetBatchPricesModal();
            },
        },
        {
            label: 'Установить лошадей',
            key: 'horses',
            icon: <FileImageOutlined />,
            onClick: () => {
                onOpenSetBatchHorsesModal();
            },
        },
        {
            label: 'Удалить',
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
                onOpenDeletePhotosBatchModal();
            },
        },
    ];

    return (
        <div className="w-full flex justify-between mb-6">
            <div className="flex gap-2 items-center">
                <Checkbox
                    indeterminate={selectAllCheckboxIndeterminate}
                    onChange={(e) => {
                        e.stopPropagation();
                        setSelectAllCheckboxChecked(e.target.checked);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    checked={selectAllCheckboxChecked}>
                </Checkbox>
                <Dropdown menu={{ items: batchActionsMenu }} disabled={selectedPhotosBatchCount === 0}>
                    <Button icon={<DownOutlined />} iconPlacement="start">
                        Выбрано: ({selectedPhotosBatchCount})
                    </Button>
                </Dropdown>
                <Select
                    disabled
                    mode="multiple"
                    placeholder="Группы"
                    className="w-48"
                    allowClear
                />
                <Select
                    mode="multiple"
                    value={pricesFilterValues}
                    onChange={setPricesFilterValues}
                    showSearch={{ filterOption: false, onSearch: setPricesFilterSearchValue }}
                    notFoundContent={pricesFilterLoading ? <Spin size="small" /> : 'Услуги не найдены'}
                    options={pricesFilterOptions as SelectProps['options']}
                    placeholder="Услуги"
                    className="w-48"
                    allowClear
                />
                <Select
                    disabled
                    mode="multiple"
                    value={horsesFilterValues}
                    onChange={setHorsesFilterValues}
                    showSearch={{ filterOption: false, onSearch: setHorsesFilterSearchValue }}
                    notFoundContent={horsesFilterLoading ? <Spin size="small" /> : 'Лошади не найдены'}
                    options={horsesFilterOptions as SelectProps['options']}
                    placeholder="Лошади"
                    className="w-48"
                    allowClear
                />
                <Select
                    disabled
                    mode="multiple"
                    placeholder="Породы"
                    className="w-48"
                    allowClear
                />
                <Select
                    disabled
                    mode="multiple"
                    placeholder="Масти"
                    className="w-48"
                    allowClear
                />
            </div>
            <div className="flex gap-2 items-center">
                <Button variant="outlined" color="danger" icon={<FilterOutlined />} onClick={onResetFilters}>Сбросить</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddPhotosModal}>Добавить</Button>
            </div>
        </div>
    );
};



