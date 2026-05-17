import React from "react";
import { Alert, Button, Empty, Input, Modal, Radio, Space, Spin, Typography } from "antd";
import type { UUID } from "crypto";
import type { HorseOutDto } from "@/types/api/horses";
import type { PedigreePickerIntent } from "../../hooks/useHorsePedigree";
import {
    getHorseBirthDateText,
    getHorsePhotoUrl,
    getHorseSexMark,
    getHorseSexText,
} from "./HorsePedigreeCard";

const getSubtitle = (intent: PedigreePickerIntent | null) => {
    if (!intent) return "";
    const prefix = intent.action === "add" ? "Добавить" : "Заменить";
    if (intent.mode === "sire") return `${prefix} отца`;
    if (intent.mode === "dam") return `${prefix} мать`;
    return `${prefix} потомка`;
};

export type HorsePedigreePickerModalProps = {
    open: boolean;
    intent: PedigreePickerIntent | null;
    candidates: HorseOutDto[];
    total: number;
    loading: boolean;
    error: string | null;
    search: string;
    onSearchChange: (value: string) => void;
    offset: number;
    limit: number;
    onOffsetChange: (offset: number) => void;
    selectedCandidateId: UUID | null;
    onSelectCandidate: (id: UUID) => void;
    onCancel: () => void;
    onSave: () => void;
    mutationLoading: boolean;
    operationError: string | null;
};

export const HorsePedigreePickerModal: React.FC<HorsePedigreePickerModalProps> = ({
    open,
    intent,
    candidates,
    total,
    loading,
    error,
    search,
    onSearchChange,
    offset,
    limit,
    onOffsetChange,
    selectedCandidateId,
    onSelectCandidate,
    onCancel,
    onSave,
    mutationLoading,
    operationError,
}) => {
    const currentChunk = Math.floor(offset / limit) + 1;
    const chunksTotal = Math.max(1, Math.ceil(total / limit));
    const canGoBack = offset > 0;
    const canGoForward = offset + limit < total;

    return (
        <Modal
            open={open}
            title={
                <div>
                    <div>Выберите лошадь</div>
                    <Typography.Text type="secondary">{getSubtitle(intent)}</Typography.Text>
                </div>
            }
            onCancel={onCancel}
            width={720}
            destroyOnHidden
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Отмена
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    onClick={onSave}
                    disabled={!selectedCandidateId || Boolean(error)}
                    loading={mutationLoading}
                >
                    Сохранить
                </Button>,
            ]}
        >
            <div style={{ display: "grid", gap: 12 }}>
                <Input
                    placeholder="Поиск"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    allowClear
                />
                <Typography.Text type="secondary">Найдено: {total} лошадей</Typography.Text>

                {(error || operationError) && (
                    <Alert
                        type="error"
                        showIcon
                        title={error || operationError}
                    />
                )}

                <div
                    data-testid="horse-pedigree-picker-results"
                    style={{
                        minHeight: 280,
                        maxHeight: "52vh",
                        overflowY: "auto",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: 8,
                    }}
                >
                    <Spin spinning={loading}>
                        {candidates.length === 0 && !loading ? (
                            <Empty description="Ничего не найдено. Попробуйте изменить поисковый запрос" />
                        ) : (
                            <div style={{ display: "grid", gap: 8 }}>
                                {candidates.map((candidate) => {
                                    const selected = candidate.id === selectedCandidateId;
                                    const photoUrl = getHorsePhotoUrl(candidate);
                                    const birthDate = getHorseBirthDateText(candidate);
                                    const sexText = getHorseSexText(candidate.sex);
                                    const sexMark = getHorseSexMark(candidate.sex);
                                    const coatColor = candidate.coat_color?.short_name
                                        ?? candidate.coat_color?.name
                                        ?? "—";
                                    const breed = candidate.breed?.short_name
                                        ?? candidate.breed?.name
                                        ?? "—";

                                    return (
                                        <button
                                            type="button"
                                            key={candidate.id.toString()}
                                            onClick={() => onSelectCandidate(candidate.id)}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "56px minmax(0, 1fr) auto",
                                                gap: 12,
                                                alignItems: "center",
                                                width: "100%",
                                                minHeight: 88,
                                                padding: 10,
                                                textAlign: "left",
                                                border: `1px solid ${selected ? "#1677ff" : "#d9d9d9"}`,
                                                borderRadius: 8,
                                                background: selected ? "#e6f4ff" : "#fff",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 6,
                                                    background: photoUrl
                                                        ? `center / cover url("${photoUrl}")`
                                                        : "#f0f0f0",
                                                    color: "#8c8c8c",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {!photoUrl ? candidate.name.slice(0, 1).toUpperCase() : ""}
                                            </span>
                                            <span style={{ minWidth: 0 }}>
                                                <Typography.Text strong ellipsis style={{ display: "block" }}>
                                                    {candidate.name} {sexMark}
                                                </Typography.Text>
                                                <Typography.Text type="secondary" style={{ display: "block" }}>
                                                    {[sexText, birthDate].filter(Boolean).join(" · ")}
                                                </Typography.Text>
                                                <Typography.Text style={{ display: "block" }}>
                                                    {coatColor} · {breed}
                                                </Typography.Text>
                                                {candidate.this_stable && (
                                                    <Typography.Text type="secondary" style={{ display: "block" }}>
                                                        В этой конюшне
                                                    </Typography.Text>
                                                )}
                                            </span>
                                            <Radio checked={selected} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </Spin>
                </div>

                <Space style={{ justifyContent: "flex-end" }}>
                    <Button
                        size="small"
                        disabled={!canGoBack}
                        onClick={() => onOffsetChange(Math.max(0, offset - limit))}
                    >
                        Назад
                    </Button>
                    <Typography.Text type="secondary">
                        {currentChunk} / {chunksTotal}
                    </Typography.Text>
                    <Button
                        size="small"
                        disabled={!canGoForward}
                        onClick={() => onOffsetChange(offset + limit)}
                    >
                        Вперед
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};
