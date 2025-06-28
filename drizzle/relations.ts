import { relations } from "drizzle-orm/relations";
import { clinics, patients, doctors, users, accounts, sessions, usersToClinics, appointments, appointmentNotes } from "./schema";

export const patientsRelations = relations(patients, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [patients.clinicId],
		references: [clinics.id]
	}),
	appointments: many(appointments),
}));

export const clinicsRelations = relations(clinics, ({many}) => ({
	patients: many(patients),
	doctors: many(doctors),
	usersToClinics: many(usersToClinics),
	appointments: many(appointments),
}));

export const doctorsRelations = relations(doctors, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [doctors.clinicId],
		references: [clinics.id]
	}),
	appointments: many(appointments),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	usersToClinics: many(usersToClinics),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersToClinicsRelations = relations(usersToClinics, ({one}) => ({
	clinic: one(clinics, {
		fields: [usersToClinics.clinicId],
		references: [clinics.id]
	}),
	user: one(users, {
		fields: [usersToClinics.userId],
		references: [users.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [appointments.clinicId],
		references: [clinics.id]
	}),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	doctor: one(doctors, {
		fields: [appointments.doctorId],
		references: [doctors.id]
	}),
	appointmentNotes: many(appointmentNotes),
}));

export const appointmentNotesRelations = relations(appointmentNotes, ({one}) => ({
	appointment: one(appointments, {
		fields: [appointmentNotes.appointmentId],
		references: [appointments.id]
	}),
}));