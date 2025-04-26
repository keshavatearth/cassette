import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Fetch notification count
  const { data: notificationData } = useQuery({
    queryKey: ["/api/notifications/count"],
    staleTime: 60000, // 1 minute
  });
  
  const unreadCount = notificationData?.count || 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar (Desktop) */}
      <Sidebar unreadCount={unreadCount} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {/* Top Navigation (Mobile) */}
        <header className="md:hidden bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <i className="fas fa-film text-primary-foreground"></i>
            </div>
            <span className="text-xl font-bold">Cassette</span>
          </div>
          <div className="flex items-center space-x-2">
            <a href="/notifications" className="relative p-2 rounded-full hover:bg-accent/10">
              <i className="fas fa-bell text-muted-foreground"></i>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </a>
          </div>
        </header>

        {/* Page Content */}
        {children}
        
        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileNav />}
      </main>
    </div>
  );
};

export default Layout;
