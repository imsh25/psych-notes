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

    // 🔐 Replace with your real admin email
    if (user.email !== "shivampandey2522005@gmail.com") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    console.log("Approve body:", body);

    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Missing requestId" },
        { status: 400 }
      );
    }

    // ✅ Get request from DB (do NOT trust frontend data)
    const { data: requestData, error: fetchError } =
      await supabase
        .from("payment_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchError || !requestData) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 400 }
      );
    }

    console.log("Request from DB:", requestData);

    // ✅ Insert purchase
    const { error: insertError } = await supabase
      .from("purchases")
      .insert({
        user_id: requestData.user_id,
        note_id: requestData.note_id,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // ✅ Delete payment request
    await supabase
      .from("payment_requests")
      .delete()
      .eq("id", requestId);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}