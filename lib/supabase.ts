import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This utility function builds a secure connection client specifically for Next.js Server Actions and Components
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Automatically reads secure authentication cookie tokens from incoming client requests
                getAll() {
                    return cookieStore.getAll();
                },
                // Automatically injects secure encryption cookie tokens back into client browsers when they log in
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The cookies.set method can occasionally be ignored if called inside a static server view.
                        // Next.js middleware handles the fallback routing seamlessly.
                    }
                },
            },
        }
    );
}