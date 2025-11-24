import { NextResponse } from "next/server";
import { users } from "@/lib/mockUsers";
import * as db from "@/lib/dbAdapter";

export async function GET() {
  try {
    const allUsers = Object.values(users);
    const totalStudents = allUsers.filter((u) => u.role === "student").length;

    // Outings that start today and are approved by parent or warden
    const todayOutings = (await db.outingsForDay(new Date())).filter(
      (o: any) => o.status === "parent_approved" || o.status === "warden_approved"
    );

    const uniqueStudentsOut = new Set(todayOutings.map((o) => o.studentId)).size;

    const currentlyAvailable = Math.max(0, totalStudents - uniqueStudentsOut);

    return NextResponse.json(
      {
        totalStudents,
        currentlyOut: uniqueStudentsOut,
        currentlyAvailable,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Warden stats error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
