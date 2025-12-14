import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, UserPlus, CheckSquare, Calendar } from "lucide-react";
import BuddyDashboardLayout from "@/components/BuddyDashboardLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: metrics, isLoading } = trpc.dashboard.getMetrics.useQuery();

  const metricCards = [
    {
      title: "Total Buddies",
      value: metrics?.buddyCount || 0,
      icon: Users,
      color: "bg-red-50 dark:bg-red-950",
      textColor: "text-red-600 dark:text-red-400",
      href: "/buddies",
    },
    {
      title: "New Hires",
      value: metrics?.newHireCount || 0,
      icon: UserPlus,
      color: "bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-600 dark:text-blue-400",
      href: "/new-hires",
    },
    {
      title: "Active Associations",
      value: metrics?.activeAssociations || 0,
      icon: Users,
      color: "bg-green-50 dark:bg-green-950",
      textColor: "text-green-600 dark:text-green-400",
      href: "/associations",
    },
    {
      title: "Pending Tasks",
      value: metrics?.pendingTasks || 0,
      icon: CheckSquare,
      color: "bg-yellow-50 dark:bg-yellow-950",
      textColor: "text-yellow-600 dark:text-yellow-400",
      href: "/tasks",
    },
  ];

  const quickActions = [
    {
      label: "Add Buddy",
      icon: Plus,
      href: "/buddies?modal=create",
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      label: "Add New Hire",
      icon: Plus,
      href: "/new-hires?modal=create",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Create Task",
      icon: CheckSquare,
      href: "/tasks?modal=create",
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      label: "Schedule Meeting",
      icon: Calendar,
      href: "/meetings?modal=create",
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <BuddyDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground mt-2">
            Manage your buddy mentorship program and track onboarding progress.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <a key={card.title} href={card.href} className="block">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground">
                        {card.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <Icon className={`w-5 h-5 ${card.textColor}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {isLoading ? "-" : card.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a key={action.label} href={action.href} className="block">
                  <Button
                    className={`w-full ${action.color} text-white font-semibold py-6`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {action.label}
                  </Button>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </BuddyDashboardLayout>
  );
}
