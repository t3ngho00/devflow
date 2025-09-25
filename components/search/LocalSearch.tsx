"use client";
import Image from "next/image";
import { useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";

import { Input } from "../ui/input";

interface LocalSearchProps {
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

// Custom useDebounce hook
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const LocalSearch = ({
  imgSrc,
  placeholder,
  otherClasses,
}: LocalSearchProps) => {
  const [searchQuery, setSearchQuery] = useQueryState("query", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  const [inputValue, setInputValue] = useState(searchQuery || "");
  const debouncedValue = useDebounce(inputValue, 300);

  // Update URL when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedValue || null);
  }, [debouncedValue, setSearchQuery]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="search"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        value={inputValue}
        className="dark:bg-background-light800_darkgradient paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearch;
