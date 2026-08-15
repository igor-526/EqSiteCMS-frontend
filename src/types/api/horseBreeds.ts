import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";

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
  | "-kind";

export type HorseBreedListQueryParams = ApiPaginationType & {
  name?: string | null;
  short_name?: string | null;
  slug?: string | null;
  description?: string | null;
  page_data?: string | null;
  kind?: HorseKind[] | null;
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
};

export type HorseBreedCreateInDto = {
  name: string;
  short_name?: string | null;
  slug?: string | null;
  description?: string | null;
  page_data?: string | null;
  kind?: HorseKind;
};

export type HorseBreedUpdateInDto = {
  name?: string | null;
  short_name?: string | null;
  slug?: string | null;
  description?: string | null;
  page_data?: string | null;
  kind?: HorseKind | null;
};
