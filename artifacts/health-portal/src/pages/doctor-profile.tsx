import { useLocation, useParams, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Mail, Phone, Calendar, Clock, DollarSign, Award, Star, AlertCircle } from "lucide-react";
import { 
  useGetDoctor, 
  getGetDoctorQueryKey,
  useListAppointments,
  getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const doctorId = parseInt(id || "0");
  
  const { data: doctor, isLoading, isError } = useGetDoctor(doctorId, {
    query: { 
      enabled: !!doctorId,
      queryKey: getGetDoctorQueryKey(doctorId)
    }
  });

  const { data: appointments, isLoading: appointmentsLoading } = useListAppointments(
    { doctorId, status: "pending" },
    { query: { enabled: !!doctorId, queryKey: getListAppointmentsQueryKey({ doctorId, status: "pending" }) } }
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Doctor Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The doctor profile you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/doctors")}>Back to Doctors</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/doctors")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
        </div>
      </div>

      {isLoading || !doctor ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] col-span-1" />
          <Skeleton className="h-[400px] col-span-2" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mb-4">
                  {doctor.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">Dr. {doctor.name}</h2>
                <p className="text-primary font-medium mb-2">{doctor.specialty}</p>
                {doctor.isActive ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active Status</Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive Status</Badge>
                )}
                
                <div className="w-full mt-6 space-y-3 text-sm text-left">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Award className="h-4 w-4 text-primary shrink-0" />
                    <span>Member since {format(new Date(doctor.createdAt), 'yyyy')}</span>
                  </div>
                </div>

                <div className="w-full mt-6">
                  <Link href={`/appointments/new?doctorId=${doctor.id}`} className="w-full block">
                    <Button className="w-full" disabled={!doctor.isActive}>Book Appointment</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Consultation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Days</span>
                  <span className="font-medium text-right max-w-[120px]">{doctor.availableDays}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Hours</span>
                  <span className="font-medium">{doctor.availableTimeStart} - {doctor.availableTimeEnd}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> Fee</span>
                  <span className="font-medium font-mono">${doctor.consultationFee}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {doctor.bio || `Dr. ${doctor.name} is a dedicated ${doctor.specialty} professional committed to providing exceptional patient care.`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Availability</CardTitle>
                <CardDescription>Appointments pending for this doctor</CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}</p>
                            <p className="text-xs text-muted-foreground">{apt.appointmentTime}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground border border-dashed rounded-md bg-muted/30">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No pending appointments.</p>
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
