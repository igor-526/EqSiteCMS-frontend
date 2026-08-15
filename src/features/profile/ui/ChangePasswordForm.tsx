import { Button, Card, Input } from "antd";
import { ClearOutlined, LockOutlined } from "@ant-design/icons";
import type { UsePasswordFormReturn } from "../hooks/usePasswordForm";

type ChangePasswordFormProps = Pick<
  UsePasswordFormReturn,
  | "formState"
  | "passwordStrength"
  | "strengthLabel"
  | "strengthColor"
  | "saving"
  | "setField"
  | "changePassword"
  | "clear"
>;

const STRENGTH_BARS = 4;

export function ChangePasswordForm({
  formState,
  passwordStrength,
  strengthLabel,
  strengthColor,
  saving,
  setField,
  changePassword,
  clear,
}: ChangePasswordFormProps) {
  return (
    <Card
      title={<div style={{ fontWeight: 600, fontSize: 16 }}>Смена пароля</div>}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Текущий пароль</div>
        <Input.Password
          value={formState.current_password}
          placeholder="Введите текущий пароль"
          onChange={(e) => setField("current_password", e.target.value)}
          aria-label="Текущий пароль"
        />
      </div>
      <div
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}
      >
        <div style={{ flex: "1 1 200px", minWidth: 180 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Новый пароль</div>
          <Input.Password
            value={formState.new_password}
            placeholder="Введите новый пароль"
            onChange={(e) => setField("new_password", e.target.value)}
            aria-label="Новый пароль"
          />
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {Array.from({ length: STRENGTH_BARS }).map((_, index) => (
                <div
                  key={index}
                  aria-label={`strength-bar-${index}`}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background:
                      index < passwordStrength
                        ? strengthColor || "#d9d9d9"
                        : "#d9d9d9",
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>
            {strengthLabel && (
              <div style={{ fontSize: 12, color: strengthColor }}>
                {strengthLabel}
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: "1 1 200px", minWidth: 180 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>
            Повторите новый пароль
          </div>
          <Input.Password
            value={formState.confirm_new_password}
            placeholder="Повторите новый пароль"
            onChange={(e) => setField("confirm_new_password", e.target.value)}
            aria-label="Повторите новый пароль"
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button icon={<ClearOutlined />} onClick={clear} disabled={saving}>
          Очистить
        </Button>
        <Button
          type="primary"
          icon={<LockOutlined />}
          loading={saving}
          onClick={changePassword}
        >
          Сменить пароль
        </Button>
      </div>
    </Card>
  );
}
