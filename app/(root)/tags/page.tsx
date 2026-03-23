import type { Metadata } from "next";

import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { TagFilters } from "@/constants/filters";
import { EMPTY_TAGS } from "@/constants/states";
import { getTags } from "@/lib/actions/tag.action";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse topics and technologies discussed on DevFlow.",
};

export default async function TagsPage({ searchParams }: RouteParams) {
  const { page, pageSize, query, sort } = await searchParams;
  const { data, success, error } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    sort,
  });

  const { tags, isNext } = data || {};
  console.log("Tag", tags);
  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search tags..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={TagFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </section>
      <DataRenderer
        success={success}
        error={error}
        data={tags}
        empty={EMPTY_TAGS}
        render={(tags) => (
          <div className="mt-10 flex w-full flex-wrap gap-4">
            {tags.map((tag) => (
              <TagCard key={tag._id} {...tag} />
            ))}
          </div>
        )}
      />
      <Pagination page={page} isNext={isNext || false} />
    </>
  );
}
