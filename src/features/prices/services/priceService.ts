import { priceCreate, priceDelete, priceDetail, priceList, pricePhotosUpdate, priceUpdate } from "@/api/price";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";
import { PriceCreateInDto, PriceListQueryParams, PriceOutDto, PriceUpdateInDto } from "@/types/api/prices";
import { UUID } from "crypto";

export const fetchPriceList = async (
    params: PriceListQueryParams
): Promise<ApiResult<ApiListPaginatedResponseType<PriceOutDto>>> => {
    return await priceList(params);
};

export const fetchPrice = async (
    priceId: UUID,
    params?: { page_data?: boolean },
): Promise<ApiResult<PriceOutDto>> => {
    return await priceDetail(priceId, params);
};

export const fetchCreatePrice = async (
    data: PriceCreateInDto
): Promise<ApiResult<PriceOutDto>> => {
    return await priceCreate(data);
};

export const fetchUpdatePrice = async (
    priceId: UUID,
    data: PriceUpdateInDto
): Promise<ApiResult<PriceOutDto>> => {
    return await priceUpdate(priceId, data);
};

export const fetchDeletePrice = async (
    priceId: UUID
): Promise<ApiResult<null>> => {
    return await priceDelete(priceId);
};

export const fetchUpdatePricePhotos = async (
    priceId: UUID,
    data: PhotoUpdateEntityInDto
): Promise<ApiResult<null>> => {
    return await pricePhotosUpdate(priceId, data);
};