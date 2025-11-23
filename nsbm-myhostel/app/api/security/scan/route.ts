import { NextRequest, NextResponse } from "next/server";
import { outings } from "@/lib/mockOutings";

// Security scan: verify student returning and mark outing as returned in shared store
export async function POST(request: NextRequest) {
  try {
    const { studentId, securityId, timestamp } = await request.json();

    if (!studentId || !securityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find an active outing for this student (today) that is parent_approved or warden_approved
    const candidate = Object.values(outings).find((o: any) => {
      return (
        o.studentId === studentId &&
        (o.status === "parent_approved" || o.status === "warden_approved")
      );
    });

    if (!candidate) {
      return NextResponse.json({ error: "No active authorized outing found for this student" }, { status: 404 });
    }

    // Mark as returned
    candidate.status = "returned";
    candidate.returnedAt = timestamp || Date.now();
    candidate.returnedVerifiedBy = securityId;
    candidate.updatedAt = Date.now();

    return NextResponse.json({ message: "Student return recorded", record: candidate }, { status: 200 });
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: error.message || "Scan failed" }, { status: 500 });
  }
}
