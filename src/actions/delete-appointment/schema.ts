import { z } from "zod";

export const deleteAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
});

export type DeleteAppointmentInput = z.infer<typeof deleteAppointmentSchema>;
