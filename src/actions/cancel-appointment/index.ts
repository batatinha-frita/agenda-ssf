"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cancelAppointmentSchema } from "./schema";

export const cancelAppointment = actionClient
  .schema(cancelAppointmentSchema)
  .action(async ({ parsedInput: { appointmentId, reason } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      redirect("/authentication");
    }

    // Buscar a clínica do usuário
    const userClinic = await db.query.usersToClinicsTable.findFirst({
      where: (usersToClinics, { eq }) =>
        eq(usersToClinics.userId, session.user.id),
      with: {
        clinic: true,
      },
    });

    if (!userClinic) {
      redirect("/clinic-form");
    }

    // Buscar o agendamento para verificar se pertence à clínica do usuário
    const appointment = await db.query.appointmentsTable.findFirst({
      where: (appointments, { eq }) => eq(appointments.id, appointmentId),
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    if (appointment.clinicId !== userClinic.clinic.id) {
      throw new Error("Você não tem permissão para cancelar este agendamento.");
    }

    // Verificar se a consulta pode ser cancelada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);

    // Não pode cancelar consultas passadas
    if (appointmentDate < today) {
      throw new Error("Não é possível cancelar consultas que já passaram.");
    }

    // Não pode cancelar consultas já pagas
    if (appointment.paymentStatus === "paid") {
      throw new Error(
        "Não é possível cancelar consultas já pagas. Entre em contato com o financeiro.",
      );
    } // Não pode cancelar consultas já canceladas
    if (appointment.appointmentStatus === "cancelled") {
      throw new Error("Esta consulta já está cancelada.");
    }

    // Cancelar o agendamento
    await db
      .update(appointmentsTable)
      .set({
        appointmentStatus: "cancelled",
        paymentStatus: "pending", // Volta para pendente se estava em outro status
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, appointmentId));

    // Adicionar observação de cancelamento se foi fornecido motivo
    if (reason) {
      const { appointmentNotesTable } = await import("@/db/schema");
      await db.insert(appointmentNotesTable).values({
        appointmentId,
        note: `[CANCELAMENTO] ${reason}`,
        createdBy: session.user.id,
      });
    }

    revalidatePath("/appointments");

    return {
      success: true,
      message: "Consulta cancelada com sucesso.",
    };
  });
