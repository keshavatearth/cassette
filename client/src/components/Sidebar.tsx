import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  unreadCount: number;
}

const Sidebar = ({ unreadCount }: SidebarProps) => {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user info
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
  });
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <i className="fas fa-film text-primary-foreground"></i>
          </div>
          <span className="text-xl font-bold">Cassette</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link href="/">
              <a className={`flex items-center px-3 py-2 rounded-md ${
                location === "/" 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground hover:bg-accent/10"
              }`}>
                <i className="fas fa-home w-5 h-5 mr-3"></i>
                <span>Home</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/library">
              <a className={`flex items-center px-3 py-2 rounded-md ${
                location === "/library" 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground hover:bg-accent/10"
              }`}>
                <i className="fas fa-book-open w-5 h-5 mr-3"></i>
                <span>Library</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/reflections">
              <a className={`flex items-center px-3 py-2 rounded-md ${
                location === "/reflections" 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground hover:bg-accent/10"
              }`}>
                <i className="fas fa-comment-dots w-5 h-5 mr-3"></i>
                <span>Reflections</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/discover">
              <a className={`flex items-center px-3 py-2 rounded-md ${
                location === "/discover" 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground hover:bg-accent/10"
              }`}>
                <i className="fas fa-compass w-5 h-5 mr-3"></i>
                <span>Discover</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <ul className="space-y-1">
          <li>
            <Link href="/notifications">
              <a className={`flex items-center px-3 py-2 rounded-md ${
                location === "/notifications" 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground hover:bg-accent/10"
              }`}>
                <i className="fas fa-bell w-5 h-5 mr-3"></i>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </a>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <a className={`flex items-center px-3 py-2 rounded-md ${
                location === "/settings" 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground hover:bg-accent/10"
              }`}>
                <i className="fas fa-cog w-5 h-5 mr-3"></i>
                <span>Settings</span>
              </a>
            </Link>
          </li>
          <li>
            <div className="flex items-center px-3 py-2 rounded-md text-foreground">
              <i className="fas fa-moon w-5 h-5 mr-3"></i>
              <span>Theme</span>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </li>
          <li>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-md text-foreground hover:bg-accent/10"
            >
              <i className="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
