"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { updateDoctorStatusSchema } from "./schema";

export const updateDoctorStatus = actionClient
  .schema(updateDoctorStatusSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
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
      redirect("/clinic-form");
    }

    const { doctorId, status } = parsedInput;

    // Verificar se o médico pertence à clínica do usuário
    const doctor = await db.query.doctorsTable.findFirst({
      where: (doctors, { eq }) => eq(doctors.id, doctorId),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado.");
    }

    if (doctor.clinicId !== userClinic.clinic.id) {
      throw new Error("Você não tem permissão para alterar este médico.");
    }

    // Atualizar o status do médico
    await db
      .update(doctorsTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(doctorsTable.id, doctorId));

    revalidatePath("/doctors");

    return {
      success: true,
      message: `Status do médico atualizado para: ${status}`,
    };
  });
