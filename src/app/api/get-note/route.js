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

    // ✅ Get user from token (DO NOT trust frontend)
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
        { error: "Missing note ID" },
        { status: 400 }
      );
    }

    console.log("Checking purchase for user:", user.id);
    console.log("Checking note:", noteId);

    // ✅ Check purchase properly
    const { data: purchase, error: purchaseError } =
      await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("note_id", noteId)
        .maybeSingle();

    if (purchaseError || !purchase) {
      console.log("Purchase not found");
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    console.log("Purchase found. Access granted.");

    // ✅ Get note file path
    const { data: note, error: noteError } =
      await supabase
        .from("notes")
        .select("file_path")
        .eq("id", noteId)
        .single();

    if (noteError || !note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 400 }
      );
    }

    // ✅ Download file from storage
    const { data: fileData, error: fileError } =
      await supabase.storage
        .from("private-notes")
        .download(note.file_path);

    if (fileError) {
      return NextResponse.json(
        { error: "File error" },
        { status: 400 }
      );
    }

    return new Response(fileData, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}