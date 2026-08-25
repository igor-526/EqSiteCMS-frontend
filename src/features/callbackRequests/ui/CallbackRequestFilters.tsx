import { useEffect, useRef, useState } from "react";
import { DatePicker, Input, Select } from "antd";
import type { CallbackRequestsQuery, CallbackRequestStatusOutDto } from "@/types/api/callbackRequests";
import { isAllowedPhoneRegex } from "../hooks/useCallbackRequests";
import { useDebounce } from "@/hooks/useDebounce";

type ChangeHandler = (patch: Partial<CallbackRequestsQuery>) => void;
const dropdownStyle = { padding: 8, minWidth: 220 };

export function CallbackRequestRegexFilter({ value, field, label, onChange }: { value?: string; field: "name" | "phone" | "comment"; label: string; onChange: ChangeHandler }) {
  const [draft, setDraft] = useState(value ?? "");
  const debounced = useDebounce(draft, 300);
  const callback = useRef(onChange);
  useEffect(() => { callback.current = onChange; }, [onChange]);
  useEffect(() => { callback.current({ [field]: debounced || undefined }); }, [debounced, field]);
  useEffect(() => { setDraft(value ?? ""); }, [value]);
  return <div style={dropdownStyle}><Input aria-label={label} placeholder={label} value={draft} onChange={(event) => { const next = event.target.value; if (field !== "phone" || isAllowedPhoneRegex(next)) setDraft(next); }} /></div>;
}

export function CallbackRequestDateFilter({ onChange }: { query: CallbackRequestsQuery; onChange: ChangeHandler }) {
  return <div style={dropdownStyle}><DatePicker.RangePicker aria-label="Период создания" showTime onChange={(_, values) => onChange({ created_at_from: values[0] || undefined, created_at_to: values[1] || undefined })} /></div>;
}

export function CallbackRequestStatusFilter({ query, statuses, onChange }: { query: CallbackRequestsQuery; statuses: CallbackRequestStatusOutDto[]; onChange: ChangeHandler }) {
  return <div style={dropdownStyle}><Select aria-label="Статусы" mode="multiple" allowClear placeholder="Статусы" value={query.status} options={statuses.map((status) => ({ value: status.id, label: status.name }))} onChange={(status) => onChange({ status: status.length ? status : undefined })} style={{ width: "100%" }} /></div>;
}

export function CallbackRequestSpamFilter({ query, onChange }: { query: CallbackRequestsQuery; onChange: ChangeHandler }) {
  return <div style={dropdownStyle}><Select aria-label="Спам" mode="multiple" allowClear placeholder="Спам" value={query.is_spam} options={[{ value: false, label: "Не спам" }, { value: true, label: "Спам" }]} onChange={(is_spam) => onChange({ is_spam: is_spam.length ? is_spam : undefined })} style={{ width: "100%" }} /></div>;
}
