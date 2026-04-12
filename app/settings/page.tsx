"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/app/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Download, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/DashboardLayout"


export default function SettingsPage() {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Profile states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  // Dietary states
  const [dietaryRestrictions, setDietaryRestrictions] = useState<{ id: string, name: string }[]>([])
  const [selectedDietIds, setSelectedDietIds] = useState<string[]>([])
  const [allergens, setAllergens] = useState<{ id: string, name: string }[]>([])
  const [selectedAllergenIds, setSelectedAllergenIds] = useState<string[]>([])
  const [dailyCalories, setDailyCalories] = useState(2000)
  const [proteinGoal, setProteinGoal] = useState(150)
  const [carbGoal, setCarbGoal] = useState(250)
  const [fatGoal, setFatGoal] = useState(67)

  // Notifications states
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    groceryReminders: true,
    weeklyPlanning: true,
    achievements: true,
    marketing: false,
  })

  // Preferences states
  const [preferences, setPreferences] = useState({
    units: "imperial",
    defaultServings: "4",
    weekStartsOn: "monday",
    theme: "system",
  })

  // Fetch data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return
      try {
        setLoading(true)
        const supabase = createClient()
        setEmail(authUser.email || "")

        // Fetch profile, create if missing
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle()
        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        } else if (!profileData) {
          // Insert default profile
          await supabase
            .from("user_profiles")
            .insert({ user_id: authUser.id, email: authUser.email, created_at: new Date().toISOString() })
        } else {
          setFirstName(profileData.first_name || "")
          setLastName(profileData.last_name || "")
          setBio(profileData.bio || "")
          setAvatarUrl(profileData.avatar_url || "")
        }

        // Fetch dietary restrictions and user selections
        const { data: restrictionsData, error: restrictionsError } = await supabase
          .from("dietary_restrictions")
          .select("id, name")
        if (restrictionsError) throw restrictionsError
        setDietaryRestrictions(restrictionsData || [])

        const { data: userDiets, error: userDietsError } = await supabase
          .from("user_dietary_restrictions")
          .select("restriction_id")
          .eq("user_id", authUser.id)
        if (userDietsError) throw userDietsError
        setSelectedDietIds(userDiets?.map(d => d.restriction_id) || [])

        // Fetch allergens and user selections
        const { data: allergensData, error: allergensError } = await supabase
          .from("allergens")
          .select("id, name")
        if (allergensError) throw allergensError
        setAllergens(allergensData || [])

        const { data: userAllergens, error: userAllergensError } = await supabase
          .from("user_allergens")
          .select("allergen_id")
          .eq("user_id", authUser.id)
        if (userAllergensError) throw userAllergensError
        setSelectedAllergenIds(userAllergens?.map(a => a.allergen_id) || [])

        // Fetch dietary preferences, create if missing
        const { data: dietaryData, error: dietaryError } = await supabase
          .from("dietary_preferences")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle()
        if (dietaryError && dietaryError.code !== "PGRST116") {
          throw dietaryError
        } else if (!dietaryData) {
          await supabase
            .from("dietary_preferences")
            .insert({ user_id: authUser.id, daily_calories: 2000, created_at: new Date().toISOString() })
        } else {
          setDailyCalories(dietaryData.daily_calories || 2000)
          setProteinGoal(dietaryData.protein_goal_g || 150)
          setCarbGoal(dietaryData.carb_goal_g || 250)
          setFatGoal(dietaryData.fat_goal_g || 67)
        }

        // Fetch notification settings, create if missing
        const { data: notifData, error: notifError } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle()
        if (notifError && notifError.code !== "PGRST116") {
          throw notifError
        } else if (!notifData) {
          await supabase
            .from("notification_settings")
            .insert({ user_id: authUser.id, created_at: new Date().toISOString() })
        } else {
          setNotifications({
            mealReminders: notifData.meal_reminders ?? true,
            groceryReminders: notifData.grocery_reminders ?? true,
            weeklyPlanning: notifData.weekly_planning ?? true,
            achievements: notifData.achievements ?? true,
            marketing: notifData.marketing ?? false,
          })
        }

        // Fetch app preferences, create if missing
        const { data: prefData, error: prefError } = await supabase
          .from("app_preferences")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle()
        if (prefError && prefError.code !== "PGRST116") {
          throw prefError
        } else if (!prefData) {
          await supabase
            .from("app_preferences")
            .insert({ user_id: authUser.id, created_at: new Date().toISOString() })
        } else {
          setPreferences({
            units: prefData.units || "imperial",
            defaultServings: prefData.default_servings?.toString() || "4",
            weekStartsOn: prefData.week_starts_on || "monday",
            theme: prefData.theme || "system",
          })
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      fetchUserData()
    }
  }, [authUser])

  const toggleDiet = async (restrictionId: string) => {
    if (!authUser) return
    try {
      const supabase = createClient()
      const isSelected = selectedDietIds.includes(restrictionId)
      if (isSelected) {
        const { error } = await supabase
          .from("user_dietary_restrictions")
          .delete()
          .eq("user_id", authUser.id)
          .eq("restriction_id", restrictionId)
        if (error) throw error
        setSelectedDietIds(prev => prev.filter(id => id !== restrictionId))
      } else {
        const { data: existing } = await supabase
          .from("user_dietary_restrictions")
          .select("id")
          .eq("user_id", authUser.id)
          .eq("restriction_id", restrictionId)
          .maybeSingle()
        if (!existing) {
          const { error } = await supabase
            .from("user_dietary_restrictions")
            .insert({ user_id: authUser.id, restriction_id: restrictionId })
          if (error) throw error
        }
        setSelectedDietIds(prev => [...prev, restrictionId])
      }
      toast.success("Dietary restriction updated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update dietary restriction")
    }
  }

  const toggleAllergen = async (allergenId: string) => {
    if (!authUser) return
    try {
      const supabase = createClient()
      const isSelected = selectedAllergenIds.includes(allergenId)
      if (isSelected) {
        const { error } = await supabase
          .from("user_allergens")
          .delete()
          .eq("user_id", authUser.id)
          .eq("allergen_id", allergenId)
        if (error) throw error
        setSelectedAllergenIds(prev => prev.filter(id => id !== allergenId))
      } else {
        const { data: existing } = await supabase
          .from("user_allergens")
          .select("id")
          .eq("user_id", authUser.id)
          .eq("allergen_id", allergenId)
          .maybeSingle()
        if (!existing) {
          const { error } = await supabase
            .from("user_allergens")
            .insert({ user_id: authUser.id, allergen_id: allergenId })
          if (error) throw error
        }
        setSelectedAllergenIds(prev => [...prev, allergenId])
      }
      toast.success("Allergen updated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update allergen")
    }
  }

  const updateNotification = async (key: keyof typeof notifications, value: boolean) => {
    if (!authUser) return
    try {
      const supabase = createClient()
      setNotifications(prev => ({ ...prev, [key]: value }))
      const { error } = await supabase
        .from("notification_settings")
        .upsert(
          { user_id: authUser.id, [key]: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      if (error) throw error
      toast.success("Notification settings updated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update notification settings")
    }
  }

  const updatePreference = async (key: keyof typeof preferences, value: string) => {
    if (!authUser) return
    try {
      const supabase = createClient()
      setPreferences(prev => ({ ...prev, [key]: value }))
      const { error } = await supabase
        .from("app_preferences")
        .upsert(
          { user_id: authUser.id, [key]: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      if (error) throw error
      toast.success("Preferences updated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update preferences")
    }
  }

  const saveProfile: () => Promise<void> = async () => {
    if (!authUser) return
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            user_id: authUser.id,
            first_name: firstName,
            last_name: lastName,
            email: authUser.email,
            bio,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
      if (error) throw error
      toast.success("Profile saved!")
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile")
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !authUser) {
      toast.error("No file selected or user not authenticated")
      return
    }
    const file = event.target.files[0]
    if (!file) {
      toast.error("No file selected")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB")
      return
    }
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Only JPG, PNG, or GIF files are allowed")
      return
    }
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${authUser.id}/${fileName}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)
      setAvatarUrl(publicUrl)
      await saveProfile()
      toast.success("Avatar uploaded successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar")
    }
  }

  const changePassword = async (current: string, newPass: string, confirm: string) => {
    if (newPass !== confirm) {
      toast.error("Passwords don't match")
      return
    }
    if (newPass.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      toast.success("Password updated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update password")
    }
  }

  const saveDietary: () => Promise<void> = async () => {
    if (!authUser) return
    if (dailyCalories <= 0) {
      toast.error("Daily calories must be greater than 0")
      return
    }
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("dietary_preferences")
        .upsert(
          {
            user_id: authUser.id,
            daily_calories: dailyCalories,
            protein_goal_g: proteinGoal >= 0 ? proteinGoal : null,
            carb_goal_g: carbGoal >= 0 ? carbGoal : null,
            fat_goal_g: fatGoal >= 0 ? fatGoal : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
      if (error) throw error
      toast.success("Dietary preferences saved!")
    } catch (err: any) {
      toast.error(err.message || "Failed to save dietary preferences")
    }
  }

  const exportData = async () => {
    if (!authUser) return
    try {
      const supabase = createClient()
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle()
      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching user_profiles:", profileError.message)
      }

      const { data: dietaryPrefs, error: dietaryPrefsError } = await supabase
        .from("dietary_preferences")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle()
      if (dietaryPrefsError && dietaryPrefsError.code !== "PGRST116") {
        console.error("Error fetching dietary_preferences:", dietaryPrefsError.message)
      }

      const { data: appPrefs, error: appPrefsError } = await supabase
        .from("app_preferences")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle()
      if (appPrefsError && appPrefsError.code !== "PGRST116") {
        console.error("Error fetching app_preferences:", appPrefsError.message)
      }

      const { data: notifPrefs, error: notifPrefsError } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle()
      if (notifPrefsError && notifPrefsError.code !== "PGRST116") {
        console.error("Error fetching notification_settings:", notifPrefsError.message)
      }

      const { data: userDiets, error: userDietsError } = await supabase
        .from("user_dietary_restrictions")
        .select("dietary_restrictions(name)")
        .eq("user_id", authUser.id)
      if (userDietsError) {
        console.error("Error fetching user_dietary_restrictions:", userDietsError.message)
      }

      const { data: userAllergens, error: userAllergensError } = await supabase
        .from("user_allergens")
        .select("allergens(name)")
        .eq("user_id", authUser.id)
      if (userAllergensError) {
        console.error("Error fetching user_allergens:", userAllergensError.message)
      }

      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from("user_achievements")
        .select("achievements(title, description, icon, target), earned_date, progress")
        .eq("user_id", authUser.id)
      if (userAchievementsError) {
        console.error("Error fetching user_achievements:", userAchievementsError.message)
      }

      const exportJson = {
        profile: profile || null,
        dietary_preferences: dietaryPrefs || null,
        app_preferences: appPrefs || null,
        notification_settings: notifPrefs || null,
        dietary_restrictions: userDiets?.map(d => d.dietary_restrictions.name as string) || [],
        allergens: userAllergens?.map(a => a.allergens.name as string) || [],
        achievements: userAchievements || [],
      }
      const blob = new Blob([JSON.stringify(exportJson, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `user_data_${authUser.id}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to export data")
    }
  }

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return
    if (!authUser) return
    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authUser.id }),
      })
      if (response.ok) {
        toast.success("Account deleted")
        window.location.href = "/"
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to delete account")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account")
    }
  }

  if (loading || !authUser) return <div>Loading...</div>
  if (error) return <div className="text-destructive">Error: {error}</div>

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings & Preferences</h1>
          <p className="text-muted-foreground">Customize your meal planning experience</p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="dietary">Dietary</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || "/placeholder.svg?height=80&width=80"} alt="Profile" />
                    <AvatarFallback className="text-2xl">{firstName[0] || ""}{lastName[0] || ""}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Input type="file" accept="image/jpeg,image/png,image/gif" onChange={uploadAvatar} className="hidden" id="avatarUpload" />
                    <Label htmlFor="avatarUpload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Change Photo</span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>

                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <Button onClick={saveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button variant="outline" onClick={() => {
                  const current = (document.getElementById("currentPassword") as HTMLInputElement).value
                  const newPass = (document.getElementById("newPassword") as HTMLInputElement).value
                  const confirm = (document.getElementById("confirmPassword") as HTMLInputElement).value
                  changePassword(current, newPass, confirm)
                }}>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dietary Settings */}
          <TabsContent value="dietary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select your dietary preferences to get personalized recipe recommendations
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryRestrictions.map((diet) => (
                    <div
                      key={diet.id}
                      onClick={() => toggleDiet(diet.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDietIds.includes(diet.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-sm font-medium">{diet.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Food Allergies & Intolerances</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Help us keep you safe by marking any allergens you need to avoid
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allergens.map((allergen) => (
                    <div
                      key={allergen.id}
                      onClick={() => toggleAllergen(allergen.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAllergenIds.includes(allergen.id)
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border hover:border-destructive/50"
                      }`}
                    >
                      <div className="text-sm font-medium">{allergen.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutrition Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dailyCalories">Daily Calories</Label>
                    <Input
                      id="dailyCalories"
                      type="number"
                      value={dailyCalories}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val > 0) setDailyCalories(val)
                      }}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="proteinGoal">Protein Goal (g)</Label>
                    <Input
                      id="proteinGoal"
                      type="number"
                      value={proteinGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val >= 0) setProteinGoal(val)
                      }}
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carbGoal">Carb Goal (g)</Label>
                    <Input
                      id="carbGoal"
                      type="number"
                      value={carbGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val >= 0) setCarbGoal(val)
                      }}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatGoal">Fat Goal (g)</Label>
                    <Input
                      id="fatGoal"
                      type="number"
                      value={fatGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val >= 0) setFatGoal(val)
                      }}
                      min="0"
                    />
                  </div>
                </div>
                <Button onClick={saveDietary}>Save Nutrition Goals</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">Choose what notifications you'd like to receive</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Meal Planning Reminders</div>
                      <div className="text-sm text-muted-foreground">Get reminded to plan your weekly meals</div>
                    </div>
                    <Switch
                      checked={notifications.mealReminders}
                      onCheckedChange={(checked) => updateNotification("mealReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Grocery Shopping Reminders</div>
                      <div className="text-sm text-muted-foreground">Get notified when it's time to shop</div>
                    </div>
                    <Switch
                      checked={notifications.groceryReminders}
                      onCheckedChange={(checked) => updateNotification("groceryReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Weekly Planning Summary</div>
                      <div className="text-sm text-muted-foreground">Weekly recap of your meal planning progress</div>
                    </div>
                    <Switch
                      checked={notifications.weeklyPlanning}
                      onCheckedChange={(checked) => updateNotification("weeklyPlanning", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Achievement Notifications</div>
                      <div className="text-sm text-muted-foreground">Get notified when you earn new badges</div>
                    </div>
                    <Switch
                      checked={notifications.achievements}
                      onCheckedChange={(checked) => updateNotification("achievements", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing & Updates</div>
                      <div className="text-sm text-muted-foreground">Receive news about new features and tips</div>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => updateNotification("marketing", checked)}
                    />
                  </div>
                </div>

                <Button onClick={() => updateNotification("marketing", notifications.marketing)}>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">Customize how the app works for you</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="units">Measurement Units</Label>
                    <Select value={preferences.units} onValueChange={(value) => updatePreference("units", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imperial">Imperial (cups, lbs, °F)</SelectItem>
                        <SelectItem value="metric">Metric (ml, kg, °C)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="servings">Default Servings</Label>
                    <Select
                      value={preferences.defaultServings}
                      onValueChange={(value) => updatePreference("defaultServings", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="6">6 people</SelectItem>
                        <SelectItem value="8">8 people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weekStart">Week Starts On</Label>
                    <Select
                      value={preferences.weekStartsOn}
                      onValueChange={(value) => updatePreference("weekStartsOn", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => updatePreference("theme", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => updatePreference("theme", preferences.theme)}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download your meal plans, recipes, and other data in JSON format
                </p>
                <Button variant="outline" onClick={exportData}>Export My Data</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <h3 className="font-medium text-destructive mb-2">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm" onClick={deleteAccount}>
                    Delete Account
                  </Button>
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