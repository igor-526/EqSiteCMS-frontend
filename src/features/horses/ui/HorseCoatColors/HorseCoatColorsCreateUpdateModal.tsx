import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Popconfirm } from "antd";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import { HorseCoatColorCreateInDto, HorseCoatColorUpdateInDto, HorseCoatColorOutDto } from "@/types/api/horseCoatColor";
import TextArea from "antd/es/input/TextArea";

export type HorseCoatColorsCreateUpdateModalProps = {
    open: boolean;
    onClose: () => void;
    selectedHorseCoatColor: HorseCoatColorOutDto | null;
    onCreate: (createData: HorseCoatColorCreateInDto) => void;
    onUpdate: (horseCoatColorId: UUID, updateData: HorseCoatColorUpdateInDto) => void;
    onDelete: (horseCoatColorId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
};

export const HorseCoatColorsCreateUpdateModal: React.FC<HorseCoatColorsCreateUpdateModalProps> = ({
    open,
    onClose,
    selectedHorseCoatColor,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation,
}) => {

    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [slug, setSlug] = useState<string>('');

    useEffect(() => {
        if (open) {
            onResetValidation();
            if (selectedHorseCoatColor) {
                setName(selectedHorseCoatColor.name);
                setDescription(selectedHorseCoatColor.description || '');
                setSlug(selectedHorseCoatColor.slug);
            } else {
                setName('');
                setDescription('');
                setSlug('');
            }
        }
    }, [open, selectedHorseCoatColor, onResetValidation]);

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>
    ]

    if (selectedHorseCoatColor) {
        footer.push(
            <Popconfirm
            key="deleteConfirm"
                title="Удалить породу"
                description="Вы уверены, что хотите удалить эту породу?"
                okText="Да"
                okType="danger"
                cancelText="Нет"
                onConfirm={() => onDelete(selectedHorseCoatColor.id)}
            >
                <Button
                key="delete"
                color="danger"
                variant="outlined">
                    <DeleteOutlined />Удалить
                </Button>
            </Popconfirm>

        );
        footer.push(
            <Button
                key="change"
                type="primary"
                onClick={() => onUpdate(selectedHorseCoatColor.id, { name: name, description: description, slug: slug })}>
                <EditOutlined />Изменить
            </Button>
        );
    } else {
        footer.push(
            <Button
            key="add"
            type="primary"
            onClick={() => onCreate({ name: name, description: description, slug: slug })}>
                <PlusOutlined />Добавить
            </Button>
        );
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
            title={selectedHorseCoatColor ? 'Изменить масть' : 'Добавить масть'}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseCoatColorNameInput">Наименование масти</label>
                <Input
                    id="createHorseCoatColorNameInput"
                    placeholder="Наименование масти"
                    value={name}
                    onChange={(e) => handleInput(setName, e.target.value)}
                    maxLength={63}
                    allowClear={true}
                />
                {validationErrors.hasOwnProperty('name') ? (
                    <div className="text-sm text-red-500">{validationErrors.name.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{name.length}/255</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseCoatColorDescriptionInput">Описание масти</label>
                <TextArea
                    id="createHorseCoatColorDescriptionInput"
                    placeholder="Описание масти"
                    value={description}
                    onChange={(e) => handleInput(setDescription, e.target.value)}
                    maxLength={511}
                    allowClear={true}
                    rows={4}
                />
                {validationErrors.hasOwnProperty('name') ? (
                    <div className="text-sm text-red-500">{validationErrors.description.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{description.length}/511</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseCoatColorSlugInput">Путь в URL (генерируется автоматически)</label>
                <Input
                    id="createHorseCoatColorSlugInput"
                    placeholder="Slug"
                    value={slug}
                    onChange={(e) => handleInput(setSlug, e.target.value)}
                    maxLength={63}
                    allowClear={true}
                />
                {validationErrors.hasOwnProperty('slug') ? (
                    <div className="text-sm text-red-500">{validationErrors.slug.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{slug.length}/63</div>
                )}
            </div>
        </Modal>
    );
};



