"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Badge,
  Button,
  Divider,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  SaveOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { UUID } from "crypto";
import {
  TableCell,
  TableCellFormatter,
  TableColumn,
  TableRow,
  TableType,
} from "@/types/api/table";
import {
  PRICE_PAGE_SCOPES_ACTIONS,
  usePricePageActionScopes,
} from "../../hooks/usePriceScopes";
import type {
  PriceColumnPanelState,
  PriceEditModalProps,
} from "./PriceEditModal.types";

export type { PriceEditModalMode, PriceEditModalProps } from "./PriceEditModal.types";

// ─── Types ───────────────────────────────────────────────────────────────────

type ColPanelState = PriceColumnPanelState;

// ─── Formatter toggle button ──────────────────────────────────────────────────

type FmtBtnProps = {
  label: string;
  active: boolean;
  onToggle: () => void;
  title: string;
};

const FmtBtn: React.FC<FmtBtnProps> = ({ label, active, onToggle, title }) => (
  <Tooltip title={title}>
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: 26,
        height: 26,
        border: `1px solid ${active ? "#91caff" : "#d9d9d9"}`,
        borderRadius: 4,
        background: active ? "#e6f4ff" : "#fff",
        color: active ? "#1677ff" : "rgba(0,0,0,0.65)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: label === "Ж" ? 700 : 400,
        fontStyle: label === "К" ? "italic" : "normal",
        textDecoration: label === "П" ? "underline" : "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  </Tooltip>
);

// ─── ColumnEditPanel ──────────────────────────────────────────────────────────

type ColumnEditPanelProps = {
  panel: ColPanelState;
  onSave: (draft: TableColumn) => void;
  onCancel: () => void;
  onChange: (draft: Partial<TableColumn>) => void;
};

const ColumnEditPanel: React.FC<ColumnEditPanelProps> = ({
  panel,
  onSave,
  onCancel,
  onChange,
}) => {
  const { draft, mode } = panel;
  const isEditing = mode === "edit";
  const canSave = !!(
    draft.key &&
    draft.key.trim() &&
    draft.title &&
    draft.title.trim()
  );

  const toggleFormatter = (fmt: TableCellFormatter) => {
    const current = draft.cell_formatter || [];
    const updated = current.includes(fmt)
      ? current.filter((f) => f !== fmt)
      : [...current, fmt];
    onChange({ ...draft, cell_formatter: updated });
  };

  return (
    <div
      style={{
        background: "#fafafa",
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        padding: "16px",
        marginBottom: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 24px",
          marginBottom: 12,
        }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Ключ колонки</label>
          <Input
            value={draft.key || ""}
            disabled={isEditing}
            placeholder="Уникальный ключ"
            onChange={(e) => onChange({ ...draft, key: e.target.value })}
            size="small"
          />
          {!isEditing && (
            <span className="text-xs text-gray-400">
              Нельзя изменить после создания
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Название</label>
          <Input
            value={draft.title || ""}
            placeholder="Название колонки"
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
            size="small"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Аннотация</label>
          <Input
            value={draft.annotation || ""}
            placeholder="Аннотация при наведении"
            onChange={(e) => onChange({ ...draft, annotation: e.target.value })}
            size="small"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Форматтеры по умолчанию</label>
          <div className="flex gap-2 mt-1">
            <FmtBtn
              label="Ж"
              active={(draft.cell_formatter || []).includes("text_bold")}
              onToggle={() => toggleFormatter("text_bold")}
              title="Жирный"
            />
            <FmtBtn
              label="К"
              active={(draft.cell_formatter || []).includes("text_italic")}
              onToggle={() => toggleFormatter("text_italic")}
              title="Курсив"
            />
            <FmtBtn
              label="П"
              active={(draft.cell_formatter || []).includes("text_underline")}
              onToggle={() => toggleFormatter("text_underline")}
              title="Подчёркнутый"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="small" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          size="small"
          type="primary"
          disabled={!canSave}
          onClick={() => {
            if (canSave) {
              onSave({
                key: draft.key!.trim(),
                title: draft.title!.trim(),
                annotation: draft.annotation || "",
                cell_formatter: draft.cell_formatter || [],
              });
            }
          }}
        >
          Сохранить колонку
        </Button>
      </div>
    </div>
  );
};

// ─── TableTabPane ─────────────────────────────────────────────────────────────

type TableTabPaneProps = {
  table: TableType;
  tableIndex: number;
  totalTables: number;
  colPanel: ColPanelState | null;
  onColPanelChange: (panel: ColPanelState | null) => void;
  onTableChange: (updatedTable: TableType) => void;
  onDuplicateTable: () => void;
  onDeleteTable: () => void;
};

const TableTabPane: React.FC<TableTabPaneProps> = ({
  table,
  tableIndex,
  colPanel,
  onColPanelChange,
  onTableChange,
  onDuplicateTable,
  onDeleteTable,
}) => {
  const handleAddColumn = () => {
    onColPanelChange({
      mode: "add",
      tableIndex,
      columnIndex: null,
      draft: {
        key: `col_${Date.now()}`,
        title: "",
        annotation: "",
        cell_formatter: [],
      },
    });
  };

  const handleEditColumn = (colIdx: number) => {
    onColPanelChange({
      mode: "edit",
      tableIndex,
      columnIndex: colIdx,
      draft: { ...table.columns[colIdx] },
    });
  };

  const handleSaveColumn = (finalCol: TableColumn) => {
    if (!colPanel) return;
    const updated = {
      ...table,
      columns: [...table.columns],
      rows: table.rows.map((r) => ({ ...r, cells: { ...r.cells } })),
    };

    if (colPanel.columnIndex !== null) {
      const oldKey = updated.columns[colPanel.columnIndex].key;
      updated.columns[colPanel.columnIndex] = finalCol;
      if (oldKey !== finalCol.key) {
        updated.rows.forEach((row) => {
          if (row.cells[oldKey] !== undefined) {
            row.cells[finalCol.key] = row.cells[oldKey];
            delete row.cells[oldKey];
          }
        });
      }
    } else {
      updated.columns.push(finalCol);
      updated.rows.forEach((row) => {
        if (!row.cells[finalCol.key]) {
          row.cells[finalCol.key] = {
            value: "",
            annotation: "",
            cell_formatter: [],
          };
        }
      });
    }

    onTableChange(updated);
    onColPanelChange(null);
  };

  const handleCancelColumn = () => {
    onColPanelChange(null);
  };

  const handleDeleteColumn = (colIdx: number) => {
    const colKey = table.columns[colIdx].key;
    const updated: TableType = {
      columns: table.columns.filter((_, i) => i !== colIdx),
      rows: table.rows.map((row) => {
        const cells = { ...row.cells };
        delete cells[colKey];
        return { ...row, cells };
      }),
    };
    onTableChange(updated);
    if (colPanel && colPanel.columnIndex === colIdx) {
      onColPanelChange(null);
    }
  };

  const handleMoveColumnLeft = (colIdx: number) => {
    if (colIdx === 0) return;
    const cols = [...table.columns];
    [cols[colIdx - 1], cols[colIdx]] = [cols[colIdx], cols[colIdx - 1]];
    onTableChange({ ...table, columns: cols });
  };

  const handleMoveColumnRight = (colIdx: number) => {
    if (colIdx === table.columns.length - 1) return;
    const cols = [...table.columns];
    [cols[colIdx + 1], cols[colIdx]] = [cols[colIdx], cols[colIdx + 1]];
    onTableChange({ ...table, columns: cols });
  };

  const handleAddRow = () => {
    const newRow: TableRow = { cells: {} };
    table.columns.forEach((col) => {
      newRow.cells[col.key] = { value: "", annotation: "", cell_formatter: [] };
    });
    onTableChange({ ...table, rows: [...table.rows, newRow] });
  };

  const handleDeleteRow = (rowIdx: number) => {
    onTableChange({
      ...table,
      rows: table.rows.filter((_, i) => i !== rowIdx),
    });
  };

  const handleCellChange = (
    rowIdx: number,
    colKey: string,
    field: "value" | "annotation",
    val: string,
  ) => {
    const rows = table.rows.map((r, i) => {
      if (i !== rowIdx) return r;
      return {
        ...r,
        cells: { ...r.cells, [colKey]: { ...r.cells[colKey], [field]: val } },
      };
    });
    onTableChange({ ...table, rows });
  };

  const handleCellFormatterToggle = (
    rowIdx: number,
    colKey: string,
    fmt: TableCellFormatter,
  ) => {
    const rows = table.rows.map((r, i) => {
      if (i !== rowIdx) return r;
      const cell = r.cells[colKey] as TableCell;
      const fmts = cell.cell_formatter.includes(fmt)
        ? cell.cell_formatter.filter((f) => f !== fmt)
        : [...cell.cell_formatter, fmt];
      return {
        ...r,
        cells: { ...r.cells, [colKey]: { ...cell, cell_formatter: fmts } },
      };
    });
    onTableChange({ ...table, rows });
  };

  const numCol = {
    title: <span style={{ color: "#999", fontSize: 12 }}>#</span>,
    key: "__num__",
    dataIndex: "__num__",
    width: 44,
    fixed: "left" as const,
    render: (_: unknown, __: TableRow & { key: number }, idx: number) => (
      <span style={{ color: "#bbb", fontSize: 12 }}>{idx + 1}</span>
    ),
  };

  const dataCols = table.columns.map((col, colIdx) => ({
    title: (
      <div style={{ minWidth: 120 }}>
        <div className="flex items-center gap-1 flex-wrap mb-1">
          <span className="font-semibold text-sm">{col.title}</span>
          <Button
            type="text"
            size="small"
            icon={<LeftOutlined />}
            disabled={colIdx === 0}
            onClick={() => handleMoveColumnLeft(colIdx)}
            style={{ padding: "0 4px" }}
          />
          <Button
            type="text"
            size="small"
            icon={<RightOutlined />}
            disabled={colIdx === table.columns.length - 1}
            onClick={() => handleMoveColumnRight(colIdx)}
            style={{ padding: "0 4px" }}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditColumn(colIdx)}
            title="Редактировать"
            style={{ padding: "0 4px" }}
          />
          <Popconfirm
            title="Удалить колонку"
            description="Колонка и данные всех строк этой колонки будут удалены."
            okText="Удалить"
            okType="danger"
            cancelText="Отмена"
            onConfirm={() => handleDeleteColumn(colIdx)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: "0 4px" }}
            />
          </Popconfirm>
        </div>
        {col.annotation && (
          <div style={{ fontSize: 11, color: "#999", fontWeight: 400 }}>
            {col.annotation}
          </div>
        )}
      </div>
    ),
    dataIndex: col.key,
    key: col.key,
    width: 200,
    render: (
      _: unknown,
      record: TableRow & { key: number },
      rowIdx: number,
    ) => {
      const cell = record.cells[col.key] || {
        value: "",
        annotation: "",
        cell_formatter: [] as TableCellFormatter[],
      };
      const fmts = cell.cell_formatter || [];
      return (
        <div
          className="flex flex-col gap-1 p-1 border rounded"
          style={{ minWidth: 150 }}
        >
          <Input
            value={cell.value}
            onChange={(e) =>
              handleCellChange(rowIdx, col.key, "value", e.target.value)
            }
            placeholder="Значение"
            size="small"
            style={{
              fontWeight: fmts.includes("text_bold") ? 700 : 400,
              fontStyle: fmts.includes("text_italic") ? "italic" : "normal",
              textDecoration: fmts.includes("text_underline")
                ? "underline"
                : "none",
            }}
          />
          <Input
            value={cell.annotation}
            onChange={(e) =>
              handleCellChange(rowIdx, col.key, "annotation", e.target.value)
            }
            placeholder="Аннотация"
            size="small"
          />
          <div className="flex gap-1">
            <FmtBtn
              label="Ж"
              active={fmts.includes("text_bold")}
              onToggle={() =>
                handleCellFormatterToggle(rowIdx, col.key, "text_bold")
              }
              title="Жирный"
            />
            <FmtBtn
              label="К"
              active={fmts.includes("text_italic")}
              onToggle={() =>
                handleCellFormatterToggle(rowIdx, col.key, "text_italic")
              }
              title="Курсив"
            />
            <FmtBtn
              label="П"
              active={fmts.includes("text_underline")}
              onToggle={() =>
                handleCellFormatterToggle(rowIdx, col.key, "text_underline")
              }
              title="Подчёркнутый"
            />
          </div>
        </div>
      );
    },
  }));

  const actionsCol = {
    title: "",
    key: "__actions__",
    dataIndex: "__actions__",
    width: 60,
    fixed: "right" as const,
    render: (_: unknown, __: TableRow & { key: number }, rowIdx: number) => (
      <Popconfirm
        title="Удалить строку"
        description="Строка будет удалена."
        okText="Удалить"
        okType="danger"
        cancelText="Отмена"
        onConfirm={() => handleDeleteRow(rowIdx)}
      >
        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    ),
  };

  const tableColumns =
    table.columns.length > 0 ? [numCol, ...dataCols, actionsCol] : [];

  const tableDataSource = table.rows.map((row, idx) => ({ ...row, key: idx }));

  return (
    <div>
      {/* Sub-header */}
      <div
        className="flex items-center gap-2 flex-wrap mb-3"
        style={{ padding: "4px 0" }}
      >
        <h4 style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
          Таблица {tableIndex + 1} · {table.columns.length} колонок ·{" "}
          {table.rows.length} строк
        </h4>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={onDuplicateTable}
          >
            Дублировать
          </Button>
          <Button size="small" icon={<PlusOutlined />} onClick={handleAddRow}>
            + Строка
          </Button>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddColumn}
          >
            + Колонка
          </Button>
          <Divider type="vertical" style={{ margin: 0 }} />
          <Popconfirm
            title="Удалить таблицу"
            description="Таблица и все данные будут удалены. Это действие необратимо."
            okText="Удалить"
            okType="danger"
            cancelText="Отмена"
            onConfirm={onDeleteTable}
          >
            <Button size="small" danger>
              Удалить таблицу
            </Button>
          </Popconfirm>
        </div>
      </div>

      {/* Inline column edit panel */}
      {colPanel && colPanel.tableIndex === tableIndex && (
        <ColumnEditPanel
          panel={colPanel}
          onSave={handleSaveColumn}
          onCancel={handleCancelColumn}
          onChange={(draft) => onColPanelChange({ ...colPanel, draft })}
        />
      )}

      {/* Empty state: no columns */}
      {table.columns.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-gray-400"
          style={{
            border: "1px dashed #d9d9d9",
            borderRadius: 8,
            padding: "40px 0",
            minHeight: 160,
          }}
        >
          <TableOutlined
            style={{ fontSize: 32, marginBottom: 12, color: "#bbb" }}
          />
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            Нет колонок в таблице
          </div>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddColumn}
          >
            Добавить первую колонку
          </Button>
        </div>
      ) : table.rows.length === 0 ? (
        /* Empty state: no rows */
        <div>
          <Table
            dataSource={[]}
            columns={tableColumns}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
          <div
            className="flex flex-col items-center justify-center text-gray-400"
            style={{
              border: "1px dashed #d9d9d9",
              borderRadius: 8,
              padding: "20px 0",
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 13, marginBottom: 8 }}>Нет строк</div>
            <Button size="small" icon={<PlusOutlined />} onClick={handleAddRow}>
              Добавить первую строку
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={tableDataSource}
            columns={tableColumns}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isTableEmpty = (table: TableType): boolean => {
  if (table.columns.length === 0 || table.rows.length === 0) return true;
  return !table.rows.some((row) =>
    table.columns.some((col) => {
      const cell = row.cells[col.key];
      return cell && cell.value.trim() !== "";
    }),
  );
};

const filterEmptyTables = (tables: TableType[]): TableType[] =>
  tables.filter((t) => !isTableEmpty(t));

const deepClone = <T,>(val: T): T => JSON.parse(JSON.stringify(val));

// ─── PriceEditModal ───────────────────────────────────────────────────────────

export const PriceEditModal: React.FC<PriceEditModalProps> = ({
  open,
  onClose,
  mode,
  selectedPrice,
  templatePrice,
  priceDetail,
  priceDetailLoading,
  onCreate,
  onUpdate,
  onDelete,
  validationErrors,
  onResetValidation,
  priceGroupsOptions,
}) => {
  const { hasPermission } = usePricePageActionScopes();

  const isEditing = mode === "update";
  const isDuplicating = mode === "duplicate";

  // ── form state ──
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [groups, setGroups] = useState<UUID[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("general");

  // ── column panel state (shared across tables) ──
  const [colPanel, setColPanel] = useState<ColPanelState | null>(null);

  // ── dirty tracking ──
  const snapshotRef = useRef<string>("");

  const isDirty = useMemo(() => {
    if (isDuplicating) return true;
    const current = JSON.stringify({ name, description, groups, tables });
    return current !== snapshotRef.current;
  }, [isDuplicating, name, description, groups, tables]);

  // ── delete confirm ──
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>("");
  const [discardOpen, setDiscardOpen] = useState<boolean>(false);

  // ── scopes ──
  const canDelete = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_DELETE);
  const canUpdate = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE);
  const canCreate = hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_CREATE);
  const isGroupsDisabled = !hasPermission(
    PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE_GROUPS,
  );
  const isNameDisabled = !hasPermission(
    PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE_NAME,
  );
  const isDescriptionDisabled = !hasPermission(
    PRICE_PAGE_SCOPES_ACTIONS.PRICE_UPDATE_DESCRIPTION,
  );

  // ── initialization on open ──
  useEffect(() => {
    if (!open) return;
    onResetValidation();
    setColPanel(null);
    setDeleteConfirmName("");
    setDiscardOpen(false);

    if (mode === "update") {
      const src = priceDetail || selectedPrice;
      const n = src?.name || "";
      const d = src?.description || "";
      const g = (src?.groups || []).map((gr) => gr.id);
      const t = deepClone(priceDetail?.price_tables || []);
      setName(n);
      setDescription(d);
      setGroups(g);
      setTables(t);
      snapshotRef.current = JSON.stringify({
        name: n,
        description: d,
        groups: g,
        tables: t,
      });
      setActiveTabKey("general");
    } else if (mode === "duplicate") {
      const src = priceDetail || templatePrice;
      const n = src?.name || "";
      const d = src?.description || "";
      const g = (src?.groups || []).map((gr) => gr.id);
      const t = deepClone(priceDetail?.price_tables || []);
      setName(n);
      setDescription(d);
      setGroups(g);
      setTables(t);
      snapshotRef.current = "";
      setActiveTabKey("general");
    } else {
      setName("");
      setDescription("");
      setGroups([]);
      setTables([]);
      snapshotRef.current = JSON.stringify({
        name: "",
        description: "",
        groups: [],
        tables: [],
      });
      setActiveTabKey("general");
    }
  }, [open, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // re-init tables when priceDetail loads (for update mode opened before detail is ready)
  useEffect(() => {
    if (!open || !priceDetail || mode === "create") return;
    const n = priceDetail.name || "";
    const d = priceDetail.description || "";
    const g = priceDetail.groups.map((gr) => gr.id);
    const t = deepClone(priceDetail.price_tables || []);
    setName(n);
    setDescription(d);
    setGroups(g);
    setTables(t);
    if (mode === "update") {
      snapshotRef.current = JSON.stringify({
        name: n,
        description: d,
        groups: g,
        tables: t,
      });
    }
  }, [priceDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── validation ──
  const hasErrors = Object.keys(validationErrors).length > 0;

  const handleFieldChange = (setter: (v: string) => void, value: string) => {
    if (hasErrors) onResetValidation();
    setter(value);
  };

  // ── table handlers ──
  const handleAddTable = () => {
    const newTable: TableType = { columns: [], rows: [] };
    const updated = [...tables, newTable];
    setTables(updated);
    setActiveTabKey(`table_${updated.length - 1}`);
  };

  const handleDuplicateTable = (idx: number) => {
    const copy = deepClone(tables[idx]);
    const updated = [
      ...tables.slice(0, idx + 1),
      copy,
      ...tables.slice(idx + 1),
    ];
    setTables(updated);
    setActiveTabKey(`table_${idx + 1}`);
  };

  const handleDeleteTable = (idx: number) => {
    const updated = tables.filter((_, i) => i !== idx);
    setTables(updated);
    setColPanel(null);
    if (activeTabKey === `table_${idx}`) {
      if (updated.length > 0) {
        setActiveTabKey(`table_${Math.max(0, idx - 1)}`);
      } else {
        setActiveTabKey("general");
      }
    } else {
      // re-index active tab key if needed
      const match = activeTabKey.match(/^table_(\d+)$/);
      if (match) {
        const current = parseInt(match[1]);
        if (current > idx) setActiveTabKey(`table_${current - 1}`);
      }
    }
  };

  const handleUpdateTable = (idx: number, updated: TableType) => {
    setTables((prev) => prev.map((t, i) => (i === idx ? updated : t)));
  };

  // ── submit ──
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submittingRef.current || hasErrors) {
      setActiveTabKey("general");
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    const payload = {
      name,
      description,
      groups,
      price_tables: filterEmptyTables(tables),
    };
    try {
      let success = false;
      if (isEditing && selectedPrice) {
        success = await onUpdate(selectedPrice.id, payload);
      } else {
        success = await onCreate(payload);
      }
      if (success) {
        onClose();
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ── close handling ──
  const handleClose = () => {
    if (isDirty) {
      setDiscardOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardOpen(false);
    onClose();
  };

  // ── delete price ──
  const handleDeletePrice = async () => {
    if (!selectedPrice) return;
    const success = await onDelete(selectedPrice.id);
    if (success) {
      onClose();
    }
  };

  // ── per-tab dirty (for indicators) ──
  const generalDirty = useMemo(() => {
    if (isDuplicating) return true;
    const snap = snapshotRef.current ? JSON.parse(snapshotRef.current) : null;
    if (!snap) return false;
    return (
      snap.name !== name ||
      snap.description !== description ||
      JSON.stringify(snap.groups) !== JSON.stringify(groups)
    );
  }, [isDuplicating, name, description, groups]);

  const getTableDirty = useCallback(
    (idx: number) => {
      if (isDuplicating) return true;
      const snap = snapshotRef.current ? JSON.parse(snapshotRef.current) : null;
      if (!snap) return false;
      return JSON.stringify(snap.tables[idx]) !== JSON.stringify(tables[idx]);
    },
    [isDuplicating, tables],
  );

  // ── modal title ──
  const modalTitle = (
    <div className="flex items-center gap-2 flex-wrap">
      <span>
        {isEditing
          ? "Редактировать услугу"
          : isDuplicating
            ? "Добавить услугу (дубль)"
            : "Добавить услугу"}
      </span>
      {isEditing && name && (
        <span style={{ color: "#999", fontWeight: 400 }}>· {name}</span>
      )}
      {isDirty && (
        <Tag color="warning" style={{ marginLeft: 4 }}>
          Несохранённые изменения
        </Tag>
      )}
    </div>
  );

  // ── tabs ──
  const tabLabel = (text: string, dirty: boolean, error: boolean) => (
    <span
      style={{ position: "relative", paddingRight: dirty || error ? 10 : 0 }}
    >
      {text}
      {(dirty || error) && (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -6,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: error ? "#ff4d4f" : "#faad14",
            display: "inline-block",
          }}
        />
      )}
    </span>
  );

  const generalError = hasErrors;

  const handleTabChange = (key: string) => {
    if (key === "add_table") {
      handleAddTable();
      return;
    }
    setActiveTabKey(key);
  };

  const tabItems = [
    {
      key: "general",
      label: tabLabel("Общее", generalDirty, generalError),
      children: null,
    },
    ...tables.map((table, idx) => {
      const tDirty = getTableDirty(idx);
      const badge = `${table.columns.length}×${table.rows.length}`;
      const label = (
        <span className="flex items-center gap-1">
          {tabLabel(`Таблица ${idx + 1}`, tDirty, false)}
          <Badge
            count={badge}
            style={{
              backgroundColor: "#f0f0f0",
              color: "#666",
              fontSize: 10,
              boxShadow: "none",
            }}
          />
          <Popconfirm
            title="Удалить таблицу"
            description="Таблица и все данные будут удалены. Это действие необратимо."
            okText="Удалить"
            okType="danger"
            cancelText="Отмена"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDeleteTable(idx);
            }}
          >
            <span
              className="tab-close-btn"
              style={{
                opacity: 0,
                transition: "opacity 0.15s",
                fontSize: 10,
                lineHeight: 1,
                display: "inline-flex",
                alignItems: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseOutlined style={{ fontSize: 10 }} />
            </span>
          </Popconfirm>
        </span>
      );
      return {
        key: `table_${idx}`,
        label,
        children: null,
      };
    }),
    {
      key: "add_table",
      label: (
        <span style={{ color: "#1677ff", borderStyle: "dashed" }}>
          <PlusOutlined /> Добавить таблицу
        </span>
      ),
      children: null,
    },
  ];

  // ── footer ──
  const footerLeft: React.ReactNode[] = [];
  if (isEditing && canDelete && selectedPrice) {
    footerLeft.push(
      <Popconfirm
        key="delete-price"
        title={
          <div>
            <div className="mb-2 font-medium">Удалить услугу?</div>
            <div className="text-sm text-gray-500 mb-2">
              Введите название услуги для подтверждения:
            </div>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={selectedPrice.name}
              size="small"
            />
          </div>
        }
        okText="Удалить"
        okType="danger"
        cancelText="Отмена"
        okButtonProps={{ disabled: deleteConfirmName !== selectedPrice.name }}
        onConfirm={handleDeletePrice}
        onOpenChange={(visible) => {
          if (!visible) setDeleteConfirmName("");
        }}
      >
        <Button danger variant="outlined" icon={<DeleteOutlined />}>
          Удалить услугу
        </Button>
      </Popconfirm>,
    );
  }

  const footerRight: React.ReactNode[] = [
    <Button
      key="close"
      color="default"
      variant="outlined"
      icon={<CloseOutlined />}
      onClick={handleClose}
    >
      Закрыть
    </Button>,
  ];

  if (isEditing && canUpdate) {
    footerRight.push(
      <Button
        key="save"
        type="primary"
        icon={<SaveOutlined />}
        disabled={!isDirty || hasErrors || isSubmitting}
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        Сохранить
      </Button>,
    );
  } else if (!isEditing && canCreate) {
    footerRight.push(
      <Button
        key="add"
        type="primary"
        icon={<PlusOutlined />}
        disabled={!isDirty || hasErrors || isSubmitting}
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        Добавить
      </Button>,
    );
  }

  const footer = (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">{footerLeft}</div>
      <div className="flex gap-2">{footerRight}</div>
    </div>
  );

  // ── render general tab content ──
  const renderGeneralTab = () => (
    <div style={{ maxWidth: 720 }}>
      <div className="mb-4 flex flex-col gap-2">
        <label className="font-medium">Группы услуг</label>
        <Select
          mode="multiple"
          options={priceGroupsOptions}
          value={groups}
          onChange={(val) => {
            if (hasErrors) onResetValidation();
            setGroups(val as UUID[]);
          }}
          allowClear
          placeholder="Выберите группы услуг"
          disabled={isGroupsDisabled}
          style={{ width: "100%" }}
        />
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <label className="font-medium">Название услуги</label>
        <Input
          value={name}
          onChange={(e) => handleFieldChange(setName, e.target.value)}
          placeholder="Название услуги"
          maxLength={63}
          allowClear
          disabled={isNameDisabled}
        />
        {validationErrors.name ? (
          <div className="text-sm text-red-500">
            {validationErrors.name.join(", ")}
          </div>
        ) : (
          <div className="text-sm text-gray-500">{name.length}/63</div>
        )}
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <label className="font-medium">Описание услуги</label>
        <TextArea
          value={description}
          onChange={(e) => handleFieldChange(setDescription, e.target.value)}
          placeholder="Описание услуги"
          rows={4}
          maxLength={511}
          allowClear
          disabled={isDescriptionDisabled}
        />
        {validationErrors.description ? (
          <div className="text-sm text-red-500">
            {validationErrors.description.join(", ")}
          </div>
        ) : (
          <div className="text-sm text-gray-500">{description.length}/511</div>
        )}
      </div>
      {isEditing && selectedPrice && (
        <div className="mb-4 flex flex-col gap-2">
          <label className="font-medium">Slug</label>
          <Input value={selectedPrice.slug} disabled />
        </div>
      )}
      {tables.length === 0 && (
        <Alert
          type="info"
          title="Нет таблиц цен"
          description={
            <span>
              Добавьте таблицу, чтобы указать цены.{" "}
              <Button
                type="link"
                size="small"
                onClick={handleAddTable}
                style={{ padding: 0 }}
              >
                Добавить таблицу
              </Button>
            </span>
          }
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );

  // ── active table index ──
  const activeTableIndex = useMemo(() => {
    const match = activeTabKey.match(/^table_(\d+)$/);
    return match ? parseInt(match[1]) : null;
  }, [activeTabKey]);

  return (
    <>
      <style>{`
                .ant-tabs-tab:hover .tab-close-btn { opacity: 1 !important; }
            `}</style>
      <Modal
        open={open}
        title={modalTitle}
        onCancel={handleClose}
        footer={footer}
        width={1200}
        style={{ top: 20 }}
        destroyOnHidden={false}
      >
        {priceDetailLoading ? (
          <div
            className="flex justify-center items-center"
            style={{ minHeight: 200 }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Tabs
              type="card"
              activeKey={activeTabKey}
              onChange={handleTabChange}
              items={tabItems}
              style={{ marginBottom: 0 }}
            />
            <div style={{ padding: "16px 0", minHeight: 400 }}>
              {activeTabKey === "general" && renderGeneralTab()}
              {activeTableIndex !== null && tables[activeTableIndex] && (
                <TableTabPane
                  table={tables[activeTableIndex]}
                  tableIndex={activeTableIndex}
                  totalTables={tables.length}
                  colPanel={colPanel}
                  onColPanelChange={setColPanel}
                  onTableChange={(updated) =>
                    handleUpdateTable(activeTableIndex, updated)
                  }
                  onDuplicateTable={() =>
                    handleDuplicateTable(activeTableIndex)
                  }
                  onDeleteTable={() => handleDeleteTable(activeTableIndex)}
                />
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={discardOpen}
        title="Закрыть без сохранения?"
        okText="Закрыть"
        cancelText="Продолжить редактирование"
        okType="danger"
        onOk={handleConfirmDiscard}
        onCancel={() => setDiscardOpen(false)}
        width={400}
        centered
      >
        <p>Есть несохранённые изменения. Они будут потеряны.</p>
      </Modal>
    </>
  );
};
