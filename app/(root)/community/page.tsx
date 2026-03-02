import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import { EMPTY_USERS } from "@/constants/states";
import { getUsers } from "@/lib/actions/user.action";

export default async function CommunityPage({ searchParams }: RouteParams) {
  const { page, pageSize, query, sort } = await searchParams;
  const { success, data, error } = await getUsers({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    sort,
  });

  const { users } = data || {};
  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <div className="mt-11">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="There are some great devs here!"
          otherClasses="flex-1"
        />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={users}
        empty={EMPTY_USERS}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user) => (
              <p key={user._id}>{user.email}</p>
            ))}
          </div>
        )}
      />
    </div>
  );
}
