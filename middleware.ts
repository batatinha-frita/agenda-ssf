import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Se está tentando acessar páginas protegidas
  if (
    request.nextUrl.pathname.startsWith("/(protected)") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/appointments") ||
    request.nextUrl.pathname.startsWith("/doctors") ||
    request.nextUrl.pathname.startsWith("/patients")
  ) {
    // Por enquanto, apenas deixar passar - a verificação será feita no servidor
    return NextResponse.next();
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico|authentication).*)",
  ],
};
