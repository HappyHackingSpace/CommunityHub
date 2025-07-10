export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'club_leader' | 'member';
  clubId?: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  memberCount: number;
  type: 'education' | 'social' | 'project';
  createdAt: string;
  isActive: boolean;
  settings: {
    allowMemberTasks: boolean;
    requireApproval: boolean;
    maxFileSize: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  clubId: string;
  assignedBy: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
  files: TaskFile[];
  feedback?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TaskFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  clubId: string;
  organizer: string;
  datetime: string;
  duration: number;
  attendees: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'meeting' | 'general' | 'club';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}