import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { BackButton } from "@/components/ui/back-button";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddDoctorButton from "./_components/add-doctor-button";
import { DoctorsFilterProvider } from "./_components/doctors-filter-context";
import { DoctorsSearchBar } from "./_components/doctors-search-bar";
import { DoctorsTableContainer } from "./_components/doctors-table-container";

export default async function DoctorsPage() {
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

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, userClinic.clinic.id),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });

  return (
    <PageContainer>
      <DoctorsFilterProvider doctors={doctors}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex flex-shrink-0 items-center">
            <BackButton href="/dashboard" />
            <div>
              <h1 className="text-2xl font-bold">Médicos</h1>
              <p className="text-muted-foreground text-sm">
                Gerencie os médicos da sua clínica
              </p>
            </div>
          </div>
          <div className="max-w-md flex-1">
            <DoctorsSearchBar />
          </div>
          <div className="flex-shrink-0">
            <AddDoctorButton />
          </div>
        </div>
        <DoctorsTableContainer />
      </DoctorsFilterProvider>
    </PageContainer>
  );
}
