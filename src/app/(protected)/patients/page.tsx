import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import { PatientsDataTable } from "./_components/patients-data-table";

const PatientsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    redirect("/authentication");
  }
  
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  
  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
  });

  return (
    <PageContainer>
      <PageHeader>        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>Acesso a detalhes dos pacientes cadastrados</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>      <PageContent>
        {patients.length > 0 ? (
          <PatientsDataTable data={patients} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Nenhum paciente cadastrado ainda.</p>
            <p className="text-sm mt-2">
              Clique em "Adicionar Paciente" para começar.
            </p>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;
