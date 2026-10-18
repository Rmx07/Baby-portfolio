import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap first line of defence for the keeper area. Pages and API routes still
 * validate the real database session — this only avoids rendering dashboard
 * shells for visitors with no session cookie at all.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get("starloom_session")?.value;
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
