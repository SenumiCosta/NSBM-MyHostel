import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";
import { users } from "@/lib/mockUsers";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use in-memory users (DB removed)
    if (Object.values(users).some((u) => u.email === email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    users[uid] = {
      uid,
      email,
      name,
      role: role as UserRole,
      password: password, // In production, hash this!
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return NextResponse.json({ message: "User created (mock)", uid, email, name, role }, { status: 201 });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 400 }
    );
  }
}
