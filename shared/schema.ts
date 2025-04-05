import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fileName: text("file_name").notNull(),
  originalText: text("original_text").notNull(),
  processedText: text("processed_text"),
  originalType: text("original_type").notNull(), // pdf, docx, etc.
  analysisResults: jsonb("analysis_results"),
  createdAt: text("created_at").notNull(),
  formattingOptions: jsonb("formatting_options"), // GOST formatting options
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  processedText: true,
  analysisResults: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// GOST formatting options schema
export const gostFormattingSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number(),
  lineSpacing: z.number(),
  pageMargins: z.object({
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
    left: z.number(),
  }),
  headingStyles: z.object({
    level1: z.object({
      fontSize: z.number(),
      fontWeight: z.string(),
      alignment: z.string(),
      spacing: z.object({
        before: z.number(),
        after: z.number(),
      }),
    }),
    level2: z.object({
      fontSize: z.number(),
      fontWeight: z.string(),
      alignment: z.string(),
      spacing: z.object({
        before: z.number(),
        after: z.number(),
      }),
    }),
    level3: z.object({
      fontSize: z.number(),
      fontWeight: z.string(),
      alignment: z.string(),
      spacing: z.object({
        before: z.number(),
        after: z.number(),
      }),
    }),
  }),
  citationStyle: z.string(),
  tableStyle: z.object({
    borderWidth: z.number(),
    headerBackgroundColor: z.string(),
    cellPadding: z.number(),
  }),
  listStyle: z.object({
    bulletType: z.string(),
    indentation: z.number(),
  }),
});

export type GostFormatting = z.infer<typeof gostFormattingSchema>;

// Типы для анализа текста
export interface AnalysisResult {
  original: string;
  improved: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface DocumentAnalysisResults {
  grammar: AnalysisResult[];
  style: AnalysisResult[];
  structure: AnalysisResult[];
  summary: string;
}

// Типы для форматирования
export interface FormatOptions {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  pageMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  citationStyle: string;
  headingStyles: {
    level1: {
      fontSize: number;
      fontWeight: string;
      alignment: string;
    };
    level2: {
      fontSize: number;
      fontWeight: string;
      alignment: string;
    };
  };
}
