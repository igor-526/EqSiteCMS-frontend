import type { HorsePedigreeMode } from "@/types/api/horses";

export const HORSE_PEDIGREE_MODE = {
  SIRE: "sire",
  DAM: "dam",
  CHILDREN: "children",
} as const satisfies Record<string, HorsePedigreeMode>;

export const PEDIGREE_PICKER_ACTION = {
  ADD: "add",
  REPLACE: "replace",
} as const;
