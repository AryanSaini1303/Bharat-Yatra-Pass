// app/api/generateToken/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, sub } = await req.json();

  const jwtToken = jwt.sign(
    {
      sub,
      email,
      aud: "authenticated",
      role: "authenticated",
    },
    process.env.SUPABASE_JWT_SECRET,
    { expiresIn: "1h" }
  );

  return NextResponse.json({ token: jwtToken });
}
