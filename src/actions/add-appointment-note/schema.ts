import { z } from "zod";

export const addAppointmentNoteSchema = z.object({
  appointmentId: z.string().uuid(),
  note: z.string().min(1, "Observação é obrigatória"),
});

export type AddAppointmentNoteInput = z.infer<typeof addAppointmentNoteSchema>;
