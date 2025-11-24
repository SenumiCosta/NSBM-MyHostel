import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/dbAdapter";


// Security scan: verify student returning and mark outing as returned in shared store
export async function POST(request: NextRequest) {
  try {
    const { studentId, securityId, timestamp } = await request.json();

    if (!studentId || !securityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Search for an active approved outing for this student (parent_approved or warden_approved)
    const outings = await db.getOutings({ userId: studentId, role: null });
    const candidate = outings.find((o: any) => o.studentId === studentId && (o.status === "parent_approved" || o.status === "warden_approved"));

    if (!candidate) {
      return NextResponse.json({ error: "No active authorized outing found for this student" }, { status: 404 });
    }

    // Mark as returned in DB
    const updated = await db.updateOuting(candidate.id, {
      status: "returned",
      returned: true as any,
      returnedAt: timestamp || Date.now(),
      returnedVerifiedBy: securityId,
    } as any);

    return NextResponse.json({ message: "Student return recorded", record: updated }, { status: 200 });
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: error.message || "Scan failed" }, { status: 500 });
  }
}
