import { useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Popconfirm } from "antd";
import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { HorseBreedGroupCreateInDto, HorseBreedGroupOutDto, HorseBreedGroupUpdateInDto } from "@/types/api/horseBreedGroups";

export type HorseBreedGroupsCreateUpdateModalProps = {
  open: boolean; onClose: () => void; selected: HorseBreedGroupOutDto | null;
  onCreate: (data: HorseBreedGroupCreateInDto) => Promise<unknown>;
  onUpdate: (id: string, data: HorseBreedGroupUpdateInDto) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  validationErrors: Record<string, string[]>; onResetValidation: () => void;
  canMutate: boolean; canDelete: boolean;
};

export const HorseBreedGroupsCreateUpdateModal = ({ open, onClose, selected, onCreate, onUpdate, onDelete, validationErrors, onResetValidation, canMutate, canDelete }: HorseBreedGroupsCreateUpdateModalProps) => {
  const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [submitting, setSubmitting] = useState(false); const guard = useRef(false);
  useEffect(() => { if (open) { onResetValidation(); setName(selected?.name ?? ""); setSlug(selected?.slug ?? ""); } }, [open, selected, onResetValidation]);
  const submit = async () => { if (!canMutate || guard.current) return; guard.current = true; setSubmitting(true); try { if (selected) await onUpdate(String(selected.id), { name, slug }); else await onCreate({ name, slug }); } finally { guard.current = false; setSubmitting(false); } };
  const clearError = () => { if (Object.keys(validationErrors).length) onResetValidation(); };
  const footer = [<Button key="close" onClick={onClose}><CloseOutlined />Закрыть</Button>];
  if (selected && canDelete) footer.push(<Popconfirm key="confirm" title="Удалить группу пород?" onConfirm={() => onDelete(String(selected.id))}><Button danger><DeleteOutlined />Удалить</Button></Popconfirm>);
  if (canMutate) footer.push(<Button key="submit" type="primary" loading={submitting} disabled={submitting} onClick={submit}>{selected ? <EditOutlined /> : <PlusOutlined />}{selected ? "Изменить" : "Добавить"}</Button>);
  return <Modal open={open} onCancel={onClose} title={selected ? "Изменить группу пород" : "Добавить группу пород"} footer={footer} destroyOnHidden>
    <label htmlFor="breedGroupName">Наименование</label><Input id="breedGroupName" value={name} status={validationErrors.name ? "error" : undefined} onChange={(event) => { clearError(); setName(event.target.value); }} maxLength={255} />
    {validationErrors.name && <div className="text-sm text-red-500">{validationErrors.name.join("\n")}</div>}
    <label htmlFor="breedGroupSlug">Путь URL (генерируется автоматически)</label><Input id="breedGroupSlug" value={slug} status={validationErrors.slug ? "error" : undefined} onChange={(event) => { clearError(); setSlug(event.target.value); }} maxLength={255} />
    {validationErrors.slug && <div className="text-sm text-red-500">{validationErrors.slug.join("\n")}</div>}
  </Modal>;
};
