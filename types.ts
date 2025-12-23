
export enum UserRole {
  PUBLIC = 'PUBLIC',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export enum Language {
  ENGLISH = 'en',
  KANNADA = 'kn',
  HINDI = 'hi'
}

export enum ReportCategory {
  WASTE = 'Waste Disposal',
  SOCIAL = 'Social Issues',
  ROADS = 'Road Facility',
  WATER = 'Water Supply',
  OTHER = 'Other'
}

export enum ReportStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export enum PriorityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface StatusHistoryEntry {
  from: ReportStatus | 'CREATED';
  to: ReportStatus;
  timestamp: string;
  updatedBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  sessionId?: string; // Unique identifier for the current active session
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  reportedBy: string; // User ID
  reportedByName: string;
  location: string;
  createdAt: string;
  aiAnalysis?: string;
  resolutionNote?: string;
  severity?: string; // High, Medium, Low
  priority?: PriorityLevel;
  history?: StatusHistoryEntry[];
  reportImage?: string; // Base64 or URL of the problem
  resolutionImage?: string; // Base64 or URL of the fix
}

export interface Announcement {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'update' | 'info';
  timestamp: string;
  read: boolean;
  relatedReportId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
