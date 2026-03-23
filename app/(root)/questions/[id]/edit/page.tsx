import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/ROUTES";
import { getQuestion } from "@/lib/actions/question.action";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const { data: question, success } = await getQuestion({ questionId: id });

  if (!success || !question) {
    return {
      title: "Edit Question",
      description: "Update your question on DevFlow.",
    };
  }

  return {
    title: `Edit: ${question.title}`,
    description: question.content.slice(0, 100),
  };
}

const EditQuestion = async ({ params }: RouteParams) => {
  const { id } = await params;

  if (!id) return notFound();

  const session = await auth();
  if (!session) return redirect(ROUTES.SIGN_IN);

  const { data: question, success } = await getQuestion({ questionId: id });
  if (!success) return notFound();

  if (question?.author._id !== session.user?.id) redirect(ROUTES.QUESTION(id));

  return (
    <>
      <main>
        <QuestionForm question={question} isEdit />
      </main>
    </>
  );
};

export default EditQuestion;
