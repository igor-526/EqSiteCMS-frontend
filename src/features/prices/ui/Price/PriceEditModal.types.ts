import type { UUID } from "crypto";
import type {
  PriceCreateInDto,
  PriceOutDto,
  PriceUpdateInDto,
} from "@/types/api/prices";
import type { TableColumn } from "@/types/api/table";

export type PriceEditModalMode = "create" | "update" | "duplicate";

export type PriceEditModalProps = {
  open: boolean;
  onClose: () => void;
  mode: PriceEditModalMode;
  selectedPrice: PriceOutDto | null;
  templatePrice: PriceOutDto | null;
  priceDetail: PriceOutDto | null;
  priceDetailLoading: boolean;
  onCreate: (createData: PriceCreateInDto) => Promise<boolean>;
  onUpdate: (priceId: UUID, updateData: PriceUpdateInDto) => Promise<boolean>;
  onDelete: (priceId: UUID) => Promise<boolean>;
  validationErrors: Record<string, string[]>;
  onResetValidation: () => void;
  priceGroupsOptions: { key: string; label: string; value: UUID }[];
};

export type PriceColumnPanelState = {
  mode: "add" | "edit";
  tableIndex: number;
  columnIndex: number | null;
  draft: Partial<TableColumn>;
};
