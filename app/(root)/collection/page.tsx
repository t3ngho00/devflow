import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { CollectionFilters } from "@/constants/filters";
import ROUTES from "@/constants/ROUTES";
import { EMPTY_COLLECTION } from "@/constants/states";
import { getSavedQuestion } from "@/lib/actions/collection.action";

export const metadata: Metadata = {
  title: "Saved Questions",
  description: "Review and manage questions you bookmarked on DevFlow.",
};

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

  const { collection, isNext } = data || {};
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search amazing minds here..."
          otherClasses="flex-1"
        />

        <CommonFilter filters={CollectionFilters} otherClasses="min-h-[56px]" />
      </div>
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
      />{" "}
      <Pagination page={page} isNext={isNext || false} />{" "}
    </>
  );
}
