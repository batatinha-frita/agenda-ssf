"use server";

import { db } from "@/db";
import { appointmentNotesTable, appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addAppointmentNoteSchema } from "./schema";

export const addAppointmentNote = actionClient
  .schema(addAppointmentNoteSchema)
  .action(async ({ parsedInput: { appointmentId, note } }) => {
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

    // Verificar se o agendamento pertence à clínica do usuário
    const appointment = await db.query.appointmentsTable.findFirst({
      where: (appointments, { eq }) => eq(appointments.id, appointmentId),
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    if (appointment.clinicId !== userClinic.clinic.id) {
      throw new Error(
        "Você não tem permissão para adicionar observações a este agendamento.",
      );
    }

    // Adicionar a observação
    await db.insert(appointmentNotesTable).values({
      appointmentId,
      note: note.trim(),
      createdBy: session.user.id,
    });

    revalidatePath("/appointments");
    revalidatePath(`/appointments/${appointmentId}`);

    return {
      success: true,
      message: "Observação adicionada com sucesso.",
    };
  });
