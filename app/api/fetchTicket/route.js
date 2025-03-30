import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get("tickedId");
//   console.log(ticketId);
  if (!ticketId) {
    return NextResponse.json(
      { error: "ticketId is required" },
      { status: 400 }
    );
  }
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("ticketId", ticketId);
    if (error) {
        console.log(error.message);;
    }
    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
