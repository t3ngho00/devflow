import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions/tag.action";

const page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { data, error, success } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
  });

  const { tag, questions, isNext } = data || {};
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1>{tag?.name?.toUpperCase()} related questions</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        ></Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
        />
      </section>
      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) =>
          questions.map((question) => (
            <div
              key={question._id}
              className="mt-10 flex w-full flex-col gap-6"
            >
              <QuestionCard question={question} />
            </div>
          ))
        }
      />{" "}
      <Pagination page={page} isNext={isNext || false} />{" "}
    </>
  );
};

export default page;
