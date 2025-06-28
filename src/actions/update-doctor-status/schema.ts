import { z } from "zod";

export const updateDoctorStatusSchema = z.object({
  doctorId: z.string().uuid("ID do médico inválido"),
  status: z.enum(["active", "inactive", "busy"], {
    required_error: "Status é obrigatório",
    invalid_type_error: "Status deve ser: active, inactive ou busy",
  }),
});
