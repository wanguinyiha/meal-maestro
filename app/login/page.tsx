"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image"; 
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, ChefHat, Loader2, Chrome } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

export const dynamic = 'force-dynamic';

function safeInternalPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = safeInternalPath(searchParams.get("redirectedFrom"));
  const nextPath = redirectedFrom || "/recipes";

  // Handle credentials login
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      toast.success("Logged in successfully!");
      router.push(nextPath);
    } catch (error) {
      toast.error("An unexpected error occurred during login.");
      setIsLoading(false);
    }
  };

  // Handle Social Login (Google Placeholder)
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // NOTE: Supabase requires a callback route defined in your app
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) {
        toast.error(`Error logging in with ${provider}: ${error.message}`);
        setIsLoading(false);
      }
      // If successful, the user is redirected, so setIsLoading is handled on callback
    } catch (error) {
      toast.error("An unexpected error occurred during social login.");
      setIsLoading(false);
    }
  };


  return (
    // 💡 Layout Change: Use a flex container for the whole screen
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      
      {/* 💡 The main container for the split view */}
      <Card className="w-full max-w-5xl overflow-hidden shadow-2xl border-border/50">
        
        {/* 💡 Grid Layout: 2 columns, image hidden on small screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Login Form */}
          <div className="sm:p-10 lg:p-12">
            
            {/* Branding/Header - Centered for the smaller screen, left-aligned for large */}
            <div className="text-center lg:text-left mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-3 shadow-xl">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">
                Welcome back to Meal Maestro
              </h1>
              <p className="text-muted-foreground text-sm">Sign in to master your meals and budget.</p>
            </div>

            <CardHeader className="space-y-1 p-0 mb-4">
              <CardTitle className="text-xl text-left">Sign In</CardTitle>
              <CardDescription className="text-left text-sm">
                Enter your credentials or use a social account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="relative mb-5">
                <Separator />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  continue with email
                </div>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/90 font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href={
                      redirectedFrom
                        ? `/signup?redirectedFrom=${encodeURIComponent(redirectedFrom)}`
                        : "/signup"
                    }
                    className="text-primary hover:text-primary/90 font-semibold hover:underline"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </CardContent>
          </div>

          {/* Right Column: Image - Hidden on screens smaller than large (lg) */}
          <div className="hidden lg:block bg-primary/5 relative mr-4 ">
            {/* 💡 Replace this with your actual image component */}
            <div className="absolute inset-0">
              <Image
                src="/AuthImage.png"
                alt="A beautiful, vibrant meal preparation scene"
                fill
                priority
                className="object-cover rounded-md"
                sizes="(max-width: 1024px) 0vw, 50vw"
              />
              
              {/* Optional: Overlay for better text/content visibility or branding */}
              <div className="absolute inset-0 bg-primary/30 opacity-60"></div>

              {/* Optional: Branding Text Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-lg bg-background/80 backdrop-blur-sm shadow-xl">
                <blockquote className="text-lg font-semibold text-foreground italic border-l-4 border-primary pl-4">
                  "Simplify meal planning, save time, and cook incredible food."
                </blockquote>
                <p className="mt-2 text-sm text-muted-foreground">- Meal Maestro Team</p>
              </div>
            </div>
            
          </div>

        </div> {/* End of grid */}
      </Card>
    </div>
  );
}

// Wrapping component remains simple
export default function LoginPage() {
  return (
    <LoginForm />
  );
}
