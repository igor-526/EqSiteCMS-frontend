"use client";

import { useEffect, useRef } from "react";
import { Alert, Button, Input, Modal, Tabs, Typography, type InputRef } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { usePageNormalization } from "../hooks/usePageNormalization";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { NormalizationList } from "./NormalizationList";
import { useSeoStyles } from "./seoStyles";

const HASHES = "hashes";

export function PageNormalizationModal({ model }: { model: ReturnType<typeof usePageNormalization> }) {
  const { styles } = useSeoStyles();
  const inputRef = useRef<InputRef>(null);
  const wasSelected = useRef(false);
  useEffect(() => {
    if (!model.open) return;
    const trigger = document.activeElement;
    return () => { if (trigger instanceof HTMLElement) trigger.focus(); };
  }, [model.open]);
  useEffect(() => {
    if (model.pending) return;
    if (wasSelected.current && !model.selected && model.open) inputRef.current?.focus();
    wasSelected.current = !!model.selected;
  }, [model.selected, model.open, model.pending]);
  const blocked = model.pending || !!model.selected;
  const label = model.kind === HASHES ? "хеш" : "параметр";
  const changeInput = (event: React.ChangeEvent<HTMLInputElement>) => model.changeInput(event.target.value);
  if (!model.open) return null;
  return (
    <>
      <Modal open={model.open} title="Нормализация страниц" width={600} footer={null} onCancel={model.close}
        closable={!blocked} keyboard={!blocked} maskClosable={!blocked} destroyOnHidden>
        <Typography.Paragraph>
          Точные исключаемые значения, не маски. Изменения применяются при последующем сохранении; старые страницы не меняются.
        </Typography.Paragraph>
        <Tabs activeKey={model.kind} onChange={model.switchKind} items={[
          { key: "hashes", label: "Хеш", disabled: blocked },
          { key: "params", label: "Параметры", disabled: blocked },
        ]} />
        <div className={styles.normalizationInput}>
          <Input ref={inputRef} aria-label={`Новый ${label}`} value={model.input} disabled={blocked || !model.canCreate}
            onChange={changeInput} onPressEnter={model.create} />
          {model.canCreate && <Button icon={<PlusOutlined />} aria-label={`Добавить ${label}`} disabled={blocked} onClick={model.create} />}
        </div>
        {model.error && <Alert type="error" title={model.error} showIcon />}
        <NormalizationList items={model.items} total={model.total} offset={model.offset} loading={model.loading}
          error={model.readError} disabled={blocked} canDelete={model.canDelete} onDelete={model.select} onPage={model.changePage} onRetry={model.retry} />
      </Modal>
      <ConfirmActionModal open={model.open && !!model.selected} title="Удалить правило?"
        text={<Typography.Paragraph className={styles.normalizationConfirm}>{model.selected?.value}</Typography.Paragraph>}
        pending={model.pending} error={model.deleteError} confirmDisabled={!model.canDelete || model.selectedMissing}
        onConfirm={model.confirmDelete} onCancel={model.cancelDelete} />
    </>
  );
}
