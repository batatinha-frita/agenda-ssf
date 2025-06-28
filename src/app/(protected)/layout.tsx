import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrialBanner } from "@/components/trial-banner";
import { auth } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

import { AppSidebar } from "./_components/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  // Verificar acesso à assinatura
  const access = hasActiveSubscription(session.user);

  return (
    <div className="min-h-screen">
      {/* Banner de trial fixo no topo */}
      {access.type === "trial" && access.daysLeft && (
        <TrialBanner daysLeft={access.daysLeft} />
      )}

      <div
        className={access.type === "trial" && access.daysLeft ? "pt-16" : ""}
      >
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </div>
    </div>
  );
}
