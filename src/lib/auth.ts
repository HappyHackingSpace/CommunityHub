import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'club_leader' | 'member';
  isActive: boolean;
}

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      await this.logSecurityEvent('login_failed', email, 'Invalid credentials');
      throw new Error('Invalid email or password');
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      await this.logSecurityEvent('login_failed', email, 'User not found or inactive');
      throw new Error('User not found or inactive');
    }

    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.is_active,
    };

    await this.logSecurityEvent('login_success', email, 'User logged in successfully');

    return { user, token: authData.session.access_token };
  }

  static async register(email: string, password: string, name: string): Promise<{ user: AuthUser }> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Registration failed');
    }

    // Create user profile
    const userData = {
      id: authData.user.id,
      email,
      name,
      role: 'member' as const,
      is_active: true,
    };

    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (userError) {
      throw new Error('Failed to create user profile');
    }

    const user: AuthUser = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
      isActive: createdUser.is_active,
    };

    await this.logSecurityEvent('register_success', email, 'User registered successfully');

    return { user };
  }

  static async validateToken(token: string): Promise<AuthUser> {
    // Validate with Supabase
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !authUser) {
      throw new Error('Invalid or expired token');
    }
    
    // Get fresh user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      throw new Error('User not found or inactive');
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.is_active,
    };
  }

  static async logout(email: string): Promise<void> {
    await supabase.auth.signOut();
    await this.logSecurityEvent('logout_success', email, 'User logged out');
  }

  private static async logSecurityEvent(
    event: string, 
    email: string, 
    details: string, 
    ipAddress?: string
  ): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        event_type: event,
        user_email: email,
        details,
        ip_address: ipAddress,
        user_agent: 'Web App',
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}