import z from "zod";

export const newsCreateSchema = z.object({
    name: z
        .string()
        .min(1, "Название должно быть заполнено")
        .max(63, "Название должно быть не более 63 символов"),
    snippet: z
        .string()
        .max(255, "Сниппет должен быть не более 255 символов")
        .nullable()
        .optional(),
    published_at: z.string().min(1, "Дата публикации должна быть заполнена"),
    content: z.string(),
});

export const newsUpdateSchema = newsCreateSchema.partial();
