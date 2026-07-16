import { describe, expect, it } from 'vitest'
import { companySchema } from './onboardingSchemas'

describe('onboardingSchemas', () => {
  it('companySchema приема валиден 9-цифрен ЕИК', () => {
    const result = companySchema.safeParse({
      eik: '131529327',
      name: 'Тест',
      legalName: 'Test EOOD',
    })
    expect(result.success).toBe(true)
  })

  it('companySchema отхвърля 13-цифрен ЕИК', () => {
    const result = companySchema.safeParse({
      eik: '1315293270001',
      name: 'Тест',
      legalName: 'Test EOOD',
    })
    expect(result.success).toBe(false)
  })

  it('companySchema отхвърля невалиден ЕИК', () => {
    const result = companySchema.safeParse({
      eik: '123',
      name: 'Тест',
      legalName: 'Test EOOD',
    })
    expect(result.success).toBe(false)
  })
})
