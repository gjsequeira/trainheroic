export type UserRole = 'coach' | 'athlete';

export interface UserDoc {
  id: string;
  email?: string;
  role: UserRole;
  coachId?: string;
  displayName?: string;
}

export interface Program {
  id: string;
  coachId: string;
  name: string;
  description?: string;
  createdAt?: unknown;
}

export interface ProgramWorkout {
  id: string;
  programId: string;
  dayIndex: number;
  items: string[];
}
