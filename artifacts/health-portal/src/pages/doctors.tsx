import { useState } from "react";
import { Link } from "wouter";
import { Search, Stethoscope, MapPin, Clock, DollarSign, Calendar } from "lucide-react";
import { 
  useListDoctors, 
  getListDoctorsQueryKey 
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Doctors() {
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  
  const params: any = {};
  if (specialtyFilter !== "all") params.specialty = specialtyFilter;

  const { data: doctors, isLoading } = useListDoctors(params, {
    query: { queryKey: getListDoctorsQueryKey(params) }
  });

  const specialties = [
    "Cardiology", "Dermatology", "Neurology", "Orthopedics", 
    "Pediatrics", "Psychiatry", "General Practice", "Oncology"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Our Doctors</h1>
          <p className="text-muted-foreground">Find and book appointments with specialists.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search doctors by name..." className="pl-9" />
        </div>
        <div className="w-full sm:w-64">
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 bg-primary w-full"></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dr. {doc.name}</CardTitle>
                      <p className="text-sm text-primary font-medium">{doc.specialty}</p>
                    </div>
                  </div>
                  {doc.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.availableDays}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{doc.availableTimeStart} - {doc.availableTimeEnd}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>${doc.consultationFee} Consultation Fee</span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4">
                <Link href={`/doctors/${doc.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-card border rounded-lg">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Stethoscope className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No doctors found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Try adjusting your search filters or browse all specialties.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setSpecialtyFilter("all")}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
