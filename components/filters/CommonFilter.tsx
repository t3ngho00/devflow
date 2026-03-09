"use client";
import { useQueryState } from "nuqs";

import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Filter {
  name: string;
  value: string;
}

interface Props {
  filters: Filter[];
  otherClasses?: string;
  containerClasses?: string;
}

const CommonFilter = ({
  filters,
  otherClasses = "",
  containerClasses = "",
}: Props) => {
  const [activeSort, setActiveSort] = useQueryState("sort", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <div className={cn("relative", containerClasses)}>
      <Select onValueChange={setActiveSort} defaultValue={activeSort}>
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border background-light800_dark300 text-dark500_light700 w-full border px-5 py-2.5 sm:w-fit",
            otherClasses
          )}
          aria-label="Filter options"
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a filter" />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;
