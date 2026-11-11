import { z } from "zod";

export const HealthCheckQuerySchema = z.object({
  verbose: z.enum(["true", "false"]).optional()
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export const UserRegistrationSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain alphanumeric characters and underscores"
  }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
});

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

