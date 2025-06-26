import { z } from "zod";

export const upsertAppointmentSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  date: z.date({
    required_error: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
  appointmentPriceInCents: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  paymentStatus: z.enum(["paid", "pending", "overdue"], {
    required_error: "Status de pagamento é obrigatório.",
  }),
  appointmentStatus: z
    .enum(["confirmed", "cancelled"], {
      required_error: "Status da consulta é obrigatório.",
    })
    .optional(),
  notes: z.string().optional(),
});
