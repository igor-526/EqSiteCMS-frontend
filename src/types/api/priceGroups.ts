import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";

export type PriceAvailableSorting = 'name' | '-name';

export type PriceGroupListQueryParams = ApiPaginationType & {
    name?: string | null;
    description?: string | null;
    sort?: PriceAvailableSorting[];
};

export type PriceGroupSimpleOutDto = {
    id: UUID;
    name: string;
}

export type PriceGroupOutDto = ApiCreatedUpdatedAtType & PriceGroupSimpleOutDto & {
    description: string | null;
};

export type PriceGroupCreateInDto = {
    name: string;
    description?: string;
};

export type PriceGroupUpdateInDto = {
    name?: string;
    description?: string;
};