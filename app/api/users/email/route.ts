import { NextResponse } from "next/server";
import z from "zod";

import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError, NotFoundError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    await dbConnect();
    const validatedData = UserSchema.partial().safeParse({ email });

    if (!validatedData.success)
      throw new ValidationError(
        z.treeifyError(validatedData.error) as unknown as Record<
          string,
          string[]
        >
      );

    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("User");

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
