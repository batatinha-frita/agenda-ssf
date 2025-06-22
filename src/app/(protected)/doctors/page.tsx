import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddDoctorButton from "./_components/add-doctor-button";
import { DoctorsClientPage } from "./_components/doctors-client-page";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });  if (!session?.user) {
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

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, userClinic.clinic.id),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Médicos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os médicos da sua clínica
          </p>
        </div>
        <AddDoctorButton />
      </div>      <DoctorsClientPage doctors={doctors} />
    </PageContainer>
  );
};

export default DoctorsPage;
