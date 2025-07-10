export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          role: 'admin' | 'club_leader' | 'member';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          role?: 'admin' | 'club_leader' | 'member';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          role?: 'admin' | 'club_leader' | 'member';
          is_active?: boolean;
          updated_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          leader_id: string | null;
          type: 'education' | 'social' | 'project';
          settings: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          leader_id?: string | null;
          type?: 'education' | 'social' | 'project';
          settings?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          leader_id?: string | null;
          type?: 'education' | 'social' | 'project';
          settings?: any;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          club_id: string;
          assigned_by: string | null;
          assigned_to: string;
          due_date: string | null;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
          files: any;
          feedback: string | null;
          grade: number | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          club_id: string;
          assigned_by?: string | null;
          assigned_to: string;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
          files?: any;
          feedback?: string | null;
          grade?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          assigned_by?: string | null;
          assigned_to?: string;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
          files?: any;
          feedback?: string | null;
          grade?: number | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          type: 'notification' | 'meeting' | 'announcement';
          title: string;
          content: string | null;
          club_id: string;
          created_by: string | null;
          target_users: string[];
          metadata: any;
          scheduled_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'notification' | 'meeting' | 'announcement';
          title: string;
          content?: string | null;
          club_id: string;
          created_by?: string | null;
          target_users?: string[];
          metadata?: any;
          scheduled_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'notification' | 'meeting' | 'announcement';
          title?: string;
          content?: string | null;
          created_by?: string | null;
          target_users?: string[];
          metadata?: any;
          scheduled_at?: string | null;
          is_active?: boolean;
        };
      };
    };
  };
}