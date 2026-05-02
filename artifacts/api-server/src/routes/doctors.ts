import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, doctorsTable } from "@workspace/db";
import {
  CreateDoctorBody,
  UpdateDoctorBody,
  UpdateDoctorParams,
  GetDoctorParams,
  DeleteDoctorParams,
  ListDoctorsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatDoctor(d: typeof doctorsTable.$inferSelect) {
  return {
    id: d.id,
    userId: d.userId,
    name: d.name,
    specialty: d.specialty,
    email: d.email,
    phone: d.phone,
    bio: d.bio,
    availableDays: d.availableDays,
    availableTimeStart: d.availableTimeStart,
    availableTimeEnd: d.availableTimeEnd,
    consultationFee: d.consultationFee,
    isActive: d.isActive,
    createdAt: d.createdAt.toISOString(),
  };
}

router.get("/doctors", async (req, res): Promise<void> => {
  const parsed = ListDoctorsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(doctorsTable).$dynamic();

  const conditions = [];
  if (parsed.data.specialty) {
    conditions.push(eq(doctorsTable.specialty, parsed.data.specialty));
  }
  if (parsed.data.available !== undefined) {
    conditions.push(eq(doctorsTable.isActive, parsed.data.available));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const doctors = await query.orderBy(doctorsTable.name);
  res.json(doctors.map(formatDoctor));
});

router.post("/doctors", async (req, res): Promise<void> => {
  const parsed = CreateDoctorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [doctor] = await db.insert(doctorsTable).values(parsed.data).returning();
  res.status(201).json(formatDoctor(doctor));
});

router.get("/doctors/:id", async (req, res): Promise<void> => {
  const params = GetDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, params.data.id));
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(formatDoctor(doctor));
});

router.patch("/doctors/:id", async (req, res): Promise<void> => {
  const params = UpdateDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDoctorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [doctor] = await db
    .update(doctorsTable)
    .set(parsed.data)
    .where(eq(doctorsTable.id, params.data.id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(formatDoctor(doctor));
});

router.delete("/doctors/:id", async (req, res): Promise<void> => {
  const params = DeleteDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doctor] = await db
    .delete(doctorsTable)
    .where(eq(doctorsTable.id, params.data.id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
