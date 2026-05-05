import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";

export type PhotoAvailableSorting = 'name' | '-name' | 'description' | '-description';

export type PhotoListQueryParams = ApiPaginationType & {
    name?: string;
    description?: string;
    sort?: PhotoAvailableSorting[];
    price_ids?: UUID[];
    horse_ids?: UUID[];
};

export type PhotoOutShortDto = {
    id: UUID;
    is_main: boolean;
    url: string;
};

export type PhotoOutDto = ApiCreatedUpdatedAtType & {
    id: UUID;
    name: string;
    description: string | null;
    path: string;
    url: string;
};

export type PhotoCreateInDto = {
    name?: string;
    description?: string;
    file: File;
};

export type PhotoUpdateInDto = {
    name?: string;
    description?: string;
    file?: File;
};

export type PhotoBatchDeleteInDto = {
    ids: UUID[];
};

export type PhotoUpdateEntityInDto = {
    photo_ids?: UUID[];
    main?: UUID;
};