import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const formData = await req.formData();
  const image = formData.get("image");
  //   console.log(image);
  if (!image) {
    // return res.status(400).json({ error: "No image file provided" });
    return new Response(JSON.stringify({ error: "No image file provided" }), {
      status: "500",
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const fileName = `${Date.now()}-${image.name}`;
    const { data, error } = await supabaseAdmin.storage
      .from("monuments")
      .upload(fileName, image, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Image upload failed:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data:imageData } = supabaseAdmin.storage
      .from("monuments")
      .getPublicUrl(fileName);

    const imageUrl = imageData.publicUrl; // ✅ This correctly extracts the URL

    console.log("Image URL:", imageUrl);
    return new Response(JSON.stringify({ imageData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
