import { z } from "zod";

const fields = {
  name: z.string().trim().min(1, "Укажите наименование").max(255),
  slug: z.string().trim().max(255).nullable().optional(),
  page_data: z.string().nullable().optional(),
};

export const horseBreedGroupCreateSchema = z.object(fields);
export const horseBreedGroupUpdateSchema = z.object(fields).partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Укажите изменяемые поля" },
);
