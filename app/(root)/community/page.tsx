import type { Metadata } from "next";

import UserCard from "@/components/cards/UserCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { UserFilters } from "@/constants/filters";
import { EMPTY_USERS } from "@/constants/states";
import { getUsers } from "@/lib/actions/user.action";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Discover developers in the DevFlow community and explore their profiles.",
};

export default async function CommunityPage({ searchParams }: RouteParams) {
  const { page, pageSize, query, sort } = await searchParams;
  const { success, data, error } = await getUsers({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 2,
    query,
    sort,
  });

  const { users, isNext } = data || {};
  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="There are some great devs here!"
          otherClasses="flex-1"
        />

        <CommonFilter filters={UserFilters} otherClasses="min-h-[56px]" />
      </div>
      <DataRenderer
        success={success}
        error={error}
        data={users}
        empty={EMPTY_USERS}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />{" "}
      <Pagination page={page} isNext={isNext || false} />{" "}
    </div>
  );
}
