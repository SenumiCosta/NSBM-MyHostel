import type { OutingRequest } from "./types";
import { outings as inMemoryOutings, outingsForDay as inMemoryOutingsForDay } from "./mockOutings";

function now() {
  return Date.now();
}

export async function getOutings(options: { userId?: string | null; role?: string | null; status?: string | null }) {
  const { userId, role, status } = options;
  let arr = Object.values(inMemoryOutings) as any[];

  if (status) arr = arr.filter((o) => o.status === status);

  if (role === "student" && userId) {
    arr = arr.filter((o) => o.studentId === userId);
  } else if (role === "parent" && userId) {
    arr = arr.filter((o) => o.parentId === userId);
  } else if (role === "warden") {
    arr = arr.filter((o) => ["parent_approved", "warden_approved", "warden_rejected"].includes(o.status));
  } else if (role === "security") {
    arr = arr.filter((o) => o.status === "warden_approved");
  }

  // sort by createdAt desc
  arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return arr as unknown as OutingRequest[];
}

export async function createOuting(data: Partial<OutingRequest>) {
  const id = `outing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = now();
  const record = {
    id,
    studentId: data.studentId,
    studentName: data.studentName,
    parentId: data.parentId,
    destination: data.destination,
    roomNumber: (data as any).roomNumber || null,
    reason: data.reason || null,
    startDateTime: data.startDateTime ? +new Date(data.startDateTime as any) : null,
    endDateTime: data.endDateTime ? +new Date(data.endDateTime as any) : null,
    outingType: (data.outingType as string) || "home",
    transportMode: data.transportMode || null,
    tukNearHostel: !!(data.tukNearHostel),
    isEmergency: !!(data.isEmergency),
    emergencyReason: data.emergencyReason || null,
    status: (data.status as string) || "pending",
    parentApprovedAt: null,
    parentApprovalReason: null,
    wardenApprovedAt: null,
    wardenApprovalReason: null,
    returned: false,
    returnedAt: null,
    returnedVerifiedBy: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  } as any;

  inMemoryOutings[record.id] = record;
  return record;
}

export async function updateOuting(id: string, update: Partial<OutingRequest> & { role?: string }) {
  const existing = inMemoryOutings[id];
  if (!existing) return null;
  const updated = { ...existing, ...update, updatedAt: now() } as any;
  inMemoryOutings[id] = updated;
  return updated;
}

export async function outingsForDay(date: Date) {
  return inMemoryOutingsForDay(date as any);
}

export async function getOutingById(id: string) {
  return inMemoryOutings[id] ?? null;
}
