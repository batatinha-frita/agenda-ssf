import { z } from "zod";

export const reactivateAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
});

export type ReactivateAppointmentInput = z.infer<
  typeof reactivateAppointmentSchema
>;
