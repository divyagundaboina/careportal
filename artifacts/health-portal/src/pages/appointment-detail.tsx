import { useLocation, useParams, Link } from "wouter";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PencilLine
} from "lucide-react";
import { 
  useGetAppointment, 
  getGetAppointmentQueryKey,
  useUpdateAppointment,
  UpdateAppointmentBodyStatus
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const appointmentId = parseInt(id || "0");
  
  const { data: appointment, isLoading, isError } = useGetAppointment(appointmentId, {
    query: { 
      enabled: !!appointmentId,
      queryKey: getGetAppointmentQueryKey(appointmentId)
    }
  });

  const updateAppointment = useUpdateAppointment();
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (appointment && initializedForId.current !== appointment.id) {
      initializedForId.current = appointment.id;
      setNotes(appointment.notes || "");
    }
  }, [appointment]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Appointment Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The appointment you're looking for doesn't exist or you don't have access.</p>
        <Button onClick={() => setLocation("/appointments")}>Back to Appointments</Button>
      </div>
    );
  }

  const handleStatusUpdate = (status: UpdateAppointmentBodyStatus) => {
    updateAppointment.mutate(
      { 
        id: appointmentId, 
        data: { status } 
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Status updated",
            description: `Appointment marked as ${status}.`,
          });
          queryClient.setQueryData(getGetAppointmentQueryKey(appointmentId), data);
        },
        onError: () => {
          toast({
            title: "Update failed",
            description: "Could not update appointment status.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleSaveNotes = () => {
    updateAppointment.mutate(
      { 
        id: appointmentId, 
        data: { notes } 
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Notes saved",
            description: "Clinical notes updated successfully.",
          });
          setIsEditingNotes(false);
          queryClient.setQueryData(getGetAppointmentQueryKey(appointmentId), data);
        },
        onError: () => {
          toast({
            title: "Save failed",
            description: "Could not save notes.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pending</Badge>;
      case "confirmed": return <Badge className="bg-primary text-primary-foreground">Confirmed</Badge>;
      case "completed": return <Badge className="bg-green-600 hover:bg-green-700 text-white">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canUpdateStatus = user?.role === "doctor" || user?.role === "admin";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/appointments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
          <p className="text-muted-foreground">ID: #{appointmentId}</p>
        </div>
      </div>

      {isLoading || !appointment ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] col-span-2" />
          <Skeleton className="h-[400px] col-span-1" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Consultation Info</CardTitle>
                  <CardDescription>Scheduled details and reason</CardDescription>
                </div>
                {getStatusBadge(appointment.status)}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date</p>
                      <p className="font-medium">{format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time</p>
                      <p className="font-medium">{appointment.appointmentTime}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reason for Visit
                  </h4>
                  <p className="text-sm bg-muted/50 p-4 rounded-md">
                    {appointment.reason || "No specific reason provided."}
                  </p>
                </div>

                {canUpdateStatus && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                  <div className="pt-4 flex flex-wrap gap-2">
                    {appointment.status === 'pending' && (
                      <Button 
                        onClick={() => handleStatusUpdate(UpdateAppointmentBodyStatus.confirmed)}
                        disabled={updateAppointment.isPending}
                        className="bg-primary"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Appointment
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button 
                        onClick={() => handleStatusUpdate(UpdateAppointmentBodyStatus.completed)}
                        disabled={updateAppointment.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Completed
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleStatusUpdate(UpdateAppointmentBodyStatus.cancelled)}
                      disabled={updateAppointment.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Cancel Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {(user?.role === "doctor" || user?.role === "admin" || (user?.role === "patient" && appointment.notes)) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Clinical Notes</CardTitle>
                  {(user?.role === "doctor" || user?.role === "admin") && !isEditingNotes && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(true)}>
                      <PencilLine className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditingNotes ? (
                    <div className="space-y-4">
                      <Textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        rows={6}
                        placeholder="Add clinical observations, diagnosis, and prescriptions here..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setNotes(appointment.notes || "");
                          setIsEditingNotes(false);
                        }}>Cancel</Button>
                        <Button size="sm" onClick={handleSaveNotes} disabled={updateAppointment.isPending}>
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-md min-h-[100px] whitespace-pre-wrap text-sm">
                      {appointment.notes ? appointment.notes : "No notes have been added yet."}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">People</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {appointment.patientName?.charAt(0) || "P"}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      {user?.role !== "patient" && (
                        <Link href={`/patients/${appointment.patientId}`}>
                          <a className="text-xs text-primary hover:underline">View Profile</a>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Doctor
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {appointment.doctorName?.charAt(0) || "D"}
                    </div>
                    <div>
                      <p className="font-medium">Dr. {appointment.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.doctorSpecialty}</p>
                      <Link href={`/doctors/${appointment.doctorId}`}>
                        <a className="text-xs text-primary hover:underline">View Profile</a>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
