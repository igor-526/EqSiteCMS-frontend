import { UUID } from "crypto";
import z from "zod";

const priceGroupBaseSchema = z.object({
    name: z.string().min(1, "Наименование должно быть заполнено").max(63, "Наименование должно быть меньше 63 символов"),
    description: z.string().max(511, "Описание должно быть меньше 511 символов").optional().or(z.literal("")),
});

const priceBaseSchema = z.object({
    name: z.string().min(1, "Наименование должно быть заполнено").max(63, "Наименование должно быть меньше 63 символов"),
    description: z.string().max(511, "Описание должно быть меньше 511 символов").optional().or(z.literal("")),
    groups: z.array(z.custom<UUID>()),
});

export const priceGroupCreateSchema = priceGroupBaseSchema;
export const priceGroupUpdateSchema = priceGroupBaseSchema.partial();
export const priceCreateSchema = priceBaseSchema;
export const priceUpdateSchema = priceBaseSchema.partial();