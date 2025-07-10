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
      meetings: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          club_id: string;
          organizer_id: string | null;
          start_time: string;
          end_time: string | null;
          location: string | null;
          participants: any;
          status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          club_id: string;
          organizer_id?: string | null;
          start_time: string;
          end_time?: string | null;
          location?: string | null;
          participants?: any;
          status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          organizer_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          location?: string | null;
          participants?: any;
          status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
          updated_at?: string;
        };
      };

      meeting_participants: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          response: 'accepted' | 'declined' | 'tentative' | 'no_response';
          joined_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          response?: 'accepted' | 'declined' | 'tentative' | 'no_response';
          joined_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          user_id?: string;
          response?: 'accepted' | 'declined' | 'tentative' | 'no_response';
        };
      };

      
    

      folders: {
        Row: {
          id: string;
          name: string;
          parent_id: string | null;
          club_id: string;
          created_by: string | null;
          permissions: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          parent_id?: string | null;
          club_id: string;
          created_by?: string | null;
          permissions?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          parent_id?: string | null;
          created_by?: string | null;
          permissions?: any;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          name: string;
          original_name: string;
          file_url: string;
          club_id: string;
          folder_id: string | null;
          uploaded_by: string | null;
          file_type: 'document' | 'image' | 'video' | 'other';
          mime_type: string;
          file_size: number;
          description: string | null;
          tags: string[];
          is_public: boolean;
          download_count: number;
          version: number;
          cloudinary_public_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          original_name: string;
          file_url: string;
          club_id: string;
          folder_id?: string | null;
          uploaded_by?: string | null;
          file_type: 'document' | 'image' | 'video' | 'other';
          mime_type: string;
          file_size: number;
          description?: string | null;
          tags?: string[];
          is_public?: boolean;
          download_count?: number;
          version?: number;
          cloudinary_public_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          original_name?: string;
          file_url?: string;
          folder_id?: string | null;
          uploaded_by?: string | null;
          file_type?: 'document' | 'image' | 'video' | 'other';
          mime_type?: string;
          file_size?: number;
          description?: string | null;
          tags?: string[];
          is_public?: boolean;
          download_count?: number;
          version?: number;
          cloudinary_public_id?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}