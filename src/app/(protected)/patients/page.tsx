import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";

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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Número de Celular</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.phoneNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {patient.sex === "male" ? "Masculino" : "Feminino"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/patients/${patient.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum paciente cadastrado ainda.</p>
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
