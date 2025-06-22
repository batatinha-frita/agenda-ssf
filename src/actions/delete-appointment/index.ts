"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteAppointmentSchema } from "./schema";

export const deleteAppointment = actionClient
  .schema(deleteAppointmentSchema)
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
      throw new Error("Você não tem permissão para deletar este agendamento.");
    }

    // Deletar o agendamento
    await db
      .delete(appointmentsTable)
      .where(eq(appointmentsTable.id, appointmentId));

    revalidatePath("/agendamentos");
  });
