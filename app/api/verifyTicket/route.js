import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get("ticketId");
  // console.log(ticketId);
  if (!ticketId) {
    return NextResponse.json(
      { error: "ticketId is required" },
      { status: 400 }
    );
  }
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("monumentName, monumentImage, dateTime, ticketId, status, user_id")
      .eq("ticketId", ticketId);
    if (error) {
      console.log(error.message);
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
