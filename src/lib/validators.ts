import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email().min(5).max(254),
    password: z.string().min(8).max(128),
    confirm: z.string().min(8).max(128),
  })
  .refine((d: { password: string; confirm: string }) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().min(5).max(254),
  password: z.string().min(8).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Applications
export const createApplicationSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().min(0).max(500).optional().default(""),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

// Licenses
export const createLicenseSchema = z.object({
  duration: z.string().regex(/^\d+$/, "Duration must be a positive integer in seconds"),
  hwidLimit: z.number().int().min(0).max(5).default(1),
  note: z.string().max(500).optional().default(""),
});

export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
