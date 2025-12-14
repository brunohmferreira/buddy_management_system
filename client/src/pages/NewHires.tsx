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

export default function NewHires() {
  const { user } = useAuth();
  const { data: newHires = [], isLoading, refetch } = trpc.newHires.list.useQuery();
  const createNewHireMutation = trpc.newHires.create.useMutation();
  const updateNewHireMutation = trpc.newHires.update.useMutation();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingNewHire, setEditingNewHire] = useState<any>(null);
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
    status: "onboarding" as const,
    startDate: new Date().toISOString().split("T")[0],
  });

  const filteredNewHires = useMemo(() => {
    return newHires.filter((newHire) => {
      if (filters.name && !newHire.nickname?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.team && newHire.team !== filters.team) {
        return false;
      }
      if (filters.level && newHire.level !== filters.level) {
        return false;
      }
      if (filters.status && newHire.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [newHires, filters]);

  const handleCreateNewHire = async () => {
    try {
      await createNewHireMutation.mutateAsync({
        userId: user!.id,
        nickname: formData.nickname,
        team: formData.team,
        level: formData.level,
        status: formData.status,
        startDate: new Date(formData.startDate),
      });
      toast.success("New hire profile created successfully!");
      setCreateModalOpen(false);
      setFormData({
        nickname: "",
        team: "",
        level: "",
        status: "onboarding",
        startDate: new Date().toISOString().split("T")[0],
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create new hire profile");
    }
  };

  const handleEditNewHire = async () => {
    if (!editingNewHire) return;
    try {
      await updateNewHireMutation.mutateAsync({
        id: editingNewHire.id,
        nickname: formData.nickname,
        team: formData.team,
        level: formData.level,
        status: formData.status,
        startDate: new Date(formData.startDate),
      });
      toast.success("New hire profile updated successfully!");
      setEditModalOpen(false);
      setEditingNewHire(null);
      setFormData({
        nickname: "",
        team: "",
        level: "",
        status: "onboarding",
        startDate: new Date().toISOString().split("T")[0],
      });
      refetch();
    } catch (error) {
      toast.error("Failed to update new hire profile");
    }
  };

  const openEditModal = (newHire: any) => {
    setEditingNewHire(newHire);
    const startDate = newHire.startDate
      ? new Date(newHire.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    setFormData({
      nickname: newHire.nickname || "",
      team: newHire.team || "",
      level: newHire.level || "",
      status: newHire.status,
      startDate,
    });
    setEditModalOpen(true);
  };

  const statusColors: Record<string, string> = {
    onboarding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <BuddyDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">New Hires</h1>
            <p className="text-muted-foreground mt-1">Manage onboarding employees</p>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add New Hire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Hire Profile</DialogTitle>
                <DialogDescription>Add a new employee to onboard</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nickname</label>
                  <Input
                    placeholder="Jane Smith"
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
                    placeholder="Junior"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="mt-1"
                  />
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
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <Button
                  onClick={handleCreateNewHire}
                  disabled={createNewHireMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createNewHireMutation.isPending ? "Creating..." : "Create New Hire"}
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
                    <option value="onboarding">Onboarding</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* New Hires List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading new hires...</p>
            </div>
          ) : filteredNewHires.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No new hires found</p>
            </div>
          ) : (
            filteredNewHires.map((newHire) => (
              <Card key={newHire.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{newHire.nickname || "Unnamed"}</CardTitle>
                      <CardDescription>{newHire.team || "No team"}</CardDescription>
                    </div>
                    <Badge className={statusColors[newHire.status]}>
                      {newHire.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-semibold text-foreground">{newHire.level || "Not specified"}</p>
                  </div>
                  {newHire.startDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(newHire.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(newHire)}
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
              <DialogTitle>Edit New Hire Profile</DialogTitle>
              <DialogDescription>Update new hire information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nickname</label>
                <Input
                  placeholder="Jane Smith"
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
                  placeholder="Junior"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="mt-1"
                />
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
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <Button
                onClick={handleEditNewHire}
                disabled={updateNewHireMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {updateNewHireMutation.isPending ? "Updating..." : "Update New Hire"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BuddyDashboardLayout>
  );
}
