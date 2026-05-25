import { z } from 'zod';

export const registerSchema = z.object({
  firstname: z.string().min(2, "First name too short"),
  lastname: z.string().min(2, "Last name too short"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{9}$/, "Phone must be exactly 9 digits"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[0-9]/, "Must contain one number"),
});

