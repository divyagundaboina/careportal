import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react";
import { 
  useListDoctors, 
  getListDoctorsQueryKey,
  useCreateAppointment,
  getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const appointmentSchema = z.object({
  doctorId: z.string().min(1, { message: "Please select a doctor" }),
  appointmentDate: z.string().min(1, { message: "Please select a date" }),
  appointmentTime: z.string().min(1, { message: "Please select a time" }),
  reason: z.string().optional(),
});

export default function NewAppointment() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createAppointment = useCreateAppointment();
  
  const { data: doctors, isLoading: doctorsLoading } = useListDoctors({}, {
    query: { queryKey: getListDoctorsQueryKey() }
  });

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: "",
      appointmentDate: format(new Date(), "yyyy-MM-dd"),
      appointmentTime: "09:00",
      reason: "",
    },
  });

  function onSubmit(values: z.infer<typeof appointmentSchema>) {
    if (!user || user.role !== "patient") {
      toast({
        title: "Error",
        description: "Only patients can book appointments directly.",
        variant: "destructive"
      });
      return;
    }

    createAppointment.mutate(
      { 
        data: {
          patientId: user.id, // Assuming user.id maps to patientId for simplicity
          doctorId: parseInt(values.doctorId),
          appointmentDate: values.appointmentDate,
          appointmentTime: values.appointmentTime,
          reason: values.reason || null
        } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Appointment booked",
            description: "Your appointment has been successfully scheduled.",
          });
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          setLocation("/appointments");
        },
        onError: (error: any) => {
          toast({
            title: "Booking failed",
            description: error.response?.data?.error || "Could not book appointment.",
            variant: "destructive",
          });
        },
      }
    );
  }

  // Generate time slots
  const timeSlots = [];
  for (let i = 8; i <= 18; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/appointments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
          <p className="text-muted-foreground">Schedule a new consultation with a doctor.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Select a doctor and your preferred time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={doctorsLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={doctorsLoading ? "Loading doctors..." : "Select a doctor"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors?.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id.toString()}>
                              Dr. {doc.name} - {doc.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type="date" className="pl-9" {...field} min={format(new Date(), "yyyy-MM-dd")} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Select time" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe your symptoms or reason for appointment" 
                        className="resize-none" 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Optional, but helps the doctor prepare for your visit.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setLocation("/appointments")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
