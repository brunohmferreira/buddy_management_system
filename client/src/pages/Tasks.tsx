import React, { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle, Clock, AlertCircle, Circle } from "lucide-react";
import BuddyDashboardLayout from "@/components/BuddyDashboardLayout";
import { toast } from "sonner";

export default function Tasks() {
  const { user } = useAuth();
  const { data: associations = [] } = trpc.associations.list.useQuery();
  const { data: buddies = [] } = trpc.buddies.list.useQuery();
  const { data: newHires = [] } = trpc.newHires.list.useQuery();

  const [selectedAssociation, setSelectedAssociation] = useState<number | null>(null);
  const { data: tasks = [], isLoading, refetch } = trpc.tasks.listByAssociation.useQuery(
    { associationId: selectedAssociation || 0 },
    { enabled: !!selectedAssociation }
  );
  const createTaskMutation = trpc.tasks.create.useMutation();
  const updateTaskMutation = trpc.tasks.update.useMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    usefulLink: "",
    status: "pending" as const,
    dueDate: new Date().toISOString().split("T")[0],
  });

  const taskStats = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "inProgress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
    };
  }, [tasks]);

  const handleCreateTask = async () => {
    if (!selectedAssociation || !formData.title) {
      toast.error("Please select an association and enter a task title");
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        associationId: selectedAssociation,
        title: formData.title,
        description: formData.description,
        usefulLink: formData.usefulLink,
        status: formData.status,
        dueDate: new Date(formData.dueDate),
      });
      toast.success("Task created successfully!");
      setCreateModalOpen(false);
      setFormData({
        title: "",
        description: "",
        usefulLink: "",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        title: formData.title,
        description: formData.description,
        usefulLink: formData.usefulLink,
        status: formData.status,
        dueDate: new Date(formData.dueDate),
      });
      toast.success("Task updated successfully!");
      setEditModalOpen(false);
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        usefulLink: "",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
      });
      refetch();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      usefulLink: task.usefulLink || "",
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setEditModalOpen(true);
  };

  const getAssociationNames = (associationId: number): { buddy: string; newHire: string } => {
    const assoc = associations.find((a) => a.id === associationId);
    if (!assoc) return { buddy: "Unknown", newHire: "Unknown" };

    const buddy = buddies.find((b) => b.id === assoc.buddyId);
    const newHire = newHires.find((nh) => nh.id === assoc.newHireId);

    return {
      buddy: buddy?.nickname || "Unknown",
      newHire: newHire?.nickname || "Unknown",
    };
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    inProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusIcons: Record<string, any> = {
    pending: Circle,
    inProgress: Clock,
    completed: CheckCircle,
    overdue: AlertCircle,
  };

  const selectedAssocNames = selectedAssociation ? getAssociationNames(selectedAssociation) : null;

  return (
    <BuddyDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage onboarding tasks</p>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a task to an association</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Association</label>
                  <select
                    value={selectedAssociation || ""}
                    onChange={(e) => setSelectedAssociation(parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select an association...</option>
                    {associations.map((assoc) => {
                      const names = getAssociationNames(assoc.id);
                      return (
                        <option key={assoc.id} value={assoc.id}>
                          {names.buddy} ↔ {names.newHire}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    placeholder="Task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    placeholder="Task description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Useful Link</label>
                  <Input
                    placeholder="https://..."
                    value={formData.usefulLink}
                    onChange={(e) => setFormData({ ...formData, usefulLink: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <Button
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Select Association</label>
          <select
            value={selectedAssociation || ""}
            onChange={(e) => setSelectedAssociation(parseInt(e.target.value))}
            className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">Choose an association...</option>
            {associations.map((assoc) => {
              const names = getAssociationNames(assoc.id);
              return (
                <option key={assoc.id} value={assoc.id}>
                  {names.buddy} ↔ {names.newHire}
                </option>
              );
            })}
          </select>
        </div>

        {selectedAssociation && selectedAssocNames && (
          <>
            <div className="p-4 bg-accent/10 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Association</p>
              <p className="text-lg font-semibold text-foreground">
                {selectedAssocNames.buddy} ↔ {selectedAssocNames.newHire}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{taskStats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{taskStats.inProgress}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{taskStats.completed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{taskStats.overdue}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks found</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const StatusIcon = statusIcons[task.status];
                  return (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <StatusIcon className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold text-foreground">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                              </div>
                            </div>
                            {task.usefulLink && (
                              <a
                                href={task.usefulLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-2 inline-block"
                              >
                                View Resource
                              </a>
                            )}
                            {task.dueDate && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge className={statusColors[task.status]}>
                              {task.status === "inProgress" ? "In Progress" : task.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(task)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}

        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  placeholder="Task description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Useful Link</label>
                <Input
                  placeholder="https://..."
                  value={formData.usefulLink}
                  onChange={(e) => setFormData({ ...formData, usefulLink: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  <option value="pending">Pending</option>
                  <option value="inProgress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <Button
                onClick={handleEditTask}
                disabled={updateTaskMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BuddyDashboardLayout>
  );
}
