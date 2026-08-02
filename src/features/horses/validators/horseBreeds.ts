import z from "zod";

const horseBreedBaseSchema = z.object({
    name: z.string().min(1, "Наименование должно быть заполнено").max(63, "Наименование должно быть меньше 63 символов"),
    short_name: z.string().max(63, "Короткое наименование должно быть не длиннее 63 символов").optional().or(z.literal("")),
    slug: z.string().max(63, "Slug должно быть меньше 63 символов").optional().or(z.literal("")),
    description: z.string().max(511, "Описание должно быть менее 511 символов").optional().or(z.literal("")),
    kind: z.enum(["horse", "pony"]).default("horse"),
});

export const horseBreedCreateSchema = horseBreedBaseSchema;
export const horseBreedUpdateSchema = horseBreedBaseSchema.partial();
