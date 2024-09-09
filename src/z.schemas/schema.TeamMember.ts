import z from "zod";

export const name = z
    .string()
    .regex(/^[\p{Script=Cyrillic}]+$/u, {
        message: "Неправильний формат імені. Викоритсовуйте тільки букви кирилиці",
    })
    .min(2, { message: "Ім'я повинно містити мінімум 2 букви" });

export const surname = z
    .string()
    .regex(/^[\p{Script=Cyrillic}]+$/u, {
        message:
            "Неправильний формат прізвиша. Викоритсовуйте тільки букви кирилиці",
    })
    .min(2, { message: "Прізвище повинно містити мінімум 2 букви" });

export const age = z
    .number({
        message: "Неправильний формат поівдомлення. Використовуйте тільки цифри",
    })
    .gte(14, { message: "Вам повинно бути більше 14 років включно" })
    .lte(50, { message: "Вам повинно бути менше 50 років включно" });

export const university = z
    .string()
    .min(2, "Повідмолення повинно містити мінімум 2 букви");

export const group = z
    .string()
    .regex(
        /^[\p{Script=Cyrillic}]{2,3}-\d{2}$/u,
        "Неправильний формат групи. Використовуйте формат XX-YY, де XX - дві або три букви, YY - дві цифри",
    );

export const course = z
    .number()
    .min(1, "Неправильний формат поівдомлення.")
    .lte(6, "Курс повинен бути від 1 до 6")
    .gt(0, "Курс повинен бути від 1 до 6");

export const source = z
    .string()
    .min(1, "Будь ласка, вкажіть як дізналися про проєкт");

export const contact = z.number();
