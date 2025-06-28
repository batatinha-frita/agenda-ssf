import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersToClinicsTable, usersTable } from "@/db/schema";
import { createTrialEndDate } from "@/lib/subscription";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // Buscar o usuário completo do banco de dados
      const dbUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, user.id),
      });

      // Verificar se o usuário precisa de trial
      if (dbUser && !dbUser.trialEndsAt && !dbUser.plan) {
        await db
          .update(usersTable)
          .set({
            trialEndsAt: createTrialEndDate(),
          })
          .where(eq(usersTable.id, user.id));

        // Atualizar o dbUser com o novo trial
        dbUser.trialEndsAt = createTrialEndDate();
      }

      const clinics = await db.query.usersToClinicsTable.findMany({
        where: eq(usersToClinicsTable.userId, user.id),
        with: {
          clinic: true,
        },
      });
      // TODO: Ao adaptar para o usuário ter múltiplas clínicas, deve-se mudar esse código
      const clinic = clinics?.[0];

      return {
        user: {
          ...user,
          // Incluir os campos de subscription do banco de dados
          plan: dbUser?.plan || null,
          stripeCustomerId: dbUser?.stripeCustomerId || null,
          stripeSubscriptionId: dbUser?.stripeSubscriptionId || null,
          trialEndsAt: dbUser?.trialEndsAt || null,
          clinic: clinic?.clinicId
            ? {
                id: clinic?.clinicId,
                name: clinic?.clinic?.name,
              }
            : undefined,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
});
