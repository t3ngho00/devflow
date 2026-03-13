"use client";
import { useQueryState } from "nuqs";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

interface Props {
  page: number | string | undefined;
  isNext: boolean;
  containerClasses?: string;
}

const Pagination = ({ page, isNext, containerClasses }: Props) => {
  const pageNumber = Number(page) || 1;
  const [, setCurrentPage] = useQueryState("page", {
    defaultValue: "1",
    clearOnDefault: true,
    shallow: false,
  });

  const hasPagination = pageNumber > 1 || isNext;

  if (!hasPagination) return null;

  const handleChangePage = (type: "next" | "prev") => {
    const nextPage = type === "next" ? pageNumber + 1 : pageNumber - 1;
    setCurrentPage(nextPage.toString());
  };

  return (
    <div
      className={cn(
        "mt-5 flex w-full items-center justify-center gap-2",
        containerClasses
      )}
    >
      {pageNumber > 1 && (
        <Button
          onClick={() => handleChangePage("prev")}
          className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        >
          <p className="body-medium text-dark200_light800">Prev</p>
        </Button>
      )}

      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>

      {isNext && (
        <Button
          onClick={() => handleChangePage("next")}
          className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        >
          <p className="body-medium text-dark200_light800">Next</p>
        </Button>
      )}
    </div>
  );
};

export default Pagination;
