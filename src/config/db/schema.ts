import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const authProviderEnum = pgEnum("auth_provider", [
  "local",
  "google",
  "facebook",
]);
export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);
export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

// Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  name: text("name").notNull(),
  avatar: text("avatar"),
  authProvider: authProviderEnum("auth_provider").default("local").notNull(),
  providerId: text("provider_id"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events Table
export const events = pgTable("events", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  organizerId: uuid("organizer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  capacity: integer("capacity").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  imageUrl: text("image_url"),
  status: eventStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Registrations Table
export const registrations = pgTable("registrations", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  status: registrationStatusEnum("status").default("pending").notNull(),
  paymentIntentId: text("payment_intent_id"),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comments Table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  registrations: many(registrations),
  comments: many(comments),
  notifications: many(notifications),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  registrations: many(registrations),
  comments: many(comments),
  notifications: many(notifications),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [comments.eventId],
    references: [events.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [notifications.eventId],
    references: [events.id],
  }),
}));
