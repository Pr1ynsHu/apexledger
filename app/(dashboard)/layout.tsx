import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import RightSidebar from "@/components/RightSidebar";
import TreasuryChatbot from "@/components/TreasuryChatbot";
import { getOperatorProfile } from "@/lib/actions/profile.actions";
import { getAssetAllocations } from "@/lib/actions/allocations.actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getOperatorProfile();
  const initialAllocations = await getAssetAllocations();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-zinc-950">

      {/* 1. Persistent Desktop Left Navigation Pane */}
      <Sidebar />

      {/* 2. Unified Master Center Frame Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Mobile Header Controller containing Hamburger Toggle */}
        <MobileNav />

        {/* Dynamic Inner Page Content Viewport with Adaptive Padding */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 lg:p-10 scrollbar-thin">
          <div className="max-w-[1200px] mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Persistent Desktop Right Metadata/Metrics Panel */}
      <RightSidebar profile={profile} initialAllocations={initialAllocations} />

      {/* 4. Global Treasury AI Assistant Interactive Toggle Node */}
      <TreasuryChatbot />

    </div>
  );
}