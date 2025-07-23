
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export class EnhancedDatabaseService {
  private static async getClient() {
    return await createClient();
  }

  // 📊 Generic paginated query method
  private static async paginatedQuery<T>(
    tableName: string,
    options: QueryOptions = {},
    selectFields = '*',
    userId?: string
  ): Promise<{ data: PaginatedResult<T> | null; error: any }> {
    try {
    const supabase = await EnhancedDatabaseService.getClient();
      const { page = 1, limit = 20, sortBy, sortOrder = 'desc', filters = {} } = options;
      const offset = (page - 1) * limit;

      // Build query
      let query = supabase.from(tableName).select(selectFields, { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

     

      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          data: (data || []) as T[],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  // 👥 Users
  static async getUsers(options: QueryOptions = {}) {
    return this.paginatedQuery<Tables['users']['Row']>(
      'users',
      options,
      'id, email, name, role, is_active, created_at'
    );
  }

  static async getUserById(id: string) {
    const supabase = await this.getClient();
    return await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
  }

  // 🏢 Clubs
  static async getClubs(options: QueryOptions = {}, userId?: string) {
    const supabase = await this.getClient();
    const { page = 1, limit = 20, sortBy, sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Get user's role to determine access
    let query = supabase
      .from('clubs')
      .select(`
        id,
        name,
        description,
        leader_id,
        type,
        is_active,
        created_at,
        users!clubs_leader_id_fkey(name)
      `, { count: 'exact' });

    // Filter active clubs only
    query = query.eq('is_active', true);

    // Apply user-specific filtering
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (user?.role === 'club_leader') {
        // Club leaders see only their club
        query = query.eq('leader_id', userId);
      }
      // Members and admins see all clubs
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        data: (data || []) as any[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      error: null
    };
  }

  static async createFile(fileData: Tables['files']['Insert']) {
    const supabase = await this.getClient();
    return await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single();
  }

  static async createMeeting(meetingData: Tables['meetings']['Insert']) {
    const supabase = await this.getClient();
    return await supabase
      .from('meetings')
      .insert(meetingData)
      .select()
      .single();
  }

  static async getClubById(id: string, userId?: string) {
    const supabase = await this.getClient();
    
    let query = supabase
      .from('clubs')
      .select(`
        id,
        name,
        description,
        leader_id,
        type,
        is_active,
        created_at,
        updated_at,
        users!clubs_leader_id_fkey(name, email)
      `)
      .eq('id', id)
      .eq('is_active', true);

    // Authorization check
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (user?.role === 'club_leader') {
        // Check if this user is the leader of the requested club
        const { data: club } = await supabase
          .from('clubs')
          .select('leader_id')
          .eq('id', id)
          .single();
        
        if (club?.leader_id !== userId) {
          return { data: null, error: { message: 'Access denied' } };
        }
      }
    }

    return await query.single();
  }

  static async createClub(clubData: Tables['clubs']['Insert']) {
    const supabase = await this.getClient();
    return await supabase
      .from('clubs')
      .insert(clubData)
      .select()
      .single();
  }

  // 📁 Files
  static async getFiles(options: QueryOptions & { clubId?: string; folderId?: string } = {}, userId?: string) {
    const supabase = await this.getClient();
    const { page = 1, limit = 20, clubId, folderId, sortBy, sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('files')
      .select(`
        id,
        name,
        file_url,
        file_type,
        file_size,
        club_id,
        folder_id,
        uploaded_by,
        created_at,
        users!files_uploaded_by_fkey(name)
      `, { count: 'exact' });

    // Apply filters
    if (clubId) {
      query = query.eq('club_id', clubId);
    }
    if (folderId) {
      query = query.eq('folder_id', folderId);
    } else {
      query = query.is('folder_id', null);
    }

    // Authorization check
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (user?.role === 'club_leader' && clubId) {
        // Check if this user is the leader of the requested club
        const { data: club } = await supabase
          .from('clubs')
          .select('leader_id')
          .eq('id', clubId)
          .single();
        
        if (club?.leader_id !== userId) {
          return { data: null, error: { message: 'Access denied' } };
        }
      }
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      error: null
    };
  }

  // � Folders
  static async getFolders(options: QueryOptions & { clubId?: string; parentId?: string } = {}, userId?: string) {
    const supabase = await this.getClient();
    const { page = 1, limit = 20, clubId, parentId, sortBy, sortOrder = 'asc' } = options;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('folders')
      .select(`
        id,
        name,
        club_id,
        parent_id,
        created_at,
        created_by,
        creator:users!folders_created_by_fkey(name)
      `, { count: 'exact' });

    // Filter by club
    if (clubId) {
      query = query.eq('club_id', clubId);
    }

    // Filter by parent folder
    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }

    // Authorization check
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (user?.role === 'club_leader' && clubId) {
        // Check if this user is the leader of the requested club
        const { data: club } = await supabase
          .from('clubs')
          .select('leader_id')
          .eq('id', clubId)
          .single();
        
        if (club?.leader_id !== userId) {
          return { data: null, error: { message: 'Access denied' } };
        }
      }
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      error: null
    };
  }

  // �📅 Meetings
  static async getMeetings(options: QueryOptions & { clubId?: string } = {}, userId?: string) {
    const supabase = await this.getClient();
    const { page = 1, limit = 20, clubId, sortBy, sortOrder = 'asc' } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('meetings')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        location,
        club_id,
        organizer_id,
        status,
        participants,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply filters
    if (clubId) {
      query = query.eq('club_id', clubId);
    }

    // Authorization check
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (user?.role === 'club_leader') {
        if (clubId) {
          // Check if this user is the leader of the requested club
          const { data: club } = await supabase
            .from('clubs')
            .select('leader_id')
            .eq('id', clubId)
            .single();
          
          if (club?.leader_id !== userId) {
            return { data: null, error: { message: 'Access denied' } };
          }
        } else {
          // Filter by clubs this user leads
          const { data: clubs } = await supabase
            .from('clubs')
            .select('id')
            .eq('leader_id', userId);
          
          if (clubs && clubs.length > 0) {
            query = query.in('club_id', clubs.map(c => c.id));
          }
        }
      }
    }

    // Apply sorting (default: upcoming meetings first)
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('start_time', { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      error: null
    };
  }

  // ✅ Tasks
  static async getTasks(options: QueryOptions & { clubId?: string; assignedTo?: string } = {}, userId?: string) {
    const supabase = await this.getClient();
    const { page = 1, limit = 20, clubId, assignedTo, sortBy, sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        club_id,
        assigned_to,
        created_by,
        created_at,
        assignee:users!tasks_assigned_to_fkey(name),
        creator:users!tasks_created_by_fkey(name)
      `, { count: 'exact' });

    // Apply filters
    if (clubId) {
      query = query.eq('club_id', clubId);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    // Authorization check
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (user?.role === 'club_leader') {
        if (clubId) {
          // Check if this user is the leader of the requested club
          const { data: club } = await supabase
            .from('clubs')
            .select('leader_id')
            .eq('id', clubId)
            .single();
          
          if (club?.leader_id !== userId) {
            return { data: null, error: { message: 'Access denied' } };
          }
        } else {
          // Filter by clubs this user leads
          const { data: clubs } = await supabase
            .from('clubs')
            .select('id')
            .eq('leader_id', userId);
          
          if (clubs && clubs.length > 0) {
            query = query.in('club_id', clubs.map(c => c.id));
          }
        }
      } else if (user?.role === 'member') {
        // Members see only their tasks
        query = query.eq('assigned_to', userId);
      }
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('due_date', { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      error: null
    };
  }

  // 🔔 Notifications
  static async getNotifications(options: QueryOptions & { userId?: string } = {}) {
    const supabase = await this.getClient();
    const { page = 1, limit = 20, userId, sortBy, sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('notifications')
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        user_id,
        created_at
      `, { count: 'exact' });

    // Filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      error: null
    };
  }
}
