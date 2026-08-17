import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";
import type { HorseBreedGroupOutDto } from "./horseBreedGroups";

export type HorseKind = "horse" | "pony";

export type HorseBreedAvailableSorting =
  | "name"
  | "-name"
  | "short_name"
  | "-short_name"
  | "description"
  | "-description"
  | "slug"
  | "-slug"
  | "kind"
  | "-kind"
  | "group_name"
  | "-group_name"
  | "created_at"
  | "-created_at";

export type HorseBreedListQueryParams = ApiPaginationType & {
  name?: string | null;
  short_name?: string | null;
  slug?: string | null;
  description?: string | null;
  page_data?: string | null;
  kind?: HorseKind[] | null;
  breed_group_ids?: UUID[] | null;
  sort?: HorseBreedAvailableSorting[] | null;
};

export type HorseBreedDetailQueryParams = {
  page_data?: boolean | null;
};

export type HorseBreedOutDto = ApiCreatedUpdatedAtType & {
  id: UUID;
  name: string;
  short_name: string;
  slug: string;
  description: string | null;
  kind: HorseKind;
  page_data?: string | null;
  group: Pick<HorseBreedGroupOutDto, "id" | "name" | "slug"> | null;
};

export type HorseBreedCreateInDto = {
  name: string;
  short_name?: string | null;
  slug?: string | null;
  description?: string | null;
  page_data?: string | null;
  kind?: HorseKind;
  breed_group_id?: UUID | null;
};

export type HorseBreedUpdateInDto = {
  name?: string | null;
  short_name?: string | null;
  slug?: string | null;
  description?: string | null;
  page_data?: string | null;
  kind?: HorseKind | null;
  breed_group_id?: UUID | null;
};
