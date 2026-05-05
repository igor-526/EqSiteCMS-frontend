import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Modal, Popconfirm, Radio } from "antd";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import { HorseOwnerCreateInDto, HorseOwnerOutDto, HorseOwnerTypeEnum, HorseOwnerUpdateInDto } from "@/types/api/horseOwners";
import TextArea from "antd/es/input/TextArea";

const horseOwnerTypeOptions = [
    { key: 'person', label: 'Физическое лицо', value: HorseOwnerTypeEnum.PERSON },
    { key: 'company', label: 'Организация', value: HorseOwnerTypeEnum.COMPANY },
];

export type HorseOwnersCreateUpdateModalProps = {
    open: boolean;
    onClose: () => void;
    selectedHorseOwner: HorseOwnerOutDto | null;
    onCreate: (createData: HorseOwnerCreateInDto) => void;
    onUpdate: (horseOwnerId: UUID, updateData: HorseOwnerUpdateInDto) => void;
    onDelete: (horseOwnerId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
};

export const HorseOwnersCreateUpdateModal: React.FC<HorseOwnersCreateUpdateModalProps> = ({
    open,
    onClose,
    selectedHorseOwner,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation,
}) => {

    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [type, setType] = useState<HorseOwnerTypeEnum>(HorseOwnerTypeEnum.PERSON);
    const [address, setAddress] = useState<string>('');
    const [phoneNumbers, setPhoneNumbers] = useState<string>('');

    const phoneNumbersStringify = (phoneNumbers: string[]) => {
        return phoneNumbers.join('\n');
    }

    const phoneNumbersParse = (phoneNumbers: string) => {
        return phoneNumbers.split('\n').filter(phone => phone.trim() !== '');
    }

    useEffect(() => {
        if (open) {
            onResetValidation();
            if (selectedHorseOwner) {
                setName(selectedHorseOwner.name);
                setDescription(selectedHorseOwner.description || '');
                setType(selectedHorseOwner.type);
                setAddress(selectedHorseOwner.address || '');
                setPhoneNumbers(phoneNumbersStringify(selectedHorseOwner.phone_numbers || []));
            } else {
                setName('');
                setDescription('');
                setType(HorseOwnerTypeEnum.PERSON);
                setAddress('');
                setPhoneNumbers('');
            }
        }
    }, [open, selectedHorseOwner, onResetValidation]);

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>
    ]

    if (selectedHorseOwner) {
        footer.push(
            <Popconfirm
                key="deleteConfirm"
                title="Удалить владельца"
                description="Вы уверены, что хотите удалить этого владельца?"
                okText="Да"
                okType="danger"
                cancelText="Нет"
                onConfirm={() => onDelete(selectedHorseOwner.id)}
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
                onClick={() => onUpdate(selectedHorseOwner.id, { name: name, description: description, type: type, address: address, phone_numbers: phoneNumbersParse(phoneNumbers) })}>
                <EditOutlined />Изменить
            </Button>
        );
    } else {
        footer.push(
            <Button
                key="add"
                type="primary"
                onClick={() => onCreate({ name: name, description: description, type: type, address: address, phone_numbers: phoneNumbersParse(phoneNumbers) })}>
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
            title={selectedHorseOwner ? 'Изменить владельца' : 'Добавить владельца'}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseOwnerTypeInput">Тип владельца</label>
                <Radio.Group
                    block
                    options={horseOwnerTypeOptions}
                    value={type}
                    onChange={(e) => {onResetValidation(); setType(e.target.value as HorseOwnerTypeEnum);}}
                    optionType="button"
                />
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseOwnerNameInput">Наименование|имя владельца</label>
                <Input
                    id="createHorseOwnerNameInput"
                    placeholder="Наименование|имя владельца"
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
                <label htmlFor="createHorseOwnerDescriptionInput">Описание владельца</label>
                <Input
                    id="createHorseOwnerDescriptionInput"
                    placeholder="Описание владельца"
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
                <label htmlFor="createHorseOwnerAddressInput">Адрес владельца</label>
                <Input
                    id="createHorseOwnerAddressInput"
                    placeholder="Адрес владельца"
                    value={address}
                    onChange={(e) => handleInput(setAddress, e.target.value)}
                    maxLength={63}
                    allowClear={true}
                />
                {validationErrors.hasOwnProperty('address') ? (
                    <div className="text-sm text-red-500">{validationErrors.address.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{address.length}/511</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createHorseOwnerPhoneNumbersInput">Телефоны владельца</label>
                <TextArea
                    id="createHorseOwnerPhoneNumbersInput"
                    placeholder="Телефоны владельца"
                    value={phoneNumbers}
                    onChange={(e) => handleInput(setPhoneNumbers, e.target.value)}
                    rows={4}
                    allowClear={true}
                />
                <div className="text-sm text-gray-500">Введите номера телефонов по одному на строку в формате +79991234567</div>
                {validationErrors.hasOwnProperty('phone_numbers') && (
                    <div className="text-sm text-red-500">{validationErrors.phone_numbers.join('\n')}</div>
                )}
            </div>
        </Modal>
    );
};



