"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteDoctor = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
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

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.id),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    if (doctor.clinicId !== userClinic.clinic.id) {
      throw new Error("Você não tem permissão para deletar este médico.");
    }

    await db.delete(doctorsTable).where(eq(doctorsTable.id, parsedInput.id));
    revalidatePath("/doctors");

    return {
      success: true,
      message: "Médico deletado com sucesso.",
    };
  });
