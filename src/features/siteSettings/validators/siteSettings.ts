import { SiteSettingType } from "@/types/api/siteSettings";
import z from "zod";

const siteSettingBaseSchema = z.object({
    key: z.string().min(1, "Ключ должно быть заполнен").max(63, "Ключ должен быть меньше 63 символов"),
    value: z.string().min(1, "Значение должно быть заполнено"),
    name: z.string().min(1, "Наименование должно быть заполнено").max(63, "Наименование должно быть меньше 63 символов"),
    description: z.string().max(511, "Описание должно быть менее 511 символов").optional().or(z.literal("")),
    type: z.enum(SiteSettingType),
});



export const siteSettingCreateSchema = siteSettingBaseSchema;
export const siteSettingUpdateSchema = siteSettingBaseSchema.partial();