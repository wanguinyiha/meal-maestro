"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image"; // 💡 Import Image component
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, ChefHat, Check, Loader2 } from "lucide-react"; // Added Loader2
import { toast } from "sonner";

const supabase = createClient();

function safeInternalPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dietaryPreference: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = safeInternalPath(searchParams.get("redirectedFrom"));

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // const termsChecked = (e.currentTarget.elements.namedItem('terms') as HTMLInputElement)?.checked;
    // if (!termsChecked) {
    //   toast.error("You must agree to the Terms and Privacy Policy.");
    //   return;
    // }// Check if terms checkbox is checked (as it's a required field in the form)
    
    
    setIsLoading(true);

    try {
      const nextPath = redirectedFrom || "/recipes";

      // Create the account on the server with the email already confirmed,
      // so no verification/confirmation step is needed.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: `${formData.firstName} ${formData.lastName}`,
          dietaryPreference: formData.dietaryPreference || "none",
        }),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        toast.error(result.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Sign in immediately and go straight to the app.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        toast.error(signInError.message);
        setIsLoading(false);
        router.push("/login");
        return;
      }

      toast.success("Account created! Welcome to Meal Maestro.");
      setIsLoading(false);
      router.push(nextPath);
    } catch (error) {
      toast.error("An error occurred during signup");
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ];

  return (
    // 💡 Main container adjusted for split-screen look
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      
      {/* 💡 The main container for the split view - Max width increased */}
      <Card className="w-full max-w-5xl overflow-hidden shadow-2xl border-border/50">
        
        {/* 💡 Grid Layout: 2 columns, image hidden on small screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Sign Up Form */}
          <div className="p-6 sm:p-10 lg:p-12">
            
            {/* Branding/Header */}
            <div className="text-center lg:text-left mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-3 shadow-xl">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">
                Join Meal Maestro
              </h1>
              <p className="text-muted-foreground text-sm">Start your meal planning journey today!</p>
            </div>

            <CardHeader className="space-y-1 p-0 mb-4">
              <CardTitle className="text-xl text-left">
                Create Account
              </CardTitle>
              <CardDescription className="text-left text-sm">
                Fill out the details below to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                {/* Dietary Preference Field */}
                <div className="space-y-2">
                  <Label htmlFor="dietaryPreference">
                    Dietary Preference (Optional)
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("dietaryPreference", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select your preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific preference</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="pescatarian">Pescatarian</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="paleo">Paleo</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <Check
                            className={`w-3 h-3 ${
                              req.met ? "text-green-500" : "text-muted-foreground/50"
                            }`}
                          />
                          <span
                            className={
                              req.met ? "text-green-600" : "text-muted-foreground"
                            }
                          >
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      required
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                </div>

                {/* Terms and Privacy Checkbox */}
                {/* <div className="flex items-start space-x-2 pt-2">
                  <input
                    id="terms"
                    name="terms" // Added name for easier form element access in handleSubmit
                    type="checkbox"
                    required
                    // Using default shadcn/tailwind classes for consistency
                    className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div> */}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold mt-6"
                  disabled={
                    isLoading || formData.password !== formData.confirmPassword
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href={
                        redirectedFrom
                          ? `/login?redirectedFrom=${encodeURIComponent(redirectedFrom)}`
                          : "/login"
                      }
                      className="text-primary hover:text-primary/90 font-semibold hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Right Column: Image - Hidden on screens smaller than large (lg) */}
          <div className="hidden lg:block bg-primary/5 relative mr-4 rounded-md">
            <div className="absolute inset-0">
              <Image
                src="/AuthImage.png" 
                alt="A chef preparing ingredients and fresh produce"
                fill
                priority
                className="object-cover rounded-md"
                sizes="(max-width: 1024px) 0vw, 50vw"
              />
              
              {/* Optional: Overlay and Branding Text */}
              <div className="absolute inset-0 bg-primary/30 opacity-70"></div>

              {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-4">
                <h2 className="text-4xl font-extrabold text-white drop-shadow-lg leading-tight">
                    Your <span className="text-primary-foreground">Culinary Journey</span> Starts Here.
                </h2>
                <p className="mt-4 text-white/90 text-lg font-medium drop-shadow-md">
                    Personalized recipes, budget tracking, and meal prep made simple.
                </p>
              </div> */}
            </div>
            
          </div>

        </div> {/* End of grid */}
      </Card>
    </div>
  );
}
