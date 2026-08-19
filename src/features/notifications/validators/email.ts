import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Введите email")
  .email("Введите корректный email");
