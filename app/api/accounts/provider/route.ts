import { NextResponse } from "next/server";
import z from "zod";

import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { ValidationError, NotFoundError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { providerAccountId } = await request.json();

  try {
    await dbConnect();
    const validatedData = AccountSchema.partial().safeParse({
      providerAccountId,
    });

    if (!validatedData.success)
      throw new ValidationError(
        z.treeifyError(validatedData.error) as unknown as Record<
          string,
          string[]
        >
      );

    const account = await Account.findOne({ providerAccountId });
    if (!account) throw new NotFoundError("account");

    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
