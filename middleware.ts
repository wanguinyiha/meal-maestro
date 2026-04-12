import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  "/recipes",
  "/grocery",
  "/profile",
  "/settings",
  "/planner",
];

const authPages = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthPage = authPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // Create Supabase client for middleware
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // 1. Not logged in and trying to access protected route
  if (!isLoggedIn && isProtected) {
    const redirectUrl = new URL("/login", nextUrl.origin);
    redirectUrl.searchParams.set("redirectedFrom", pathname + nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Logged in and visiting /login or /signup
  if (isLoggedIn && isAuthPage) {
    const redirectedFrom = nextUrl.searchParams.get("redirectedFrom");
    return NextResponse.redirect(
      new URL(redirectedFrom || "/recipes", nextUrl.origin)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/recipes/:path*",
    "/planner/:path*",
    "/grocery/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
 