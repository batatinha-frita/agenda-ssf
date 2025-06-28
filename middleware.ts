import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lista de rotas protegidas que precisam de assinatura ativa
  const protectedRoutes = [
    "/dashboard",
    "/reports",
    "/appointments",
    "/doctors",
    "/patients",
  ];

  // Se está tentando acessar uma rota protegida
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return NextResponse.redirect(new URL("/authentication", request.url));
      }

      if (!session.user.clinic) {
        return NextResponse.redirect(new URL("/clinic-form", request.url));
      }

      // Verificar se tem acesso (trial ou plano pago)
      const access = hasActiveSubscription(session.user);

      if (!access.hasAccess) {
        return NextResponse.redirect(new URL("/subscription", request.url));
      }
    } catch (error) {
      // Em caso de erro, redirecionar para login
      return NextResponse.redirect(new URL("/authentication", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - authentication (login page)
     * - subscription (subscription page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|authentication|subscription).*)",
  ],
};
