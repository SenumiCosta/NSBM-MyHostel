"use client";

import { useState } from "react";

interface OutingRequest {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  startDateTime: number;
  endDateTime: number;
  destination: string;
  status: string;
}

export default function ParentPage() {
  const [studentId, setStudentId] = useState("");
  const [request, setRequest] = useState<OutingRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState("");

  // Determine whether the current request is eligible for parent approval
  const canApprove = request ? request.status === "pending" : false;

  async function fetchRequest() {
    setLoading(true);
    setRequest(null);
    setDecision(null);
    setMessage("");
    // Replace with real API call
    // Simulate fetching a request for the entered student ID
    setTimeout(() => {
      if (studentId.trim() === "S12345") {
        setRequest({
          id: "req1",
          studentId: "S12345",
          studentName: "John Doe",
          reason: "Family visit",
          startDateTime: Date.now(),
          endDateTime: Date.now() + 3600 * 1000,
          destination: "Colombo",
          status: "pending",
        });
      } else {
        setRequest(null);
        setMessage("No pending request found for this student ID.");
      }
      setLoading(false);
    }, 1000);
  }

  async function handleDecision() {
    if (!request || !decision) return;
    setLoading(true);
    // Replace with real API call to update status
    setTimeout(() => {
      setMessage(
        decision === "approve"
          ? "You have approved the outing request."
          : "You have rejected the outing request."
      );
      setRequest(null);
      setDecision(null);
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-slate-900 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Parent Approval</h1>
        <label className="block mb-2 font-medium">Enter Student ID</label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Try mock ID: <button type="button" onClick={() => setStudentId("S12345")} className="underline text-blue-600 dark:text-blue-400">S12345</button></p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g. S12345"
            className="flex-1 px-3 py-2 rounded border border-zinc-300 dark:bg-slate-700 dark:text-white"
            disabled={loading}
          />
          <button
            onClick={fetchRequest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading || !studentId.trim()}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {request && (
          <div className="mb-4 border rounded p-4 bg-zinc-50 dark:bg-slate-700">
            <div className="mb-3">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                canApprove
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-zinc-300"
              }`}>
                {canApprove ? "Eligible for Approval" : `Not eligible (${request.status.replace(/_/g, " ")})`}
              </span>
            </div>
            <p>
              <span className="font-semibold">Student:</span> {request.studentName} ({request.studentId})
            </p>
            <p>
              <span className="font-semibold">Destination:</span> {request.destination}
            </p>
            <p>
              <span className="font-semibold">Reason:</span> {request.reason}
            </p>
            <p>
              <span className="font-semibold">From:</span>{" "}
              {new Date(request.startDateTime).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">To:</span>{" "}
              {new Date(request.endDateTime).toLocaleString()}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDecision("approve")}
                className={`flex-1 px-4 py-2 rounded ${
                  decision === "approve"
                    ? "bg-green-700 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                disabled={loading || !canApprove}
              >
                Approve
              </button>
              <button
                onClick={() => setDecision("reject")}
                className={`flex-1 px-4 py-2 rounded ${
                  decision === "reject"
                    ? "bg-red-700 text-white"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                disabled={loading || !canApprove}
              >
                Reject
              </button>
            </div>
            {decision && (
              <div className="mt-4">
                <button
                  onClick={handleDecision}
                  className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : `Confirm ${decision === "approve" ? "Approval" : "Rejection"}`}
                </button>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className="mt-4 text-center text-blue-700 dark:text-blue-300">{message}</div>
        )}
      </div>
    </div>
  );
}