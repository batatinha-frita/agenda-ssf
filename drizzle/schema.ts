import { pgTable, text, timestamp, uuid, foreignKey, unique, integer, time, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const appointmentStatus = pgEnum("appointment_status", ['confirmed', 'pending', 'cancelled', 'completed'])
export const patientSex = pgEnum("patient_sex", ['male', 'female'])
export const paymentStatus = pgEnum("payment_status", ['paid', 'pending', 'overdue'])


export const verifications = pgTable("verifications", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const clinics = pgTable("clinics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const patients = pgTable("patients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phoneNumber: text("phone_number").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	sex: patientSex().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	cpf: text(),
	birthDate: timestamp("birth_date", { mode: 'string' }),
	emergencyContact: text("emergency_contact"),
	emergencyPhone: text("emergency_phone"),
	observations: text(),
	cep: text(),
	logradouro: text(),
	numero: text(),
	complemento: text(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "patients_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	unique("patients_cpf_unique").on(table.cpf),
]);

export const doctors = pgTable("doctors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	name: text().notNull(),
	avatarImageUrl: text("avatar_image_url"),
	availableFromWeekDay: integer("available_from_week_day").notNull(),
	availableToWeekDay: integer("available_to_week_day").notNull(),
	availableFromTime: time("available_from_time").notNull(),
	availableToTime: time("available_to_time").notNull(),
	specialty: text().notNull(),
	appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "doctors_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_token_unique").on(table.token),
]);

export const usersToClinics = pgTable("users_to_clinics", {
	userId: text("user_id").notNull(),
	clinicId: uuid("clinic_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "users_to_clinics_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "users_to_clinics_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const appointments = pgTable("appointments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	clinicId: uuid("clinic_id").notNull(),
	patientId: uuid("patient_id").notNull(),
	doctorId: uuid("doctor_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
	paymentStatus: paymentStatus("payment_status").default('pending').notNull(),
	notes: text(),
	appointmentStatus: appointmentStatus("appointment_status").default('confirmed').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "appointments_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "appointments_patient_id_patients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "appointments_doctor_id_doctors_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	plan: text(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const appointmentNotes = pgTable("appointment_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	note: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: text("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "appointment_notes_appointment_id_appointments_id_fk"
		}).onDelete("cascade"),
]);
