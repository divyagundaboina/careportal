import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { User, Mail, Shield, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mb-4 shadow-lg shadow-primary/20">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <Badge className="mt-2 capitalize bg-primary text-primary-foreground">
              {user.role} Account
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Personal details and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  Full Name
                </div>
                <p className="font-medium">{user.name}</p>
              </div>
              
              <div className="space-y-1 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <p className="font-medium">{user.email}</p>
              </div>

              <div className="space-y-1 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <Shield className="h-4 w-4" />
                  Role / Permissions
                </div>
                <p className="font-medium capitalize">{user.role}</p>
              </div>

              <div className="space-y-1 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </div>
                <p className="font-medium">{format(new Date(user.createdAt), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 border rounded-lg bg-blue-50/50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 flex gap-3">
              <div className="shrink-0 mt-0.5">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Security Notice</h4>
                <p className="text-sm mt-1 opacity-90">
                  Your account uses standard authentication. Always ensure you log out when using public or shared medical terminals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
