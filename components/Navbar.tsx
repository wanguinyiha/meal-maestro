"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChefHat } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { ThemeToggle } from "./theme-toggle"

export default function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()

  // Hide navbar on login, signup, and home pages
  if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
    return null
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">
              Meal Maestro
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}