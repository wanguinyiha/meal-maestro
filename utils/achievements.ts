import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export async function updateAchievementProgress(userId: string, achievementId: string, increment: number = 1) {
  try {
    // Get current progress
    const { data: current, error: fetchError } = await supabase
      .from("user_achievements")
      .select("progress")
      .eq("user_id", userId)
      .eq("achievement_id", achievementId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching achievement progress:", fetchError)
      return
    }

    const newProgress = (current?.progress || 0) + increment

    // Update or insert progress
    const { error: upsertError } = await supabase
      .from("user_achievements")
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        progress: newProgress
      }, {
        onConflict: "user_id,achievement_id"
      })

    if (upsertError) {
      console.error("Error updating achievement progress:", upsertError)
      return
    }

    // Check if achievement should be earned
    const { data: achievement, error: achError } = await supabase
      .from("achievements")
      .select("target")
      .eq("id", achievementId)
      .single()

    if (achError) {
      console.error("Error fetching achievement target:", achError)
      return
    }

    if (achievement.target && newProgress >= achievement.target) {
      // Mark as earned if not already
      const { error: earnError } = await supabase
        .from("user_achievements")
        .update({ earned_date: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("achievement_id", achievementId)
        .is("earned_date", null)

      if (earnError) {
        console.error("Error marking achievement as earned:", earnError)
      }
    }
  } catch (error) {
    console.error("Unexpected error updating achievement:", error)
  }
}

export async function updateStreak(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("current_streak, last_active_date")
      .eq("user_id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching profile for streak:", profileError)
      return
    }

    const lastActive = profile.last_active_date ? new Date(profile.last_active_date).toISOString().split('T')[0] : null
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let newStreak = profile.current_streak || 0

    if (lastActive === today) {
      // Already active today, no change
      return
    } else if (lastActive === yesterday) {
      // Consecutive day, increment streak
      newStreak += 1
    } else {
      // Gap or first time, reset to 1
      newStreak = 1
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        current_streak: newStreak,
        last_active_date: today
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating streak:", updateError)
    } else {
      // Update streak achievement
      await updateAchievementProgress(userId, 'streak-master', 0) // Just check if earned
    }
  } catch (error) {
    console.error("Unexpected error updating streak:", error)
  }
}