import { NextRequest, NextResponse } from "next/server";
import { configured, supabase } from "@/lib/supabase";
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (configured && code) {
    const db = await supabase();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) {
      const next =
        req.nextUrl.searchParams.get("next") === "/reset-password"
          ? "/reset-password"
          : "/dashboard";
      return NextResponse.redirect(new URL(next, req.url));
    }
  }
  return NextResponse.redirect(new URL("/login?error=confirmation", req.url));
}
