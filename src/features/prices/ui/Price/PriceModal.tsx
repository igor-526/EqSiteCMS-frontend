import { PriceCreateInDto, PriceOutDto, PriceUpdateInDto } from "@/types/api/prices";
import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Popconfirm, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import { PRICE_PAGE_SCOPES_ACTIONS, usePricePageActionScopes } from "../../hooks/usePriceScopes";

export type PriceModalProps = {
    open: boolean;
    onClose: () => void;
    selectedPrice: PriceOutDto | null;
    onCreate: (createData: PriceCreateInDto) => void;
    onUpdate: (priceId: UUID, updateData: PriceUpdateInDto) => void;
    onDelete: (priceId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
    priceGroupsOptions: { key: string, label: string, value: UUID }[];
};

export const PriceModal: React.FC<PriceModalProps> = ({
    open,
    onClose,
    selectedPrice,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation,
    priceGroupsOptions
}) => {
    const { hasPermission } = usePricePageActionScopes();
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [priceGroups, setPriceGroups] = useState<UUID[]>([]);

    useEffect(() => {
        if (open) {
            if (selectedPrice) {
                setName(selectedPrice.name);
                setDescription(selectedPrice.description || '');
                setPriceGroups(selectedPrice.groups.map((group) => group.id));
            } else {
                setName('');
                setDescription('');
                setPriceGroups([]);
            }
            onResetValidation();
        }
    }, [open, selectedPrice, onResetValidation]);

    const isDeleteButtonAvailable = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_DELETE);
    const isUpdateButtonAvailable = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE);
    const isAddButtonAvailable = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_CREATE);
    const isGroupsFieldDisabled = !hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE_GROUPS);
    const isNameFieldDisabled = !hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE_NAME);
    const isDescriptionFieldDisabled = !hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE_DESCRIPTION);

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>
    ]

    if (selectedPrice) {
        if (isDeleteButtonAvailable) {
            footer.push(
                <Popconfirm
                    key="deleteConfirm"
                    title="Удалить цену"
                    description="Вы уверены, что хотите удалить эту цену?"
                    okText="Да"
                    okType="danger"
                    cancelText="Нет"
                    onConfirm={() => onDelete(selectedPrice.id)}
                >
                    <Button
                        key="delete"
                        color="danger"
                        variant="outlined">
                        <DeleteOutlined />Удалить
                    </Button>
                </Popconfirm>
            );
        }
        if (isUpdateButtonAvailable) {
            footer.push(
                <Button
                    key="change"
                    type="primary"
                    onClick={() => onUpdate(selectedPrice.id, { name: name, description: description, groups: priceGroups as UUID[] })}>
                    <EditOutlined />Изменить
                </Button>
            );
        }
    } else {
        if (isAddButtonAvailable) {
            footer.push(
                <Button
                    key="add"
                    type="primary"
                    onClick={() => onCreate({ name: name, description: description, groups: priceGroups })}>
                    <PlusOutlined />Добавить
                </Button>
            );
        }
    }



    const handleInput = (setter: (value: string) => void, value: string) => {
        if (Object.keys(validationErrors).length > 0) {
            onResetValidation();
        }
        setter(value);
    }

    return (
        <Modal
            open={open}
            title={selectedPrice ? 'Изменить цену' : 'Добавить цену'}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createPriceGroupNameInput">Группы</label>
                <Select
                    options={priceGroupsOptions}
                    mode="multiple"
                    onChange={setPriceGroups}
                    value={priceGroups}
                    allowClear={true}
                    placeholder="Выберите группы услуг"
                    disabled={isGroupsFieldDisabled}
                />

            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createPriceGroupNameInput">Название цены</label>
                <Input
                    id="createPriceNameInput"
                    placeholder="Название цены"
                    value={name}
                    onChange={(e) => handleInput(setName, e.target.value)}
                    maxLength={63}
                    allowClear={true}
                    disabled={isNameFieldDisabled}
                />

                {validationErrors.hasOwnProperty('name') ? (
                    <div className="text-sm text-red-500">{validationErrors.name.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{name.length}/63</div>
                )}

            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createPriceDescriptionInput">Описание цены</label>
                <TextArea
                    id="createPriceDescriptionInput"
                    rows={4}
                    placeholder="Описание цены"
                    allowClear={true}
                    value={description}
                    onChange={(e) => handleInput(setDescription, e.target.value)}
                    maxLength={511}
                    disabled={isDescriptionFieldDisabled}
                />
                {validationErrors.hasOwnProperty('description') ? (
                    <div className="text-sm text-red-500">{validationErrors.description.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{description.length}/511</div>
                )}
            </div>
        </Modal>
    );
};



