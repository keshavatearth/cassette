import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
});

// Content Table (Movies and TV Shows)
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // "movie" or "tv"
  year: integer("year"),
  posterUrl: text("poster_url"),
  synopsis: text("synopsis"),
  genres: text("genres").array(),
  cast: text("cast").array(),
  runtime: integer("runtime"), // in minutes for movies
  seasons: integer("seasons"), // for tv shows
  episodes: integer("episodes"), // for tv shows
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentSchema = createInsertSchema(content).pick({
  title: true,
  type: true,
  year: true,
  posterUrl: true,
  synopsis: true,
  genres: true,
  cast: true,
  runtime: true,
  seasons: true,
  episodes: true,
});

// User Content Entry (tracks user's relationship with content)
export const userContent = pgTable("user_content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  status: text("status").notNull(), // "watching", "watched", "watchlist"
  rating: integer("rating"), // 1-5 stars
  progress: integer("progress"), // in minutes for movies, current episode for TV
  currentSeason: integer("current_season"), // for TV
  currentEpisode: integer("current_episode"), // for TV
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserContentSchema = createInsertSchema(userContent).pick({
  userId: true,
  contentId: true,
  status: true,
  rating: true,
  progress: true,
  currentSeason: true,
  currentEpisode: true,
});

// Reflections Table (notes)
export const reflections = pgTable("reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  text: text("text").notNull(),
  timestamp: text("timestamp"), // HH:MM:SS or SXXEYY or scene description
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReflectionSchema = createInsertSchema(reflections).pick({
  userId: true,
  contentId: true,
  text: true,
  timestamp: true,
  tags: true,
});

// Notification Table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  contentId: true,
  message: true,
  read: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type UserContent = typeof userContent.$inferSelect;
export type InsertUserContent = z.infer<typeof insertUserContentSchema>;

export type Reflection = typeof reflections.$inferSelect;
export type InsertReflection = z.infer<typeof insertReflectionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
