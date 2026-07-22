import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial().primaryKey(),
  title: text().notNull(),
  completed: boolean().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profileData = pgTable("profile_data", {
  likes: integer().default(0),
  friends: integer().default(0),
  posts: integer().default(0),
});

export const fakeDoctorData = pgTable("doctor_data", {
  id: serial().primaryKey(),
  name: text().notNull(),
  specialty: text().notNull(),
  location: text().notNull(),
  yearsOfExperience: integer().default(0),
  isAvailable: boolean().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shipmentData = pgTable("shipment_data", {
  id: serial().primaryKey(),
  trackingNumber: text("tracking_number").notNull(),
  carrier: text().notNull(),
  destination: text().notNull(),
  status: text().default("pending"),
  weightKg: integer("weight_kg").default(0),
  isDelivered: boolean("is_delivered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
