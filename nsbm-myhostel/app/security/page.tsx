"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import type { OutingRequest } from "@/lib/types";

export default function SecurityDashboard() {
  const { user, logout } = useAuth();
  const [outings, setOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [scanResult, setScanResult] = useState<OutingRequest | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchOutings();
    }
  }, [user]);

  async function fetchOutings() {
    try {
      const res = await fetch(`/api/outings?role=security`);
      if (res.ok) {
        const { outings: data } = await res.json();
        setOutings(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch outings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleScan() {
    if (!searchId.trim()) {
      alert("Please enter a student ID");
      return;
    }

    try {
      const res = await fetch(`/api/security/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: searchId, securityId: user?.uid, timestamp: Date.now() }),
      });

      if (res.ok) {
        const result = await res.json();
        setScanResult(result.record);
        alert(`✓ Return recorded: ${result.record.studentName}`);
        // refresh the list so returned status is reflected
        fetchOutings();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Student not found or not authorized to exit");
      }
    } catch (error) {
      console.error(error);
      alert("Scan failed");
    }
  }

  if (!user || user.role !== "security") {
    return (
      <div className="p-4">
        <p>Access denied. Please log in as a security officer.</p>
        <Link href="/" className="text-blue-500 underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Security Portal</h1>
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
        {/* Student Scan */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700">
            Scan Student ID / Check Permission
          </h2>
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Student ID (e.g., S12345)"
                className="flex-1 rounded border px-3 py-2 dark:bg-slate-700"
                onKeyPress={(e) => e.key === "Enter" && handleScan()}
              />
              <button
                onClick={handleScan}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Scan
              </button>
            </div>

            {scanResult && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <p className="font-medium text-green-800 dark:text-green-200">✓ Authorization Found</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Student: {scanResult.studentName}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Destination: {scanResult.destination}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {scanResult.returnedAt
                    ? `Returned: ${new Date(scanResult.returnedAt).toLocaleString()}`
                    : scanResult.startDateTime
                    ? `Authorized Exit: ${new Date(scanResult.startDateTime).toLocaleString()}`
                    : "—"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Approved Outings for Today */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700">
            Approved Outings (Warden Verified)
          </h2>

          {loading ? (
            <p className="p-6">Loading...</p>
          ) : outings.length === 0 ? (
            <p className="p-6 text-zinc-600 dark:text-zinc-400">No approved outings visible to security.</p>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-slate-700">
              {outings.map((outing) => (
                <div key={outing.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-lg">{outing.studentName}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Student ID: {outing.studentId}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Destination: {outing.destination}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Authorized Exit: {outing.startDateTime ? new Date(outing.startDateTime).toLocaleString() : "—"}</p>
                      {outing.returnedAt && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Returned: {new Date(outing.returnedAt).toLocaleString()}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ml-4 ${outing.status === 'returned' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {outing.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Approved</p>
              <p className="text-3xl font-semibold mt-2">{outings.filter(o => o.status === 'parent_approved' || o.status === 'warden_approved' || o.status === 'returned').length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Currently Out</p>
              <p className="text-3xl font-semibold mt-2">{outings.filter(o => o.status === 'parent_approved' || o.status === 'warden_approved').length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Returned</p>
              <p className="text-3xl font-semibold mt-2">{outings.filter(o => o.status === 'returned').length}</p>
            </div>
          </div>
      </main>
    </div>
  );
}
