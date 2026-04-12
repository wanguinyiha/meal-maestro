"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChefHat,
  Calendar,
  ShoppingCart,
  User,
  Settings,
  Plus,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import { User as UserIcon } from "lucide-react";

const sidebarNavItems = [
  {
    title: "Recipes",
    href: "/recipes",
    icon: BookOpen,
  },
  {
    title: "Create Recipe",
    href: "/recipes/create",
    icon: Plus,
  },
  {
    title: "Planner",
    href: "/planner",
    icon: Calendar,
  },
  {
    title: "Grocery",
    href: "/grocery",
    icon: ShoppingCart,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
  <div className="fixed w-[240px] h-full bg-card/50 backdrop-blur-sm border-r border-border/50 z-10 flex flex-col justify-between">
      
      {/* Top Section: Logo and Navigation */}
      <div className="space-y-4 py-4 flex-grow">
        <div className="px-6 pb-2 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-extrabold text-lg tracking-tight">Meal Maestro</span>
          </Link>
        </div>
        
        {/* Navigation List */}
        <div className="px-4">
          <div className="space-y-1">
            {sidebarNavItems.map((item) => {
              // Check if the current route starts with the item's href
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon; // Get the Lucide icon component

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start font-medium transition-colors"
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: User Info and Logout */}
      <div className="p-4 border-t border-border/50">
        <div className="space-y-2">
          
          {user ? (
            <>
              {/* User Info (Optional) */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span className="truncate" title={user.email}>{user.email}</span>
              </div>
              
              {/* Logout Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            // If user is not logged in, show login/signup links (optional based on app flow)
            <div className="flex justify-between gap-2">
              <Button asChild variant="default" size="sm">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
