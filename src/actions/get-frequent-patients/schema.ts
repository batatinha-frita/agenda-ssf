import { z } from "zod";

export const getFrequentPatientsSchema = z.object({
  clinicId: z.string().uuid(),
  minConsultations: z.number().min(0).default(0),
});

export type GetFrequentPatientsSchema = z.infer<
  typeof getFrequentPatientsSchema
>;
