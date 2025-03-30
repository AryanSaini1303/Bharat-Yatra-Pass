import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json(); // Parse JSON body
    const {
      name,
      city,
      address,
      description,
      image,
      popularity,
      ticket_price,
      opening_time,
      closing_time,
    } = body;

    const formattedTicketPrice = {
      senior: Number(ticket_price[0]), // Convert string to number
      child: Number(ticket_price[1]),
      adult: Number(ticket_price[2]),
      foreigner: Number(ticket_price[3]),
    };

    const { data, error } = await supabaseAdmin
      .from("monuments")
      .insert([
        {
          name,
          city,
          address,
          description,
          image_url: image, // Ensure this is a public URL
          popularity,
          ticket_price: formattedTicketPrice, // Store as jsonb
          opening_time,
          closing_time,
        },
      ])
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Monument added successfully", data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error adding monument:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
