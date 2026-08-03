import { UUID } from "crypto";
import { PriceFormatter } from "./prices";

export type HorseServiceRelationOutDto = {
    id: UUID;
    horse_id: UUID;
    service_id: UUID;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    price_formatter: PriceFormatter;
};

export type HorseServiceRelationCreateInDto = {
    service_id: UUID;
    description_override?: string | null;
    price_override?: number | null;
    price_formatter_override?: PriceFormatter | null;
};

export type HorseServiceRelationUpdateInDto = {
    description_override?: string | null;
    price_override?: number | null;
    price_formatter_override?: PriceFormatter | null;
};

export type HorseServiceRelationAvailableServiceDto = {
    id: UUID;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    price_formatter: PriceFormatter;
};

export type HorseServiceRelationAvailableServicesQueryParams = {
    search?: string;
};
