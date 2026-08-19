import { MuscleGroup, ExerciseLevel, MetricType, SetType } from '../isg/isg-constants';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  currentWeightKg: number;
  heightCm: number;
  streakDays: number;
  role: UserRole;
  gymId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'USER' | 'TRAINER' | 'GYM_ADMIN' | 'SUPER_ADMIN';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  level: ExerciseLevel;
  metricType: MetricType;
  massValue: number;
  demandValue: number;
  complexityValue: number;
  impactValue: number;
  exerciseFactor: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  estimatedCalories: number;
  createdAt: Date;
}

export interface Set {
  id: string;
  sessionId: string;
  exerciseId: string;
  userId: string;
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  setType: SetType;
  variantBonus: number;
  penalty: number;
  isRecordPr: boolean;
  isgScore: number;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ISGCalculationResult {
  rawScore: number;
  finalScore: number;
  ratioFuerza: number;
  heightFactor: number;
  isPhysiologicalLimitExceeded: boolean;
  physiologicalLimit: number;
}

export type AppRole = 'player' | 'gym' | 'coach';

export interface Location {
  country: string;
  province: string;
}

export interface Division {
  name: string;
  minScore: number;
}

export interface PlayerProfile {
  id: string;
  email: string;
  name: string;
  role: 'player';
  location: Location;
  age: number;
  heightCm: number;
  weightKg: number;
  activeRoutineId?: string;
  isgScore: number;
  division: Division;
}

export interface LinkedPerson {
  id: string;
  name: string;
  email?: string;
  isgScore?: number;
}

export interface GymProfile {
  id: string;
  name: string;
  country: string;
  province: string;
  linkedCoaches: LinkedPerson[];
  linkedPlayers: LinkedPerson[];
}

export interface CoachProfile {
  id: string;
  email: string;
  name: string;
  role: 'coach';
  assignedGym: { id: string; name: string };
  linkedStudents: LinkedPerson[];
}

export type AppProfile = PlayerProfile | GymProfile | CoachProfile;

export type FollowStatus = 'none' | 'following' | 'requested' | 'pending';

export interface FollowRelation {
  id: string;
  followerId: string;
  followeeId: string;
  status: FollowStatus;
  createdAt: Date;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRelation {
  id: string;
  userAId: string;
  userBId: string;
  status: FriendRequestStatus;
  createdAt: Date;
}

export type { MuscleGroup, ExerciseLevel, MetricType, SetType };