import { z } from "zod";

export const getRevenueReportSchema = z.object({
  from: z.string().min(1, "Data inicial é obrigatória"),
  to: z.string().min(1, "Data final é obrigatória"),
  doctorId: z.string().optional(),
});

export type GetRevenueReportInput = z.infer<typeof getRevenueReportSchema>;
