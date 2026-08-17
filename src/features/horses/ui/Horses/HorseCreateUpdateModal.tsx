import {
  HorseCreateInDto,
  HorseDateMode,
  HorseOutDto,
  HorseSex,
  HorseUpdateInDto,
} from "@/types/api/horses";
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import {
  HORSES_PAGE_SCOPES_ACTIONS,
  useHorsePageActionScopes,
} from "../../hooks/useHorseScopes";

const { TextArea } = Input;
const { Text } = Typography;

const SEX_OPTIONS = [
  { label: "Жеребец", value: "male" },
  { label: "Кобыла", value: "female" },
  { label: "Мерин", value: "geld" },
];

const DATE_MODE_OPTIONS = [
  { label: "Год", value: "y" },
  { label: "Год и месяц", value: "ym" },
  { label: "Полная дата", value: "ymd" },
  { label: "Скрыть", value: "hide" },
];

const THIS_STABLE_OPTIONS = [
  { label: "Наша", value: "true" },
  { label: "Чужая", value: "false" },
];

export type HorseCreateUpdateModalProps = {
  open: boolean;
  onClose: () => void;
  selectedHorse: HorseOutDto | null;
  onCreate: (createData: HorseCreateInDto) => Promise<boolean>;
  onUpdate: (horseId: UUID, updateData: HorseUpdateInDto) => Promise<boolean>;
  onDelete: (horseId: UUID) => Promise<boolean>;
  validationErrors: Record<string, string[]>;
  onResetValidation: () => void;
  breedOptions: { label: string; value: string }[];
  breedOptionsLoading?: boolean;
  coatColorOptions: { label: string; value: string }[];
  coatColorOptionsLoading?: boolean;
  ownerOptions: { label: string; value: string }[];
  ownerOptionsLoading?: boolean;
  onCoatColorSearch?: (value: string) => void;
  onBreedSearch?: (value: string) => void;
  onOwnerSearch?: (value: string) => void;
};

export const HorseCreateUpdateModal: React.FC<HorseCreateUpdateModalProps> = ({
  open,
  onClose,
  selectedHorse,
  onCreate,
  onUpdate,
  onDelete,
  validationErrors,
  onResetValidation,
  breedOptions,
  breedOptionsLoading = false,
  coatColorOptions,
  coatColorOptionsLoading = false,
  ownerOptions,
  ownerOptionsLoading = false,
  onCoatColorSearch,
  onBreedSearch,
  onOwnerSearch,
}) => {
  const { hasPermission } = useHorsePageActionScopes();
  const canCreate = hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE);
  const canUpdate = hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE);
  const canDelete = hasPermission(HORSES_PAGE_SCOPES_ACTIONS.DELETE_HORSE);

  const [name, setName] = useState<string>("");
  const [pedigreeName, setPedigreeName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [thisStable, setThisStable] = useState<boolean>(false);
  const [sex, setSex] = useState<HorseSex>("male");
  const [breedId, setBreedId] = useState<string | null>(null);
  const [coatColorId, setCoatColorId] = useState<string | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [bdate, setBdate] = useState<string | null>(null);
  const [bdateMode, setBdateMode] = useState<HorseDateMode>("hide");
  const [ddate, setDdate] = useState<string | null>(null);
  const [ddateMode, setDdateMode] = useState<HorseDateMode>("hide");
  const [horseOwnerId, setHorseOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      onResetValidation();
      if (selectedHorse) {
        setName(selectedHorse.name);
        setPedigreeName(selectedHorse.pedigree_name ?? "");
        setDescription(selectedHorse.description ?? "");
        setThisStable(selectedHorse.this_stable);
        setSex(selectedHorse.sex as HorseSex);
        setBreedId(selectedHorse.breed?.id?.toString() ?? null);
        setCoatColorId(selectedHorse.coat_color?.id?.toString() ?? null);
        setHeight(selectedHorse.height ?? null);
        setBdate(selectedHorse.bdate ?? null);
        setBdateMode((selectedHorse.bdate_mode as HorseDateMode) ?? "hide");
        setDdate(selectedHorse.ddate ?? null);
        setDdateMode((selectedHorse.ddate_mode as HorseDateMode) ?? "hide");
        setHorseOwnerId(selectedHorse.horse_owner?.id?.toString() ?? null);
      } else {
        setName("");
        setPedigreeName("");
        setDescription("");
        setThisStable(false);
        setSex("male");
        setBreedId(null);
        setCoatColorId(null);
        setHeight(null);
        setBdate(null);
        setBdateMode("hide");
        setDdate(null);
        setDdateMode("hide");
        setHorseOwnerId(null);
      }
    }
  }, [open, selectedHorse, onResetValidation]);

  const handleInput = (setter: (value: string) => void, value: string) => {
    if (Object.keys(validationErrors).length > 0) {
      onResetValidation();
    }
    setter(value);
  };

  const buildCreatePayload = (): HorseCreateInDto => ({
    name,
    pedigree_name: pedigreeName === "" ? null : pedigreeName,
    description: description || null,
    this_stable: thisStable,
    sex,
    breed_id: breedId as UUID | null,
    coat_color_id: coatColorId as UUID | null,
    height,
    bdate,
    bdate_mode: bdateMode,
    ddate,
    ddate_mode: ddateMode,
    horse_owner_id: horseOwnerId as UUID | null,
  });

  const buildUpdatePayload = (): HorseUpdateInDto => ({
    name,
    description: description || null,
    this_stable: thisStable,
    sex,
    breed_id: breedId as UUID | null,
    coat_color_id: coatColorId as UUID | null,
    height,
    bdate,
    bdate_mode: bdateMode,
    ddate,
    ddate_mode: ddateMode,
    horse_owner_id: horseOwnerId as UUID | null,
    ...(pedigreeName !== (selectedHorse?.pedigree_name ?? "")
      ? { pedigree_name: pedigreeName === "" ? null : pedigreeName }
      : {}),
  });

  const handleCreate = async () => {
    if (submitting || !canCreate) return;
    setSubmitting(true);
    try {
      await onCreate(buildCreatePayload());
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (submitting || !canUpdate || !selectedHorse) return;
    setSubmitting(true);
    try {
      await onUpdate(selectedHorse.id, buildUpdatePayload());
    } finally {
      setSubmitting(false);
    }
  };

  const footer: React.ReactNode[] = [
    <Button key="close" color="default" variant="outlined" onClick={onClose}>
      <CloseOutlined />
      Закрыть
    </Button>,
  ];

  if (selectedHorse && canDelete) {
    footer.push(
      <Popconfirm
        key="deleteConfirm"
        title="Удалить лошадь"
        description="Вы уверены, что хотите удалить эту лошадь?"
        okText="Да"
        okType="danger"
        cancelText="Нет"
        onConfirm={() => onDelete(selectedHorse.id)}
      >
        <Button key="delete" color="danger" variant="outlined">
          <DeleteOutlined />
          Удалить
        </Button>
      </Popconfirm>,
    );
  }

  if (selectedHorse && canUpdate) {
    footer.push(
      <Button
        key="update"
        type="primary"
        loading={submitting}
        disabled={submitting}
        onClick={handleUpdate}
      >
        <EditOutlined />
        Изменить
      </Button>,
    );
  } else if (!selectedHorse && canCreate) {
    footer.push(
      <Button
        key="create"
        type="primary"
        loading={submitting}
        disabled={submitting}
        onClick={handleCreate}
      >
        <PlusOutlined />
        Добавить
      </Button>,
    );
  }

  return (
    <Modal
      open={open}
      title={selectedHorse ? "Редактировать лошадь" : "Добавить лошадь"}
      onCancel={onClose}
      footer={footer}
      width={600}
      styles={{
        body: {
          overflowY: "auto",
          maxHeight: "calc(100vh - 250px)",
        },
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Основные данные */}
        <div>
          <Text
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(0,0,0,0.55)",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Основные данные
          </Text>
          <div className="flex flex-col gap-2">
            <label htmlFor="horseNameInput">Кличка *</label>
            <Input
              id="horseNameInput"
              placeholder="Кличка лошади"
              value={name}
              onChange={(e) => handleInput(setName, e.target.value)}
              maxLength={255}
              allowClear
              status={validationErrors.name ? "error" : undefined}
            />
            {validationErrors.name && (
              <div className="text-sm text-red-500">
                {validationErrors.name.join(", ")}
              </div>
            )}
            <label htmlFor="horsePedigreeNameInput">Кличка в родословной</label>
            <Input
              id="horsePedigreeNameInput"
              placeholder="Кличка в родословной"
              value={pedigreeName}
              onChange={(event) =>
                handleInput(setPedigreeName, event.target.value)
              }
              maxLength={63}
              allowClear
              status={validationErrors.pedigree_name ? "error" : undefined}
            />
            {validationErrors.pedigree_name && (
              <div className="text-sm text-red-500">
                {validationErrors.pedigree_name.join(", ")}
              </div>
            )}
            <label htmlFor="horseDescriptionInput">Описание</label>
            <TextArea
              id="horseDescriptionInput"
              placeholder="Описание лошади"
              value={description}
              onChange={(e) => handleInput(setDescription, e.target.value)}
              rows={3}
              allowClear
            />
            <Row gutter={8}>
              <Col span={12}>
                <div className="text-xs text-gray-500 mb-1">База</div>
                <Select
                  value={thisStable ? "true" : "false"}
                  onChange={(v) => setThisStable(v === "true")}
                  options={THIS_STABLE_OPTIONS}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-500 mb-1">Пол</div>
                <Select
                  value={sex}
                  onChange={(v) => setSex(v as HorseSex)}
                  options={SEX_OPTIONS}
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>
          </div>
        </div>

        {/* Дополнительно */}
        <div>
          <Text
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(0,0,0,0.55)",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Дополнительно
          </Text>
          <div className="flex flex-col gap-2">
            <label>Порода</label>
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={onBreedSearch}
              placeholder="Выберите породу"
              value={breedId ?? undefined}
              onChange={(v) => setBreedId(v ?? null)}
              options={breedOptions}
              loading={breedOptionsLoading}
              style={{ width: "100%" }}
            />
            <label>Масть</label>
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={onCoatColorSearch}
              placeholder="Выберите масть"
              value={coatColorId ?? undefined}
              onChange={(v) => setCoatColorId(v ?? null)}
              options={coatColorOptions}
              loading={coatColorOptionsLoading}
              style={{ width: "100%" }}
            />
            <label>Рост (см)</label>
            <InputNumber
              min={0}
              max={300}
              value={height}
              onChange={(v) => setHeight(v)}
              placeholder="Рост в сантиметрах"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Даты */}
        <div>
          <Text
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(0,0,0,0.55)",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Даты
          </Text>
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-xs text-gray-500 mb-1">Дата рождения</div>
              <Row gutter={8}>
                <Col flex={1}>
                  <DatePicker
                    value={bdate ? dayjs(bdate) : null}
                    onChange={(d) =>
                      setBdate(d ? d.format("YYYY-MM-DD") : null)
                    }
                    placeholder="Дата рождения"
                    allowClear
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col>
                  <Select
                    value={bdateMode}
                    onChange={(v) => setBdateMode(v as HorseDateMode)}
                    options={DATE_MODE_OPTIONS}
                    style={{ width: 130 }}
                  />
                </Col>
              </Row>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Дата смерти</div>
              <Row gutter={8}>
                <Col flex={1}>
                  <DatePicker
                    value={ddate ? dayjs(ddate) : null}
                    onChange={(d) =>
                      setDdate(d ? d.format("YYYY-MM-DD") : null)
                    }
                    placeholder="Дата смерти"
                    allowClear
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col>
                  <Select
                    value={ddateMode}
                    onChange={(v) => setDdateMode(v as HorseDateMode)}
                    options={DATE_MODE_OPTIONS}
                    style={{ width: 130 }}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </div>

        {/* Владелец */}
        <div>
          <Text
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(0,0,0,0.55)",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Владелец
          </Text>
          <Select
            allowClear
            showSearch
            filterOption={false}
            onSearch={onOwnerSearch}
            placeholder="Выберите владельца"
            value={horseOwnerId ?? undefined}
            onChange={(v) => setHorseOwnerId(v ?? null)}
            options={ownerOptions}
            loading={ownerOptionsLoading}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </Modal>
  );
};
