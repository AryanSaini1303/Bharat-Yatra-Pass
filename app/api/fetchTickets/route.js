import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const user_id = searchParams.get("user_id");
  const verifierId = searchParams.get("id");
  const verified = searchParams.get("verified");
  
  // console.log("verifierId:", verifierId);
  // console.log("verified:", verified);

  const isVerified = verified === "true"; // Convert verified to boolean

  try {
    let query = supabase.from("tickets").select("monumentName, monumentImage, dateTime, ticketId");

    if (!isVerified) {
      query = query.eq("status", status).eq("user_id", user_id);
    } else {
      if (!verifierId) {
        return NextResponse.json({ error: "verifierId is required" }, { status: 400 });
      }
      console.log("Fetching verified tickets...");
      query = query.eq("verifierId", verifierId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Unexpected Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
