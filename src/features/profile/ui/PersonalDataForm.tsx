import { Button, Card, Input } from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import type { ProfileFormState, UseProfileFormReturn } from "../hooks/useProfileForm";

const MAX_LENGTH = 63;

type PersonalDataFormProps = Pick<
    UseProfileFormReturn,
    "formState" | "isDirty" | "saving" | "setField" | "save" | "reset"
>;

type FieldConfig = {
    key: keyof ProfileFormState;
    label: string;
    placeholder: string;
};

const FIELDS: FieldConfig[] = [
    { key: "last_name", label: "Фамилия", placeholder: "Введите фамилию" },
    { key: "first_name", label: "Имя", placeholder: "Введите имя" },
    { key: "middle_name", label: "Отчество", placeholder: "Введите отчество" },
];

export function PersonalDataForm({ formState, isDirty, saving, setField, save, reset }: PersonalDataFormProps) {
    return (
        <Card
            title={
                <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Личные данные</div>
                    <div style={{ fontWeight: 400, fontSize: 13, color: "#8c8c8c" }}>
                        Обновите своё ФИО
                    </div>
                </div>
            }
        >
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {FIELDS.map(({ key, label, placeholder }) => {
                    const value = formState[key];
                    const count = value.length;
                    const isOver = count > MAX_LENGTH;
                    return (
                        <div key={key} style={{ flex: "1 1 160px", minWidth: 140 }}>
                            <div style={{ marginBottom: 4, fontWeight: 500 }}>{label}</div>
                            <Input
                                value={value}
                                placeholder={placeholder}
                                onChange={(e) => setField(key, e.target.value)}
                                status={isOver ? "error" : undefined}
                                aria-label={label}
                            />
                            <div
                                style={{
                                    fontSize: 12,
                                    marginTop: 2,
                                    color: isOver ? "red" : "#8c8c8c",
                                    textAlign: "right",
                                }}
                            >
                                {count} / {MAX_LENGTH}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <Button
                    icon={<CloseOutlined />}
                    disabled={!isDirty || saving}
                    onClick={reset}
                >
                    Сбросить
                </Button>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    disabled={!isDirty}
                    loading={saving}
                    onClick={save}
                >
                    Сохранить изменения
                </Button>
            </div>
        </Card>
    );
}
