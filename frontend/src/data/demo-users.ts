import type { CitizenProfile, User } from "@/types";

export const demoUser: User = {
  id: "user-aarav",
  email: "aarav.patil@example.in",
  fullName: "Aarav Patil",
  createdAt: "2025-05-01",
};

export const demoProfile: CitizenProfile = {
  userId: "user-aarav",
  fullName: "Aarav Patil",
  preferredLanguage: "en",
  state: "Maharashtra",
  district: "Pune",
  age: 21,
  occupation: "Student",
  incomeBand: "1L_3L",
  isStudent: true,
  isFarmer: false,
  completeness: 78,
};
