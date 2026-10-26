"use client";

import { Alert, Button, Empty, Pagination, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { SeoBlacklistItemOutDto } from "@/types/api/seo";
import { useSeoStyles } from "./seoStyles";

export type NormalizationListProps = {
  items: SeoBlacklistItemOutDto[];
  total: number;
  offset: number;
  loading: boolean;
  error: string | null;
  disabled: boolean;
  canDelete: boolean;
  onDelete: (item: SeoBlacklistItemOutDto) => void;
  onPage: (page: number) => void;
  onRetry: () => void;
};

const PAGE_SIZE = 10;

export function NormalizationList({ items, total, offset, loading, error, disabled, canDelete, onDelete, onPage, onRetry }: NormalizationListProps) {
  const { styles } = useSeoStyles();
  return (
    <div className={styles.normalizationList}>
      {error && <Alert type="error" title={error} action={<Button size="small" disabled={disabled || loading} onClick={onRetry}>Повторить</Button>} />}
      {loading && <Spin aria-label="Загрузка правил" />}
      {!loading && !error && !total && <Empty description="Правил пока нет" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      <ul className={styles.compactList}>
        {items.map(item => (
          <li key={item.id} className={styles.normalizationRow}>
            <span className={styles.normalizationValue} title={item.value}>{item.value}</span>
            {canDelete && <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label={`Удалить ${item.value}`} disabled={disabled || loading} onClick={() => onDelete(item)} />}
          </li>
        ))}
      </ul>
      <Pagination size="small" current={offset / PAGE_SIZE + 1} pageSize={PAGE_SIZE} total={total} showSizeChanger={false} disabled={disabled || loading} onChange={onPage} />
    </div>
  );
}
