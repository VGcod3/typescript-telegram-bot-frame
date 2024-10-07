import z from "zod";
export const MAX_STRING_LENGTH = 50
export const name = z
  .string().max(MAX_STRING_LENGTH, {message: "Використовуйте менше 50-ти символів"});;

export const surname = z
  .string().max(MAX_STRING_LENGTH, {message: "Використовуйте менше 50-ти символів"});

export const age = z
  .number({
    message: "Неправильний формат поівдомлення. Викорисоввуйте тільки цифри",
  })
  .gte(17, { message: "Вам повинно бути більше 17 років включно" })
  .lte(50, { message: "Вам повинно бути менше 50 років включно" });

export const university = z
  .string()
  .min(2, "Повідмолення повинно містити мінімум 2 букви").max(MAX_STRING_LENGTH, {message: "Використовуйте менше 50-ти символів"});;

export const group = z
  .string().max(MAX_STRING_LENGTH, {message: "Використовуйте менше 50-ти символів"});;

export const course = z
  .number({message: "Курс повинен бути числом"})
  .min(1, "Неправильний формат поівдомлення.")
  .lte(6, "Курс повинен бути від 1 до 6")
  .gt(0, "Курс повинен бути від 1 до 6");

export const source = z
  .string()
  .min(1, "Будь ласка, вкажіть як дізналися про проєкт").max(MAX_STRING_LENGTH, {message: "Використовуйте менше 50-ти символів"});;
export const contact = z.string();
