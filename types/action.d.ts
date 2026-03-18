interface SignInWithOAuthParams {
  provider: "google" | "github";
  providerAccountId: string;
  user: {
    name: string;
    username: string;
    image: string;
    email: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

interface GetQuestionParams {
  questionId: string;
}

interface GetTagQuestionsParams extends Omit<PaginatedSearchParams, "sort"> {
  tagId: string;
}

interface IncrementViewsParams {
  questionId: string;
}

interface CreateAnswerParams {
  questionId: string;
  content: string;
}

interface GetAnswersParams extends PaginatedSearchParams {
  questionId: string;
}

interface CreateVoteParams {
  targetId: string;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}

interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}

type HasVotedParams = Pick<CreateVoteParams, "targetId" | "targetType">;

interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

interface CollectionBaseParams {
  questionId: string;
}

interface GetUserWithStatsParams {
  userId: string;
}

interface GetUserQuestionsParams
  extends Omit<PaginatedSearchParams, "query" | "sort"> {
  userId: string;
}

interface GetUserAnswersParams extends PaginatedSearchParams {
  userId: string;
}

interface GetUserTagsParams {
  userId: string;
}

interface DeleteQuestionParams {
  questionId: string;
}

interface DeleteAnswerParams {
  answerId: string;
}

interface CreateInteractionParams {
  action:
    | "view"
    | "upvote"
    | "downvote"
    | "removeVote"
    | "bookmark"
    | "post"
    | "edit"
    | "delete"
    | "search";
  targetId: string;
  targetType: "question" | "answer";
  targetAuthorId: string;
  voteType?: "upvote" | "downvote";
}

interface UpdateReputationParams {
  interaction: IInteractionDoc;
  session: mongoose.ClientSession;
  actorId: string;
  targetAuthorId: string;
}
