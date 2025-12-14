import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, Menu, X } from "lucide-react";
import { getLoginUrl } from "@/const";

interface BuddyDashboardLayoutProps {
  children: React.ReactNode;
}

export default function BuddyDashboardLayout({ children }: BuddyDashboardLayoutProps) {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Buddy System</h1>
          <p className="text-muted-foreground mb-6">Please log in to continue</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLogoutLoading(false);
    }
  };

  const navigationItems = [
    { label: "Dashboard", href: "/", icon: "📊" },
    { label: "Buddies", href: "/buddies", icon: "👥" },
    { label: "New Hires", href: "/new-hires", icon: "🆕" },
    { label: "Associations", href: "/associations", icon: "🔗" },
    { label: "Tasks", href: "/tasks", icon: "✓" },
    { label: "Meetings", href: "/meetings", icon: "📅" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-card border-r border-border flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">Buddy System</h1>
          <p className="text-xs text-muted-foreground mt-1">Mentorship Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="px-4 py-2 bg-accent/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold text-foreground truncate">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-center"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="ml-2">{theme === "dark" ? "Light" : "Dark"}</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full justify-center"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2">{isLogoutLoading ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
