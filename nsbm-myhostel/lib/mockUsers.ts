// Shared in-memory mock user store for local development/testing
export const users: Record<string, any> = {
  user_student: {
    uid: "user_student",
    email: "student@example.com",
    name: "Student Example",
    role: "student",
    password: "password123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  user_parent: {
    uid: "user_parent",
    email: "parent@example.com",
    name: "Parent Example",
    role: "parent",
    password: "password123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  user_security: {
    uid: "user_security",
    email: "security@example.com",
    name: "Security Officer",
    role: "security",
    password: "password123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  user_warden: {
    uid: "user_warden",
    email: "warden@example.com",
    name: "Warden User",
    role: "warden",
    password: "password123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

export function findUserByEmail(email: string) {
  return Object.values(users).find((u) => u.email === email) || null;
}
