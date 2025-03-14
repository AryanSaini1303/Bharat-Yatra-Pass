import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const user_id = searchParams.get("user_id");
    console.log(status);
    console.log(user_id);
  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("monumentName, monumentImage, dateTime, ticketId")
      .eq("status", status)
      .eq("user_id", user_id);
    if (error) {
      console.log(error.message);
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
