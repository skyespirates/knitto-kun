import { z } from "zod";

export const userRegistrationSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const itemSchema = z.object({
  name: z.string(),
});

export const transferSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  amount: z.number(),
});

export const newAccountSchema = z.object({
  name: z.string(),
});
