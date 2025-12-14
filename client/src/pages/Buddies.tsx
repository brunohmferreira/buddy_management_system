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

export default function Buddies() {
  const { user } = useAuth();
  const { data: buddies = [], isLoading, refetch } = trpc.buddies.list.useQuery();
  const createBuddyMutation = trpc.buddies.create.useMutation();
  const updateBuddyMutation = trpc.buddies.update.useMutation();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBuddy, setEditingBuddy] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    team: "",
    level: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    nickname: "",
    team: "",
    level: "",
    status: "available" as const,
  });

  const filteredBuddies = useMemo(() => {
    return buddies.filter((buddy) => {
      if (filters.name && !buddy.nickname?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.team && buddy.team !== filters.team) {
        return false;
      }
      if (filters.level && buddy.level !== filters.level) {
        return false;
      }
      if (filters.status && buddy.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [buddies, filters]);

  const handleCreateBuddy = async () => {
    try {
      await createBuddyMutation.mutateAsync({
        userId: user!.id,
        ...formData,
      });
      toast.success("Buddy profile created successfully!");
      setCreateModalOpen(false);
      setFormData({ nickname: "", team: "", level: "", status: "available" });
      refetch();
    } catch (error) {
      toast.error("Failed to create buddy profile");
    }
  };

  const handleEditBuddy = async () => {
    if (!editingBuddy) return;
    try {
      await updateBuddyMutation.mutateAsync({
        id: editingBuddy.id,
        ...formData,
      });
      toast.success("Buddy profile updated successfully!");
      setEditModalOpen(false);
      setEditingBuddy(null);
      setFormData({ nickname: "", team: "", level: "", status: "available" });
      refetch();
    } catch (error) {
      toast.error("Failed to update buddy profile");
    }
  };

  const openEditModal = (buddy: any) => {
    setEditingBuddy(buddy);
    setFormData({
      nickname: buddy.nickname || "",
      team: buddy.team || "",
      level: buddy.level || "",
      status: buddy.status,
    });
    setEditModalOpen(true);
  };

  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    unavailable: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <BuddyDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Buddies</h1>
            <p className="text-muted-foreground mt-1">Manage experienced mentors</p>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Buddy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Buddy Profile</DialogTitle>
                <DialogDescription>Add a new buddy to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nickname</label>
                  <Input
                    placeholder="John Doe"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Team</label>
                  <Input
                    placeholder="Engineering"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Level</label>
                  <Input
                    placeholder="Senior"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <Button
                  onClick={handleCreateBuddy}
                  disabled={createBuddyMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createBuddyMutation.isPending ? "Creating..." : "Create Buddy"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
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
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Team</label>
                  <Input
                    placeholder="Filter by team..."
                    value={filters.team}
                    onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Level</label>
                  <Input
                    placeholder="Filter by level..."
                    value={filters.level}
                    onChange={(e) => setFilters({ ...filters, level: e.target.value })}
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
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Buddies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading buddies...</p>
            </div>
          ) : filteredBuddies.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No buddies found</p>
            </div>
          ) : (
            filteredBuddies.map((buddy) => (
              <Card key={buddy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{buddy.nickname || "Unnamed"}</CardTitle>
                      <CardDescription>{buddy.team || "No team"}</CardDescription>
                    </div>
                    <Badge className={statusColors[buddy.status]}>
                      {buddy.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-semibold text-foreground">{buddy.level || "Not specified"}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(buddy)}
                    className="w-full"
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Buddy Profile</DialogTitle>
              <DialogDescription>Update buddy information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nickname</label>
                <Input
                  placeholder="John Doe"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Team</label>
                <Input
                  placeholder="Engineering"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Level</label>
                <Input
                  placeholder="Senior"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <Button
                onClick={handleEditBuddy}
                disabled={updateBuddyMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {updateBuddyMutation.isPending ? "Updating..." : "Update Buddy"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BuddyDashboardLayout>
  );
}
