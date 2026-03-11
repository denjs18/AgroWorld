import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Nouveau contact:", { ...body, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
