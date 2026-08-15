import React, { useCallback } from "react";
import { Button, Space, Typography } from "antd";
import { useHorsePedigreePickerModalStyles } from "./horsePedigreePickerModal.styles";

export type HorsePedigreePickerPaginationProps = {
  offset: number;
  limit: number;
  total: number;
  onOffsetChange: (offset: number) => void;
};

export const HorsePedigreePickerPagination: React.FC<
  HorsePedigreePickerPaginationProps
> = ({ offset, limit, total, onOffsetChange }) => {
  const { styles } = useHorsePedigreePickerModalStyles();
  const currentChunk = Math.floor(offset / limit) + 1;
  const chunksTotal = Math.max(1, Math.ceil(total / limit));
  const canGoBack = offset > 0;
  const canGoForward = offset + limit < total;

  const handleGoBack = useCallback(() => {
    onOffsetChange(Math.max(0, offset - limit));
  }, [limit, offset, onOffsetChange]);

  const handleGoForward = useCallback(() => {
    onOffsetChange(offset + limit);
  }, [limit, offset, onOffsetChange]);

  return (
    <Space className={styles.paginationRow}>
      <Button size="small" disabled={!canGoBack} onClick={handleGoBack}>
        Назад
      </Button>
      <Typography.Text type="secondary">
        {currentChunk} / {chunksTotal}
      </Typography.Text>
      <Button size="small" disabled={!canGoForward} onClick={handleGoForward}>
        Вперед
      </Button>
    </Space>
  );
};
