"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import type { OutingRequest } from "@/lib/types";

export default function WardenDashboard() {
  const { user, logout } = useAuth();
  const [outings, setOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyReason, setReplyReason] = useState("");
  const [anomalyData, setAnomalyData] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [currentlyOut, setCurrentlyOut] = useState<number | null>(null);
  const [currentlyAvailable, setCurrentlyAvailable] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastFetchPayload, setLastFetchPayload] = useState<any>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchOutings();
      fetchAnomalies();
      fetchStats();
    }
  }, [user]);

  async function fetchOutings() {
    try {
      setFetchError(null);
      setLoading(true);

      // primary attempt (warden-scoped)
      const res = await fetch(
        `/api/outings?userId=${encodeURIComponent(user?.uid ?? "")}&role=warden`
      );

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      console.debug("/api/outings response:", res.status, data);
      setLastFetchPayload({ primary: data, status: res.status });

      if (res.ok) {
        // prefer explicit outings array if present, otherwise attempt to use the body directly
        if (Array.isArray(data.outings)) {
          setOutings(data.outings);
        } else if (Array.isArray(data)) {
          setOutings(data);
        } else if (Array.isArray((data as any).data)) {
          setOutings((data as any).data);
        } else {
          setOutings(data.outings ?? []);
        }
        return;
      }

      // on non-ok, show the error and try a generic fallback (helps debug seeded data)
      setFetchError(data?.error || `Status ${res.status}`);
      setOutings([]);

      // fallback: try the endpoint without query params to inspect raw seed
      const fb = await fetch("/api/outings");
      let fbData: any = {};
      try {
        fbData = await fb.json();
      } catch (e) {
        fbData = {};
      }

      console.debug("fallback /api/outings response:", fb.status, fbData);
      setLastFetchPayload((prev: any) => ({ ...prev, fallback: fbData, fallbackStatus: fb.status }));

      if (fb.ok) {
        if (Array.isArray(fbData.outings)) {
          setOutings(fbData.outings);
        } else if (Array.isArray(fbData)) {
          setOutings(fbData);
        } else {
          setOutings(fbData.outings ?? []);
        }
        setFetchError(null);
      }
    } catch (error) {
      console.error("Failed to fetch outings:", error);
      setFetchError(String(error));
      setOutings([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnomalies() {
    try {
      const res = await fetch("/api/anomalies");
      if (res.ok) {
        const { anomalies } = await res.json();
        setAnomalyData(anomalies);
      }
    } catch (error) {
      console.error("Failed to fetch anomalies:", error);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch("/api/warden/stats");
      if (res.ok) {
        const data = await res.json();
        setTotalStudents(data.totalStudents || 0);
        setCurrentlyOut(data.currentlyOut || 0);
        setCurrentlyAvailable(data.currentlyAvailable || 0);
      }
    } catch (error) {
      console.error("Failed to fetch warden stats:", error);
    }
  }

  async function handleApproval(outingId: string, approve: boolean) {
    try {
      const res = await fetch(`/api/outings?id=${outingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: approve ? "warden_approved" : "warden_rejected",
          approvalReason: replyReason || (approve ? "Approved" : "Rejected"),
          role: "warden",
        }),
      });

      if (res.ok) {
        alert(`Request ${approve ? "approved" : "rejected"}!`);
        setReplyingTo(null);
        setReplyReason("");
        fetchOutings();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed: ${err.error || res.status}`);
      }
    } catch (error) {
      alert("Failed to update request");
    }
  }

  if (!user || user.role !== "warden") {
    return (
      <div className="p-4">
        <p>Access denied. Please log in as a warden.</p>
        <Link href="/" className="text-blue-500 underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Warden Dashboard</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Welcome, {user.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Debug panel removed for production/delivery */}

        {/* Anomaly Detection removed from top; will render at bottom of page */}

        {/* Warden Statistics */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 flex gap-6">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total students</p>
            <p className="text-2xl font-semibold">{totalStudents ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Currently out (today)</p>
            <p className="text-2xl font-semibold">{currentlyOut ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Currently available</p>
            <p className="text-2xl font-semibold">{currentlyAvailable ?? "—"}</p>
          </div>
        </div>

        {/* Separated lists: Day outings and Going Home (parent-approved) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
            <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700">
              Day Outings (Parent-Approved)
            </h2>
            {loading ? (
              <p className="p-6">Loading...</p>
            ) : outings.filter(o => o.status === "parent_approved" && o.outingType === "day").length === 0 ? (
              <p className="p-6 text-zinc-600 dark:text-zinc-400">No day outings.</p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-slate-700">
                {outings.filter(o => o.status === "parent_approved" && o.outingType === "day").map((outing) => (
                  <div key={outing.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{outing.studentName}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Destination: {outing.destination}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{outing.startDateTime ? new Date(outing.startDateTime).toLocaleString() : "—"}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Reason: {outing.reason}</p>
                        <p className="text-sm text-green-600 mt-2">✓ Parent Approved: {outing.parentApprovalReason ?? ""}</p>
                      </div>
                    </div>
                    {replyingTo === outing.id ? (
                      <div className="space-y-3 mt-4 pt-4 border-t border-zinc-200 dark:border-slate-700">
                        <textarea
                          value={replyReason}
                          onChange={(e) => setReplyReason(e.target.value)}
                          placeholder="Optional remarks"
                          className="w-full rounded border px-3 py-2 text-sm dark:bg-slate-700"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproval(outing.id, true)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Grant Permission
                          </button>
                          <button
                            onClick={() => handleApproval(outing.id, false)}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-2 border border-zinc-300 dark:border-slate-600 rounded hover:bg-zinc-100 dark:hover:bg-slate-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(outing.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Review & Decide
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
            <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700">
              Going Home Requests (Parent-Approved)
            </h2>
            {loading ? (
              <p className="p-6">Loading...</p>
            ) : outings.filter(o => o.status === "parent_approved" && o.outingType === "home").length === 0 ? (
              <p className="p-6 text-zinc-600 dark:text-zinc-400">No going-home requests.</p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-slate-700">
                {outings.filter(o => o.status === "parent_approved" && o.outingType === "home").map((outing) => (
                  <div key={outing.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{outing.studentName}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Destination: {outing.destination}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{outing.startDateTime ? new Date(outing.startDateTime).toLocaleString() : "—"}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Reason: {outing.reason}</p>
                        <p className="text-sm text-green-600 mt-2">✓ Parent Approved: {outing.parentApprovalReason ?? ""}</p>
                      </div>
                    </div>
                    {replyingTo === outing.id ? (
                      <div className="space-y-3 mt-4 pt-4 border-t border-zinc-200 dark:border-slate-700">
                        <textarea
                          value={replyReason}
                          onChange={(e) => setReplyReason(e.target.value)}
                          placeholder="Optional remarks"
                          className="w-full rounded border px-3 py-2 text-sm dark:bg-slate-700"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproval(outing.id, true)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Grant Permission
                          </button>
                          <button
                            onClick={() => handleApproval(outing.id, false)}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-2 border border-zinc-300 dark:border-slate-600 rounded hover:bg-zinc-100 dark:hover:bg-slate-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(outing.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Review & Decide
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Approved History */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700">
            Approved Requests
          </h2>
          <div className="divide-y divide-zinc-200 dark:divide-slate-700">
            {outings.filter(o => o.status === "warden_approved").length === 0 ? (
              <p className="p-6 text-zinc-600 dark:text-zinc-400">No approved requests.</p>
            ) : (
              outings.filter(o => o.status === "warden_approved").map((outing) => (
                <div key={outing.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{outing.studentName} → {outing.destination}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {outing.wardenApprovedAt ? new Date(outing.wardenApprovedAt).toLocaleString() : (outing.startDateTime ? new Date(outing.startDateTime).toLocaleString() : "—")}
                      </p>
                      { (outing.wardenApprovalReason || outing.parentApprovalReason) && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Reason: {outing.wardenApprovalReason ?? outing.parentApprovalReason}</p>
                      ) }
                    </div>
                    <span className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800">Approved</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rejected History */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700">
            Rejected Requests
          </h2>
          <div className="divide-y divide-zinc-200 dark:divide-slate-700">
            {outings.filter(o => o.status === "warden_rejected").length === 0 ? (
              <p className="p-6 text-zinc-600 dark:text-zinc-400">No rejected requests.</p>
            ) : (
              outings.filter(o => o.status === "warden_rejected").map((outing) => (
                <div key={outing.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{outing.studentName} → {outing.destination}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {outing.wardenApprovedAt ? new Date(outing.wardenApprovedAt).toLocaleString() : (outing.startDateTime ? new Date(outing.startDateTime).toLocaleString() : "—")}
                      </p>
                      { (outing.wardenApprovalReason || outing.parentApprovalReason) && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Reason: {outing.wardenApprovalReason ?? outing.parentApprovalReason}</p>
                      ) }
                    </div>
                    <span className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">Rejected</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flagged Students (Irregular Behavior) - moved to bottom */}
        {anomalyData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
            <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700 text-red-600">
              ⚠️ Flagged Students (Irregular Behavior)
            </h2>
            <div className="divide-y divide-zinc-200 dark:divide-slate-700">
              {anomalyData.map((anomaly, idx) => (
                <div key={idx} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{anomaly.studentName}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Anomaly Score: {(anomaly.anomalyScore * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Reason: {anomaly.irregularityReason}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">
                      Flagged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}