import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/ROUTES";
import {
  EMPTY_COLLECTION
} from "@/constants/states";
import { getSavedQuestion } from "@/lib/actions/collection.action";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function Collection({ searchParams }: SearchParams) {
  const { page, pageSize, query, sort } = await searchParams;

  const { success, data, error } = await getSavedQuestion({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    sort: sort || "",
  });

  const loggedInUser = await auth();

  if (!loggedInUser) {
    redirect(ROUTES.SIGN_IN);
  }

  const { collection } = data || {};
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
        />
      </section>
      <HomeFilter />
      <DataRenderer
        success={success}
        error={error}
        data={collection}
        empty={EMPTY_COLLECTION}
        render={(collection) =>
          collection.map((item) => (
            <div key={item._id} className="mt-10 flex w-full flex-col gap-6">
              <QuestionCard question={item.question} />
            </div>
          ))
        }
      />
    </>
  );
}
