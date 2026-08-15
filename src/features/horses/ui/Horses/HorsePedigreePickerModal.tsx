import React, { useCallback } from "react";
import { Alert, Button, Empty, Input, Modal, Spin, Typography } from "antd";
import type { UUID } from "crypto";
import type { HorseOutDto } from "@/types/api/horses";
import {
  HORSE_PEDIGREE_MODE,
  PEDIGREE_PICKER_ACTION,
} from "../../constants/pedigree";
import type { PedigreePickerIntent } from "../../hooks/useHorsePedigree";
import { HorsePedigreeCandidateButton } from "./HorsePedigreeCandidateButton";
import { HorsePedigreePickerPagination } from "./HorsePedigreePickerPagination";
import { useHorsePedigreePickerModalStyles } from "./horsePedigreePickerModal.styles";

const getSubtitle = (intent: PedigreePickerIntent | null) => {
  if (!intent) return "";
  const prefix =
    intent.action === PEDIGREE_PICKER_ACTION.ADD ? "Добавить" : "Заменить";
  if (intent.mode === HORSE_PEDIGREE_MODE.SIRE) return `${prefix} отца`;
  if (intent.mode === HORSE_PEDIGREE_MODE.DAM) return `${prefix} мать`;
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

export const HorsePedigreePickerModal: React.FC<
  HorsePedigreePickerModalProps
> = ({
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
  const { styles } = useHorsePedigreePickerModalStyles();

  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
    },
    [onSearchChange],
  );

  const displayError = error || operationError;
  const saveDisabled = !selectedCandidateId || Boolean(error);

  return (
    <Modal
      open={open}
      title={
        <div>
          <div>Выберите лошадь</div>
          <Typography.Text type="secondary">
            {getSubtitle(intent)}
          </Typography.Text>
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
          disabled={saveDisabled}
          loading={mutationLoading}
        >
          Сохранить
        </Button>,
      ]}
    >
      <div className={styles.root}>
        <Input
          placeholder="Поиск"
          value={search}
          onChange={handleSearchInputChange}
          allowClear
        />
        <Typography.Text type="secondary">
          Найдено: {total} лошадей
        </Typography.Text>

        {displayError && <Alert type="error" showIcon title={displayError} />}

        <div
          data-testid="horse-pedigree-picker-results"
          className={styles.resultsPanel}
        >
          <Spin spinning={loading}>
            {candidates.length === 0 && !loading ? (
              <Empty description="Ничего не найдено. Попробуйте изменить поисковый запрос" />
            ) : (
              <div className={styles.resultsList}>
                {candidates.map((candidate) => (
                  <HorsePedigreeCandidateButton
                    key={candidate.id.toString()}
                    candidate={candidate}
                    selected={candidate.id === selectedCandidateId}
                    onSelect={onSelectCandidate}
                  />
                ))}
              </div>
            )}
          </Spin>
        </div>

        <HorsePedigreePickerPagination
          offset={offset}
          limit={limit}
          total={total}
          onOffsetChange={onOffsetChange}
        />
      </div>
    </Modal>
  );
};
