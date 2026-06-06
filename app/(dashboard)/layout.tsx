import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import RightSidebar from "@/components/RightSidebar";
import TreasuryChatbot from "@/components/TreasuryChatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Mobile Header + Nav */}
      <MobileNav />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Desktop Right Sidebar */}
      <RightSidebar />
      
      {/* Global Treasury Chatbot Drawer */}
      <TreasuryChatbot />
    </div>
  );
}
