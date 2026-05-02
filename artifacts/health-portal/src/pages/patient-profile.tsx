import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle,
  Activity,
  Droplets,
  FileText
} from "lucide-react";
import { 
  useGetPatient, 
  getGetPatientQueryKey,
  useListAppointments,
  getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const patientId = parseInt(id || "0");
  
  const { data: patient, isLoading, isError } = useGetPatient(patientId, {
    query: { 
      enabled: !!patientId,
      queryKey: getGetPatientQueryKey(patientId)
    }
  });

  const { data: appointments, isLoading: appointmentsLoading } = useListAppointments(
    { patientId },
    { query: { enabled: !!patientId, queryKey: getListAppointmentsQueryKey({ patientId }) } }
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Patient Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The patient record you're looking for doesn't exist or you don't have access.</p>
        <Button onClick={() => setLocation("/patients")}>Back to Patients</Button>
      </div>
    );
  }

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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Record</h1>
          <p className="text-muted-foreground">ID: #{patientId}</p>
        </div>
      </div>

      {isLoading || !patient ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[300px] col-span-1" />
          <Skeleton className="h-[300px] col-span-2" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center pb-6 border-b">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mb-4">
                    {patient.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold">{patient.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Added {format(new Date(patient.createdAt), 'MMM yyyy')}
                  </p>
                </div>
                
                <div className="pt-6 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{patient.email}</p>
                    </div>
                  </div>
                  
                  {patient.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{patient.phone}</p>
                      </div>
                    </div>
                  )}

                  {patient.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">{patient.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.dateOfBirth && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Date of Birth</p>
                        <p className="text-muted-foreground">{format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.gender && (
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Gender</p>
                        <p className="text-muted-foreground capitalize">{patient.gender}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-destructive" />
                  Vital Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Blood Group</p>
                  {patient.bloodGroup ? (
                    <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/5">{patient.bloodGroup}</Badge>
                  ) : (
                    <span className="text-muted-foreground italic">Not recorded</span>
                  )}
                </div>
                <div>
                  <p className="font-medium mb-1">Allergies</p>
                  {patient.allergies ? (
                    <p className="text-destructive bg-destructive/5 p-2 rounded-md border border-destructive/20">{patient.allergies}</p>
                  ) : (
                    <span className="text-muted-foreground italic">No known allergies</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicalHistory ? (
                  <div className="bg-muted/30 p-4 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                    {patient.medicalHistory}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No comprehensive medical history recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Appointment History
                </CardTitle>
                <CardDescription>Past and upcoming consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-md shrink-0">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{format(new Date(apt.appointmentDate), 'MMMM dd, yyyy')} at {apt.appointmentTime}</p>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <User className="h-3 w-3" /> Dr. {apt.doctorName}
                              <span className="mx-1">•</span>
                              <span>{apt.doctorSpecialty}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                          {getStatusBadge(apt.status)}
                          <Link href={`/appointments/${apt.id}`}>
                            <Button variant="ghost" size="sm" className="h-8">Details</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md bg-muted/20">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No appointments found for this patient.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
