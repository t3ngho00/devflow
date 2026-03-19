import { z } from "zod";

import { InteractionActionEnums } from "@/database/interaction.model";

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

export const EditQuestionSchema = AskQuestionSchema.extend({
  questionId: z.string().min(1, { message: "Question ID is required" }),
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
  image: z.url({ message: "Please provide a valid URL." }).optional(),
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

export const GetQuestionSchema = z.object({
  questionId: z.string().min(1, { message: "Question ID is required" }),
});

export const PaginatedSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  query: z.string().optional(),
  sort: z.string().optional(),
});

export const GetTagQuestionsSchema = PaginatedSearchParamsSchema.extend({
  tagId: z.string().min(1, { message: "Tag ID is required" }),
});

export const IncrementViewsSchema = z.object({
  questionId: z.string().min(1, { message: "Question ID is required" }),
});

export const AnswerSchema = z.object({
  content: z
    .string()
    .min(100, { message: "Answer should have more than 100 characters" }),
});

export const AnswerServerSchema = AnswerSchema.extend({
  questionId: z.string().min(1, { message: "Question ID is required" }),
});

export const GetAnswersSchema = PaginatedSearchParamsSchema.extend({
  questionId: z.string().min(1, { message: "Question ID is required" }),
});

export const AIAnswerSchema = z.object({
  question: z
    .string()
    .min(4, { message: "Question is required." })
    .max(130, { message: "Question cannot exceed 130 characters." }),
  content: z
    .string()
    .min(100, { message: "Answer has to have more than 100 characters." }),
  userAnswer: z.string().optional(),
});

export const CreateVoteSchema = z.object({
  targetId: z.string().min(1, { message: "Target ID is required." }),
  targetType: z.enum(["question", "answer"], {
    message: "Invalid target type.",
  }),
  voteType: z.enum(["upvote", "downvote"], { message: "Invalid vote type." }),
});

export const UpdateVoteCountSchema = CreateVoteSchema.extend({
  change: z.number().int().min(-1).max(1),
});

export const HasVotedSchema = CreateVoteSchema.pick({
  targetId: true,
  targetType: true,
});

export const CollectionBaseSchema = z.object({
  questionId: z.string().min(1, { message: "Question ID is required" }),
});

export const GetUserWithStatsSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export const GetUserQuestionsSchema = PaginatedSearchParamsSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export const GetUsersAnswersSchema = PaginatedSearchParamsSchema.extend({
  userId: z.string().min(1, { message: "User ID is required." }),
});

export const GetUserTagsSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export const DeleteQuestionSchema = z.object({
  questionId: z.string().min(1, { message: "Question ID is required" }),
});

export const DeleteAnswerSchema = z.object({
  answerId: z.string().min(1, { message: "Answer ID is required" }),
});

export const CreateInteractionSchema = z.object({
  action: z.enum(InteractionActionEnums),
  targetType: z.enum(["question", "answer"]),
  targetId: z.string().min(1, { message: "Target ID is required" }),
  targetAuthorId: z
    .string()
    .min(1, { message: "Target author ID is required" }),
  voteType: z.enum(["upvote", "downvote"]).optional(),
});

export const GetuserStatsSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export const GetRecommendationSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }).optional(),
  query: z.string().optional(),
  skip: z.number().int().min(0, { message: "Skip cannot be negative." }),
  limit: z.number().int().min(1, { message: "Limit must be at least 1." }),
});
