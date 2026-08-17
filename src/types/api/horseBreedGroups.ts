import type { UUID } from "crypto";
import type { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";

export type HorseBreedGroupAvailableSorting =
  | "name" | "-name" | "slug" | "-slug"
  | "created_at" | "-created_at" | "updated_at" | "-updated_at";

export type HorseBreedGroupListQueryParams = ApiPaginationType & {
  name?: string | null;
  slug?: string | null;
  page_data?: string | null;
  sort?: HorseBreedGroupAvailableSorting[] | null;
};

export type HorseBreedGroupDetailQueryParams = { page_data?: boolean | null };

export type HorseBreedGroupOutDto = ApiCreatedUpdatedAtType & {
  id: UUID;
  name: string;
  slug: string;
  page_data?: string | null;
};

export type HorseBreedGroupCreateInDto = {
  name: string;
  slug?: string | null;
  page_data?: string | null;
};

export type HorseBreedGroupUpdateInDto = Partial<HorseBreedGroupCreateInDto>;
