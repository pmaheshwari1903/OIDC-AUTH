import { z } from 'zod';

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must contain at least 6 characters")
});

export const signUpSchema = z.object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(50),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(50),
    profileImageUrl: z.string().url("Invalid URL").optional(),
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(6, "Password must contain at least 6 characters").max(20)
});
