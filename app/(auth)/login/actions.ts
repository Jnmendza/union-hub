"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // FIX: Return the error instead of redirecting
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const rawName = formData.get("name") as string;
  const finalName =
    rawName && rawName.trim() !== "" ? rawName : email.split("@")[0];

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    // FIX: Return the error instead of redirecting
    return { error: authError.message };
  }

  if (authData.user) {
    try {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name: finalName,
          role: "MEMBER",
          tier: "FREE",
        },
      });
    } catch (dbError) {
      console.error("Database Creation Error:", dbError);
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();

  // Sign out from Supabase (clears the session)
  await supabase.auth.signOut();

  // Clear cache and redirect to login
  revalidatePath("/", "layout");
  redirect("/login");
}
