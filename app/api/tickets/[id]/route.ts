import { NextResponse } from "next/server";

import tickets from "@/app/database";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) return NextResponse.json({ error: "Ticket id is required" });

  const parseId = Number(id);
  if (Number.isNaN(parseId))
    return NextResponse.json({ error: "Ticket id is not a number" });

  const ticket = tickets.find((ticket) => ticket.id === parseId);
  if (!ticket) return NextResponse.json({ error: "Ticket not found" });

  return NextResponse.json(ticket);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, type, status } = await request.json();

  if (!id) return NextResponse.json({ error: "Ticket id is required" });

  const parseId = Number(id);
  if (Number.isNaN(parseId))
    return NextResponse.json({ error: "Ticket id is not a number" });

  const ticket = tickets.find((ticket) => ticket.id === parseId);
  if (!ticket) return NextResponse.json({ error: "Ticket not found" });

  if (name) ticket.name = name;
  if (type) ticket.type = type;
  if (status) ticket.status = status;

  return NextResponse.json(ticket);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) return NextResponse.json({ error: "Ticket id is required" });

  const parseId = Number(id);
  if (Number.isNaN(parseId))
    return NextResponse.json({ error: "Ticket id is not a number" });

  const ticket = tickets.find((ticket) => ticket.id === parseId);
  if (!ticket) return NextResponse.json({ error: "Ticket not found" });

  tickets.splice(tickets.indexOf(ticket), 1);

  return NextResponse.json(tickets);
}
