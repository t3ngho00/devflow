'use client'

import { useEffect } from "react";
import { toast } from "sonner";

import { incrementViews } from "@/lib/actions/question.action";

const Views = ({ questionId }: { questionId: string }) => {
  const handleViews = async () => {
    try {
      await incrementViews({ questionId });
      toast.success("View incremented");
    } catch {
      toast("An error occured");
    }
  };
  useEffect(() => {
    handleViews();
  }, []);
  return null;
};

export default Views;
