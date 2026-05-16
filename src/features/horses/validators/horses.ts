import z from "zod";

const horseBaseSchema = z.object({
    name: z
        .string()
        .min(1, "Кличка должна быть заполнена")
        .max(255, "Кличка должна быть меньше 255 символов"),
    description: z
        .string()
        .max(2047, "Описание должно быть меньше 2047 символов")
        .optional()
        .nullable()
        .or(z.literal("")),
    breed_id: z.string().uuid("Некорректный идентификатор породы").optional().nullable(),
    coat_color_id: z.string().uuid("Некорректный идентификатор масти").optional().nullable(),
    kind: z.enum(["horse", "pony"]).optional(),
    height: z
        .number()
        .min(0, "Рост не может быть меньше 0")
        .max(300, "Рост не может быть больше 300 см")
        .optional()
        .nullable(),
    sex: z.enum(["male", "female", "geld"]).optional(),
    bdate: z.string().optional().nullable(),
    ddate: z.string().optional().nullable(),
    bdate_mode: z.enum(["y", "ym", "ymd", "hide"]).optional(),
    ddate_mode: z.enum(["y", "ym", "ymd", "hide"]).optional(),
    horse_owner_id: z.string().uuid("Некорректный идентификатор владельца").optional().nullable(),
    this_stable: z.boolean().optional(),
});

export const horseCreateSchema = horseBaseSchema.extend({
    name: z
        .string()
        .min(1, "Кличка должна быть заполнена")
        .max(255, "Кличка должна быть меньше 255 символов"),
});

export const horseUpdateSchema = horseBaseSchema.partial();
