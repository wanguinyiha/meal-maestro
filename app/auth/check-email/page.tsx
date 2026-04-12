"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function safeInternalPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
}

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const redirectedFrom = safeInternalPath(searchParams.get("redirectedFrom") ?? searchParams.get("next"));

  const loginHref = redirectedFrom
    ? `/login?redirectedFrom=${encodeURIComponent(redirectedFrom)}`
    : "/login";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link{email ? ` to ${email}` : ""}. Open it to verify your account, then come back to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href={loginHref}>Go to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signup">Use a different email</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

