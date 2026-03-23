import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your DevFlow account.",
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
