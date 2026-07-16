import { z } from 'zod'

export const companySchema = z.object({
  eik: z
    .string()
    .trim()
    .regex(/^[0-9]{9}$/, 'ЕИК трябва да е 9 цифри'),
  name: z.string().trim().min(1, 'Въведете име на фирмата').max(200),
  legalName: z.string().trim().min(1, 'Въведете юридическо име').max(200),
})

export const salonSchema = z.object({
  name: z.string().trim().min(1, 'Въведете име на салона').max(200),
  description: z.string().trim().max(5000).optional(),
  cityId: z.string().min(1, 'Изберете град'),
  address: z.string().trim().min(1, 'Въведете адрес').max(300),
  email: z.email('Невалиден email адрес'),
  phone: z.string().trim().min(1, 'Въведете телефон').max(30),
})

export const serviceSchema = z.object({
  categoryId: z.string().min(1, 'Изберете категория'),
  name: z.string().trim().min(1, 'Въведете име на услугата').max(200),
  durationMin: z.string().min(1, 'Въведете продължителност').regex(/^\d+$/, 'Само цифри'),
  price: z.string().min(1, 'Въведете цена').regex(/^\d+(\.\d{1,2})?$/, 'Невалидна цена'),
})

export const photoSchema = z.object({
  url: z.string().trim().url('Въведете валиден URL').max(500),
})

export type CompanyFormValues = z.infer<typeof companySchema>
export type SalonFormValues = z.infer<typeof salonSchema>
export type ServiceFormValues = z.infer<typeof serviceSchema>
export type PhotoFormValues = z.infer<typeof photoSchema>
