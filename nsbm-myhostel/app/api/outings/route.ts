import { NextRequest, NextResponse } from "next/server";
import type { OutingRequest } from "@/lib/types";
import { outings } from "@/lib/mockOutings";

// GET all outings (filter by student/parent/warden/security based on role)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    let outingsArray: OutingRequest[] = Object.values(outings);

    // Filter by role and userId
    if (role === "student") {
      outingsArray = outingsArray.filter((o) => o.studentId === userId);
    } else if (role === "parent") {
      outingsArray = outingsArray.filter((o) => o.parentId === userId);
    } else if (role === "warden") {
      // Wardens see all requests with status parent_approved
      outingsArray = outingsArray.filter(
        (o) => o.status === "parent_approved" || o.status === "warden_approved" || o.status === "warden_rejected"
      );
    } else if (role === "security") {
      // Security sees all approved outings
      outingsArray = outingsArray.filter((o) => o.status === "warden_approved");
    }

    if (status) {
      outingsArray = outingsArray.filter((o) => o.status === status);
    }

    return NextResponse.json({ outings: outingsArray }, { status: 200 });
  } catch (error: any) {
    console.error("GET outings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch outings" },
      { status: 500 }
    );
  }
}

// POST new outing request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      studentName,
      parentId,
      reason,
      startDateTime,
      endDateTime,
      destination,
      outingType,
      transportMode,
      tukNearHostel,
      isEmergency,
      emergencyReason,
    } = body;

    // Basic required fields
    if (!studentId || !parentId || !destination) {
      return NextResponse.json(
        { error: "Missing required fields (studentId, parentId, destination)" },
        { status: 400 }
      );
    }

    const id = `outing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const outingData: OutingRequest = {
      id,
      studentId,
      studentName,
      parentId,
      reason,
      startDateTime: startDateTime || null,
      endDateTime: endDateTime || null,
      destination,
      outingType: outingType || "home",
      transportMode: transportMode || undefined,
      tukNearHostel: !!tukNearHostel,
      isEmergency: !!isEmergency,
      emergencyReason: emergencyReason || undefined,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    outings[id] = outingData;

    return NextResponse.json(
      { message: "Outing request created", id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST outing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create outing request" },
      { status: 500 }
    );
  }
}

// PUT to update outing status (parent approval, warden approval, etc.)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outingId = searchParams.get("id");
    const body = await request.json();
    const { status, approvalReason, role } = body;

    if (!outingId || !status) {
      return NextResponse.json(
        { error: "Missing outing ID or status" },
        { status: 400 }
      );
    }

    const outing = outings[outingId];
    if (!outing) {
      return NextResponse.json(
        { error: "Outing not found" },
        { status: 404 }
      );
    }

    // Prevent warden from approving a request that hasn't been parent-approved
    if (role === "warden" && status === "warden_approved" && outing.status !== "parent_approved") {
      return NextResponse.json({ error: "Cannot approve outing before parent approval" }, { status: 400 });
    }

    const updateData: any = { status, updatedAt: Date.now() };

    if (role === "parent") {
      if (status === "parent_approved") {
        updateData.parentApprovedAt = Date.now();
        updateData.parentApprovalReason = approvalReason || "Approved";
      } else if (status === "parent_rejected") {
        updateData.parentApprovedAt = Date.now();
        updateData.parentApprovalReason = approvalReason || "Rejected";
      }
    } else if (role === "warden") {
      if (status === "warden_approved") {
        updateData.wardenApprovedAt = Date.now();
        updateData.wardenApprovalReason = approvalReason || "Approved";
      } else if (status === "warden_rejected") {
        updateData.wardenApprovedAt = Date.now();
        updateData.wardenApprovalReason = approvalReason || "Rejected";
      }
    }

    outings[outingId] = { ...outing, ...updateData };

    return NextResponse.json(
      { message: "Outing status updated" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT outing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update outing" },
      { status: 500 }
    );
  }
}
