import { PriceFormatter } from "@/types/api/prices";
import z from "zod";

const horseServiceBaseSchema = z.object({
    name: z.string().min(1, "Наименование должно быть заполнено").max(63, "Наименование должно быть меньше 63 символов"),
    slug: z.string().max(63, "Slug должно быть меньше 63 символов").optional().or(z.literal("")),
    description: z.string().max(511, "Описание должно быть менее 511 символов").optional().or(z.literal("")),
    price: z.number().int("Цена должна быть целым числом").min(0, "Цена не может быть отрицательной"),
    price_formatter: z.enum(PriceFormatter),
});

export const horseServiceCreateSchema = horseServiceBaseSchema;
export const horseServiceUpdateSchema = horseServiceBaseSchema.partial();
