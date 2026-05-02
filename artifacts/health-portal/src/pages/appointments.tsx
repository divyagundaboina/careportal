import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Calendar, Clock, Search, Filter, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListAppointments, 
  getListAppointmentsQueryKey,
  useListDoctors,
  getListDoctorsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Appointments() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  
  // Base params
  const params: any = {};
  if (user?.role === "patient") {
    params.patientId = user.id;
  } else if (user?.role === "doctor") {
    params.doctorId = user.id; // Would need proper doctor profile mapping in a real app, assuming 1:1 for simplicity here if ids match, or API handles it based on role
  }
  
  if (statusFilter !== "all") params.status = statusFilter;
  if (doctorFilter !== "all") params.doctorId = parseInt(doctorFilter);

  const { data: appointments, isLoading } = useListAppointments(params, {
    query: { queryKey: getListAppointmentsQueryKey(params) }
  });

  const { data: doctors } = useListDoctors({}, {
    query: { queryKey: getListDoctorsQueryKey() }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "confirmed": return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Confirmed</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage and view your consultations.</p>
        </div>
        {(user?.role === "patient" || user?.role === "admin") && (
          <Link href="/appointments/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {user?.role !== "doctor" && (
                <div className="w-full sm:w-64">
                  <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {doctors?.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          Dr. {doc.name} - {doc.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>{user?.role === "patient" ? "Doctor" : "Patient"}</TableHead>
                    <TableHead>Specialty / Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id} className="hover:bg-muted/50 cursor-pointer transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1.5 text-muted-foreground mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            {apt.appointmentTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user?.role === "patient" ? (
                          <div className="font-medium text-primary flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Dr. {apt.doctorName}
                          </div>
                        ) : (
                          <div className="font-medium">{apt.patientName}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {user?.role === "patient" ? (
                            <span>{apt.doctorSpecialty}</span>
                          ) : null}
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {apt.reason || "No reason provided"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/appointments/${apt.id}`}>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No appointments found</h3>
              <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                You don't have any appointments matching the current filters.
              </p>
              {(user?.role === "patient" || user?.role === "admin") && (
                <Link href="/appointments/new">
                  <Button>Book an Appointment</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
