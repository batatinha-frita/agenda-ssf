"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { deletePatientSchema } from "./schema";

export const deletePatientAction = actionClient
  .schema(deletePatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.clinic) {
      redirect("/authentication");
    }

    const { id } = parsedInput;

    // Verificar se o paciente pertence à clínica do usuário
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, id),
    });

    if (!patient || patient.clinicId !== session.user.clinic.id) {
      throw new Error("Paciente não encontrado ou não autorizado");
    }

    // Deletar o paciente
    await db.delete(patientsTable).where(eq(patientsTable.id, id));

    revalidatePath("/patients");
    return { success: true };
  });
