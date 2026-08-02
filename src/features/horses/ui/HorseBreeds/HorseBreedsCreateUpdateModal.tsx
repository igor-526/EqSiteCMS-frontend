import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Popconfirm, Select } from "antd";
import { UUID } from "crypto";
import React, { useEffect, useRef, useState } from "react";
import {
    HorseBreedCreateInDto,
    HorseBreedUpdateInDto,
    HorseBreedOutDto,
    HorseKind,
} from "@/types/api/horseBreeds";
import TextArea from "antd/es/input/TextArea";

const KIND_OPTIONS = [
    { label: "Лошадь", value: "horse" },
    { label: "Пони", value: "pony" },
];

export type HorseBreedCreateUpdateModalProps = {
    open: boolean;
    onClose: () => void;
    selectedHorseBreed: HorseBreedOutDto | null;
    onCreate: (createData: HorseBreedCreateInDto) => void | Promise<unknown>;
    onUpdate: (horseBreedId: UUID, updateData: HorseBreedUpdateInDto) => void | Promise<unknown>;
    onDelete: (horseBreedId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
    canMutate: boolean;
    canDelete: boolean;
};

export const HorseBreedCreateUpdateModal: React.FC<HorseBreedCreateUpdateModalProps> = ({
    open,
    onClose,
    selectedHorseBreed,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation,
    canMutate,
    canDelete,
}) => {

    const [name, setName] = useState<string>('');
    const [shortName, setShortName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [kind, setKind] = useState<HorseKind>("horse");
    const [submitting, setSubmitting] = useState(false);
    const submitGuard = useRef(false);

    const submit = async (operation: () => void | Promise<unknown>) => {
        if (!canMutate) return;
        if (submitGuard.current) return;
        submitGuard.current = true;
        setSubmitting(true);
        try {
            await operation();
        } finally {
            submitGuard.current = false;
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            onResetValidation();
            if (selectedHorseBreed) {
                setName(selectedHorseBreed.name);
                setShortName(selectedHorseBreed.short_name);
                setDescription(selectedHorseBreed.description || '');
                setSlug(selectedHorseBreed.slug);
                setKind(selectedHorseBreed.kind);
            } else {
                setName('');
                setShortName('');
                setDescription('');
                setSlug('');
                setKind("horse");
            }
        }
    }, [open, selectedHorseBreed, onResetValidation]);

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>
    ]

    if (selectedHorseBreed) {
        if (canDelete) {
        footer.push(
            <Popconfirm
            key="deleteConfirm"
                title="Удалить породу"
                description="Вы уверены, что хотите удалить эту породу?"
                okText="Да"
                okType="danger"
                cancelText="Нет"
                onConfirm={() => onDelete(selectedHorseBreed.id)}
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
        if (canMutate) {
        footer.push(
            <Button
                key="change"
                type="primary"
                loading={submitting}
                onClick={() => submit(() => onUpdate(selectedHorseBreed.id, { name, short_name: shortName, description, slug, kind }))}>
                <EditOutlined />Изменить
            </Button>
        );
        }
    } else if (canMutate) {
        footer.push(
            <Button
            key="add"
            type="primary"
            loading={submitting}
            onClick={() => submit(() => onCreate({ name, short_name: shortName, description, slug, kind }))}>
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
            title={selectedHorseBreed ? 'Изменить породу' : 'Добавить породу'}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseBreedNameInput">Наименование породы</label>
                <Input
                    id="createHorseBreedNameInput"
                    placeholder="Наименование породы"
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
                <label htmlFor="createHorseBreedShortNameInput">Короткое наименование</label>
                <Input
                    id="createHorseBreedShortNameInput"
                    placeholder="Короткое наименование"
                    value={shortName}
                    onChange={(e) => handleInput(setShortName, e.target.value)}
                    maxLength={64}
                    allowClear
                    status={validationErrors.short_name ? "error" : undefined}
                />
                {validationErrors.short_name ? (
                    <div className="text-sm text-red-500">{validationErrors.short_name.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{shortName.length}/63</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseBreedDescriptionInput">Описание породы</label>
                <TextArea
                    id="createHorseBreedDescriptionInput"
                    placeholder="Описание породы"
                    value={description}
                    onChange={(e) => handleInput(setDescription, e.target.value)}
                    maxLength={511}
                    allowClear={true}
                    rows={4}
                />
                {Array.isArray(validationErrors.description) ? (
                    <div className="text-sm text-red-500">{validationErrors.description.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{description.length}/511</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseBreedKindSelect">Тип</label>
                <Select
                    id="createHorseBreedKindSelect"
                    value={kind}
                    onChange={(value) => setKind(value as HorseKind)}
                    options={KIND_OPTIONS}
                    style={{ width: "100%" }}
                />
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseBreedSlugInput">Путь в URL (генерируется автоматически)</label>
                <Input
                    id="createHorseBreedSlugInput"
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
