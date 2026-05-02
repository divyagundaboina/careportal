import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Stethoscope, 
  UserCircle, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return <>{children}</>;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["patient", "doctor", "admin"] },
    { name: "Appointments", href: "/appointments", icon: CalendarDays, roles: ["patient", "doctor", "admin"] },
    { name: "Doctors", href: "/doctors", icon: Stethoscope, roles: ["patient", "admin"] },
    { name: "Patients", href: "/patients", icon: Users, roles: ["doctor", "admin"] },
    { name: "Profile", href: "/profile", icon: UserCircle, roles: ["patient", "doctor", "admin"] },
  ];

  const filteredNavigation = navigation.filter((item) => 
    item.roles.includes(user.role)
  );

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {filteredNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href || location.startsWith(`${item.href}/`);
        return (
          <Link key={item.name} href={item.href}>
            <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}>
              <Icon className="h-4 w-4" />
              {item.name}
            </a>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg tracking-tight">CarePortal</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-8">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg tracking-tight">CarePortal</span>
              </div>
              <div className="flex-1">
                <NavLinks />
              </div>
              <div className="pt-4 border-t mt-auto">
                <div className="mb-4 px-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar p-6 shrink-0 h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg tracking-tight">CarePortal</span>
        </div>
        
        <div className="flex-1">
          <NavLinks />
        </div>

        <div className="pt-4 border-t mt-auto">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        <div className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
