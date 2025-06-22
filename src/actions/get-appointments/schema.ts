import { z } from "zod";

export const getAppointmentsSchema = z.object({
  doctorId: z.string().min(1),
  date: z.date(),
});
