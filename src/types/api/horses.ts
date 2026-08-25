import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";
import type { HorseKind } from "./horseBreeds";
import { HorseServiceOutDto } from "./horseServices";
import { PhotoOutShortDto } from "./photos";

export type { HorseKind } from "./horseBreeds";
export type HorseSex = "male" | "female" | "geld";
export type HorseDateMode = "y" | "ym" | "ymd" | "hide";
export type HorsePedigreeMode = "sire" | "dam" | "children";

export type HorseAvailableSorting =
  | "name"
  | "-name"
  | "breed_name"
  | "-breed_name"
  | "coat_color_name"
  | "-coat_color_name"
  | "kind"
  | "-kind"
  | "sex"
  | "-sex"
  | "created_at"
  | "-created_at"
  | "updated_at"
  | "-updated_at";

export type HorseBreedSimpleOutDto = {
  id: UUID;
  name: string;
  short_name?: string | null;
  slug: string;
};

export type HorseCoatColorSimpleOutDto = {
  id: UUID;
  name: string;
  short_name?: string | null;
  slug: string;
};

export type HorseOwnerSimpleOutDto = {
  id: UUID;
  name: string;
};

export type HorseOutDto = ApiCreatedUpdatedAtType & {
  id: UUID;
  slug: string;
  name: string;
  pedigree_name: string | null;
  description: string | null;
  breed: HorseBreedSimpleOutDto | null;
  coat_color: HorseCoatColorSimpleOutDto | null;
  height: number | null;
  sex: HorseSex;
  bdate: string | null;
  ddate: string | null;
  bdate_mode: HorseDateMode;
  ddate_mode: HorseDateMode;
  bdate_formatted: string | null;
  ddate_formatted: string | null;
  age: number | null;
  horse_owner: HorseOwnerSimpleOutDto | null;
  photos: PhotoOutShortDto[];
  services?: HorseServiceOutDto[];
  this_stable: boolean;
};

export type HorsePedigreeDto = {
  sire?: HorseOutDto | null;
  dam?: HorseOutDto | null;
  foals?: HorseOutDto[];
};

export type HorseWithPedigreeOutDto = HorseOutDto & {
  pedigree: HorsePedigreeDto;
};

export type HorseAvailablePedigreeQueryParams = ApiPaginationType & {
  search?: string | null;
};

export type HorseGetQueryParams = {
  pedigree?: 0 | 1 | null;
};

export type HorseListQueryParams = ApiPaginationType & {
  sort?: HorseAvailableSorting[] | null;
  name?: string | null;
  description?: string | null;
  breed_ids?: UUID[] | null;
  coat_color_ids?: UUID[] | null;
  kind?: HorseKind[] | null;
  sex?: HorseSex[] | null;
  height_gte?: number | null;
  height_lte?: number | null;
  bdate_gte?: string | null;
  bdate_lte?: string | null;
  ddate_gte?: string | null;
  ddate_lte?: string | null;
  horse_owner_ids?: UUID[] | null;
  services?: UUID[] | null;
  this_stable?: boolean | null;
  pedigree?: 0 | 1 | null;
  exclude_ids?: UUID[] | null;
  include_ids?: UUID[] | null;
};

export type HorseCreateInDto = {
  name: string;
  slug?: string | null;
  pedigree_name?: string | null;
  description?: string | null;
  breed_id?: UUID | null;
  coat_color_id?: UUID | null;
  height?: number | null;
  sex?: HorseSex;
  bdate?: string | null;
  ddate?: string | null;
  bdate_mode?: HorseDateMode;
  ddate_mode?: HorseDateMode;
  horse_owner_id?: UUID | null;
  this_stable?: boolean;
};

export type HorseUpdateInDto = {
  name?: string | null;
  slug?: string | null;
  pedigree_name?: string | null;
  description?: string | null;
  breed_id?: UUID | null;
  coat_color_id?: UUID | null;
  height?: number | null;
  sex?: HorseSex | null;
  bdate?: string | null;
  ddate?: string | null;
  bdate_mode?: HorseDateMode | null;
  ddate_mode?: HorseDateMode | null;
  horse_owner_id?: UUID | null;
  this_stable?: boolean | null;
};

export type HorseSetPedigreeInDto = {
  sire_id?: UUID | null;
  dam_id?: UUID | null;
  foals?: UUID[];
};
