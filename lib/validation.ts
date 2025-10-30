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
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." }),
  email: z
    .email("Please provide a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).*$/,
      "Password must contain at least one letter and one number."
    ),
});

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),

  content: z.string().min(1, { message: "Body is required." }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag is required." })
        .max(30, { message: "Tag cannot exceed 30 characters." })
    )
    .min(1, { message: "At least one tag is required." })
    .max(3, { message: "Cannot add more than 3 tags." }),
});

export const UserSchema = z.object({
  name: z.string().min(1, { message: "Name must be atleast 1 character long" }),
  username: z
    .string()
    .min(3, { message: "Username must be 3 characters long" }),
  email: z.email({ message: "Please provide a valid email" }),
  bio: z.string().optional(),
  image: z.url({ message: "Please provide a valid URL." }).optional(),
  location: z.string().optional(),
  portfolio: z.url({ message: "Please provide a valid URL." }).optional(),
  reputation: z.number().optional(),
});

export const AccountSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  image: z.string().url({ message: "Please provide a valid URL." }).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    })
    .optional(),
  provider: z.string().min(1, { message: "Provider is required." }),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
});

export const SignInWithOAuthSchema = z.object({
  provider: z.enum(["google", "github"]),
  providerAccountId: z
    .string()
    .min(1, { message: "The provider account id is required" }),
  user: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    username: z
      .string()
      .min(3, { message: "Username must be atleast 3 characters long" }),
    email: z.email({ message: "Please provide a valid email address" }),
    image: z.url({ message: "Please provide a valid image url" }).optional(),
  }),
});
