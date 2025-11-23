import { NextRequest, NextResponse } from "next/server";

// Mock anomaly detection data
const mockAnomalies = [
  {
    studentId: "student_001",
    studentName: "John Doe",
    anomalyScore: 0.78,
    irregularityReason: "Frequent late-night outings (past 22:00)",
    flaggedAt: Date.now(),
  },
  {
    studentId: "student_002",
    studentName: "Jane Smith",
    anomalyScore: 0.65,
    irregularityReason: "Outing frequency increased by 150% this month",
    flaggedAt: Date.now(),
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { anomalies: mockAnomalies },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET anomalies error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch anomalies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentOutingData } = body;

    // Placeholder: Integrate with Python ML model for logistic regression
    // Example: Call Python API or use ml.js library for client-side predictions
    const anomalyScore = Math.random() * 0.5; // Mock score

    return NextResponse.json(
      {
        anomalyScore,
        flagged: anomalyScore > 0.6,
        reason: anomalyScore > 0.6 ? "Irregular pattern detected" : "Normal behavior",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST anomalies error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compute anomalies" },
      { status: 500 }
    );
  }
}
