import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Popconfirm, Radio } from "antd";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import { HorseServiceCreateInDto, HorseServiceOutDto, HorseServiceUpdateInDto } from "@/types/api/horseServices";
import { PriceFormatter } from "@/types/api/prices";

const priceFormattersOptions = [
    { key: 'equal', label: 'Равно', value: PriceFormatter.equal },
    { key: 'lt', label: 'До', value: PriceFormatter.lt },
    { key: 'gt', label: 'От', value: PriceFormatter.gt },
    { key: 'discuss', label: 'Обсуждается', value: PriceFormatter.discuss },
];

export type HorseServicesCreateUpdateModalProps = {
    open: boolean;
    onClose: () => void;
    selectedHorseService: HorseServiceOutDto | null;
    onCreate: (createData: HorseServiceCreateInDto) => void;
    onUpdate: (horseServiceId: UUID, updateData: HorseServiceUpdateInDto) => void;
    onDelete: (horseServiceId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
};

export const HorseServicesCreateUpdateModal: React.FC<HorseServicesCreateUpdateModalProps> = ({
    open,
    onClose,
    selectedHorseService,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation,
}) => {

    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [priceFormatter, setPriceFormatter] = useState<PriceFormatter>(PriceFormatter.equal);

    useEffect(() => {
        if (open) {
            onResetValidation();
            if (selectedHorseService) {
                setName(selectedHorseService.name);
                setDescription(selectedHorseService.description || '');
                setSlug(selectedHorseService.slug);
                setPrice(selectedHorseService.price);
                setPriceFormatter(selectedHorseService.price_formatter);
            } else {
                setName('');
                setDescription('');
                setSlug('');
                setPrice(0);
                setPriceFormatter(PriceFormatter.equal);
            }
        }
    }, [open, selectedHorseService, onResetValidation]);

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>
    ]

    if (selectedHorseService) {
        footer.push(
            <Popconfirm
                key="deleteConfirm"
                title="Удалить услугу"
                description="Вы уверены, что хотите удалить эту услугу?"
                okText="Да"
                okType="danger"
                cancelText="Нет"
                onConfirm={() => onDelete(selectedHorseService.id)}
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
                onClick={() => onUpdate(selectedHorseService.id, { name: name, description: description, slug: slug, price: price, price_formatter: priceFormatter })}>
                <EditOutlined />Изменить
            </Button>
        );
    } else {
        footer.push(
            <Button
                key="add"
                type="primary"
                onClick={() => onCreate({ name: name, description: description, slug: slug, price: price, price_formatter: priceFormatter })}>
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
            title={selectedHorseService ? 'Изменить услугу' : 'Добавить услугу'}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseServiceNameInput">Наименование услуги</label>
                <Input
                    id="createHorseServiceNameInput"
                    placeholder="Наименование услуги"
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
                <label htmlFor="createHorseServiceDescriptionInput">Описание услуги</label>
                <Input
                    id="createHorseServiceDescriptionInput"
                    placeholder="Описание услуги"
                    value={description}
                    onChange={(e) => handleInput(setDescription, e.target.value)}
                    maxLength={511}
                    allowClear={true}
                />
                {validationErrors.hasOwnProperty('description') ? (
                    <div className="text-sm text-red-500">{validationErrors.description.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{description.length}/511</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseServiceSlugInput">Путь в URL (генерируется автоматически)</label>
                <Input
                    id="createHorseServiceSlugInput"
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
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseServicePriceInput">Цена услуги по умолчанию</label>
                <Radio.Group
                    block
                    options={priceFormattersOptions}
                    value={priceFormatter}
                    onChange={(e) => { onResetValidation(); setPriceFormatter(e.target.value as PriceFormatter); }}
                    optionType="button"
                />
                {priceFormatter !== PriceFormatter.discuss && (
                    <>
                        <Input
                            id="createHorseServicePriceInput"
                            placeholder="Цена в рублях по умолчанию"
                            value={price}
                            onChange={(e) => { onResetValidation(); setPrice(Number(e.target.value)); }}
                            type="number"
                            allowClear={true}
                        />
                        {validationErrors.hasOwnProperty('price') ? (
                            <div className="text-sm text-red-500">{validationErrors.price.join('\n')}</div>
                        ) : (
                            <div className="text-sm text-gray-500">При привязке услуги к лошади цену можно будет переопределить для каждой лошади</div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};



