import { supabase } from './supabase';
import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export class DatabaseService {
  // Users
  static async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  static async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    return { data, error };
  }

  static async createUser(user: Tables['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    return { data, error };
  }

  // Clubs - Artık tüm kulüpler dönecek, filtering frontend'de olacak
  static async getClubs(userId?: string) {
    console.log('DatabaseService.getClubs called - returning all clubs');
    
    let query = supabase
      .from('clubs')
      .select(`
        *,
        leader:users!clubs_leader_id_fkey(name),
        club_members(user_id)
      `)
      .eq('is_active', true);

    // userId parametresi sadece debug için kullanılacak
    if (userId) {
      console.log('User context provided:', userId);
    }

    const { data, error } = await query;
    
    console.log('DatabaseService.getClubs raw result:', { data, error });
    
    // Transform data to match frontend expectations
    const transformedData = data?.map(club => ({
      ...club,
      leaderName: club.leader?.name || 'Unknown',
      memberCount: club.club_members?.length || 0,
      memberIds: club.club_members?.map((m: Tables['club_members']['Row']) => m.user_id) || []
    }));

    console.log('DatabaseService.getClubs transformed data:', transformedData);

    return { data: transformedData, error };
  }

  static async getClub(id: string) {
    const { data, error } = await supabase
      .from('clubs')
      .select(`
        *,
        leader:users!clubs_leader_id_fkey(name),
        club_members(user_id, users(name))
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (data) {
      return {
        data: {
          ...data,
          leaderName: data.leader?.name || 'Unknown',
          memberCount: data.club_members?.length || 0,
          memberIds: data.club_members?.map((m: Tables['club_members']['Row']) => m.user_id) || []
        },
        error
      };
    }

    return { data, error };
  }

  static async createClub(club: Tables['clubs']['Insert']) {
    const { data, error } = await supabase
      .from('clubs')
      .insert(club)
      .select()
      .single();
    
    return { data, error };
  }

  // Club Memberships
  static async joinClub(clubId: string, userId: string) {
    const { data, error } = await supabase
      .from('club_members')
      .insert({ club_id: clubId, user_id: userId })
      .select()
      .single();
    
    return { data, error };
  }

  // Tasks
  static async getTasks(filters: {
    clubId?: string;
    userId?: string;
    status?: string;
  } = {}) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_by_user:users!tasks_assigned_by_fkey(name),
        assigned_to_user:users!tasks_assigned_to_fkey(name),
        club:clubs(name)
      `)
      .order('created_at', { ascending: false });

    if (filters.clubId) {
      query = query.eq('club_id', filters.clubId);
    }

    if (filters.userId) {
      query = query.or(`assigned_to.eq.${filters.userId},assigned_by.eq.${filters.userId}`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async createTask(task: Tables['tasks']['Insert']) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateTask(id: string, updates: Tables['tasks']['Update']) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  // Activities (Notifications)
  static async getActivities(userId: string, type?: string) {
    let query = supabase
      .from('activities')
      .select(`
        *,
        created_by_user:users!activities_created_by_fkey(name),
        club:clubs(name)
      `)
      .contains('target_users', [userId])
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async createActivity(activity: Tables['activities']['Insert']) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    
    return { data, error };
  }

   static async getMeetings(filters: {
    clubId?: string;
    userId?: string;
  } = {}) {
    let query = supabase
      .from('meetings')
      .select(`
        *,
        organizer:users!meetings_organizer_id_fkey(name),
        club:clubs(name),
        meeting_participants(
          *,
          user:users(name)
        )
      `)
      .order('start_time', { ascending: true });

    if (filters.clubId) {
      query = query.eq('club_id', filters.clubId);
    }

    if (filters.userId) {
      query = query.or(`organizer_id.eq.${filters.userId},meeting_participants.user_id.eq.${filters.userId}`);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async createMeeting(meeting: Tables['meetings']['Insert']) {
    const { data, error } = await supabase
      .from('meetings')
      .insert(meeting)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateMeeting(id: string, updates: Tables['meetings']['Update']) {
    const { data, error } = await supabase
      .from('meetings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  // Meeting Participants
  static async addMeetingParticipant(participant: Tables['meeting_participants']['Insert']) {
    const { data, error } = await supabase
      .from('meeting_participants')
      .insert(participant)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateMeetingResponse(meetingId: string, userId: string, response: 'accepted' | 'declined') {
    const { data, error } = await supabase
      .from('meeting_participants')
      .update({ response })
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  }

  static async getMeetingById(id: string) {
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        organizer:users!meetings_organizer_id_fkey(name),
        club:clubs(name),
        meeting_participants(
          *,
          user:users(name)
        )
      `)
      .eq('id', id)
      .single();

    return { data, error };
  }

   // Files
  static async getFiles(filters: {
    clubId: string;
    folderId?: string;
  }) {
    let query = supabase
      .from('files')
      .select(`
        *,
        uploader:users!files_uploaded_by_fkey(name),
        folder:folders(name)
      `)
      .eq('club_id', filters.clubId)
      .order('created_at', { ascending: false });

    if (filters.folderId) {
      query = query.eq('folder_id', filters.folderId);
    } else {
      query = query.is('folder_id', null);
    }

    const { data, error } = await query;
    return { data, error };
  }

    static async createFile(file: Tables['files']['Insert'] & { uploaded_by?: string }) {
    const fileData = {
      ...file,
      uploaded_by: file.uploaded_by || null,
    };
    
    const { data, error } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateFile(id: string, updates: Tables['files']['Update']) {
    const { data, error } = await supabase
      .from('files')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteFile(id: string) {
    const { data, error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  // Folders
  static async getFolders(filters: {
    clubId: string;
    parentId?: string;
  }) {
    let query = supabase
      .from('folders')
      .select(`
        *,
        creator:users!folders_created_by_fkey(name)
      `)
      .eq('club_id', filters.clubId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (filters.parentId) {
      query = query.eq('parent_id', filters.parentId);
    } else {
      query = query.is('parent_id', null);
    }

    const { data, error } = await query;
    return { data, error };
  }

   static async createFolder(folder: Tables['folders']['Insert'] & { created_by?: string }) {
    const folderData = {
      ...folder,
      created_by: folder.created_by || null,
    };
    
    const { data, error } = await supabase
      .from('folders')
      .insert(folderData)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateFolder(id: string, updates: Tables['folders']['Update']) {
    const { data, error } = await supabase
      .from('folders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteFolder(id: string) {
    const { data, error } = await supabase
      .from('folders')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  return { data, error };
}
}