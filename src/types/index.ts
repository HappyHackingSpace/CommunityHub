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

export interface Meeting {
  id: string;
  title: string;
  description: string;
  clubId: string;
  organizerId: string;
  organizerName: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  agenda: AgendaItem[];
  notes?: string;
  recurrence?: RecurrenceSettings;
  participants: MeetingParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  userName: string;
  response: 'pending' | 'accepted' | 'declined';
  attended?: boolean;
  joinedAt?: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration?: number; // minutes
  presenter?: string;
  order: number;
}

export interface RecurrenceSettings {
  type: 'none' | 'daily' | 'weekly' | 'monthly';
  interval: number; // every X days/weeks/months
  endDate?: string;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
}

// Bu interfaces'leri dosyanın sonuna ekle:

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  fileUrl: string;
  clubId: string;
  folderId?: string;
  folderName?: string;
  uploadedBy: string;
  uploaderName: string;
  fileType: 'document' | 'image' | 'video' | 'other';
  mimeType: string;
  fileSize: number;
  description?: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  version: number;
  cloudinaryPublicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  clubId: string;
  createdBy: string;
  permissions: {
    view: string[];
    upload: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subfolders?: Folder[];
  fileCount?: number;
}