import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, MessageSquare } from "lucide-react";
import BuddyDashboardLayout from "@/components/BuddyDashboardLayout";
import { toast } from "sonner";

export default function Meetings() {
  const { user } = useAuth();
  const { data: associations = [] } = trpc.associations.list.useQuery();
  const { data: buddies = [] } = trpc.buddies.list.useQuery();
  const { data: newHires = [] } = trpc.newHires.list.useQuery();

  const [selectedAssociation, setSelectedAssociation] = useState<number | null>(null);
  const { data: meetings = [], isLoading, refetch } = trpc.meetings.listByAssociation.useQuery(
    { associationId: selectedAssociation || 0 },
    { enabled: !!selectedAssociation }
  );
  const { data: meetingNotes = [], refetch: refetchNotes } = trpc.meetingNotes.listByMeeting.useQuery(
    { meetingId: selectedAssociation ? meetings[0]?.id || 0 : 0 },
    { enabled: !!selectedAssociation && meetings.length > 0 }
  );

  const createMeetingMutation = trpc.meetings.create.useMutation();
  const createNoteMutation = trpc.meetingNotes.create.useMutation();
  const updateMeetingMutation = trpc.meetings.update.useMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    scheduledAt: new Date().toISOString().split("T")[0],
    scheduledTime: "10:00",
  });

  const [noteContent, setNoteContent] = useState("");

  const handleCreateMeeting = async () => {
    if (!selectedAssociation || !formData.scheduledAt) {
      toast.error("Please select an association and date");
      return;
    }

    try {
      const dateTime = new Date(`${formData.scheduledAt}T${formData.scheduledTime}`);
      await createMeetingMutation.mutateAsync({
        associationId: selectedAssociation,
        title: formData.title,
        scheduledAt: dateTime,
      });
      toast.success("Meeting created successfully!");
      setCreateModalOpen(false);
      setFormData({
        title: "",
        scheduledAt: new Date().toISOString().split("T")[0],
        scheduledTime: "10:00",
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create meeting");
    }
  };

  const handleAddNote = async () => {
    if (!selectedMeeting || !noteContent) {
      toast.error("Please enter a note");
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        meetingId: selectedMeeting.id,
        content: noteContent,
      });
      toast.success("Note added successfully!");
      setNoteContent("");
      refetchNotes();
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const handleCompleteMeeting = async (meeting: any) => {
    try {
      await updateMeetingMutation.mutateAsync({
        id: meeting.id,
        completedAt: new Date(),
      });
      toast.success("Meeting marked as completed!");
      refetch();
    } catch (error) {
      toast.error("Failed to update meeting");
    }
  };

  const handleUndoComplete = async (meeting: any) => {
    try {
      await updateMeetingMutation.mutateAsync({
        id: meeting.id,
        completedAt: undefined,
      });
      toast.success("Meeting unmarked!");
      refetch();
    } catch (error) {
      toast.error("Failed to update meeting");
    }
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

  const selectedAssocNames = selectedAssociation ? getAssociationNames(selectedAssociation) : null;

  return (
    <BuddyDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage meetings</p>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
                <DialogDescription>Create a new meeting for an association</DialogDescription>
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
                    placeholder="Meeting title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    type="date"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreateMeeting}
                  disabled={createMeetingMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createMeetingMutation.isPending ? "Creating..." : "Schedule Meeting"}
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
          <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Association</p>
              <p className="text-lg font-semibold text-foreground">
                {selectedAssocNames.buddy} ↔ {selectedAssocNames.newHire}
              </p>
            </div>

            <h2 className="text-xl font-bold text-foreground">Upcoming Meetings</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading meetings...</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No meetings scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <Card
                    key={meeting.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedMeeting?.id === meeting.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-semibold text-foreground">
                              {meeting.title || "Meeting"}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {new Date(meeting.scheduledAt).toLocaleString()}
                          </p>
                          {meeting.completedAt && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              ✓ Completed
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {!meeting.completedAt ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteMeeting(meeting);
                                }}
                              >
                                Mark Done
                              </Button>
                              <Dialog open={notesModalOpen && selectedMeeting?.id === meeting.id} onOpenChange={setNotesModalOpen}>
                                <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedMeeting(meeting)}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Notes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{meeting.title || "Meeting"}</DialogTitle>
                                    <DialogDescription>
                                      {new Date(meeting.scheduledAt).toLocaleString()}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                      {meetingNotes.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No notes yet</p>
                                      ) : (
                                        meetingNotes.map((note) => (
                                          <div key={note.id} className="p-3 bg-accent/10 rounded-lg">
                                            <p className="text-sm text-foreground">{note.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {new Date(note.createdAt).toLocaleString()}
                                            </p>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    <div className="space-y-2 border-t border-border pt-4">
                                      <textarea
                                        placeholder="Add a note..."
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                                        rows={3}
                                      />
                                      <Button
                                        onClick={handleAddNote}
                                        disabled={createNoteMutation.isPending}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                        size="sm"
                                      >
                                        {createNoteMutation.isPending ? "Adding..." : "Add Note"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndoComplete(meeting);
                              }}
                            >
                              Undo
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BuddyDashboardLayout>
  );
}
