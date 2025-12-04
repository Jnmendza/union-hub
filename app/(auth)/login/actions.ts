"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // 1. Get data from form
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 2. Sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=Invalid credentials");
  }

  // 3. Refresh and go home
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Extract a name from email (e.g., "jonathan" from "jonathan@email.com")
  // In a real app, you'd add a "Name" input field to the form.
  const defaultName = email.split("@")[0];

  // 1. Sign up in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error("Signup Error:", authError.message);
    redirect(`/login?message=${encodeURIComponent(authError.message)}`);
  }

  // 2. Create the Public User Profile in Prisma
  if (authData.user) {
    try {
      await prisma.user.create({
        data: {
          id: authData.user.id, // CRITICAL: Use the SAME UUID as Supabase Auth
          email: authData.user.email!,
          name: defaultName,
          role: "MEMBER", // Default role
          tier: "FREE", // Default tier
        },
      });
    } catch (dbError) {
      console.error("Database Creation Error:", dbError);
      // Optional: You might want to delete the auth user if this fails
      // so they aren't stuck in a half-created state.
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}
