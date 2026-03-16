import { formatDistance } from "date-fns";
import Link from "next/link";
import { Suspense } from "react";

import ROUTES from "@/constants/ROUTES";
import { hasVoted } from "@/lib/actions/vote.action";
import { cn } from "@/lib/utils";

import Preview from "../editor/Preview";
import UserAvatar from "../UserAvatar";
import Votes from "../votes/Votes";

interface Props extends Omit<Answer, "question"> {
  question?: string;
  containerClasses?: string;
  showReadMore?: boolean;
}

const AnswerCard = ({
  _id,
  author,
  content,
  createdAt,
  upvotes,
  downvotes,
  question,
  containerClasses,
  showReadMore = false,
}: Props) => {
  const answerId = String(_id);
  const hasVotedPromise = hasVoted({
    targetId: answerId,
    targetType: "answer",
  });
  return (
    <article className={cn("light-border border-b py-10", containerClasses)}>
      <span id={`answer-${answerId}`} className="hash-span" />

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author._id}
            name={author.name}
            imageUrl={author.image}
            className="size-5 rounded-full object-cover max-sm:mt-2"
          />

          <Link
            href={ROUTES.PROFILE(author._id)}
            className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center"
          >
            <p className="body-semibold text-dark300_light700">
              {author.name ?? "Anonymous"}
            </p>

            <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered {formatDistance(new Date(), createdAt)} ago
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          <Suspense>
            <Votes
              upvotes={upvotes}
              downvotes={downvotes}
              hasVotedPromise={hasVotedPromise}
              targetId={answerId}
              targetType="answer"
            />
          </Suspense>
        </div>
      </div>

      <Preview content={content} />
      {showReadMore && question && (
        <Link
          href={`/questions/${question}#answer-${answerId}`}
          className="body-semibold relative z-10 font-space-grotesk text-primary-500"
        >
          <p className="mt-1">Read more...</p>
        </Link>
      )}
    </article>
  );
};

export default AnswerCard;
