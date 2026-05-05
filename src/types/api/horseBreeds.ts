import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";

export type HorseBreedAvailableSorting = 'name' | 'description' | 'slug' | '-name' | '-description' | '-slug';

export type HorseBreedListQueryParams = ApiPaginationType & {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    page_data?: string | null;
    sort?: HorseBreedAvailableSorting[];
};

export type HorseBreedDetailQueryParams = {
    page_data?: boolean | null;
};

export type HorseBreedOutDto = ApiCreatedUpdatedAtType & {
    id: UUID;
    name: string;
    slug: string;
    description: string | null;
    page_data?: string | null;
};

export type HorseBreedCreateInDto = {
    name: string;
    slug?: string | null;
    description?: string | null;
    page_data?: string | null;
};

export type HorseBreedUpdateInDto = {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    page_data?: string | null;
};