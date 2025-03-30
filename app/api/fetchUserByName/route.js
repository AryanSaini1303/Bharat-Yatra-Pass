import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Must be kept secret!
);

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  try {
    // Fetch authenticated users from Supabase Auth
    const { data, error } = await supabase.auth.admin.listUsers();
    // console.log(data);

    if (error) {
      console.error("Supabase Auth Error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const filteredUsers = data.users.filter((user) =>
        user.user_metadata.full_name?.toLowerCase().includes(name.toLowerCase())
      );
      return new Response(JSON.stringify(filteredUsers), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    // console.log("Fetched Users:", data.users);
  } catch (error) {
    console.error("Unexpected Error:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
