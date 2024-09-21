import z from "zod"
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Формат повідомлення неправильний. Код повинен містити 24 символи шістнадяцткових знаечнь")