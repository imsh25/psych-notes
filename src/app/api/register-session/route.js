import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No auth" }, { status: 401 });
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

  const { deviceId } = await req.json();

  if (!deviceId) {
    return NextResponse.json({ error: "No device id" }, { status: 400 });
  }

  // Get all sessions
  const { data: sessions } = await supabase
    .from("active_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // If already exists → do nothing
  const exists = sessions?.find(
    (s) => s.device_id === deviceId
  );

  if (exists) {
    return NextResponse.json({ success: true });
  }

  // If 2 devices → delete oldest
  if (sessions && sessions.length >= 2) {
    await supabase
      .from("active_sessions")
      .delete()
      .eq("id", sessions[0].id);
  }

  // Insert new
  await supabase.from("active_sessions").insert({
    user_id: user.id,
    device_id: deviceId,
  });

  return NextResponse.json({ success: true });
}