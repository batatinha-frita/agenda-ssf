import { z } from "zod";

// Helper para validar CPF
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

export const upsertPatientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  sex: z.enum(["male", "female"], { required_error: "Sexo é obrigatório" }),
  cpf: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return validateCPF(val);
      },
      { message: "CPF inválido" },
    )
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  birthDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.length === 0) return undefined;
      return val;
    }),
  cep: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        const cleanCEP = val.replace(/\D/g, "");
        return cleanCEP.length === 8;
      },
      { message: "CEP deve ter 8 dígitos" },
    )
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  logradouro: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  numero: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  complemento: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  emergencyContact: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  emergencyPhone: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  observations: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

export type UpsertPatientData = z.infer<typeof upsertPatientSchema>;
