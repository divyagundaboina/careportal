import { useAuth } from "@/hooks/use-auth";
import {
  useGetDashboardStats,
  useGetRecentAppointments,
  useGetAppointmentTrends,
  useGetSpecialtyBreakdown,
  getGetDashboardStatsQueryKey,
  getGetRecentAppointmentsQueryKey,
  getGetAppointmentTrendsQueryKey,
  getGetSpecialtyBreakdownQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });

  const { data: recentAppointments, isLoading: recentLoading } = useGetRecentAppointments(
    { limit: 5 },
    { query: { queryKey: getGetRecentAppointmentsQueryKey({ limit: 5 }) } }
  );

  const { data: trends, isLoading: trendsLoading } = useGetAppointmentTrends({
    query: { queryKey: getGetAppointmentTrendsQueryKey() }
  });

  const { data: specialties, isLoading: specialtyLoading } = useGetSpecialtyBreakdown({
    query: { queryKey: getGetSpecialtyBreakdownQueryKey() }
  });

  const COLORS = ['#0ea5e9', '#0d9488', '#64748b', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's an overview of the clinic.
        </p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {trendsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : trends && trends.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      labelFormatter={(val) => format(new Date(val), 'MMM dd, yyyy')}
                    />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Specialty Breakdown</CardTitle>
            <CardDescription>Active doctors per specialty</CardDescription>
          </CardHeader>
          <CardContent>
            {specialtyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : specialties && specialties.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={specialties}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="specialty"
                    >
                      {specialties.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {specialties.map((spec, index) => (
                    <div key={spec.specialty} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-muted-foreground">{spec.specialty} ({spec.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No specialty data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
          <CardDescription>Latest scheduled consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentAppointments && recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{apt.patientName}</p>
                    <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{apt.appointmentTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Dr. {apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.doctorSpecialty}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No recent appointments found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
