import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/mockUsers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = Object.values(users).find((u) => u.email === email);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user info and mock token
    const { password: _, ...userProfile } = user;
    const idToken = `token_${user.uid}_${Date.now()}`;

    return NextResponse.json(
      {
        message: "Login successful",
        idToken,
        user: userProfile,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 401 }
    );
  }
}
