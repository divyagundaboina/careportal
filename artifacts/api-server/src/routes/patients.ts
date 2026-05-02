import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, patientsTable } from "@workspace/db";
import {
  CreatePatientBody,
  UpdatePatientBody,
  UpdatePatientParams,
  GetPatientParams,
  DeletePatientParams,
  ListPatientsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatPatient(p: typeof patientsTable.$inferSelect) {
  return {
    id: p.id,
    userId: p.userId,
    name: p.name,
    email: p.email,
    phone: p.phone,
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    address: p.address,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies,
    medicalHistory: p.medicalHistory,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/patients", async (req, res): Promise<void> => {
  const parsed = ListPatientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(patientsTable).$dynamic();

  if (parsed.data.search) {
    query = query.where(ilike(patientsTable.name, `%${parsed.data.search}%`));
  }

  const patients = await query.orderBy(patientsTable.name);
  res.json(patients.map(formatPatient));
});

router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [patient] = await db.insert(patientsTable).values(parsed.data).returning();
  res.status(201).json(formatPatient(patient));
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json(formatPatient(patient));
});

router.patch("/patients/:id", async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [patient] = await db
    .update(patientsTable)
    .set(parsed.data)
    .where(eq(patientsTable.id, params.data.id))
    .returning();

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json(formatPatient(patient));
});

router.delete("/patients/:id", async (req, res): Promise<void> => {
  const params = DeletePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db
    .delete(patientsTable)
    .where(eq(patientsTable.id, params.data.id))
    .returning();

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
