import { z } from 'zod'

export const companySchema = z.object({
  eik: z
    .string()
    .trim()
    .regex(/^[0-9]{9}$/, 'ЕИК трябва да е 9 цифри'),
  name: z.string().trim().min(1, 'Въведете име на фирмата').max(200),
  legalName: z.string().trim().min(1, 'Въведете юридическо име').max(200),
  email: z.email('Невалиден email адрес'),
  phone: z.string().trim().min(1, 'Въведете телефон').max(30),
})

/** Форма за добавяне на обект към съществуваща фирма. */
export const salonSchema = z.object({
  name: z.string().trim().min(1, 'Въведете име на обекта').max(200),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  cityId: z.string().min(1, 'Изберете град'),
  address: z.string().trim().min(1, 'Въведете адрес').max(300),
  email: z.email('Невалиден email адрес'),
  phone: z.string().trim().min(1, 'Въведете телефон').max(30),
})

export type CompanyFormValues = z.infer<typeof companySchema>
export type SalonFormValues = z.infer<typeof salonSchema>
