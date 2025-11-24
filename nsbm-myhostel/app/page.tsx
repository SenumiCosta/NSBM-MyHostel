"use client";

import { useState } from "react";
import StudentLogin from "@/components/StudentLogin";
import ParentLogin from "@/components/ParentLogin";
import WardenLogin from "@/components/WardenLogin";
import SecurityLogin from "@/components/SecurityLogin";

type UserRole = "student" | "parent" | "warden" | "security" | null;

const roles = [
  {
    id: "student",
    name: "Student",
    description: "Request outings, track approvals, and manage permissions.",
    icon: "👤",
    color: "blue",
  },
  {
    id: "parent",
    name: "Parent",
    description: "Approve or deny child's outing requests with feedback.",
    icon: "👨‍👩‍👧",
    color: "purple",
  },
  {
    id: "warden",
    name: "Warden",
    description: "Verify approvals, grant final permissions, and monitor anomalies.",
    icon: "🔐",
    color: "amber",
  },
  {
    id: "security",
    name: "Security Officer",
    description: "Scan student IDs and verify entry/exit permissions.",
    icon: "🛡️",
    color: "red",
  },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-600 to-blue-700",
      purple: "from-purple-600 to-purple-700",
      amber: "from-amber-600 to-amber-700",
      red: "from-red-600 to-red-700",
    };
    return colors[role] || "from-zinc-600 to-zinc-700";
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; button: string; light: string }> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        button: "bg-blue-600 hover:bg-blue-700",
        light: "bg-blue-100 dark:bg-blue-900/30",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-600 dark:text-purple-400",
        button: "bg-purple-600 hover:bg-purple-700",
        light: "bg-purple-100 dark:bg-purple-900/30",
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-600 dark:text-amber-400",
        button: "bg-amber-600 hover:bg-amber-700",
        light: "bg-amber-100 dark:bg-amber-900/30",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
        button: "bg-red-600 hover:bg-red-700",
        light: "bg-red-100 dark:bg-red-900/30",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const selectedRoleData = roles.find((r) => r.id === selectedRole);
  const colorClasses = selectedRoleData ? getColorClasses(selectedRoleData.color) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-slate-900 dark:to-slate-800 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">NSBM MyHostel</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Integrated Hostel Management System</p>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{formattedDate}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!selectedRole ? (
          <>
            {/* Role Selection */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-2">Select Your Role</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Choose your role to log in to the system
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id as UserRole)}
                    className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRoleColor(role.color)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative p-6 bg-white dark:bg-slate-800 group-hover:bg-transparent transition-colors">
                      <div className="text-5xl mb-4">{role.icon}</div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{role.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-white/90 transition-colors">
                        {role.description}
                      </p>
                      <div className="mt-4 text-sm font-semibold group-hover:text-white transition-colors">
                        Select Role →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* System Features */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold mb-6">System Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold">4-Role Approval Workflow</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Multi-level approval process for secure outing management
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold">Real-Time Notifications</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Instant updates on approval status and requests
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold">AI Anomaly Detection</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Smart monitoring for unusual outing patterns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold">Digital Records</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Complete history of all outing requests and approvals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold">ID Scanning</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Secure verification of entry and exit
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold">Mobile & Web Support</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Access from any device, anywhere
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Login Section */}
            <div className="max-w-2xl mx-auto">
              {/* Back Button & Role Info */}
              <div className="mb-8">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-slate-600 hover:bg-zinc-100 dark:hover:bg-slate-700 transition text-sm font-medium mb-6"
                >
                  ← Back to Role Selection
                </button>

                <div className={`rounded-lg p-6 ${colorClasses?.bg}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedRoleData?.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedRoleData?.name} Login</h2>
                      <p className={`text-sm mt-1 ${colorClasses?.text}`}>
                        {selectedRoleData?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login Forms */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
                {selectedRole === "student" && <StudentLogin />}
                {selectedRole === "parent" && <ParentLogin />}
                {selectedRole === "warden" && <WardenLogin />}
                {selectedRole === "security" && <SecurityLogin />}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
