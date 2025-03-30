import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || false;
  const detailed = searchParams.get("detailed") || false;
  const id = searchParams.get("id") || false;

  if (!city && !detailed) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  try {
    if (!detailed && city) {
      const { data, error } = await supabase
        .from("monuments")
        .select("image_url, name, city, id")
        .ilike("city", `%${city}%`);
      if (error) {
        throw error;
      }
      return NextResponse.json(data, { status: 200 });
    } else {
      const { data, error } = await supabase
        .from("monuments")
        .select("*")
        .eq("id", id);
      if (error) {
        throw error;
      }
      return NextResponse.json(data, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// This is the new way of writing api in next.js now, we now store the api folder in the "app" directory and in the "app" directory we make folder of api's name i.e. fetchMonuments and then we make "route.js" file where we write the actual api code
// We don't use "req, res" now instead we use "NextResponse" to send responses and "URL" to get queries i.e. "city"
