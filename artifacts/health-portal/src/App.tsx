import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import NewAppointment from "@/pages/new-appointment";
import AppointmentDetail from "@/pages/appointment-detail";
import Doctors from "@/pages/doctors";
import DoctorProfile from "@/pages/doctor-profile";
import Patients from "@/pages/patients";
import PatientProfile from "@/pages/patient-profile";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ component: Component, roles }: { component: any, roles?: string[] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
};

function Router() {
  const { user } = useAuth();

  return (
    <Layout>
      <Switch>
        {/* Public Routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Redirect root to dashboard or login */}
        <Route path="/">
          {user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
        </Route>

        {/* Protected Routes */}
        <Route path="/dashboard">
          {() => <ProtectedRoute component={Dashboard} />}
        </Route>
        
        <Route path="/appointments/new">
          {() => <ProtectedRoute component={NewAppointment} roles={["patient", "admin"]} />}
        </Route>
        
        <Route path="/appointments/:id">
          {() => <ProtectedRoute component={AppointmentDetail} />}
        </Route>
        
        <Route path="/appointments">
          {() => <ProtectedRoute component={Appointments} />}
        </Route>

        <Route path="/doctors/:id">
          {() => <ProtectedRoute component={DoctorProfile} roles={["patient", "admin", "doctor"]} />}
        </Route>
        
        <Route path="/doctors">
          {() => <ProtectedRoute component={Doctors} roles={["patient", "admin", "doctor"]} />}
        </Route>

        <Route path="/patients/:id">
          {() => <ProtectedRoute component={PatientProfile} roles={["doctor", "admin"]} />}
        </Route>
        
        <Route path="/patients">
          {() => <ProtectedRoute component={Patients} roles={["doctor", "admin"]} />}
        </Route>

        <Route path="/profile">
          {() => <ProtectedRoute component={Profile} />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
