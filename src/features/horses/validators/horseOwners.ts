import { HorseOwnerTypeEnum } from "@/types/api/horseOwners";
import z from "zod";

const horseOwnerBaseSchema = z.object({
    name: z.string().min(1, "Наименование должно быть заполнено").max(63, "Наименование должно быть меньше 63 символов"),
    description: z.string().max(511, "Описание должно быть менее 511 символов").optional().or(z.literal("")),
    type: z.enum(HorseOwnerTypeEnum),
    address: z.string().max(511, "Адрес должен быть менее 511 символов").optional().or(z.literal("")),
    phone_numbers: z.array(z.string()).optional().default([]),
});

export const horseOwnerCreateSchema = horseOwnerBaseSchema;
export const horseOwnerUpdateSchema = horseOwnerBaseSchema.partial();
