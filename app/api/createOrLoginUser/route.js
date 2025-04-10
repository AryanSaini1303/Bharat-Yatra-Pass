// app/api/createOrLoginUser/route.js

import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { email, sub, name } = await req.json();

  // Try to create user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    user_metadata: {
      full_name: name,
      last_signin: new Date().toISOString(),
    },
    email,
    email_confirm: true,
    id: sub,
  });

  // If user already exists, do NOT create or return token
  if (error) {
    if (error.message.includes("A user with this email address has already been registered")) {
      console.log("User already exists");
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    } else {
      console.log(error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const user = data.user;

  if (!user) {
    return NextResponse.json(
      { error: "User creation failed." },
      { status: 500 }
    );
  }

  // Generate Supabase-compatible JWT
  const jwtToken = jwt.sign(
    {
      sub: sub,
      email: user.email,
      aud: "authenticated",
      role: "authenticated",
    },
    process.env.SUPABASE_JWT_SECRET,
    { expiresIn: "1h" }
  );

  return NextResponse.json({ token: jwtToken }, { status: 200 });
}
