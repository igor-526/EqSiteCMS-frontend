import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Popconfirm, Radio, Select, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import {
    HorseServiceRelationAvailableServiceDto,
    HorseServiceRelationCreateInDto,
    HorseServiceRelationOutDto,
    HorseServiceRelationUpdateInDto,
} from "@/types/api/horseServiceRelations";
import { PriceFormatter } from "@/types/api/prices";

const priceFormatterOptions = [
    { key: "equal", label: "Равно", value: PriceFormatter.equal },
    { key: "lt", label: "До", value: PriceFormatter.lt },
    { key: "gt", label: "От", value: PriceFormatter.gt },
    { key: "discuss", label: "Обсуждается", value: PriceFormatter.discuss },
];

export type HorseServiceRelationCreateUpdateModalProps = {
    open: boolean;
    onClose: () => void;
    selectedRelation: HorseServiceRelationOutDto | null;
    availableServices: HorseServiceRelationAvailableServiceDto[];
    availableServicesLoading: boolean;
    onSearchServices: (search: string) => void;
    onCreate: (createData: HorseServiceRelationCreateInDto) => void;
    onUpdate: (relationId: UUID, updateData: HorseServiceRelationUpdateInDto) => void;
    onDelete: (relationId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
    submitting?: boolean;
};

export const HorseServiceRelationCreateUpdateModal: React.FC<HorseServiceRelationCreateUpdateModalProps> = ({
    open,
    onClose,
    selectedRelation,
    availableServices,
    availableServicesLoading,
    onSearchServices,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation,
    submitting = false,
}) => {
    const isEditMode = selectedRelation !== null;

    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<HorseServiceRelationAvailableServiceDto | null>(null);
    const [descriptionOverride, setDescriptionOverride] = useState<string>("");
    const [priceFormatterOverride, setPriceFormatterOverride] = useState<PriceFormatter>(PriceFormatter.equal);
    const [priceOverride, setPriceOverride] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            onResetValidation();
            if (selectedRelation) {
                setSelectedServiceId(selectedRelation.service_id.toString());
                setSelectedService(null);
                setDescriptionOverride(selectedRelation.description || "");
                setPriceFormatterOverride(selectedRelation.price_formatter || PriceFormatter.equal);
                setPriceOverride(selectedRelation.price);
            } else {
                setSelectedServiceId(null);
                setSelectedService(null);
                setDescriptionOverride("");
                setPriceFormatterOverride(PriceFormatter.equal);
                setPriceOverride(null);
            }
        }
    }, [open, selectedRelation, onResetValidation]);

    const handleServiceSelect = (value: string) => {
        if (Object.keys(validationErrors).length > 0) {
            onResetValidation();
        }
        setSelectedServiceId(value);
        const service = availableServices.find((s) => s.id.toString() === value);
        setSelectedService(service || null);
        setDescriptionOverride("");
        setPriceOverride(null);
    };

    const handleSearch = (value: string) => {
        onSearchServices(value);
    };

    const handleInput = (setter: (value: string) => void, value: string) => {
        if (Object.keys(validationErrors).length > 0) {
            onResetValidation();
        }
        setter(value);
    };

    const handlePriceFormatterChange = (e: { target: { value?: unknown } }) => {
        onResetValidation();
        setPriceFormatterOverride(e.target.value as PriceFormatter);
    };

    const handlePriceOverrideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onResetValidation();
        setPriceOverride(e.target.value ? Number(e.target.value) : null);
    };

    const buildCreateData = (): HorseServiceRelationCreateInDto => {
        const data: HorseServiceRelationCreateInDto = {
            service_id: selectedServiceId as UUID,
        };
        if (descriptionOverride) {
            data.description_override = descriptionOverride;
        }
        if (priceOverride !== null) {
            data.price_override = priceOverride;
            data.price_formatter_override = priceFormatterOverride;
        }
        return data;
    };

    const buildUpdateData = (): HorseServiceRelationUpdateInDto => {
        const data: HorseServiceRelationUpdateInDto = {};
        if (descriptionOverride) {
            data.description_override = descriptionOverride;
        } else {
            data.description_override = null;
        }
        if (priceOverride !== null) {
            data.price_override = priceOverride;
            data.price_formatter_override = priceFormatterOverride;
        } else {
            data.price_override = null;
            data.price_formatter_override = null;
        }
        return data;
    };

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>,
    ];

    if (isEditMode) {
        footer.push(
            <Popconfirm
                key="deleteConfirm"
                title="Отвязать услугу"
                description="Вы уверены, что хотите отвязать эту услугу от лошади?"
                okText="Да"
                okType="danger"
                cancelText="Нет"
                onConfirm={() => onDelete(selectedRelation.id)}
                disabled={submitting}
            >
                <Button key="delete" color="danger" variant="outlined" disabled={submitting}>
                    <DeleteOutlined />Удалить
                </Button>
            </Popconfirm>,
        );
        footer.push(
            <Button
                key="change"
                type="primary"
                onClick={() => onUpdate(selectedRelation.id, buildUpdateData())}
                loading={submitting}
                disabled={submitting}
            >
                <EditOutlined />Изменить
            </Button>,
        );
    } else {
        footer.push(
            <Button
                key="add"
                type="primary"
                onClick={() => onCreate(buildCreateData())}
                disabled={!selectedServiceId || submitting}
                loading={submitting}
            >
                <PlusOutlined />Добавить
            </Button>,
        );
    }

    const selectedServiceInfo = isEditMode
        ? { description: selectedRelation.description, price: selectedRelation.price, price_formatter: selectedRelation.price_formatter }
        : selectedService;

    return (
        <Modal
            open={open}
            title={isEditMode ? "Изменить связь с услугой" : "Добавить услугу к лошади"}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label>Услуга</label>
                {isEditMode ? (
                    <Input value={selectedRelation.name} disabled />
                ) : (
                    <>
                        <Select
                            showSearch
                            placeholder="Начните вводить название услуги"
                            filterOption={false}
                            onSearch={handleSearch}
                            onChange={handleServiceSelect}
                            value={selectedServiceId}
                            loading={availableServicesLoading}
                            notFoundContent={availableServicesLoading ? <Spin size="small" /> : "Ничего не найдено"}
                            options={availableServices.map((s) => ({
                                label: s.name,
                                value: s.id.toString(),
                            }))}
                            allowClear
                        />
                        {validationErrors.hasOwnProperty("service_id") && (
                            <div className="text-sm text-red-500">
                                {validationErrors.service_id.join("\n")}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="mb-6 flex flex-col gap-2">
                <label>Описание</label>
                <TextArea
                    placeholder={selectedServiceInfo?.description || "Описание для этой лошади"}
                    value={descriptionOverride}
                    onChange={(e) => handleInput(setDescriptionOverride, e.target.value)}
                    maxLength={511}
                    allowClear
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
                {validationErrors.hasOwnProperty("description_override") ? (
                    <div className="text-sm text-red-500">
                        {validationErrors.description_override.join("\n")}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">{descriptionOverride.length}/511</div>
                )}
            </div>

            <div className="mb-6 flex flex-col gap-2">
                <label>Цена</label>
                <Radio.Group
                    block
                    options={priceFormatterOptions}
                    value={priceFormatterOverride}
                    onChange={handlePriceFormatterChange}
                    optionType="button"
                />
                {priceFormatterOverride !== PriceFormatter.discuss && (
                    <>
                        <Input
                            placeholder={selectedServiceInfo?.price ? `${selectedServiceInfo.price} ₽` : "Цена в рублях"}
                            value={priceOverride ?? ""}
                            onChange={handlePriceOverrideChange}
                            type="number"
                            allowClear
                        />
                        {validationErrors.hasOwnProperty("price_override") && (
                            <div className="text-sm text-red-500">
                                {validationErrors.price_override.join("\n")}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};
