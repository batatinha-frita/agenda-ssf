import { z } from "zod";

export const getPaymentsReportSchema = z.object({
  from: z.string().min(1, "Data inicial é obrigatória"),
  to: z.string().min(1, "Data final é obrigatória"),
  doctorId: z.string().optional(),
  paymentStatus: z
    .enum(["all", "paid", "pending", "overdue"])
    .optional()
    .default("all"),
});
