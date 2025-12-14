import React, { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ChevronDown, ChevronUp, Search } from "lucide-react";
import BuddyDashboardLayout from "@/components/BuddyDashboardLayout";
import { toast } from "sonner";

export default function Associations() {
  const { user } = useAuth();
  const { data: associations = [], isLoading, refetch } = trpc.associations.list.useQuery();
  const { data: buddies = [] } = trpc.buddies.list.useQuery();
  const { data: newHires = [] } = trpc.newHires.list.useQuery();
  const createAssociationMutation = trpc.associations.create.useMutation();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    buddyName: "",
    newHireName: "",
    startDate: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    buddyId: "",
    newHireId: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const filteredAssociations = useMemo(() => {
    return associations.filter((assoc) => {
      const buddy = buddies.find((b) => b.id === assoc.buddyId);
      const newHire = newHires.find((nh) => nh.id === assoc.newHireId);

      if (filters.buddyName && !buddy?.nickname?.toLowerCase().includes(filters.buddyName.toLowerCase())) {
        return false;
      }
      if (filters.newHireName && !newHire?.nickname?.toLowerCase().includes(filters.newHireName.toLowerCase())) {
        return false;
      }
      if (filters.status && assoc.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [associations, buddies, newHires, filters]);

  const handleCreateAssociation = async () => {
    if (!formData.buddyId || !formData.newHireId) {
      toast.error("Please select both buddy and new hire");
      return;
    }

    try {
      await createAssociationMutation.mutateAsync({
        buddyId: parseInt(formData.buddyId),
        newHireId: parseInt(formData.newHireId),
        startDate: new Date(formData.startDate),
      });
      toast.success("Association created successfully!");
      setCreateModalOpen(false);
      setFormData({
        buddyId: "",
        newHireId: "",
        startDate: new Date().toISOString().split("T")[0],
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create association");
    }
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const getBuddyName = (buddyId: number) => {
    return buddies.find((b) => b.id === buddyId)?.nickname || "Unknown";
  };

  const getNewHireName = (newHireId: number) => {
    return newHires.find((nh) => nh.id === newHireId)?.nickname || "Unknown";
  };

  return (
    <BuddyDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Associations</h1>
            <p className="text-muted-foreground mt-1">Manage buddy-new hire pairings</p>
          </div>
          {user?.role === "admin" && (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  New Association
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Association</DialogTitle>
                  <DialogDescription>Pair a buddy with a new hire</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Select Buddy</label>
                    <select
                      value={formData.buddyId}
                      onChange={(e) => setFormData({ ...formData, buddyId: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">Choose a buddy...</option>
                      {buddies.map((buddy) => (
                        <option key={buddy.id} value={buddy.id}>
                          {buddy.nickname || "Unnamed"} ({buddy.team || "No team"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Select New Hire</label>
                    <select
                      value={formData.newHireId}
                      onChange={(e) => setFormData({ ...formData, newHireId: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">Choose a new hire...</option>
                      {newHires.map((newHire) => (
                        <option key={newHire.id} value={newHire.id}>
                          {newHire.nickname || "Unnamed"} ({newHire.team || "No team"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Start Date</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleCreateAssociation}
                    disabled={createAssociationMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {createAssociationMutation.isPending ? "Creating..." : "Create Association"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center justify-between w-full hover:opacity-70 transition-opacity"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">Filters</span>
              </div>
              {filtersOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {filtersOpen && (
            <CardContent className="space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Buddy Name</label>
                  <Input
                    placeholder="Search by buddy name..."
                    value={filters.buddyName}
                    onChange={(e) => setFilters({ ...filters, buddyName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">New Hire Name</label>
                  <Input
                    placeholder="Search by new hire name..."
                    value={filters.newHireName}
                    onChange={(e) => setFilters({ ...filters, newHireName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading associations...</p>
            </div>
          ) : filteredAssociations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No associations found</p>
            </div>
          ) : (
            filteredAssociations.map((assoc) => (
              <Card key={assoc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Buddy</p>
                          <p className="font-semibold text-foreground">{getBuddyName(assoc.buddyId)}</p>
                        </div>
                        <div className="text-2xl text-muted-foreground">↔</div>
                        <div>
                          <p className="text-sm text-muted-foreground">New Hire</p>
                          <p className="font-semibold text-foreground">{getNewHireName(assoc.newHireId)}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        Started: {new Date(assoc.startDate).toLocaleDateString()}
                        {assoc.endDate && ` • Ended: ${new Date(assoc.endDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Badge className={statusColors[assoc.status]}>
                      {assoc.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </BuddyDashboardLayout>
  );
}
