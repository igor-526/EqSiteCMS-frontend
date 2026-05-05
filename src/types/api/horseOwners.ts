import { UUID } from "crypto";
import { ApiCreatedUpdatedAtType, ApiPaginationType } from "./api";

export type HorseOwnerAvailableSorting = 'name' | 'description' | 'type' | '-name' | '-description' | '-type';

export enum HorseOwnerTypeEnum {
    PERSON = "person",
    COMPANY = "company",
}

export type HorseOwnerListQueryParams = ApiPaginationType & {
    name?: string | null;
    description?: string | null;
    type?: HorseOwnerTypeEnum[] | null;
    address?: string | null;
    phone_numbers?: string | null;
    sort?: HorseOwnerAvailableSorting[];
};

export type HorseOwnerOutDto = ApiCreatedUpdatedAtType & {
    id: UUID;
    name: string;
    description: string | null;
    type: HorseOwnerTypeEnum;
    address?: string | null;
    phone_numbers: string[];
};

export type HorseOwnerCreateInDto = {
    name: string;
    description?: string | null;
    type: HorseOwnerTypeEnum;
    address?: string | null;
    phone_numbers?: string[] | null;
};

export type HorseOwnerUpdateInDto = {
    name?: string;
    description?: string | null;
    type?: HorseOwnerTypeEnum;
    address?: string | null;
    phone_numbers?: string[] | null;
};