import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import {
  CreateAppointmentBody,
  UpdateAppointmentBody,
  UpdateAppointmentParams,
  GetAppointmentParams,
  DeleteAppointmentParams,
  ListAppointmentsQueryParams,
} from "@workspace/api-zod";
import { enrichAppointmentBasic } from "./appointments-utils";

const router: IRouter = Router();

router.get("/appointments", async (req, res): Promise<void> => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(appointmentsTable).$dynamic();
  const conditions = [];

  if (parsed.data.patientId) {
    conditions.push(eq(appointmentsTable.patientId, parsed.data.patientId));
  }
  if (parsed.data.doctorId) {
    conditions.push(eq(appointmentsTable.doctorId, parsed.data.doctorId));
  }
  if (parsed.data.status) {
    conditions.push(eq(appointmentsTable.status, parsed.data.status));
  }
  if (parsed.data.date) {
    conditions.push(eq(appointmentsTable.appointmentDate, parsed.data.date));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const appointments = await query.orderBy(appointmentsTable.appointmentDate, appointmentsTable.appointmentTime);
  const enriched = await Promise.all(appointments.map(enrichAppointmentBasic));
  res.json(enriched);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { patientId, doctorId, appointmentDate, appointmentTime } = parsed.data;

  const [conflict] = await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.doctorId, doctorId),
        eq(appointmentsTable.appointmentDate, appointmentDate),
        eq(appointmentsTable.appointmentTime, appointmentTime),
        sql`${appointmentsTable.status} NOT IN ('cancelled')`
      )
    );

  if (conflict) {
    res.status(400).json({ error: "This time slot is already booked for the selected doctor" });
    return;
  }

  const [appointment] = await db.insert(appointmentsTable).values(parsed.data).returning();
  const enriched = await enrichAppointmentBasic(appointment);
  res.status(201).json(enriched);
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id));

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const enriched = await enrichAppointmentBasic(appointment);
  res.json(enriched);
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [appointment] = await db
    .update(appointmentsTable)
    .set(parsed.data)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const enriched = await enrichAppointmentBasic(appointment);
  res.json(enriched);
});

router.delete("/appointments/:id", async (req, res): Promise<void> => {
  const params = DeleteAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .delete(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
