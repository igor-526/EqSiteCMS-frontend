import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";

export type HorseCoatColorAvailableSorting = 'name' | 'description' | 'slug' | '-name' | '-description' | '-slug';

export type HorseCoatColorListQueryParams = ApiPaginationType & {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    page_data?: string | null;
    sort?: HorseCoatColorAvailableSorting[];
};

export type HorseCoatColorDetailQueryParams = {
    page_data?: boolean | null;
};

export type HorseCoatColorOutDto = ApiCreatedUpdatedAtType & {
    id: UUID;
    name: string;
    slug: string;
    description: string | null;
    page_data?: string | null;
};

export type HorseCoatColorCreateInDto = {
    name: string;
    slug?: string | null;
    description?: string | null;
    page_data?: string | null;
};

export type HorseCoatColorUpdateInDto = {
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    page_data?: string | null;
};