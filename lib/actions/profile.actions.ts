"use server";

import { createClient } from "@/lib/supabase";
import { log } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export interface OperatorProfile {
  name: string;
  role: string;
  email: string;
  clearance_level: string;
  updated_at?: string;
}

export async function getOperatorProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("operator_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      log.error("Failed to fetch operator profile:", error);
      return null;
    }

    if (!data) {
      // Try to fallback to KYC users table
      const { data: userData } = await supabase.from("users").select("first_name, last_name, email").eq("id", user.id).single();

      // Return a default profile if none exists
      return {
        name: userData ? `${userData.first_name} ${userData.last_name}` : "Operator",
        role: "Chief Treasury Officer",
        email: userData?.email || user.email || "operator@apexledger.corp",
        clearance_level: "L4 — Executive",
      } as OperatorProfile;
    }

    return {
      name: data.name,
      role: data.role,
      email: data.email,
      clearance_level: data.clearance_level,
      updated_at: data.updated_at,
    } as OperatorProfile;
  } catch (error) {
    log.error("Error in getOperatorProfile:", error);
    return null;
  }
}

export async function updateOperatorProfile(profileData: {
  name: string;
  role: string;
  email: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized request. No active session.");
    }

    const { error } = await supabase
      .from("operator_profiles")
      .upsert({
        user_id: user.id,
        name: profileData.name,
        role: profileData.role,
        email: profileData.email,
        clearance_level: "L4 — Executive", // Default clearance for demo
      }, { onConflict: "user_id" });

    if (error) {
      throw error;
    }

    log.info("Operator profile updated successfully", { userId: user.id });

    // Revalidate paths that show the profile
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    log.error("Failed to update operator profile:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
