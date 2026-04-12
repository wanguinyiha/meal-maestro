"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChefHat, Calendar, DollarSign, Target, Trophy,
  Flame, Star, TrendingUp, Award, Edit, ShoppingCart
} from "lucide-react"
import { format, formatDistanceToNow, startOfWeek, endOfWeek } from "date-fns"
import { toast } from "sonner"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/app/AuthProvider"

// -----------------------------------------------------------------------------
// Supabase client (using the configured client)
// -----------------------------------------------------------------------------
const supabase = createClient()

// -----------------------------------------------------------------------------
// Icon lookup – keep it in one place so the DB can store just a string name
// -----------------------------------------------------------------------------
const iconMap: Record<string, React.ComponentType<any>> = {
  ChefHat, Calendar, DollarSign, Target, Trophy,
  Flame, Star, TrendingUp, Award, ShoppingCart
}

// -----------------------------------------------------------------------------
// Types (derived from your DB schema – you can also import the generated ones)
// -----------------------------------------------------------------------------
type UserProfile = {
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  join_date: string
  current_streak: number
  total_meals_planned: number
  money_saved: number
  favorite_recipes_count: number
  last_active_date: string | null
}

type Achievement = {
  id: string
  title: string
  description: string | null
  icon: string | null
  target: number | null
  earned_date: string | null
  progress: number
}

type ActivityLog = {
  id: string
  type: string
  description: string | null
  date: string
  icon: string | null
}

type DietaryPrefs = {
  daily_calories: number | null
  protein_goal_g: number | null
  // we only need these two for the UI
}

type PlannedMeal = {
  servings: number
  recipes: {
    calories: number
    protein_g: number
    carbs_g: number
    fiber_g?: number
  }
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [dietPrefs, setDietPrefs] = useState<DietaryPrefs | null>(null)

  // ---- Derived UI data ------------------------------------------------------
  const [weeklyProgress, setWeeklyProgress] = useState({ current: 0, goal: 7 })
  const [weeklyNutrition, setWeeklyNutrition] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalFiber: 0
  })
  const [nutritionGoals, setNutritionGoals] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Helper – get the start / end of the **current** week (Monday → Sunday)
  // -------------------------------------------------------------------------
  const getCurrentWeek = () => {
    const now = new Date()
    const start = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 })
    return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd") }
  }

  // -------------------------------------------------------------------------
  // Main data fetch
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)

        // Check if user is authenticated
        if (!authUser) {
          throw new Error("Not authenticated")
        }

        // -----------------------------------------------------------------
        // 2. Profile (user_profiles)
        // -----------------------------------------------------------------
        const { data: prof, error: profErr } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single()
        if (profErr) throw profErr
        setProfile(prof)

        // -----------------------------------------------------------------
        // 3. Achievements + user progress (achievements ← user_achievements)
        // -----------------------------------------------------------------
        const { data: ach, error: achErr } = await supabase
          .from("achievements")
          .select(`
            id,
            title,
            description,
            icon,
            target,
            user_achievements!achievement_id (
              earned_date,
              progress
            )
          `)
        if (achErr) throw achErr

        const mappedAch: Achievement[] = ach.map((a: any) => {
          const ua = Array.isArray(a.user_achievements)
            ? a.user_achievements[0]
            : a.user_achievements
          return {
            id: a.id,
            title: a.title,
            description: a.description,
            icon: a.icon ?? "Trophy",
            target: a.target,
            earned_date: ua?.earned_date ?? null,
            progress: ua?.progress ?? 0
          }
        })
        setAchievements(mappedAch)

        // -----------------------------------------------------------------
        // 4. Recent activity
        // -----------------------------------------------------------------
        const { data: act, error: actErr } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", authUser.id)
          .order("date", { ascending: false })
          .limit(10)
        if (actErr) throw actErr
        setActivity(act)

        // -----------------------------------------------------------------
        // 5. Dietary preferences (for nutrition goals)
        // -----------------------------------------------------------------
        const { data: diet, error: dietErr } = await supabase
          .from("dietary_preferences")
          .select("daily_calories, protein_goal_g")
          .eq("user_id", authUser.id)
          .single()
        if (dietErr && dietErr.code !== "PGRST116") throw dietErr
        setDietPrefs(diet ?? { daily_calories: 2000, protein_goal_g: 150 })

        // -----------------------------------------------------------------
        // 6. Weekly progress (how many distinct days have a planned meal)
        // -----------------------------------------------------------------
        const week = getCurrentWeek()
        const { data: weekPlans, error: wpErr } = await supabase
          .from("meal_plans")
          .select("id")
          .eq("user_id", authUser.id)
          .gte("week_start_date", week.start)
          .lte("week_start_date", week.end)

        if (wpErr) throw wpErr

        if (weekPlans?.length) {
          const planIds = weekPlans.map(p => p.id)
          const { data: days, error: daysErr } = await supabase
            .from("planned_meals")
            .select("day_of_week")
            .in("plan_id", planIds)

          if (daysErr) throw daysErr
          const uniqueDays = new Set(days.map(d => d.day_of_week)).size
          setWeeklyProgress({ current: uniqueDays, goal: 7 })
        }

        // -----------------------------------------------------------------
        // 7. Weekly nutrition totals
        // -----------------------------------------------------------------
        if (weekPlans?.length) {
          const planIds = weekPlans.map(p => p.id)
          const { data: meals, error: mealsErr } = await supabase
            .from("planned_meals")
            .select(`
              servings,
              recipes!inner (
                calories,
                protein_g,
                carbs_g,
                fiber_g
              )
            `)
            .in("plan_id", planIds)

          if (mealsErr) throw mealsErr

          const totals = meals.reduce(
            (acc, m: any) => {
              const r = m.recipes
              const s = m.servings ?? 1
              acc.totalCalories += r.calories * s
              acc.totalProtein += r.protein_g * s
              acc.totalFiber += (r.fiber_g ?? 0) * s
              return acc
            },
            { totalCalories: 0, totalProtein: 0, totalFiber: 0 }
          )
          setWeeklyNutrition(totals)
        }

        // -----------------------------------------------------------------
        // 8. Nutrition-goal cards (hard-coded current values – replace with real
        //     daily tracking if you add a table later)
        // -----------------------------------------------------------------
        setNutritionGoals([
          { name: "Daily Calories", current: 1850, target: diet?.daily_calories ?? 2000, unit: "cal" },
          { name: "Protein", current: 120, target: diet?.protein_goal_g ?? 150, unit: "g" },
          { name: "Fiber", current: 28, target: 35, unit: "g" },
          { name: "Water", current: 6, target: 8, unit: "glasses" }
        ])

      } catch (e: any) {
        console.error(e)
        setError(e.message ?? "Failed to load profile")
        toast.error(e.message ?? "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      fetchAll()
    }
  }, [authUser])

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------
  if (!authUser || loading) return <DashboardLayout><div className="flex min-h-screen items-center justify-center">Loading…</div></DashboardLayout>
  if (error || !profile) return <DashboardLayout><div className="flex min-h-screen items-center justify-center text-red-600">{error}</div></DashboardLayout>

  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "User"
  const avatarUrl = profile.avatar_url ?? "/placeholder.svg?height=80&width=80"
  const joinDate = format(new Date(profile.join_date), "MMMM yyyy")

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ====================== PROFILE HEADER ====================== */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="text-2xl">
                    {fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  </div>
                  <p className="mb-4 text-muted-foreground">{profile.email}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div><div className="font-semibold">{profile.current_streak}</div><div className="text-muted-foreground">Day Streak</div></div>
                    <div><div className="font-semibold">{profile.total_meals_planned}</div><div className="text-muted-foreground">Meals Planned</div></div>
                    <div><div className="font-semibold">${profile.money_saved.toFixed(0)}</div><div className="text-muted-foreground">Money Saved</div></div>
                    <div><div className="font-semibold">{profile.favorite_recipes_count}</div><div className="text-muted-foreground">Favorite Recipes</div></div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Member since</div>
                  <div className="font-medium">{joinDate}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================== TABS ====================== */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* ------------------- OVERVIEW ------------------- */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {/* Week progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>{weeklyProgress.current} of {weeklyProgress.goal} days planned</span>
                      <span className="font-medium">{Math.round((weeklyProgress.current / weeklyProgress.goal) * 100)}%</span>
                    </div>
                    <Progress value={(weeklyProgress.current / weeklyProgress.goal) * 100} />
                    <p className="text-xs text-muted-foreground">
                      {weeklyProgress.goal - weeklyProgress.current} day{weeklyProgress.goal - weeklyProgress.current !== 1 ? "s" : ""} to go!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Streak */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" />Current Streak</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{profile.current_streak}</div>
                  <div className="text-sm text-muted-foreground">consecutive days</div>
                  <p className="mt-3 text-xs text-muted-foreground">Longest streak: 18 days</p>
                </CardContent>
              </Card>

              {/* Money saved */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-600" />Money Saved</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">${profile.money_saved.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">this year</div>
                  <p className="mt-3 text-xs text-muted-foreground">≈ $67 / month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent achievements */}
            <Card>
              <CardHeader><CardTitle>Recent Achievements</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {achievements
                    .filter(a => a.earned_date)
                    .slice(0, 4)
                    .map(a => {
                      const Icon = iconMap[a.icon ?? "Trophy"] ?? Trophy
                      return (
                        <div key={a.id} className="flex items-center gap-3 rounded-lg bg-accent/20 p-3">
                          <div className="rounded-full bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                          <div>
                            <div className="text-sm font-medium">{a.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {a.earned_date ? format(new Date(a.earned_date), "MMM d, yyyy") : ""}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------- ACHIEVEMENTS ------------------- */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {achievements.map(a => {
                const Icon = iconMap[a.icon ?? "Trophy"] ?? Trophy
                const earned = !!a.earned_date
                return (
                  <Card key={a.id} className={earned ? "border-primary/20" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-full p-3 ${earned ? "bg-primary/10" : "bg-muted/50"}`}>
                          <Icon className={`h-6 w-6 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h3 className="font-semibold">{a.title}</h3>
                            {earned && <Badge className="bg-primary text-primary-foreground">Earned</Badge>}
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">{a.description}</p>
                          {earned ? (
                            <p className="text-xs text-muted-foreground">
                              Earned on {format(new Date(a.earned_date!), "MMMM d, yyyy")}
                            </p>
                          ) : a.target ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{a.progress}/{a.target}</span>
                              </div>
                              <Progress value={(a.progress / a.target) * 100} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* ------------------- NUTRITION ------------------- */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Daily Nutrition Goals</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {nutritionGoals.map(g => (
                    <div key={g.name} className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-sm text-muted-foreground">{g.current}/{g.target} {g.unit}</span>
                      </div>
                      <Progress value={(g.current / g.target) * 100} />
                      <p className="text-xs text-muted-foreground">
                        {g.target - g.current > 0 ? `${g.target - g.current} ${g.unit} remaining` : "Goal achieved!"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>This Week’s Nutrition Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{weeklyNutrition.totalCalories}</div>
                    <div className="text-sm text-muted-foreground">Total Calories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{weeklyNutrition.totalProtein}g</div>
                    <div className="text-sm text-muted-foreground">Total Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{weeklyNutrition.totalFiber}g</div>
                    <div className="text-sm text-muted-foreground">Total Fiber</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------- ACTIVITY ------------------- */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.map(a => {
                    const Icon = iconMap[a.icon ?? "ChefHat"] ?? ChefHat
                    return (
                      <div key={a.id} className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted/50">
                        <div className="rounded-full bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{a.description ?? a.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(a.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </DashboardLayout>
  )
}