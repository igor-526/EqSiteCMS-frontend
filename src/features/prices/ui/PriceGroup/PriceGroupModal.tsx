import { PriceGroupCreateInDto, PriceGroupOutDto, PriceGroupUpdateInDto } from "@/types/api/priceGroups";
import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Popconfirm } from "antd";
import TextArea from "antd/es/input/TextArea";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import { PRICE_PAGE_SCOPES_ACTIONS, usePricePageActionScopes } from "../../hooks/usePriceScopes";

export type PriceGroupModalProps = {
    open: boolean;
    onClose: () => void;
    selectedPriceGroup: PriceGroupOutDto | null;
    onCreate: (createData: PriceGroupCreateInDto) => void;
    onUpdate: (priceGroupId: UUID, updateData: PriceGroupUpdateInDto) => void;
    onDelete: (priceGroupId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
};

export const PriceGroupModal: React.FC<PriceGroupModalProps> = ({
    open,
    onClose,
    selectedPriceGroup,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation
}) => {
    const { hasPermission } = usePricePageActionScopes();
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        if (open) {
            if (selectedPriceGroup) {
                setName(selectedPriceGroup.name);
                setDescription(selectedPriceGroup.description || '');
            } else {
                setName('');
                setDescription('');
            }
            onResetValidation();
        }
    }, [open, selectedPriceGroup, onResetValidation]);

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>
    ]

    const isDeleteButtonAvailable = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_DELETE);
    const isUpdateButtonAvailable = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_UPDATE);
    const isAddButtonAvailable = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_CREATE);
    const isNameFieldDisabled = !hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_UPDATE_NAME);
    const isDescriptionFieldDisabled = !hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_UPDATE_DESCRIPTION);

    if (selectedPriceGroup) {
        if (isDeleteButtonAvailable) {
            footer.push(
                <Popconfirm
                    key="deleteConfirm"
                    title="Удалить группу услуг"
                    description="Вы уверены, что хотите удалить эту группу услуг?"
                    okText="Да"
                    okType="danger"
                    cancelText="Нет"
                    onConfirm={() => onDelete(selectedPriceGroup.id)}
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
                    onClick={() => onUpdate(selectedPriceGroup.id, { name: name, description: description })}>
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
                    onClick={() => onCreate({ name: name, description: description })}>
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
            title={selectedPriceGroup ? 'Изменить группу услуг' : 'Добавить группу услуг'}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createPriceGroupNameInput">Название группы услуг</label>
                <Input
                    id="createPriceGroupNameInput"
                    placeholder="Название группы услуг"
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
                <label htmlFor="createPriceGroupDescriptionInput">Описание группы услуг</label>
                <TextArea
                    id="createPriceGroupDescriptionInput"
                    rows={4}
                    placeholder="Описание группы услуг"
                    value={description}
                    onChange={(e) => handleInput(setDescription, e.target.value)}
                    maxLength={511}
                    allowClear={true}
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



