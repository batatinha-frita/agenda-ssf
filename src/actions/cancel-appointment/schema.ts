import { z } from "zod";

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z.string().optional(),
});

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
