import { eq } from "drizzle-orm";
import { db, appointmentsTable, doctorsTable, patientsTable } from "@workspace/db";

export async function enrichAppointmentBasic(a: typeof appointmentsTable.$inferSelect) {
  const [doctor] = await db
    .select({ name: doctorsTable.name, specialty: doctorsTable.specialty })
    .from(doctorsTable)
    .where(eq(doctorsTable.id, a.doctorId));
  const [patient] = await db
    .select({ name: patientsTable.name })
    .from(patientsTable)
    .where(eq(patientsTable.id, a.patientId));

  return {
    id: a.id,
    patientId: a.patientId,
    doctorId: a.doctorId,
    patientName: patient?.name ?? null,
    doctorName: doctor?.name ?? null,
    doctorSpecialty: doctor?.specialty ?? null,
    appointmentDate: a.appointmentDate,
    appointmentTime: a.appointmentTime,
    status: a.status as "pending" | "confirmed" | "completed" | "cancelled",
    reason: a.reason,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
  };
}
