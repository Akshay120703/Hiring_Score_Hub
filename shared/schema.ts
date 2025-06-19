import { pgTable, text, serial, integer, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rubrics = pgTable("rubrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categories: json("categories").$type<RubricCategory[]>().notNull(),
  maxScore: integer("max_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  position: text("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  rubricId: integer("rubric_id").notNull(),
  scores: json("scores").$type<Record<string, number>>().notNull(),
  overallScore: decimal("overall_score", { precision: 4, scale: 2 }).notNull(),
  notes: text("notes"),
  evaluatorName: text("evaluator_name").notNull(),
  status: text("status").notNull().default("draft"), // draft, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types for rubric structure
export interface RubricCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
}

// Insert schemas
export const insertRubricSchema = createInsertSchema(rubrics).omit({
  id: true,
  createdAt: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertRubric = z.infer<typeof insertRubricSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;

export type Rubric = typeof rubrics.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Evaluation = typeof evaluations.$inferSelect;

// Extended types for API responses
export interface EvaluationWithDetails extends Evaluation {
  candidate: Candidate;
  rubric: Rubric;
}

export interface CandidateWithEvaluations extends Candidate {
  evaluations: EvaluationWithDetails[];
  averageScore?: number;
}

export interface DashboardStats {
  activeAssessments: number;
  candidatesEvaluated: number;
  averageScore: number;
  passRate: number;
}
