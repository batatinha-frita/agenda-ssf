"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, gte, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppointmentsSchema } from "./schema";

export const getAppointments = actionClient
  .schema(getAppointmentsSchema)
  .action(async ({ parsedInput: { doctorId, date } }) => {
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
    });

    if (!userClinic) {
      redirect("/clinic-form");
    }

    // Definir o início e fim do dia
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar agendamentos do médico na data especificada
    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, doctorId),
        eq(appointmentsTable.clinicId, userClinic.clinic.id),
        gte(appointmentsTable.date, startOfDay),
        lt(appointmentsTable.date, endOfDay)
      ),
      columns: {
        id: true,
        date: true,
      },
    });

    return appointments.map(appointment => appointment.date);
  });
