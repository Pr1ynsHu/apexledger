"use server";

import { createClient } from "@/lib/supabase";
import { log } from "@/lib/logger";

export interface AssetAllocation {
  id: string;
  user_id: string;
  label: string;
  category: string;
  amount_utilized: number;
  budget_limit: number;
  color_hex: string;
}

export async function getAssetAllocations(): Promise<AssetAllocation[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: allocations, error } = await supabase
      .from("asset_allocations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: true });

    if (error && error.code !== "42P01") { // Ignore if table doesn't exist yet
      log.error("Failed to fetch asset allocations:", error);
      return [];
    }

    // If table exists but user has no allocations, provision the defaults
    if (allocations && allocations.length === 0 && (error as any)?.code !== "42P01") {
      const defaultAllocations = [
        {
          user_id: user.id,
          label: "Software Licensing",
          category: "SFT",
          amount_utilized: 124800,
          budget_limit: 200000,
          color_hex: "#10b981", // emerald-500
        },
        {
          user_id: user.id,
          label: "Hardware Procurement",
          category: "HDW",
          amount_utilized: 78250,
          budget_limit: 150000,
          color_hex: "#14b8a6", // teal-500
        },
        {
          user_id: user.id,
          label: "Legal & Compliance",
          category: "LGL",
          amount_utilized: 43100,
          budget_limit: 60000,
          color_hex: "#64748b", // slate-500
        },
      ];

      const { data: inserted, error: insertError } = await supabase
        .from("asset_allocations")
        .insert(defaultAllocations)
        .select();

      if (insertError) {
        log.error("Failed to provision default allocations:", insertError);
        return [];
      }
      return inserted || [];
    }

    return allocations || [];
  } catch (error) {
    log.error("Error in getAssetAllocations:", error);
    return [];
  }
}
