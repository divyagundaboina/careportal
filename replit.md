# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Application: CarePortal — Healthcare Patient & Appointment Management System

### Problem Statement
A full-stack healthcare portal for managing patients, doctors, and appointments. Role-based access for patients, doctors, and administrators.

### Features
- **Authentication**: Email/password login and registration. Session stored in localStorage. Role-based routing (patient/doctor/admin).
- **Dashboard**: Live stats (total patients, doctors, appointments), appointment trends chart (7 days), specialty breakdown chart
- **Appointments**: Book new appointments, filter by status/date/doctor, confirm/complete/cancel, add clinical notes, prevent duplicate slot bookings
- **Doctors**: Directory with specialty and availability info, profile view
- **Patients**: Patient records with medical history, blood group, allergies, appointment history
- **Profile**: Current user profile

### Demo Accounts (password: `password123` for all)
- Admin: `admin@healthcare.com`
- Doctor: `dr.smith@healthcare.com`
- Patient: `patient1@example.com`

### Architecture
- `artifacts/health-portal` — React + Vite frontend (wouter routing, Tanstack Query, shadcn/ui, Recharts)
- `artifacts/api-server` — Express 5 REST API backend
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-client-react` — Generated React Query hooks
- `lib/api-zod` — Generated Zod validation schemas
- `lib/db` — Drizzle ORM with PostgreSQL

### DB Schema
- `users` — email, passwordHash, name, role (patient/doctor/admin)
- `doctors` — name, specialty, email, phone, bio, availability, consultationFee, isActive
- `patients` — name, email, phone, dateOfBirth, gender, address, bloodGroup, allergies, medicalHistory
- `appointments` — patientId, doctorId, appointmentDate, appointmentTime, status, reason, notes

### API Routes
- `POST /api/users/login` — Login
- `POST /api/users/register` — Register
- `GET /api/users/me?userId=` — Get current user
- `GET /api/users` — List all users (admin)
- `GET/POST /api/doctors` — List/create doctors
- `GET/PATCH/DELETE /api/doctors/:id` — Doctor CRUD
- `GET/POST /api/patients` — List/create patients
- `GET/PATCH/DELETE /api/patients/:id` — Patient CRUD
- `GET/POST /api/appointments` — List/create appointments (with conflict detection)
- `GET/PATCH/DELETE /api/appointments/:id` — Appointment CRUD
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/dashboard/recent-appointments` — Recent appointments feed
- `GET /api/dashboard/appointment-trends` — 7-day trend data
- `GET /api/dashboard/specialty-breakdown` — Appointments by specialty
