"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { reactivateAppointmentSchema } from "./schema";

export const reactivateAppointment = actionClient
  .schema(reactivateAppointmentSchema)
  .action(async ({ parsedInput: { appointmentId } }) => {
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
      throw new Error("Você não tem permissão para reativar este agendamento.");
    }

    // Verificar se a consulta pode ser reativada
    if (appointment.appointmentStatus !== "cancelled") {
      throw new Error("Apenas consultas canceladas podem ser reativadas.");
    }

    // Verificar se ainda é uma consulta futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      throw new Error("Não é possível reativar consultas que já passaram.");
    }

    // Reativar o agendamento
    await db
      .update(appointmentsTable)
      .set({
        appointmentStatus: "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, appointmentId));

    revalidatePath("/appointments");

    return {
      success: true,
      message: "Consulta reativada com sucesso.",
    };
  });
