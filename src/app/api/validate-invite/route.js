import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { invite } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("code", invite)
    .eq("is_used", false)
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false });
  }

  // Mark invite as used
  await supabase
    .from("invite_codes")
    .update({ is_used: true })
    .eq("id", data.id);

  return NextResponse.json({ valid: true });
}