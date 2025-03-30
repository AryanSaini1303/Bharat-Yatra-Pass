import { supabase } from "@/lib/supabaseClient";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  let queryConditions = [
    `monumentName.ilike.%${query}%`,
    `monumentCity.ilike.%${query}%`,
    `ticketId.ilike.%${query}%`,
  ];

  // Check if `query` is a valid UUID before adding the `user_id` filter
  const isUUID = /^[0-9a-fA-F-]{36}$/.test(query); // Regex to check UUID format
  if (isUUID) {
    queryConditions.push(`user_id.eq.${query}`);
  }

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Query parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    let { data, error } = await supabase
      .from("tickets")
      .select("*")
      .or(queryConditions.join(","));

    if (error) {
      console.error("Supabase Error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected Error:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
