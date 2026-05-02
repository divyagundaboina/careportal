import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, appointmentsTable, doctorsTable, patientsTable } from "@workspace/db";
import {
  GetRecentAppointmentsQueryParams,
} from "@workspace/api-zod";
import { enrichAppointmentBasic } from "./appointments-utils";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [patientCount] = await db.select({ count: count() }).from(patientsTable);
  const [doctorCount] = await db.select({ count: count() }).from(doctorsTable).where(eq(doctorsTable.isActive, true));
  const [totalAppts] = await db.select({ count: count() }).from(appointmentsTable);

  const statusCounts = await db
    .select({ status: appointmentsTable.status, count: count() })
    .from(appointmentsTable)
    .groupBy(appointmentsTable.status);

  const today = new Date().toISOString().split("T")[0];
  const [todayAppts] = await db
    .select({ count: count() })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.appointmentDate, today));

  const getCount = (status: string) => statusCounts.find((s) => s.status === status)?.count ?? 0;

  res.json({
    totalPatients: patientCount.count,
    totalDoctors: doctorCount.count,
    totalAppointments: totalAppts.count,
    pendingAppointments: getCount("pending"),
    confirmedAppointments: getCount("confirmed"),
    completedAppointments: getCount("completed"),
    cancelledAppointments: getCount("cancelled"),
    todayAppointments: todayAppts.count,
  });
});

router.get("/dashboard/recent-appointments", async (req, res): Promise<void> => {
  const parsed = GetRecentAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const limit = parsed.data.limit ?? 10;

  const appointments = await db
    .select()
    .from(appointmentsTable)
    .orderBy(sql`${appointmentsTable.createdAt} DESC`)
    .limit(limit);

  const enriched = await Promise.all(appointments.map(enrichAppointmentBasic));
  res.json(enriched);
});

router.get("/dashboard/appointment-trends", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      date: appointmentsTable.appointmentDate,
      count: count(),
    })
    .from(appointmentsTable)
    .where(sql`${appointmentsTable.appointmentDate} >= (CURRENT_DATE - INTERVAL '7 days')::text`)
    .groupBy(appointmentsTable.appointmentDate)
    .orderBy(appointmentsTable.appointmentDate);

  const dateMap = new Map(results.map((r) => [r.date, r.count]));
  const trends = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    trends.push({ date: dateStr, count: dateMap.get(dateStr) ?? 0 });
  }

  res.json(trends);
});

router.get("/dashboard/specialty-breakdown", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      specialty: doctorsTable.specialty,
      count: count(),
    })
    .from(appointmentsTable)
    .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .groupBy(doctorsTable.specialty)
    .orderBy(sql`count(*) DESC`);

  res.json(results.map((r) => ({ specialty: r.specialty, count: r.count })));
});

export default router;
