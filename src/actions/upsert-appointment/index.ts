"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput: { id, patientId, doctorId, date, time, appointmentPriceInCents, paymentStatus, notes } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      redirect("/authentication");
    }

    // Buscar a clínica do usuário
    const userClinic = await db.query.usersToClinicsTable.findFirst({
      where: (usersToClinics, { eq }) => eq(usersToClinics.userId, session.user.id),
      with: {
        clinic: true,
      },
    });    if (!userClinic) {
      redirect("/clinic-form");
    }

    // Combinar data e hora
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Buscar o médico para obter o valor da consulta
    const doctor = await db.query.doctorsTable.findFirst({
      where: (doctors, { eq }) => eq(doctors.id, doctorId),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado.");
    }

    // Verificar se já existe um agendamento no mesmo horário para o mesmo médico
    const existingAppointment = await db.query.appointmentsTable.findFirst({
      where: (appointments, { eq, and, ne }) => 
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, appointmentDateTime),
          id ? ne(appointments.id, id) : undefined
        ),
    });    if (existingAppointment) {
      throw new Error("Já existe um agendamento para este médico neste horário.");
    }

    if (id) {
      // Atualizar agendamento existente
      await db
        .update(appointmentsTable)
        .set({
          patientId,
          doctorId,
          date: appointmentDateTime,
          appointmentPriceInCents,
          paymentStatus,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(appointmentsTable.id, id));
    } else {
      // Criar novo agendamento
      await db.insert(appointmentsTable).values({
        clinicId: userClinic.clinic.id,
        patientId,
        doctorId,
        date: appointmentDateTime,
        appointmentPriceInCents,        paymentStatus,
        notes,
      });
    }

    revalidatePath("/agendamentos");
  });
