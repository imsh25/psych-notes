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

  // ✅ Only allow your email
  if (user.email !== "shivampandey2522005@gmail.com") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId, userId, noteId } = await req.json();

  // Insert purchase
  const { error: insertError } = await supabase
  .from("purchases")
  .insert({
    user_id: userId,
    note_id: noteId,
  });

if (insertError) {
  console.error("Insert error:", insertError);
  return NextResponse.json(
    { error: insertError.message },
    { status: 500 }
  );
}

  // Delete request
  await supabase
    .from("payment_requests")
    .delete()
    .eq("id", requestId);

  return NextResponse.json({ success: true });
}