import { eq, count } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { BackButton } from "@/components/ui/back-button";
import { db } from "@/db";
import { patientsTable, appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import { PatientsClientPage } from "./_components/patients-client-page";

const PatientsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
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

  // Buscar pacientes com contagem de consultas
  const patients = await db
    .select({
      id: patientsTable.id,
      name: patientsTable.name,
      email: patientsTable.email,
      phoneNumber: patientsTable.phoneNumber,
      sex: patientsTable.sex,
      birthDate: patientsTable.birthDate,
      emergencyContact: patientsTable.emergencyContact,
      emergencyPhone: patientsTable.emergencyPhone,
      observations: patientsTable.observations,
      cep: patientsTable.cep,
      logradouro: patientsTable.logradouro,
      numero: patientsTable.numero,
      complemento: patientsTable.complemento,
      cpf: patientsTable.cpf,
      createdAt: patientsTable.createdAt,
      updatedAt: patientsTable.updatedAt,
      clinicId: patientsTable.clinicId,
      _count: {
        appointments: count(appointmentsTable.id),
      },
    })
    .from(patientsTable)
    .leftJoin(
      appointmentsTable,
      eq(patientsTable.id, appointmentsTable.patientId),
    )
    .where(eq(patientsTable.clinicId, userClinic.clinic.id))
    .groupBy(
      patientsTable.id,
      patientsTable.name,
      patientsTable.email,
      patientsTable.phoneNumber,
      patientsTable.sex,
      patientsTable.birthDate,
      patientsTable.emergencyContact,
      patientsTable.emergencyPhone,
      patientsTable.observations,
      patientsTable.cep,
      patientsTable.logradouro,
      patientsTable.numero,
      patientsTable.complemento,
      patientsTable.cpf,
      patientsTable.createdAt,
      patientsTable.updatedAt,
      patientsTable.clinicId,
    )
    .orderBy(patientsTable.name);
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BackButton href="/dashboard" />
          <div>
            <h1 className="text-2xl font-bold">Pacientes</h1>
            <p className="text-muted-foreground text-sm">
              Acesso a detalhes dos pacientes cadastrados
            </p>
          </div>
        </div>
        <AddPatientButton />
      </div>{" "}
      <div className="mt-8">
        <PatientsClientPage patients={patients} />
      </div>
    </PageContainer>
  );
};

export default PatientsPage;
