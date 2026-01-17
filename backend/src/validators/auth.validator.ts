import { z } from 'zod';

// Register validation schema
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  role: z.enum(['CREATOR', 'PROFESSIONAL'], {
    errorMap: () => ({ message: 'Le rôle doit être CREATOR ou PROFESSIONAL' }),
  }),
  // Optional fields for creators
  companyName: z.string().optional(),
  // Optional fields for professionals
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
