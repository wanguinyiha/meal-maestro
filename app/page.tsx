'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  Calendar,
  ShoppingCart,
  Target,
  Star,
  Users,
  ArrowRight,
  Quote
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
}

// --- New Component for Testimonials (UX Enhancement: Social Proof) ---
const TestimonialCard = ({ quote, name, title }: TestimonialProps) => (
  <Card className="p-6 border-l-4 border-primary shadow-md">
    <Quote className="h-6 w-6 text-primary mb-4 opacity-50" />
    <blockquote className="italic text-lg text-foreground mb-4 leading-relaxed">
      "{quote}"
    </blockquote>
    <div className="flex items-center">
      <Avatar className="h-10 w-10 mr-4">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  </Card>
);

export default function HomePage() {
  const testimonials = [
    {
      quote: "My grocery bill dropped by 20% in the first month! Meal Maestro is a game-changer for budgeting and saving time.",
      name: "Sarah K.",
      title: "Busy Parent"
    },
    {
      quote: "The nutrition tracking is fantastic. I hit my macro goals every week without the stress of manual calculation.",
      name: "Mark T.",
      title: "Fitness Enthusiast"
    },
    {
      quote: "I used to dread meal planning. Now, it takes me 15 minutes on Sunday. Highly recommend!",
      name: "Jessica P.",
      title: "Young Professional"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - UI/UX: Enhanced Visuals and CTA Focus */}
      <section className="relative py-24 lg:py-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary bg-primary/10 px-4 py-1">
              Plan • Prep • Prosper
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Master Your Meals,
              <span className="text-primary block mt-2"> Master Your Budget</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 text-pretty max-w-xl lg:max-w-none leading-relaxed">
              Transform your meal planning with our intelligent system that helps
              you eat well, save money, and stay organized. From weekly planning
              to grocery lists, we've got your kitchen covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild className="text-lg px-8 shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/signup">Sign Up <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" className="text-lg px-8">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
          
          {/* Visual Hook - UX Enhancement: Gives immediate context */}
          <div className="hidden lg:block relative p-4 bg-card rounded-xl shadow-2xl shadow-primary/20">
            {/* Placeholder for an actual app screenshot or illustrative image */}
            {/* <div className="aspect-video w-full bg-primary/10 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
              <span className="text-lg text-muted-foreground">App Screenshot Placeholder: Meal Planner View</span>
            </div> */}
            <Image src="/LandingImage.png" 
            alt="Meal Maestro App Screenshot" 
            width={800} height={600} 
            className="rounded-lg shadow-lg" />
            
          </div>
        </div>
      </section>

      {/* Features Grid - UI/UX: Clearer Hierarchy and Visual Feedback */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Meal Prep Like a Pro
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Streamline your kitchen workflow with tools designed for busy people
              who want to eat well, save money, and waste less food.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards - Increased Hover Effect */}
            <Card className="border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02]">
              <CardHeader>
                <Calendar className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-full mb-4" />
                <CardTitle>Smart Meal Planning</CardTitle>
                <CardDescription>
                  Plan your entire week with drag-and-drop simplicity. Set dietary
                  preferences and serving sizes for personalized meal schedules.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02]">
              <CardHeader>
                <ShoppingCart className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-full mb-4" />
                <CardTitle>Cost-Savvy Grocery Lists</CardTitle>
                <CardDescription>
                  Auto-generated shopping lists organized by store section. Track
                  estimated costs and stick to your budget effortlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02]">
              <CardHeader>
                <Target className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-full mb-4" />
                <CardTitle>Nutrition Tracking</CardTitle>
                <CardDescription>
                  Get instant nutrition snapshots for every recipe. Track
                  calories, protein, carbs, and fats to meet your health goals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02]">
              <CardHeader>
                <Star className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-full mb-4" />
                <CardTitle>Progress & Achievements</CardTitle>
                <CardDescription>
                  Stay motivated with gamified progress tracking. Earn badges for
                  consistency and celebrate your meal prep victories.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02]">
              <CardHeader>
                <ChefHat className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-full mb-4" />
                <CardTitle>Recipe Library</CardTitle>
                <CardDescription>
                  Access hundreds of tested recipes filtered by dietary needs,
                  prep time, and budget. Find your new favorites easily.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02]">
              <CardHeader>
                <Users className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-full mb-4" />
                <CardTitle>Family-Friendly</CardTitle>
                <CardDescription>
                  Scale recipes for any household size. Manage different dietary
                  preferences and allergies all in one place.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section - UX Enhancement: Social Proof */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Hear From Our Happy Users
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from people who have transformed their kitchen and their finances.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <TestimonialCard key={index} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - UI/UX: Stronger Visual Appeal & Focused Action */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Take Control of Your Kitchen?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto">
            Join thousands of users who have simplified their meal planning and
            saved money with Marita's Meal Maestro today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" className="text-lg px-10 font-bold shadow-lg hover:shadow-xl">
              <Link href="/signup">Sign Up</Link>
            </Button>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <ChefHat className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl text-foreground">
                Marita's Meal Maestro
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support Center
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Marita's Meal Maestro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}