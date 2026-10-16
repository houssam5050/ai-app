import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const courseFilterSchema = paginationSchema.extend({
  q: z.string().max(200).optional().default(""),
  category: z.string().max(100).optional().default(""),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

export const enrollSchema = z.object({
  courseId: z.string().min(1),
});

export const completeLessonSchema = z.object({
  lessonId: z.string().min(1),
  timeSpentMin: z.coerce.number().int().min(0).max(600).default(5),
});

export const quizSubmitSchema = z.object({
  quizId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionIds: z.array(z.string().min(1)).max(10),
      }),
    )
    .min(1)
    .max(100),
});

export const exerciseSubmitSchema = z.object({
  exerciseId: z.string().min(1),
  code: z.string().min(1).max(50_000),
});

export const signUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const signInSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export const notificationPatchSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  read: z.boolean(),
});
