import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Post schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  slug: text("slug").notNull().unique(),
  featuredImage: text("featured_image"),
  status: text("status").notNull().default("draft"),
  visibility: text("visibility").notNull().default("public"),
  authorId: integer("author_id").notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Tag schema
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

// PostCategory schema (Many-to-many relationship)
export const postCategories = pgTable("post_categories", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  categoryId: integer("category_id").notNull(),
});

export const insertPostCategorySchema = createInsertSchema(postCategories).omit({
  id: true,
});

// PostTag schema (Many-to-many relationship)
export const postTags = pgTable("post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

export const insertPostTagSchema = createInsertSchema(postTags).omit({
  id: true,
});

// Comment schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  email: text("email").notNull(),
  postId: integer("post_id").notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  approved: true,
  createdAt: true,
});

// Advert schema
export const adverts = pgTable("adverts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  code: text("code").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  position: text("position").notNull(),
});

export const insertAdvertSchema = createInsertSchema(adverts).omit({
  id: true,
});

// Theme schema
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  previewImage: text("preview_image"),
  isActive: boolean("is_active").default(false).notNull(),
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  isActive: true,
});

// Stats schema
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  totalViews: integer("total_views").default(0).notNull(),
  totalAdRevenue: integer("total_ad_revenue").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type PostCategory = typeof postCategories.$inferSelect;
export type InsertPostCategory = z.infer<typeof insertPostCategorySchema>;

export type PostTag = typeof postTags.$inferSelect;
export type InsertPostTag = z.infer<typeof insertPostTagSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Advert = typeof adverts.$inferSelect;
export type InsertAdvert = z.infer<typeof insertAdvertSchema>;

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;

export type Stats = typeof stats.$inferSelect;
