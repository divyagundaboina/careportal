import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  bio: text("bio"),
  availableDays: text("available_days").notNull().default("Monday,Tuesday,Wednesday,Thursday,Friday"),
  availableTimeStart: text("available_time_start").notNull().default("09:00"),
  availableTimeEnd: text("available_time_end").notNull().default("17:00"),
  consultationFee: real("consultation_fee"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true, createdAt: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;
