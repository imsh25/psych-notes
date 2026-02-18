import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ Get logged in user from token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 401 }
      );
    }

    const { noteId } = await req.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID required" },
        { status: 400 }
      );
    }

    // ✅ Check purchase
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("note_id", noteId)
      .eq("user_id", user.id)
      .single();

    if (!purchase) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
// ✅ Validate device session
const deviceId = req.headers.get("x-device-id");

if (!deviceId) {
  return NextResponse.json(
    { error: "Device missing" },
    { status: 403 }
  );
}

const { data: deviceSession } = await supabase
  .from("active_sessions")
  .select("id")
  .eq("user_id", user.id)
  .eq("device_id", deviceId)
  .single();

if (!deviceSession) {
  return NextResponse.json(
    { error: "Session expired. Please login again." },
    { status: 403 }
  );
}
    // ✅ Get file path
    const { data: note } = await supabase
      .from("notes")
      .select("file_path")
      .eq("id", noteId)
      .single();

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // ✅ Download file from private storage
    const { data: fileData, error } =
      await supabase.storage
        .from("private-notes")
        .download(note.file_path);

    if (error || !fileData) {
      return NextResponse.json(
        { error: "File error" },
        { status: 400 }
      );
    }

    return new Response(fileData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
      },
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}