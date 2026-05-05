import { SiteSettingOutDto, SiteSettingsCreateInDto, SiteSettingsUpdateInDto, SiteSettingType } from "@/types/api/siteSettings";
import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, InputNumber, Modal, Popconfirm, Select, Switch, TimePicker } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs, { Dayjs } from "dayjs";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";

export type SiteSettingsCreateUpdateModalProps = {
    open: boolean;
    onClose: () => void;
    selectedSiteSetting: SiteSettingOutDto | null;
    onCreate: (createData: SiteSettingsCreateInDto) => void;
    onUpdate: (siteSettingId: UUID, updateData: SiteSettingsUpdateInDto) => void;
    onDelete: (priceId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
};

export const SiteSettingsCreateUpdateModal: React.FC<SiteSettingsCreateUpdateModalProps> = ({
    open,
    onClose,
    selectedSiteSetting,
    onCreate,
    onUpdate,
    onDelete,
    validationErrors,
    onResetValidation,
}) => {

    const [key, setKey] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [type, setType] = useState<SiteSettingType>(SiteSettingType.string);
    const [value, setValue] = useState<string>('');
    const [valueNumber, setValueNumber] = useState<number | null>(null);
    const [valueBoolean, setValueBoolean] = useState<boolean>(false);
    const [valueDate, setValueDate] = useState<Dayjs | null>(null);
    const [valueTime, setValueTime] = useState<Dayjs | null>(null);
    const [valueDateTime, setValueDateTime] = useState<Dayjs | null>(null);

    // Функция для конвертации значения в string
    const convertValueToString = (): string => {
        switch (type) {
            case SiteSettingType.number:
                return valueNumber !== null ? String(valueNumber) : '';
            case SiteSettingType.float:
                return valueNumber !== null ? String(valueNumber) : '';
            case SiteSettingType.boolean:
                return String(valueBoolean);
            case SiteSettingType.date:
                return valueDate ? valueDate.format('YYYY-MM-DD') : '';
            case SiteSettingType.time:
                return valueTime ? valueTime.format('HH:mm') : '';
            case SiteSettingType.datetime:
                return valueDateTime ? valueDateTime.format('YYYY-MM-DD HH:mm') : '';
            case SiteSettingType.object:
            case SiteSettingType.string:
            default:
                return value;
        }
    };

    // Функция для парсинга строки в значение нужного типа
    const parseValueFromString = (str: string, settingType: SiteSettingType) => {
        switch (settingType) {
            case SiteSettingType.number:
                const num = parseInt(str, 10);
                return isNaN(num) ? null : num;
            case SiteSettingType.float:
                const float = parseFloat(str);
                return isNaN(float) ? null : float;
            case SiteSettingType.boolean:
                return str === 'true' || str === 'True' || str === '1';
            case SiteSettingType.date:
                return str ? dayjs(str, 'YYYY-MM-DD') : null;
            case SiteSettingType.time:
                return str ? dayjs(str, 'HH:mm') : null;
            case SiteSettingType.datetime:
                return str ? dayjs(str, 'YYYY-MM-DD HH:mm') : null;
            case SiteSettingType.object:
            case SiteSettingType.string:
            default:
                return str;
        }
    };

    useEffect(() => {
        if (open) {
            onResetValidation();
            if (selectedSiteSetting) {
                setKey(selectedSiteSetting.key);
                setName(selectedSiteSetting.name);
                setDescription(selectedSiteSetting.description || '');
                setType(selectedSiteSetting.type);
                const parsedValue = parseValueFromString(selectedSiteSetting.value, selectedSiteSetting.type);
                if (selectedSiteSetting.type === SiteSettingType.number || selectedSiteSetting.type === SiteSettingType.float) {
                    setValueNumber(parsedValue as number | null);
                    setValue('');
                } else if (selectedSiteSetting.type === SiteSettingType.boolean) {
                    setValueBoolean(parsedValue as boolean);
                    setValue('');
                } else if (selectedSiteSetting.type === SiteSettingType.date) {
                    setValueDate(parsedValue as Dayjs | null);
                    setValue('');
                } else if (selectedSiteSetting.type === SiteSettingType.time) {
                    setValueTime(parsedValue as Dayjs | null);
                    setValue('');
                } else if (selectedSiteSetting.type === SiteSettingType.datetime) {
                    setValueDateTime(parsedValue as Dayjs | null);
                    setValue('');
                } else {
                    setValue(parsedValue as string);
                    setValueNumber(null);
                    setValueBoolean(false);
                    setValueDate(null);
                    setValueTime(null);
                    setValueDateTime(null);
                }
            } else {
                setKey('');
                setName('');
                setDescription('');
                setType(SiteSettingType.string);
                setValue('');
                setValueNumber(null);
                setValueBoolean(false);
                setValueDate(null);
                setValueTime(null);
                setValueDateTime(null);
            }
        }
    }, [open, selectedSiteSetting, onResetValidation]);

    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>
    ]

    if (selectedSiteSetting) {
        footer.push(
            <Popconfirm
            key="deleteConfirm"
                title="Удалить настройку сайта"
                description="Вы уверены, что хотите удалить эту настройку сайта?"
                okText="Да"
                okType="danger"
                cancelText="Нет"
                onConfirm={() => onDelete(selectedSiteSetting.id)}
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
                onClick={() => onUpdate(selectedSiteSetting.id, { key: key, name: name, description: description, type: type, value: convertValueToString() })}>
                <EditOutlined />Изменить
            </Button>
        );
    } else {
        footer.push(
            <Button
            key="add"
            type="primary"
            onClick={() => onCreate({ key: key, name: name, description: description, type: type, value: convertValueToString() })}>
                <PlusOutlined />Добавить
            </Button>
        );
    }

    const handlePressEnter = () => {
        if (selectedSiteSetting) {
            onUpdate(selectedSiteSetting.id, { key: key, name: name, description: description, type: type, value: convertValueToString() });
        } else {
            onCreate({ key: key, name: name, description: description, type: type, value: convertValueToString() });
        }
    }

    const handleTypeChange = (newType: SiteSettingType) => {
        setType(newType);
        // Сбрасываем все значения при смене типа
        setValue('');
        setValueNumber(null);
        setValueBoolean(false);
        setValueDate(null);
        setValueTime(null);
        setValueDateTime(null);
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
            title={selectedSiteSetting ? 'Изменить настройку сайта' : 'Добавить настройку сайта'}
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createSiteSettingKeyInput">Ключ для API</label>
                <Input
                    id="createSiteSettingKeyInput"
                    placeholder="Ключ для API"
                    value={key}
                    onChange={(e) => handleInput(setKey, e.target.value)}
                    maxLength={63}
                    allowClear={true}
                    onPressEnter={handlePressEnter}
                />
                {validationErrors.hasOwnProperty('key') ? (
                    <div className="text-sm text-red-500">{validationErrors.key.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{key.length}/63</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createSiteSettingNameInput">Название</label>
                <Input
                    id="createSiteSettingNameInput"
                    placeholder="Название"
                    value={name}
                    onChange={(e) => handleInput(setName, e.target.value)}
                    maxLength={63}
                    allowClear={true}
                    onPressEnter={handlePressEnter}
                />
                {validationErrors.hasOwnProperty('name') ? (
                    <div className="text-sm text-red-500">{validationErrors.name.join('\n')}</div>
                ) : (
                    <div className="text-sm text-gray-500">{name.length}/63</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createSiteSettingDescriptionInput">Описание</label>
                <TextArea
                    id="createSiteSettingDescriptionInput"
                    placeholder="Описание"
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
                <label htmlFor="createSiteSettingTypeInput">Тип</label>
                <Select
                    id="createSiteSettingTypeInput"
                    placeholder="Тип значения"
                    value={type}
                    onChange={(value) => handleTypeChange(value as SiteSettingType)}
                    options={[
                        { value: SiteSettingType.string, label: 'Строка' },
                        { value: SiteSettingType.number, label: 'Число' },
                        { value: SiteSettingType.float, label: 'Число с плавающей точкой' },
                        { value: SiteSettingType.boolean, label: 'Булево' },
                        { value: SiteSettingType.object, label: 'Объект JSON' },
                        { value: SiteSettingType.date, label: 'Дата (YYYY-MM-DD)' },
                        { value: SiteSettingType.time, label: 'Время (HH:MM)' },
                        { value: SiteSettingType.datetime, label: 'Дата и время (YYYY-MM-DD HH:MM)' },
                      ]}
                />
                {validationErrors.hasOwnProperty('type') && (
                    <div className="text-sm text-red-500">{validationErrors.type.join('\n')}</div>
                )}
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="createSiteSettingValueInput">Значение</label>
                {type === SiteSettingType.string && (
                    <TextArea
                        id="createSiteSettingValueInput"
                        placeholder="Введите строку"
                        value={value}
                        onChange={(e) => handleInput(setValue, e.target.value)}
                        allowClear={true}
                        autoSize={{ minRows: 1, maxRows: 4 }}
                    />
                )}
                {type === SiteSettingType.number && (
                    <InputNumber
                        id="createSiteSettingValueInput"
                        placeholder="Введите число"
                        value={valueNumber}
                        onChange={(val) => {
                            if (Object.keys(validationErrors).length > 0) {
                                onResetValidation();
                            }
                            setValueNumber(val);
                        }}
                        style={{ width: '100%' }}
                    />
                )}
                {type === SiteSettingType.float && (
                    <InputNumber
                        id="createSiteSettingValueInput"
                        placeholder="Введите число с плавающей точкой"
                        value={valueNumber}
                        onChange={(val) => {
                            if (Object.keys(validationErrors).length > 0) {
                                onResetValidation();
                            }
                            setValueNumber(val);
                        }}
                        step={0.01}
                        style={{ width: '100%' }}
                    />
                )}
                {type === SiteSettingType.boolean && (
                    <Switch
                        id="createSiteSettingValueInput"
                        checked={valueBoolean}
                        onChange={(checked) => {
                            if (Object.keys(validationErrors).length > 0) {
                                onResetValidation();
                            }
                            setValueBoolean(checked);
                        }}
                        checkedChildren="Да"
                        unCheckedChildren="Нет"
                    />
                )}
                {type === SiteSettingType.object && (
                    <TextArea
                        id="createSiteSettingValueInput"
                        placeholder='Введите JSON объект, например: {"key": "value"}'
                        value={value}
                        onChange={(e) => handleInput(setValue, e.target.value)}
                        allowClear={true}
                        rows={4}
                    />
                )}
                {type === SiteSettingType.date && (
                    <DatePicker
                        id="createSiteSettingValueInput"
                        placeholder="Выберите дату"
                        value={valueDate}
                        onChange={(date) => {
                            if (Object.keys(validationErrors).length > 0) {
                                onResetValidation();
                            }
                            setValueDate(date);
                        }}
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                    />
                )}
                {type === SiteSettingType.time && (
                    <TimePicker
                        id="createSiteSettingValueInput"
                        placeholder="Выберите время"
                        value={valueTime}
                        onChange={(time) => {
                            if (Object.keys(validationErrors).length > 0) {
                                onResetValidation();
                            }
                            setValueTime(time);
                        }}
                        format="HH:mm"
                        style={{ width: '100%' }}
                    />
                )}
                {type === SiteSettingType.datetime && (
                    <DatePicker
                        id="createSiteSettingValueInput"
                        placeholder="Выберите дату и время"
                        value={valueDateTime}
                        onChange={(date) => {
                            if (Object.keys(validationErrors).length > 0) {
                                onResetValidation();
                            }
                            setValueDateTime(date);
                        }}
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        style={{ width: '100%' }}
                    />
                )}
                {validationErrors.hasOwnProperty('value') && (
                    <div className="text-sm text-red-500">{validationErrors.value.join('\n')}</div>
                )}
            </div>
        </Modal>
    );
};



