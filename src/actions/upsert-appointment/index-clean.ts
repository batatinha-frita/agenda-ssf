"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
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
      throw new Error("Clinic not found");
    }

    // Combinar data e hora
    const [hours, minutes] = parsedInput.time.split(":").map(Number);
    const appointmentDateTime = new Date(parsedInput.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Verificar se já existe um agendamento no mesmo horário para o mesmo médico
    const existingAppointment = await db.query.appointmentsTable.findFirst({
      where: (appointments, { eq, and, ne }) =>
        and(
          eq(appointments.doctorId, parsedInput.doctorId),
          eq(appointments.date, appointmentDateTime),
          parsedInput.id ? ne(appointments.id, parsedInput.id) : undefined,
        ),
    });

    if (existingAppointment) {
      throw new Error(
        "Já existe um agendamento para este médico neste horário.",
      );
    }

    await db
      .insert(appointmentsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: userClinic.clinic.id,
        date: appointmentDateTime,
        notes: parsedInput.notes || null,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          patientId: parsedInput.patientId,
          doctorId: parsedInput.doctorId,
          date: appointmentDateTime,
          appointmentPriceInCents: parsedInput.appointmentPriceInCents,
          paymentStatus: parsedInput.paymentStatus,
          appointmentStatus: parsedInput.appointmentStatus,
          notes: parsedInput.notes || null,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/appointments");
  });
