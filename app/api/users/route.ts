import { NextResponse } from "next/server";
import z from "zod";

import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const validatedData = UserSchema.safeParse(body);

    if (!validatedData.success) {
      throw new ValidationError(
        z.treeifyError(validatedData.error) as unknown as Record<
          string,
          string[]
        >
      );
    }

    const { username, email } = validatedData.data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new Error("A user with this email already exists");

    const existingUser = await User.findOne({ username });
    if (existingUser) throw new Error("This username has been taken");

    const newUser = await User.create(validatedData.data);
    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
