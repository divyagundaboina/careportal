import { useState } from "react";
import { Link } from "wouter";
import { Search, Users, Phone, Mail, MapPin } from "lucide-react";
import { 
  useListPatients, 
  getListPatientsQueryKey 
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce for search
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);
  
  const params: any = {};
  if (debouncedSearch) params.search = debouncedSearch;

  const { data: patients, isLoading } = useListPatients(params, {
    query: { queryKey: getListPatientsQueryKey(params) }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage and view patient records.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search patients by name or email..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : patients && patients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card key={patient.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{patient.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">ID: #{patient.id}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-primary/70" />
                  <span className="truncate">{patient.email}</span>
                </div>
                {patient.phone ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                    <span>{patient.phone}</span>
                  </div>
                ) : null}
                {patient.address ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/patients/${patient.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">View Record</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-card border rounded-lg">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No patients found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            {debouncedSearch ? "Try adjusting your search terms." : "There are currently no patients in the system."}
          </p>
          {debouncedSearch && (
            <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
