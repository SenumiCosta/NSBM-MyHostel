import type { OutingRequest } from "@/lib/types";

// Shared in-memory outing store for development
export const outings: Record<string, OutingRequest> = {};

// Helper to count outings active on a given day (by startDateTime)
export function outingsForDay(date: Date) {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;
  return Object.values(outings).filter((o) => {
    if (!o.startDateTime) return false;
    return o.startDateTime >= dayStart && o.startDateTime <= dayEnd;
  });
}

// Seed a sample parent-approved outing so wardens see data after login
if (Object.keys(outings).length === 0) {
  const sampleId = `outing_sample_${Date.now()}`;
  const now = Date.now();
  const todayNoon = new Date();
  todayNoon.setHours(12, 0, 0, 0);

  outings[sampleId] = {
    id: sampleId,
    studentId: "user_student",
    studentName: "Student Example",
    parentId: "user_parent",
    reason: "Visit home (seed)",
    startDateTime: todayNoon.getTime(),
    endDateTime: null,
    destination: "Home Town",
    outingType: "home",
    transportMode: "Bus",
    tukNearHostel: false,
    isEmergency: false,
    emergencyReason: undefined,
    status: "parent_approved",
    parentApprovedAt: now,
    parentApprovalReason: "Seeded approval",
    createdAt: now,
    updatedAt: now,
  };
}
