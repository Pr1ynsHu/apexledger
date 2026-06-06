"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface SignUpParams {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    addressOne: string;
    city: string;
    state: string;
    postalCode: string;
    dateOfBirth: string;
}

// 1. SIGN UP ACTION: Provisions an account and creates a public profile row
export async function signUpUser(params: SignUpParams) {
    try {
        const supabase = await createClient();

        // A. Initialize the core account credentials inside Supabase Auth management core
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: params.email,
            password: params.password,
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("Authentication node provisioning aborted.");

        const userId = authData.user.id;

        // B. Populate our public.users profile row to hold custom corporate information
        const { error: dbError } = await supabase
            .from("users")
            .insert({
                id: userId,
                email: params.email,
                first_name: params.firstName,
                last_name: params.lastName,
                address_one: params.addressOne,
                city: params.city,
                state: params.state,
                postal_code: params.postalCode,
                date_of_birth: params.dateOfBirth,
            });

        if (dbError) throw new Error(`Public metadata registration exception: ${dbError.message}`);

        return { success: true, user: authData.user };
    } catch (error: any) {
        console.error("Critical failure during signUpUser clearance processing:", error.message);
        return { success: false, error: error.message || "Failed to finalize account clearance parameters." };
    }
}

interface SignInParams {
    email: string;
    password: string;
}

// 2. SIGN IN ACTION: Validates keys and sets an HTTP-only browser cookie session
export async function signInUser({ email, password }: SignInParams) {
    try {
        const supabase = await createClient();

        // Negotiate security clearance access logs directly with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);

        return { success: true, user: data.user };
    } catch (error: any) {
        console.error("Critical failure during signInUser identity exchange:", error.message);
        return { success: false, error: error.message || "Invalid security clearance token data." };
    }
}