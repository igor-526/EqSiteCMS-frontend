import { z } from "zod";
import type { SeoNormalizationKind } from "@/types/api/seo";

const MAX_CODE_POINTS = 255;

const ruleValue = z.string()
  .min(1, "Введите значение")
  .refine((value) => Array.from(value).length <= MAX_CODE_POINTS, "Не более 255 символов")
  .refine((value) => !/[\s\p{Cc}#]/u.test(value), "Пробельные, управляющие символы и # запрещены");

export const normalizationSchemas = {
  hashes: z.string().transform((value) => value.trim().replace(/^#/, "")).pipe(ruleValue),
  params: z.string().trim().pipe(ruleValue)
    .refine((value) => !/[&=?]/u.test(value), "Символы &, = и ? запрещены"),
} satisfies Record<SeoNormalizationKind, z.ZodType<string>>;
