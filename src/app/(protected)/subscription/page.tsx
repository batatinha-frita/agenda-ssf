import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

import { SubscriptionPlan } from "./_components/subscription-plan";

const SubscriptionPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const access = hasActiveSubscription(session.user);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Assinatura</PageTitle>
          <PageDescription>
            {access.type === "trial"
              ? `Gerencie sua assinatura. Trial restante: ${access.daysLeft} dias`
              : access.type === "paid"
                ? "Gerencie sua assinatura ativa."
                : "Seu trial expirou. Assine para continuar usando o sistema."}
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <SubscriptionPlan
          className="w-[350px]"
          active={access.type === "paid"}
          userEmail={session.user.email}
        />
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
