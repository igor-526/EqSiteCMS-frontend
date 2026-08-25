import { Descriptions, Modal, Tag } from "antd";
import type { CallbackRequestOutDto, CallbackRequestStatusOutDto } from "@/types/api/callbackRequests";

export function CallbackRequestDetailModal({ row, statuses, onClose }: { row: CallbackRequestOutDto | null; statuses: CallbackRequestStatusOutDto[]; onClose: () => void }) {
  const status = statuses.find((item) => item.id === row?.status);
  return <Modal title="Заявка на обратный звонок" open={Boolean(row)} onCancel={onClose} footer={null}>
    {row && <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="Дата и время">{new Date(row.created_at).toLocaleString("ru-RU")}</Descriptions.Item>
      <Descriptions.Item label="Статус"><Tag color={status?.color}>{status?.name ?? row.status}</Tag></Descriptions.Item>
      <Descriptions.Item label="Спам">{row.is_spam ? "Да" : "Нет"}</Descriptions.Item>
      <Descriptions.Item label="Имя">{row.name || "—"}</Descriptions.Item>
      <Descriptions.Item label="Телефон"><a href={`tel:${row.phone}`}>{row.phone}</a></Descriptions.Item>
      <Descriptions.Item label="Комментарий"><span style={{ whiteSpace: "pre-wrap" }}>{row.comment || "—"}</span></Descriptions.Item>
      <Descriptions.Item label="Уведомление опубликовано">{row.notifications_delivered ? "Да" : "Нет"}</Descriptions.Item>
    </Descriptions>}
  </Modal>;
}
