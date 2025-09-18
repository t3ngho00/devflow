import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .email("Please provide a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export const SignUpSchema = z.object({
    name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'Name can only contain letters and spaces.',
    }),
    username: z
        .string()
        .min(6, { message: "Username must be at least 3 characters long." })
        .max(30, { message: "Username cannot exceed 30 characters." }),
    email: z
        .email("Please provide a valid email address")
        .min(1, "Email is required"),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .max(100, { message: "Password cannot exceed 100 characters." })
        .regex(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one letter and one number."
        ),
});