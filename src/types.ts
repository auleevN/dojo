export type UserRole = 'member' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  category: string;
  url: string;
  duration?: string;
  createdAt: any; // Firestore Timestamp
}

export const VIDEO_CATEGORIES = [
  "Échauffement",
  "Débutants",
  "Intermédiaires",
  "Avancés",
  "Techniques spécifiques",
  "Kata / Formes",
  "Combat / Randori"
];
