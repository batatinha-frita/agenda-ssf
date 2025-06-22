"use server";

import { eq } from "drizzle-orm";
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

    const { id, ...patientData } = parsedInput;

    if (id) {
      // Update existing patient
      await db
        .update(patientsTable)
        .set({
          ...patientData,
          clinicId: session.user.clinic.id,
        })
        .where(eq(patientsTable.id, id));
    } else {
      // Create new patient
      await db.insert(patientsTable).values({
        ...patientData,
        clinicId: session.user.clinic.id,
      });
    }

    revalidatePath("/patients");
    if (id) {
      revalidatePath(`/patients/${id}`);
    }
    return { success: true };
  });
