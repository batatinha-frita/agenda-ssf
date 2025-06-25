"use server";

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { count, desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getFrequentPatientsSchema } from "./schema";

export const getFrequentPatients = actionClient
  .schema(getFrequentPatientsSchema)
  .action(async ({ parsedInput: { clinicId, minConsultations } }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        redirect("/authentication");
      }

      // Usar o clinic ID da sessão em vez do parâmetro se disponível
      const actualClinicId = session.user.clinic?.id || clinicId;

      if (!actualClinicId) {
        return {
          data: [],
          message: "Nenhuma clínica encontrada para o usuário",
        };
      }

      // Buscar pacientes com contagem de consultas
      console.log("Buscando pacientes para clinic ID:", actualClinicId);

      const patientsWithConsultations = await db
        .select({
          id: patientsTable.id,
          name: patientsTable.name,
          email: patientsTable.email,
          sex: patientsTable.sex,
          consultations: count(appointmentsTable.id),
        })
        .from(patientsTable)
        .leftJoin(
          appointmentsTable,
          eq(patientsTable.id, appointmentsTable.patientId),
        )
        .where(eq(patientsTable.clinicId, actualClinicId))
        .groupBy(
          patientsTable.id,
          patientsTable.name,
          patientsTable.email,
          patientsTable.sex,
        )
        .orderBy(desc(count(appointmentsTable.id)));

      console.log("Pacientes encontrados:", patientsWithConsultations.length);
      console.log("Dados dos pacientes:", patientsWithConsultations);

      // Filtrar pacientes que atendem ao critério mínimo APÓS a busca
      const filteredPatients = patientsWithConsultations.filter(
        (patient) => patient.consultations >= minConsultations,
      );

      console.log("Pacientes filtrados:", filteredPatients.length);

      // Categorizar pacientes por frequência
      const categorizedPatients = filteredPatients.map((patient) => {
        let level = "Novo";
        let icon = "User";

        if (patient.consultations >= 10) {
          level = "VIP";
          icon = "Flame";
        } else if (patient.consultations >= 5) {
          level = "Frequente";
          icon = "Star";
        } else if (patient.consultations >= 2) {
          level = "Regular";
          icon = "User";
        }

        return {
          ...patient,
          level,
          icon,
        };
      });

      return {
        data: categorizedPatients,
      };
    } catch (error) {
      console.error("Erro ao buscar pacientes frequentes:", error);
      throw new Error("Erro ao buscar pacientes frequentes");
    }
  });
