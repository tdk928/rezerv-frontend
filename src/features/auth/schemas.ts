import { z } from 'zod'

/** Валидацията отразява правилата на rezerv-cas (RegisterRequest/LoginRequest). */

export const loginSchema = z.object({
  email: z.email('Невалиден email адрес'),
  password: z.string().min(1, 'Паролата е задължителна'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.email('Невалиден email адрес'),
  password: z
    .string()
    .min(8, 'Паролата трябва да е поне 8 символа')
    .max(72, 'Паролата трябва да е най-много 72 символа'),
  firstName: z.string().min(1, 'Името е задължително').max(100, 'Най-много 100 символа'),
  lastName: z.string().min(1, 'Фамилията е задължителна').max(100, 'Най-много 100 символа'),
  phone: z.string().trim().min(1, 'Телефонът е задължителен').max(32, 'Най-много 32 символа'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
