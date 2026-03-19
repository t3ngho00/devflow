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

interface UserIdParams {
  userId: string;
}

interface QuestionIdParams {
  questionId: string;
}

interface AnswerIdParams {
  answerId: string;
}

interface TagIdParams {
  tagId: string;
}

interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

interface EditQuestionParams extends CreateQuestionParams, QuestionIdParams {}

type GetQuestionParams = QuestionIdParams;

interface GetTagQuestionsParams
  extends Omit<PaginatedSearchParams, "sort">,
    TagIdParams {}

type IncrementViewsParams = QuestionIdParams;

interface CreateAnswerParams extends QuestionIdParams {
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

type CollectionBaseParams = QuestionIdParams;

type GetUserParams = UserIdParams;

interface GetUserQuestionsParams
  extends Omit<PaginatedSearchParams, "query" | "sort">,
    UserIdParams {}

interface GetUserAnswersParams extends PaginatedSearchParams, UserIdParams {}

type GetUserTagsParams = UserIdParams;

type DeleteQuestionParams = QuestionIdParams;

type DeleteAnswerParams = AnswerIdParams;

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

type GetUserStatsParams = UserIdParams;