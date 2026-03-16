import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getDevIcon } from "@/constants/techMap";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isObjectId = (
  value: unknown
): value is { _bsontype: "ObjectId"; toHexString: () => string } => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as {
    _bsontype?: unknown;
    toHexString?: unknown;
  };

  return (
    candidate._bsontype === "ObjectId" &&
    typeof candidate.toHexString === "function"
  );
};

const normalizeForSerialization = (value: unknown): unknown => {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (isObjectId(value)) {
    return value.toHexString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeForSerialization(entry));
  }

  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries()).map(([key, entry]) => [
        String(key),
        normalizeForSerialization(entry),
      ])
    );
  }

  if (value instanceof Set) {
    return Array.from(value).map((entry) => normalizeForSerialization(entry));
  }

  if (typeof (value as { toObject?: () => unknown }).toObject === "function") {
    return normalizeForSerialization(
      (value as { toObject: () => unknown }).toObject()
    );
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        normalizeForSerialization(entry),
      ])
    );
  }

  return String(value);
};

export const toPlainObject = <T>(value: T): T =>
  normalizeForSerialization(value) as T;

export function getTechIcon(techName: string): string {
  return getDevIcon(techName);
}

export const techDescriptionMap: { [key: string]: string } = {
  javascript:
    "JavaScript is a powerful language for building dynamic, interactive, and modern web applications.",
  typescript:
    "TypeScript adds strong typing to JavaScript, making it great for scalable and maintainable applications.",
  react:
    "React is a popular library for building fast and modular user interfaces.",
  nextjs:
    "Next.js is a React framework for server-side rendering and building optimized web applications.",
  nodejs:
    "Node.js enables server-side JavaScript, allowing you to create fast, scalable network applications.",
  python:
    "Python is a versatile language known for readability and a vast ecosystem, often used for data science and automation.",
  java: "Java is an object-oriented language commonly used for enterprise applications and Android development.",
  cplusplus:
    "C++ is a high-performance language suitable for system software, game engines, and complex applications.",
  git: "Git is a version control system that tracks changes in source code during software development.",
  docker:
    "Docker is a container platform that simplifies application deployment and environment management.",
  mongodb:
    "MongoDB is a NoSQL database for handling large volumes of flexible, document-based data.",
  mysql:
    "MySQL is a popular relational database, known for reliability and ease of use.",
  postgresql:
    "PostgreSQL is a robust open-source relational database with advanced features and strong SQL compliance.",
  aws: "AWS is a comprehensive cloud platform offering a wide range of services for deployment, storage, and more.",
};

export const getTechDescription = (techName: string) => {
  const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();
  return techDescriptionMap[normalizedTechName]
    ? techDescriptionMap[normalizedTechName]
    : `${techName} is a technology or tool widely used in web development, providing valuable features and capabilities.`;
};

export const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toString();
  }
};
