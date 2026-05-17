import React from "react";
import { Alert, Button, Empty, Grid, Modal, Typography } from "antd";
import type { MenuProps } from "antd";
import type { UUID } from "crypto";
import type { HorseOutDto, HorseWithPedigreeOutDto } from "@/types/api/horses";
import { useHorsePedigree } from "../../hooks/useHorsePedigree";
import { HorsePedigreeCard, getHorseSexMark } from "./HorsePedigreeCard";
import { HorsePedigreePickerModal } from "./HorsePedigreePickerModal";

type RelationKind = "sire" | "dam" | "foal";

export type HorsePedigreeModalProps = {
    open: boolean;
    selectedHorse: HorseWithPedigreeOutDto | null;
    onClose: () => void;
    onChanged?: () => void;
    onEditHorse?: (horse: HorseOutDto) => void;
    onOpenHorsePedigree?: (horse: HorseOutDto) => void;
};

const buildFilledItems = (canUpdate: boolean): MenuProps["items"] => [
    {
        key: "edit",
        label: "Редактировать",
    },
    {
        key: "go",
        label: "Перейти",
    },
    {
        key: "replace",
        label: "Заменить связь",
        disabled: !canUpdate,
    },
    {
        key: "remove",
        label: "Удалить связь",
        disabled: !canUpdate,
    },
];

const buildMissingItems = (canUpdate: boolean): MenuProps["items"] => [
    {
        key: "replace",
        label: "Заменить связь",
        disabled: !canUpdate,
    },
];

export const HorsePedigreeModal: React.FC<HorsePedigreeModalProps> = ({
    open,
    selectedHorse,
    onClose,
    onChanged,
    onEditHorse,
    onOpenHorsePedigree,
}) => {
    const screens = Grid.useBreakpoint();
    const isNarrow = screens.xs === true && screens.md !== true;
    const {
        horse,
        canUpdatePedigree,
        pickerIntent,
        openPicker,
        closePicker,
        candidateSearch,
        setCandidateSearch,
        candidateOffset,
        setCandidateOffset,
        candidateLimit,
        candidates,
        candidatesTotal,
        candidatesLoading,
        candidatesError,
        selectedCandidateId,
        setSelectedCandidateId,
        mutationLoading,
        operationError,
        removeSire,
        removeDam,
        removeFoal,
        saveCandidate,
    } = useHorsePedigree(selectedHorse, open, onChanged);

    const pedigree = horse?.pedigree;
    const sire = pedigree?.sire ?? null;
    const dam = pedigree?.dam ?? null;
    const foals = pedigree?.foals ?? [];

    const handleMenuClick = (kind: RelationKind, relatedHorse: HorseOutDto | null): MenuProps["onClick"] => async ({ key }) => {
        if (key === "replace") {
            if (kind === "sire") openPicker({ mode: "sire", action: relatedHorse ? "replace" : "add" });
            if (kind === "dam") openPicker({ mode: "dam", action: relatedHorse ? "replace" : "add" });
            if (kind === "foal") openPicker({ mode: "children", action: "replace", targetFoalId: relatedHorse?.id });
            return;
        }

        if (key === "remove" && relatedHorse) {
            if (kind === "sire") await removeSire();
            if (kind === "dam") await removeDam();
            if (kind === "foal") await removeFoal(relatedHorse.id);
            return;
        }

        if (key === "edit" && relatedHorse) {
            onEditHorse?.(relatedHorse);
            return;
        }

        if (key === "go" && relatedHorse) {
            onOpenHorsePedigree?.(relatedHorse);
        }
    };

    return (
        <>
            <Modal
                open={open}
                title={
                    <span>
                        Родословная{horse ? ` — ${horse.name} (${getHorseSexMark(horse.sex)})` : ""}
                    </span>
                }
                onCancel={onClose}
                width={1100}
                destroyOnHidden
                footer={
                    <Button key="close" onClick={onClose}>
                        Закрыть
                    </Button>
                }
            >
                {!horse ? (
                    <Empty description="Лошадь не выбрана" />
                ) : (
                    <div style={{ display: "grid", gap: 24 }}>
                        {!canUpdatePedigree && (
                            <Alert
                                type="warning"
                                showIcon
                                title="Родословная доступна только для просмотра. Недостаточно прав для изменений."
                            />
                        )}
                        {operationError && (
                            <Alert type="error" showIcon title={operationError} />
                        )}

                        <section>
                            <Typography.Title level={4} style={{ marginTop: 0 }}>
                                Родители
                            </Typography.Title>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: isNarrow
                                        ? "minmax(240px, 1fr)"
                                        : "minmax(240px, 1fr) 48px minmax(240px, 1fr) 48px minmax(240px, 1fr)",
                                    gap: isNarrow ? 12 : 16,
                                    alignItems: "center",
                                }}
                            >
                                <HorsePedigreeCard
                                    horse={sire}
                                    label="Отец"
                                    emptyText="Не указан"
                                    menuItems={sire ? buildFilledItems(canUpdatePedigree) : buildMissingItems(canUpdatePedigree)}
                                    onMenuClick={handleMenuClick("sire", sire)}
                                    loading={mutationLoading}
                                />
                                {!isNarrow && (
                                    <div
                                        aria-hidden="true"
                                        data-testid="pedigree-connection-line"
                                        style={{ height: 2, background: "#d9d9d9" }}
                                    />
                                )}
                                <HorsePedigreeCard
                                    horse={horse}
                                    label="Выбранная"
                                    compact
                                    selected
                                />
                                {!isNarrow && (
                                    <div
                                        aria-hidden="true"
                                        data-testid="pedigree-connection-line"
                                        style={{ height: 2, background: "#d9d9d9" }}
                                    />
                                )}
                                <HorsePedigreeCard
                                    horse={dam}
                                    label="Мать"
                                    emptyText="Не указана"
                                    menuItems={dam ? buildFilledItems(canUpdatePedigree) : buildMissingItems(canUpdatePedigree)}
                                    onMenuClick={handleMenuClick("dam", dam)}
                                    loading={mutationLoading}
                                />
                            </div>
                        </section>

                        <section>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 12,
                                    marginBottom: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Typography.Title level={4} style={{ margin: 0 }}>
                                    Потомство
                                </Typography.Title>
                                <Button
                                    type="primary"
                                    onClick={() => openPicker({ mode: "children", action: "add" })}
                                    disabled={!canUpdatePedigree}
                                    loading={mutationLoading}
                                >
                                    + Добавить потомка
                                </Button>
                            </div>

                            {foals.length === 0 ? (
                                <div
                                    style={{
                                        minHeight: 160,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "1px dashed #d9d9d9",
                                        borderRadius: 8,
                                    }}
                                >
                                    <Empty
                                        description={
                                            <span>
                                                <strong>Потомство отсутствует</strong>
                                                <br />
                                                У этой лошади пока нет зарегистрированных потомков.
                                            </span>
                                        }
                                    />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                        gap: 12,
                                    }}
                                >
                                    {foals.map((foal) => (
                                        <HorsePedigreeCard
                                            key={foal.id.toString()}
                                            horse={foal}
                                            extraLine="Второй родитель: —"
                                            menuItems={buildFilledItems(canUpdatePedigree)}
                                            onMenuClick={handleMenuClick("foal", foal)}
                                            loading={mutationLoading}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </Modal>
            <HorsePedigreePickerModal
                open={Boolean(pickerIntent)}
                intent={pickerIntent}
                candidates={candidates}
                total={candidatesTotal}
                loading={candidatesLoading}
                error={candidatesError}
                search={candidateSearch}
                onSearchChange={setCandidateSearch}
                offset={candidateOffset}
                limit={candidateLimit}
                onOffsetChange={setCandidateOffset}
                selectedCandidateId={selectedCandidateId}
                onSelectCandidate={(id: UUID) => setSelectedCandidateId(id)}
                onCancel={closePicker}
                onSave={saveCandidate}
                mutationLoading={mutationLoading}
                operationError={operationError}
            />
        </>
    );
};
