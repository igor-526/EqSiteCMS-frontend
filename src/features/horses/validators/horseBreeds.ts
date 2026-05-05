import z from "zod";

const horseBreedBaseSchema = z.object({
    name: z.string().min(1, "Наименование должно быть заполнено").max(63, "Наименование должно быть меньше 63 символов"),
    slug: z.string().max(63, "Slug должно быть меньше 63 символов").optional().or(z.literal("")),
    description: z.string().max(511, "Описание должно быть менее 511 символов").optional().or(z.literal("")),
});

export const horseBreedCreateSchema = horseBreedBaseSchema;
export const horseBreedUpdateSchema = horseBreedBaseSchema.partial();
