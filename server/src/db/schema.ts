import { sqliteTable, integer, text, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  displayName: text("display_name").notNull().unique(),
  passcodeHash: text("passcode_hash").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const boards = sqliteTable("boards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const tiers = sqliteTable("tiers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  boardId: integer("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  color: text("color").notNull(),
  position: integer("position").notNull(),
});

export const folders = sqliteTable("folders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parentId: integer("parent_id").references((): AnySQLiteColumn => folders.id, {
    onDelete: "cascade",
  }),
  createdAt: integer("created_at").notNull(),
});

export const images = sqliteTable("images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "set null" }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: integer("created_at").notNull(),
});

export const tierItems = sqliteTable("tier_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  boardId: integer("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  tierId: integer("tier_id")
    .notNull()
    .references(() => tiers.id, { onDelete: "cascade" }),
  imageId: integer("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  placedBy: integer("placed_by").references(() => users.id),
  updatedAt: integer("updated_at").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  boardsCreated: many(boards),
  imagesUploaded: many(images),
  tierItemsPlaced: many(tierItems),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  creator: one(users, { fields: [boards.createdBy], references: [users.id] }),
  tiers: many(tiers),
  tierItems: many(tierItems),
}));

export const tiersRelations = relations(tiers, ({ one, many }) => ({
  board: one(boards, { fields: [tiers.boardId], references: [boards.id] }),
  tierItems: many(tierItems),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, { fields: [folders.parentId], references: [folders.id] }),
  children: many(folders),
  images: many(images),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  folder: one(folders, { fields: [images.folderId], references: [folders.id] }),
  uploader: one(users, { fields: [images.uploadedBy], references: [users.id] }),
  tierItems: many(tierItems),
}));

export const tierItemsRelations = relations(tierItems, ({ one }) => ({
  board: one(boards, { fields: [tierItems.boardId], references: [boards.id] }),
  tier: one(tiers, { fields: [tierItems.tierId], references: [tiers.id] }),
  image: one(images, { fields: [tierItems.imageId], references: [images.id] }),
  placer: one(users, { fields: [tierItems.placedBy], references: [users.id] }),
}));
