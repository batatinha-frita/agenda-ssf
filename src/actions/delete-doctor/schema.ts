import { z } from "zod";

export const deleteDoctorSchema = z.object({
  id: z.string().uuid("ID do médico inválido"),
});
