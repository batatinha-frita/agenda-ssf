import { z } from "zod";

export const upsertAppointmentSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  time: z.string().min(1, "Horário é obrigatório"),
  appointmentPriceInCents: z.number().min(0, "Valor da consulta é obrigatório"),
  paymentStatus: z.enum(["paid", "pending", "overdue"]),
  appointmentStatus: z.enum(["confirmed", "pending", "cancelled", "completed"]),
  notes: z.string().optional(),
});

export type UpsertAppointmentFormData = z.infer<typeof upsertAppointmentSchema>;
