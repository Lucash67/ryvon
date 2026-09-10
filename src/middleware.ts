import { NextResponse, type NextRequest } from "next/server";
import { isAuthDisabled } from "@/lib/flags";

export async function middleware(request: NextRequest) {
  if (isAuthDisabled() && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
