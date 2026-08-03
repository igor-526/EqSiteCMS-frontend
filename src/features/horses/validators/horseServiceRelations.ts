import { PriceFormatter } from "@/types/api/prices";
import z from "zod";

export const horseServiceRelationCreateSchema = z.object({
    service_id: z.string().min(1, "Выберите услугу"),
    description_override: z.string().max(511, "Описание должно быть менее 511 символов").optional().nullable(),
    price_override: z.number().int("Цена должна быть целым числом").min(0, "Цена не может быть отрицательной").optional().nullable(),
    price_formatter_override: z.nativeEnum(PriceFormatter).optional().nullable(),
});

export const horseServiceRelationUpdateSchema = z.object({
    description_override: z.string().max(511, "Описание должно быть менее 511 символов").optional().nullable(),
    price_override: z.number().int("Цена должна быть целым числом").min(0, "Цена не может быть отрицательной").optional().nullable(),
    price_formatter_override: z.nativeEnum(PriceFormatter).optional().nullable(),
});
