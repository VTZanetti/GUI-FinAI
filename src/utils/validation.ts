import * as yup from 'yup'

/** Regra de senha espelhada do backend (Identity): mín. 8, maiúsc, minúsc, dígito, especial. */
export const passwordSchema = yup
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .matches(/[A-Z]/, 'A senha deve conter uma letra maiúscula.')
  .matches(/[a-z]/, 'A senha deve conter uma letra minúscula.')
  .matches(/\d/, 'A senha deve conter um dígito.')
  .matches(/[^A-Za-z0-9]/, 'A senha deve conter um caractere especial.')

export const loginSchema = yup.object({
  email: yup.string().email('E-mail inválido.').required('Informe seu e-mail.'),
  password: yup.string().required('Informe sua senha.')
})

export const registerSchema = yup.object({
  firstName: yup.string().required('Informe seu nome.').max(100, 'Nome muito longo.'),
  lastName: yup.string().required('Informe seu sobrenome.').max(100, 'Sobrenome muito longo.'),
  email: yup.string().email('E-mail inválido.').required('Informe seu e-mail.'),
  password: passwordSchema.required('Informe uma senha.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem.')
    .required('Confirme sua senha.')
})

export const accountSchema = yup.object({
  name: yup.string().required('Informe o nome.').max(100, 'Nome muito longo.'),
  type: yup.string().required('Selecione o tipo.'),
  currency: yup.string().required('Informe a moeda.').max(3, 'Moeda ISO-4217 (ex.: BRL).'),
  initialBalance: yup
    .number()
    .typeError('Informe um valor numérico.')
    .required('Informe o saldo inicial.')
})

export const transactionSchema = yup.object({
  description: yup.string().required('Informe a descrição.').max(255, 'Descrição muito longa.'),
  amount: yup
    .number()
    .typeError('Informe um valor numérico.')
    .required('Informe o valor.')
    .test('not-zero', 'O valor não pode ser zero.', (v) => v !== 0),
  date: yup.string().required('Informe a data.'),
  accountId: yup.string().required('Selecione a conta.')
})

export const budgetSchema = yup.object({
  categoryId: yup.string().required('Selecione a categoria.'),
  month: yup
    .number()
    .typeError('Informe o mês.')
    .min(1, 'Mês inválido.')
    .max(12, 'Mês inválido.')
    .required('Informe o mês.'),
  year: yup
    .number()
    .typeError('Informe o ano.')
    .min(2000, 'Ano inválido.')
    .max(2100, 'Ano inválido.')
    .required('Informe o ano.'),
  limitAmount: yup
    .number()
    .typeError('Informe um valor numérico.')
    .positive('O limite deve ser positivo.')
    .required('Informe o limite.')
})
