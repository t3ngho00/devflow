import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your DevFlow account and join the developer community.",
};

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return children;
}
