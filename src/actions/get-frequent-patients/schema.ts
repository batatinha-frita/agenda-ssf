import { z } from "zod";

export const getFrequentPatientsSchema = z.object({
  clinicId: z.string().uuid(),
  minConsultations: z.number().min(1).default(1),
});

export type GetFrequentPatientsSchema = z.infer<
  typeof getFrequentPatientsSchema
>;
