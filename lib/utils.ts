import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getDevIcon } from "@/constants/techMap";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTechIcon(techName: string): string {
  return getDevIcon(techName);
}
