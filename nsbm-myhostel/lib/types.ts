// User role types
export type UserRole = "student" | "parent" | "warden" | "security";

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  hostelBlock?: string; // For students
  childrenIds?: string[]; // For parents
  createdAt: number;
  updatedAt: number;
}

// Outing Request interface
export interface OutingRequest {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  wardenId?: string;
  reason: string;
  startDateTime?: number | null; // Unix timestamp
  endDateTime?: number | null; // Unix timestamp
  destination: string;
  outingType?: "home" | "day" | string;
  transportMode?: string;
  tukNearHostel?: boolean;
  isEmergency?: boolean;
  emergencyReason?: string;
  status: "pending" | "parent_approved" | "parent_rejected" | "warden_approved" | "warden_rejected" | "returned";
  parentApprovedAt?: number;
  parentApprovalReason?: string;
  wardenApprovedAt?: number;
  wardenApprovalReason?: string;
  returnedAt?: number;
  returnedVerifiedBy?: string;
  createdAt: number;
  updatedAt: number;
}

// Outing Record (for completed outings)
export interface OutingRecord {
  id: string;
  requestId: string;
  studentId: string;
  studentName: string;
  exitTime: number;
  entryTime: number;
  destination: string;
  verifiedBySecurityId?: string;
  createdAt: number;
}

// Anomaly detection result
export interface AnomalyResult {
  studentId: string;
  studentName: string;
  anomalyScore: number; // 0-1, higher = more irregular
  irregularityReason: string; // e.g., "Frequent late-night outings"
  flaggedAt: number;
}
