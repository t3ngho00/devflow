import { getTags } from "@/lib/actions/tag.action";

export default async function TagsPage() {
  const {data} = await getTags({
    page: 1,
    pageSize: 10,
    // query: "test"
  });

  const {tags} = data || {};
  console.log("Tag", tags);
  return <div>Tags Page</div>;
}
