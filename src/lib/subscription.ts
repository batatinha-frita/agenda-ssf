interface User {
  id: string;
  plan?: string | null;
  stripeSubscriptionId?: string | null;
  trialEndsAt?: Date | null;
  createdAt: Date;
}

interface SubscriptionAccess {
  hasAccess: boolean;
  type: "paid" | "trial" | "expired";
  daysLeft?: number;
}

export function hasActiveSubscription(user: User): SubscriptionAccess {
  // Se tem plano pago ativo
  if (user.plan === "essential" && user.stripeSubscriptionId) {
    return { hasAccess: true, type: "paid" };
  }

  // Se está no trial
  if (user.trialEndsAt && new Date() < new Date(user.trialEndsAt)) {
    const daysLeft = Math.ceil(
      (new Date(user.trialEndsAt).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return { hasAccess: true, type: "trial", daysLeft };
  }

  // Trial expirado e sem plano
  return { hasAccess: false, type: "expired" };
}

export function createTrialEndDate(): Date {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 dias
  return trialEndsAt;
}
