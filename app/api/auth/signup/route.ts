import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

async function findUserByEmail(
  admin: SupabaseClient,
  email: string
): Promise<User | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) return null;
    const users = data?.users ?? [];
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (users.length < 1000) break;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, dietaryPreference } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || "",
          dietary_preference: dietaryPreference || "none",
        },
      });

    if (createError) {
      const message = createError.message || "";
      const alreadyExists = /already (registered|exists)/i.test(message);

      // Account exists but may be unconfirmed from an earlier signup:
      // confirm it so the user can sign in right away.
      if (alreadyExists) {
        const existing = await findUserByEmail(admin, email);
        if (existing && !existing.email_confirmed_at) {
          await admin.auth.admin.updateUserById(existing.id, {
            email_confirm: true,
          });
        }
        return NextResponse.json({ ok: true, existing: true });
      }

      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, userId: created.user?.id });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
