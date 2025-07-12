import { NextRequest, NextResponse } from "next/server";
import type { RandomUserResponse } from "../../../types/globals.type";

export async function GET(req: NextRequest) {
  const res = await fetch("https://randomuser.me/api/?results=5");

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  const data: RandomUserResponse = await res.json();

  return NextResponse.json(data);
}