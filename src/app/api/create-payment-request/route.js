import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const { noteId } = await req.json();

  // Prevent duplicate requests
  const { data: existing } = await supabase
    .from("payment_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("note_id", noteId)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Already requested" });
  }

  await supabase.from("payment_requests").insert({
    user_id: user.id,
    note_id: noteId,
  });

  return NextResponse.json({ success: true });
}