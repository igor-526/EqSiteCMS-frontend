import { z } from "zod";

export const updateProfileSchema = z.object({
    first_name: z.string().max(63, "Максимальная длина 63 символа").nullable(),
    last_name: z.string().max(63, "Максимальная длина 63 символа").nullable(),
    middle_name: z.string().max(63, "Максимальная длина 63 символа").nullable(),
});

export const changePasswordSchema = z
    .object({
        current_password: z.string().min(1, "Введите текущий пароль"),
        new_password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
        confirm_new_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_new_password, {
        message: "Пароли не совпадают",
        path: ["confirm_new_password"],
    });

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
