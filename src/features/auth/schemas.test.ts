import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './schemas'

describe('loginSchema', () => {
  it('приема валидни данни', () => {
    const result = loginSchema.safeParse({ email: 'ivan@example.bg', password: 'secret123' })
    expect(result.success).toBe(true)
  })

  it('отхвърля невалиден email', () => {
    const result = loginSchema.safeParse({ email: 'не-е-email', password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('отхвърля празна парола', () => {
    const result = loginSchema.safeParse({ email: 'ivan@example.bg', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    email: 'ivan@example.bg',
    password: 'secret123',
    firstName: 'Иван',
    lastName: 'Иванов',
    phone: '+359888123456',
  }

  it('приема валидни данни', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('приема празен телефон (по избор)', () => {
    expect(registerSchema.safeParse({ ...valid, phone: '' }).success).toBe(true)
  })

  it('отхвърля парола под 8 символа', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'kratka' }).success).toBe(false)
  })

  it('отхвърля парола над 72 символа', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'x'.repeat(73) }).success).toBe(false)
  })

  it('отхвърля празно име и фамилия', () => {
    expect(registerSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, lastName: '' }).success).toBe(false)
  })
})
