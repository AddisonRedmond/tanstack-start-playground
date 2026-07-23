import { relations } from "drizzle-orm";
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

export const users = pgTable("users", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text().notNull(),
  content: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  userId: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  userId: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  userId: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
