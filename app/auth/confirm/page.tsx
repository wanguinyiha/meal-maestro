"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { EmailOtpType } from "@supabase/supabase-js";

const supabase = createClient();

function safeInternalPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
}

const allowedOtpTypes: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type') as EmailOtpType | null;

      if (!token_hash || !type || !allowedOtpTypes.includes(type)) {
        setStatus('error');
        setMessage('Invalid confirmation link.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('success');
          if (type === "recovery") {
            setMessage("Recovery link verified. You can now set a new password.");
            toast.success("Recovery link verified!");
          } else {
            setMessage("Email confirmed successfully! You can now log in.");
            toast.success("Email confirmed!");
          }
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            Email Confirmation
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'success' && (
            <Button
              onClick={() => {
                const redirectedFrom = safeInternalPath(searchParams.get("redirectedFrom") ?? searchParams.get("next"));
                const loginHref = redirectedFrom
                  ? `/login?redirectedFrom=${encodeURIComponent(redirectedFrom)}`
                  : "/login";

                const type = searchParams.get("type") as EmailOtpType | null;
                if (type === "recovery") {
                  router.push("/reset-password");
                  return;
                }

                router.push(loginHref);
              }}
              className="w-full"
            >
              {searchParams.get("type") === "recovery" ? "Set new password" : "Go to Login"}
            </Button>
          )}
          {status === 'error' && (
            <Button onClick={() => router.push('/signup')} variant="outline" className="w-full">
              Try Signing Up Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Email Confirmation
            </CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}
