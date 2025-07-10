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

  // Clubs
  static async getClubs(userId?: string) {
    let query = supabase
      .from('clubs')
      .select(`
        *,
        leader:users!clubs_leader_id_fkey(name),
        club_members(user_id)
      `)
      .eq('is_active', true);

    if (userId) {
      query = query.or(`leader_id.eq.${userId},club_members.user_id.eq.${userId}`);
    }

    const { data, error } = await query;
    
    // Transform data to match frontend expectations
    const transformedData = data?.map(club => ({
      ...club,
      leaderName: club.leader?.name || 'Unknown',
      memberCount: club.club_members?.length || 0,
      memberIds: club.club_members?.map((m: Tables['club_members']['Row']) => m.user_id) || []
    }));

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
}