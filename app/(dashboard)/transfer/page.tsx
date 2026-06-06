import { createClient } from "@/lib/supabase";
import TransferForm from "@/components/TransferForm";
import { redirect } from "next/navigation";

export const revalidate = 0; // Enforce strict server separation

export default async function TransferPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Fetch accounts on the server
  const { data: accounts, error } = await supabase
    .from("corporate_bank_accounts")
    .select("account_id, official_name, current_balance, mask");

  if (error) {
    console.error("Failed to load accounts for transfer page:", error);
  }

  return (
    <main className="flex flex-1 flex-col p-8 md:p-12 max-w-[1400px] w-full mx-auto min-h-screen bg-transparent">
      <TransferForm initialAccounts={accounts || []} />
    </main>
  );
}
