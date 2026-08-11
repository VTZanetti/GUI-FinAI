import { describe, it, expect } from 'vitest'
import { passwordSchema, loginSchema, registerSchema } from '@/utils/validation'

describe('passwordSchema', () => {
  const ok = 'Senha@123'

  it('aceita senha forte', async () => {
    await expect(passwordSchema.validate(ok)).resolves.toBe(ok)
  })

  it('rejeita senha curta', async () => {
    await expect(passwordSchema.validate('Ab1@')).rejects.toThrow('8 caracteres')
  })

  it('rejeita sem maiúscula', async () => {
    await expect(passwordSchema.validate('senha@123')).rejects.toThrow('maiúscula')
  })

  it('rejeita sem minúscula', async () => {
    await expect(passwordSchema.validate('SENHA@123')).rejects.toThrow('minúscula')
  })

  it('rejeita sem dígito', async () => {
    await expect(passwordSchema.validate('Senha@abc')).rejects.toThrow('dígito')
  })

  it('rejeita sem especial', async () => {
    await expect(passwordSchema.validate('Senha123')).rejects.toThrow('especial')
  })
})

describe('loginSchema', () => {
  it('valida credenciais corretas', async () => {
    await expect(loginSchema.validate({ email: 'a@b.com', password: 'x' })).resolves.toBeTruthy()
  })

  it('rejeita email inválido', async () => {
    await expect(loginSchema.validate({ email: 'invalido', password: 'x' })).rejects.toThrow('E-mail inválido')
  })
})

describe('registerSchema', () => {
  const valid = {
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'a@b.com',
    password: 'Senha@123',
    confirmPassword: 'Senha@123'
  }

  it('valida registro correto', async () => {
    await expect(registerSchema.validate(valid)).resolves.toBeTruthy()
  })

  it('rejeita senhas diferentes', async () => {
    await expect(
      registerSchema.validate({ ...valid, confirmPassword: 'Outra@123' })
    ).rejects.toThrow('não coincidem')
  })

  it('rejeita sem nome', async () => {
    await expect(registerSchema.validate({ ...valid, firstName: '' })).rejects.toThrow('nome')
  })
})
