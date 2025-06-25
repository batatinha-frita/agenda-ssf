"use server";

import { eq, and, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

export const upsertPatientAction = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.clinic) {
      redirect("/authentication");
    }

    const { id, ...patientData } = parsedInput; // Converter undefined para null para o banco de dados
    const dataForDb = {
      name: patientData.name,
      email: patientData.email,
      phoneNumber: patientData.phoneNumber,
      sex: patientData.sex,
      cpf: patientData.cpf || null,
      birthDate:
        patientData.birthDate && patientData.birthDate.length > 0
          ? new Date(patientData.birthDate)
          : null,
      cep: patientData.cep || null,
      logradouro: patientData.logradouro || null,
      numero: patientData.numero || null,
      complemento: patientData.complemento || null,
      emergencyContact: patientData.emergencyContact || null,
      emergencyPhone: patientData.emergencyPhone || null,
      observations: patientData.observations || null,
      clinicId: session.user.clinic.id,
    };
    // Validar CPF único se fornecido
    if (patientData.cpf) {
      const cpfQuery = id
        ? db
            .select()
            .from(patientsTable)
            .where(
              and(
                eq(patientsTable.cpf, patientData.cpf),
                ne(patientsTable.id, id),
                eq(patientsTable.clinicId, session.user.clinic.id),
              ),
            )
        : db
            .select()
            .from(patientsTable)
            .where(
              and(
                eq(patientsTable.cpf, patientData.cpf),
                eq(patientsTable.clinicId, session.user.clinic.id),
              ),
            );

      const existingPatient = await cpfQuery;
      if (existingPatient.length > 0) {
        throw new Error("CPF já cadastrado para outro paciente nesta clínica");
      }
    }

    if (id) {
      // Update existing patient
      const { clinicId, ...updateData } = dataForDb;
      await db
        .update(patientsTable)
        .set(updateData)
        .where(eq(patientsTable.id, id));
    } else {
      // Create new patient
      await db.insert(patientsTable).values(dataForDb);
    }

    revalidatePath("/patients");
    if (id) {
      revalidatePath(`/patients/${id}`);
    }
    return { success: true };
  });
