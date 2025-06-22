import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
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

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, userClinic.clinic.id),
    orderBy: (patients, { asc }) => [asc(patients.name)],
  });
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm">
            Acesso a detalhes dos pacientes cadastrados
          </p>
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
